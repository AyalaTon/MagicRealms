class Entity {
  constructor(id, type = 'generic', x = 0, y = 0) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.direction = 0;
    this.isDead = false;
    this.speed = 0;

    // Hitbox por defecto (vacía, las subclases la definen)
    this.hitbox = null;
  }

  update() {
    if (!this.isDead) {
      this.updatePosition();
    }
  }

  updatePosition() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.hitbox) {
      this.hitbox.setPosition(this.x, this.y);
    }
  }

  // Verificar colisión con otra entidad
  collidesWith(other) {
    if (!this.hitbox || !other.hitbox) {
      return false;
    }
    return this.hitbox.collidesWith(other.hitbox);
  }

  die() {
    this.isDead = true;
    this.vx = 0;
    this.vy = 0;
    console.log(`Entidad ${this.id} (${this.type}) murió.`);
  }

  setDirection(angle) {
    this.direction = angle;
  }

  getState() {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      direction: this.direction,
      isDead: this.isDead,
      hitbox: this.hitbox ?  this.hitbox.getState() : null,
    };
  }
}

export default Entity;
// module.exports = { Entity };