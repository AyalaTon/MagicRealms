// Singleton class to manage persistence of data
class Persistence {
  constructor() {
    if (!Persistence.instance) {
      this.users = [];
      this.entities = [];
      this.conexiones = [];  // ← Agregar conexiones
      this.maps = {};
      this.nextEntityId = 1; // ← Mover el ID aquí también
      Persistence.instance = this;
    }
    return Persistence.instance;
  }

  // Métodos helper para entities
  addEntity(entity) {
    this.entities. push(entity);
  }

  removeEntity(id) {
    this.entities = this.entities.filter(e => e.id !== id);
  }

  getEntityById(id) {
    return this.entities.find(e => e.id === id);
  }

  // Métodos helper para conexiones
  addConexion(conexion) {
    this.conexiones.push(conexion);
  }

  getConexionByUsername(username) {
    return this.conexiones.find(c => c.username === username);
  }

  getConexionByWs(ws) {
    return this.conexiones.find(c => c.ws === ws);
  }

  // Método para obtener el próximo ID
  getNextEntityId() {
    return this.nextEntityId++;
  }

  // Métodos para mapas
  setMap(name, map) {
    this.maps[name] = map;
  }

  getMap(name) {
    return this.maps[name];
  }
}

export default new Persistence();