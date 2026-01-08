const WebSocket = require('ws');
const Conexion = require('./Conexion');
const { Entity, PLAYER, MOB, NPC, DAMAGE } = require('./Entity');
const Spawn = require('./Spawn');


const wss = new WebSocket.Server({ port: 8080 });
console.log('Servidor WebSocket corriendo en ws://localhost:8080');

const conexiones = []; // Lista de conexiones activas
var entities = []; // Lista global de entidades
const spawns = []; // Lista global de SPAWNs
let nextEntityId = 1; // ID único de la próxima entidad

// Crear algunas entidades iniciales
entities.push(new NPC(nextEntityId++, 100, 100)); // Crear un NPC inicial
// entities.push(new MOB(nextEntityId++, 200, 200)); // Crear un MOB inicial

// Crear un SPAWN inicial

// Crear un SPAWN con límite de 10 mobs y radio de 150 unidades
const spawn1 = new Spawn(nextEntityId++, 300, 300, 10, 150);
spawns.push(spawn1);

// Crear otro SPAWN con límite de 5 mobs y radio de 50 unidades
const spawn2 = new Spawn(nextEntityId++, 500, 500, 5, 50);
spawns.push(spawn2);

// Manejar nuevas conexiones
wss.on('connection', (ws) => {
  console.log('Nuevo cliente conectado.');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      switch (msg.type) {
        case 'join':  {
          const username = msg.username. trim();
          const existente = conexiones.find((c) => c.username === username);

          if (existente && existente.status === 'conectado') {
            ws.send(JSON.stringify({ type: 'error', message: `El username "${username}" ya está en uso. ` }));
            ws.close();
          } else if (existente && existente.status === 'desconectado') {
            existente.ws = ws;
            existente.status = 'conectado';
            console.log(`Usuario reconectado: ${username}. `);
            // Enviar el playerId al cliente reconectado
            ws.send(JSON.stringify({ 
              type: 'success', 
              message: 'Reconectado con éxito.',
              playerId: existente. player.id // ← Envía el ID del jugador
            }));
          } else {
            // Nueva conexión:  asignar una entidad única al jugador
            const playerEntity = new PLAYER(nextEntityId++, username, 0, 0);
            const nuevaConexion = new Conexion(ws, username, playerEntity);
            entities.push(playerEntity);
            conexiones.push(nuevaConexion);

            console.log(`Nuevo usuario conectado: ${username}`);
            // Enviar el playerId al cliente nuevo
            ws.send(JSON. stringify({ 
              type: 'success', 
              message:  `Conectado como "${username}".`,
              playerId: playerEntity.id // ← Envía el ID del jugador
            }));
          }
          break;
        }

        case 'move':  {
          const conexion = conexiones.find((c) => c.ws === ws);
          if (conexion) {
            const player = conexion.player;
            
            if (player.isDead) {
              break; // No mover si está muerto
            }

            const { dx, dy } = msg;

            // Normalizar la dirección y aplicar la velocidad del jugador
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            
            if (magnitude > 0) {
              // Normalizar (convertir a vector unitario) y multiplicar por speed
              player.vx = (dx / magnitude) * player.speed;
              player.vy = (dy / magnitude) * player.speed;
            } else {
              player.vx = 0;
              player.vy = 0;
            }
          }
          break;
        }

        case 'stop': {
          // Detener el movimiento
          const conexion = conexiones.find((c) => c.ws === ws);
          if (conexion) {
            conexion.player.vx = 0;
            conexion.player.vy = 0;
          }
          break;
        }

        case 'die': {
          const conexion = conexiones.find((c) => c.ws === ws);
          if (conexion) {
            conexion.player.die();
          }
          break;
        }

        case 'direction': {
          const conexion = conexiones.find((c) => c.ws === ws);
          if (conexion) {
            const { direction } = msg;
            conexion.player.setDirection(direction);
          }
          break;
        }

        case 'fire': {
          const conexion = conexiones. find((c) => c.ws === ws);
          if (conexion) {
            const player = conexion.player;
            
            // Verificar si está muerto
            if (player. isDead) {
              ws.send(JSON.stringify({ type: 'fire_error', reason: 'dead' }));
              break;
            }

            // Intentar disparar
            const result = player.fire();
            
            if (result.success) {
              const { direction } = msg;
              const powerEntity = new DAMAGE(
                nextEntityId++, 
                player.id, 
                player.x, 
                player.y, 
                direction
              );
              entities.push(powerEntity);
              console.log(`${conexion.username} disparó.  Energía restante: ${Math.round(player.energy)}`);
            } else {
              // Notificar al cliente por qué no pudo disparar
              ws.send(JSON.stringify({ type: 'fire_error', reason: result.reason }));
              console.log(`${conexion.username} no puede disparar:  ${result.reason}`);
            }
          }
          break;
        }

        case 'use_potion':  {
          const conexion = conexiones.find((c) => c.ws === ws);
          if (conexion) {
            const player = conexion.player;

            if (player.isDead) {
              ws.send(JSON.stringify({ type: 'potion_error', reason: 'dead' }));
              break;
            }

            const { potionType } = msg;
            const result = player.usePotion(potionType);

            if (result.success) {
              ws.send(JSON.stringify({ 
                type: 'potion_used', 
                potion: result.potion 
              }));
            } else {
              ws.send(JSON.stringify({ 
                type: 'potion_error', 
                reason:  result.reason 
              }));
            }
          }
          break;
        }

        default:
          console.log('Mensaje no reconocido:', msg.type);
          break;
      }
    } catch (error) {
      console.error('Error procesando el mensaje:', error.message);
    }
  });

  ws.on('close', () => {
    const conexion = conexiones.find((c) => c.ws === ws);
    if (conexion) {
      conexion.status = 'desconectado';
      conexion.ws = null; // Limpiar referencia WebSocket
      console.log(`Usuario desconectado: ${conexion.username}`);
    }
  });

  ws.on('error', (err) => {
    console.error('Error en la conexión del cliente:', err.message);
  });
});


const TICK_RATE = 1000 / 24;
setInterval(() => {
  // Actualizar entidades
  entities.forEach((entity) => {
    entity.update(entities);
  });

  spawns.forEach((spawn) => {
    spawn.update();

    spawn.mobs.forEach((mob) => {
      if (!entities.find((e) => e.id === mob.id)) {
        entities.push(mob); // Añade el mob si no está ya en la lista
      }
    });
  });

  // Eliminar entidades muertas (excepto jugadores)
  entities = entities.filter((entity) => !entity.isDead || entity.type === 'player');
  // Enviar estado actualizado a todos los clientes conectados
  for (const conexion of conexiones) {
    if (conexion.status === 'conectado') {
      conexion.sendState(entities);
    }
  }

}, TICK_RATE);
