class Conexion {
  constructor(ws, username, player) {
    this.ws = ws;
    this.username = username;
    this.status = 'conectado';
    this.player = player;
  }

  sendState(entities) {
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      const snapshot = entities.map((e) => e.getState()); // Genera el snapshot aquí
      this.ws.send(JSON.stringify({ type: 'update', entities: snapshot }));
    }
  }
}

export default Conexion;
// module.exports = Conexion;