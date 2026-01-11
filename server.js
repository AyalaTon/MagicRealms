// const WebSocket = require('ws');
// const Conexion = require('./Conexion');
// const { Entity } = require('./Entity');
// const Player = require('./Player');
// const Map = require('./Map');
// const persistence = require('./Persistence');
import WebSocket, { WebSocketServer } from 'ws';
import Conexion from './Conexion.js';
import Player from './Player.js';
import Map from './Map.js';
import persistence from './Persistence.js';


// Inicializar mapa
persistence.setMap('main', new Map(800, 600, { xMin: 0, xMax: 800, yMin: 0, yMax: 600 }));
const wss = new WebSocketServer({ port: 8080 });
console.log('Servidor WebSocket corriendo en ws://localhost:8080');

// Manejar nuevas conexiones
wss.on('connection', (ws) => {
  console.log('Nuevo cliente conectado.');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      switch (msg.type) {
        case 'join':  {
          const username = msg.username.trim();
          const existente = persistence.getConexionByUsername(username);

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
              playerId: existente.player.id // ← Envía el ID del jugador
            }));
          } else {
            // Nueva conexión:  asignar una entidad única al jugador
            const spawnPoint = persistence.getMap('main').getRandomSpawnPoint();
            const playerEntity = new Player(persistence.getNextEntityId(), username, spawnPoint.x, spawnPoint.y);
            const nuevaConexion = new Conexion(ws, username, playerEntity);
            persistence.addEntity(playerEntity);
            persistence.addConexion(nuevaConexion);

            console.log(`Nuevo usuario conectado: ${username}`);
            // Enviar el playerId al cliente nuevo
            ws.send(JSON.stringify({ 
              type: 'success', 
              message:  `Conectado como "${username}".`,
              playerId: playerEntity.id // ← Envía el ID del jugador
            }));
          }
          break;
        }
        case 'move':  {
          const conexion = persistence.getConexionByWs(ws);
          if (conexion) {
            const player = conexion.player;
            
            if (player.isDead) {
              break; // No mover si está muerto
            }
            const { dx, dy } = msg; // Dirección del movimiento

            // Normalizar la dirección y aplicar la velocidad del jugador
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            
            if (magnitude > 0) {
              // Normalizar (convertir a vector unitario) y multiplicar por speed
              // Obtener la velocidad del player con buffs y equipamiento
              const speed = player.getSpeed();
              player.vx = (dx / magnitude) * speed;
              player.vy = (dy / magnitude) * speed;
            } else {
              player.vx = 0;
              player.vy = 0;
            }
          }
          break;
        }

        case 'stop': {
          // Detener el movimiento
          const conexion = persistence.getConexionByWs(ws);
          if (conexion) {
            conexion.player.vx = 0;
            conexion.player.vy = 0;
          }
          break;
        }

        case 'die': {
          const conexion = persistence.getConexionByWs(ws);
          if (conexion) {
            conexion.player.die();
          }
          break;
        }

        case 'direction': {
          const conexion = persistence.getConexionByWs(ws);
          if (conexion) {
            const { direction } = msg;
            conexion.player.setDirection(direction);
          }
          break;
        }

        // case 'fire': {
        //   const conexion = persistence.getConexionByWs(ws);
        //   if (conexion) {
        //     const player = conexion.player;
            
        //     // Verificar si está muerto
        //     if (player.isDead) {
        //       ws.send(JSON.stringify({ type: 'fire_error', reason: 'dead' }));
        //       break;
        //     }

        //     // Intentar disparar
        //     const result = player.fire();
            
        //     if (result.success) {
        //       const { direction } = msg;
        //       const powerEntity = new DAMAGE(
        //         nextEntityId++, 
        //         player.id, 
        //         player.x, 
        //         player.y, 
        //         direction
        //       );
        //       entities.push(powerEntity);
        //       console.log(`${conexion.username} disparó.  Energía restante: ${Math.round(player.energy)}`);
        //     } else {
        //       // Notificar al cliente por qué no pudo disparar
        //       ws.send(JSON.stringify({ type: 'fire_error', reason: result.reason }));
        //       console.log(`${conexion.username} no puede disparar:  ${result.reason}`);
        //     }
        //   }
        //   break;
        // }

        // case 'use_potion':  {
        //   const conexion = persistence.getConexionByWs(ws);
        //   if (conexion) {
        //     const player = conexion.player;

        //     if (player.isDead) {
        //       ws.send(JSON.stringify({ type: 'potion_error', reason: 'dead' }));
        //       break;
        //     }

        //     const { potionType } = msg;
        //     const result = player.usePotion(potionType);

        //     if (result.success) {
        //       ws.send(JSON.stringify({ 
        //         type: 'potion_used', 
        //         potion: result.potion 
        //       }));
        //     } else {
        //       ws.send(JSON.stringify({ 
        //         type: 'potion_error', 
        //         reason:  result.reason 
        //       }));
        //     }
        //   }
        //   break;
        // }

        default:
          console.log('Mensaje no reconocido:', msg.type);
          break;
      }
    } catch (error) {
      console.error('Error procesando el mensaje:', error.message);
    }
  });

  ws.on('close', () => {
    const conexion = persistence.getConexionByWs(ws);
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
  persistence.entities.forEach((entity) => {
    entity.update();
  });

  // Eliminar entidades muertas (excepto jugadores)
  persistence.entities = persistence.entities.filter((entity) => !entity.isDead || entity.type === 'player');
  // Enviar estado actualizado a todos los clientes conectados
  for (const conexion of persistence.conexiones) {
    if (conexion.status === 'conectado') {
      conexion.sendState(persistence.entities);
    }
  }

}, TICK_RATE);
