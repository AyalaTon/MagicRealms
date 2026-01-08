const { MOB } = require('./Entity');

class Spawn {
  constructor(id, x, y, mobLimit = 10, radius = 100) {
    this.id = id; // ID único del SPAWN
    this.x = x; // Posición central en X
    this.y = y; // Posición central en Y
    this.mobLimit = mobLimit; // Número máximo de mobs
    this.radius = radius; // Radio de spawn
    this.mobs = []; // Lista de mobs supervisados
    this.lastSpawnCheck = Date.now(); // Marca de tiempo para la última revisión
    this.nextMobId = 1; // ID único para mobs generados por este spawn
  }

  // Método para actualizar el estado del SPAWN
  update() {
    const now = Date.now();

    // Verificar si han pasado más de 10 segundos desde la última revisión
    if (now - this.lastSpawnCheck >= 10000) {
      this.lastSpawnCheck = now; // Actualizar el tiempo de la última revisión

      // Eliminar mobs muertos de la lista
      this.mobs = this.mobs.filter((mob) => !mob.isDead);

      // Si hay menos mobs que el límite, crear solo 1
      if (this.mobs.length < this.mobLimit) {
        const newMob = this.createMob();
        this.mobs.push(newMob);
        console.log(`SPAWN ${this.id}: se creó un nuevo MOB (${newMob.id}). Total: ${this.mobs. length}/${this.mobLimit}`);
      }
    }
  }

  // Crear un nuevo mob en una posición aleatoria dentro del radio
  createMob() {
    // Generar posición aleatoria dentro del radio
    const angle = Math.random() * 2 * Math.PI; // Ángulo aleatorio (0 a 360 grados en radianes)
    const distance = Math.random() * this.radius; // Distancia aleatoria (0 al radio máximo)

    const spawnX = this.x + Math.cos(angle) * distance;
    const spawnY = this.y + Math.sin(angle) * distance;

    const mobId = `spawn-${this.id}-mob-${this.nextMobId++}`;
    return new MOB(mobId, spawnX, spawnY);
  }
}

module.exports = Spawn;