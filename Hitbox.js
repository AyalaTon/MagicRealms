class Shape {
  constructor(type, offsetX = 0, offsetY = 0) {
    this.type = type; // 'circle' o 'rectangle'
    this.offsetX = offsetX; // Offset relativo al centro de la Hitbox
    this.offsetY = offsetY;
  }

  // Obtener posición absoluta en el mundo
  getWorldPosition(hitbox) {
    return {
      x: hitbox.x + this.offsetX,
      y: hitbox.y + this.offsetY,
    };
  }
}

class Circle extends Shape {
  constructor(radius, offsetX = 0, offsetY = 0) {
    super('circle', offsetX, offsetY);
    this.radius = radius;
  }

  // Verificar colisión con otra forma
  collidesWith(other, thisHitbox, otherHitbox) {
    const thisPos = this.getWorldPosition(thisHitbox);
    const otherPos = other.getWorldPosition(otherHitbox);

    if (other.type === 'circle') {
      return this.collidesWithCircle(thisPos, otherPos, other);
    } else if (other.type === 'rectangle') {
      return this.collidesWithRectangle(thisPos, otherPos, other);
    }
    return false;
  }

  collidesWithCircle(thisPos, otherPos, otherCircle) {
    const dx = thisPos.x - otherPos.x;
    const dy = thisPos.y - otherPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.radius + otherCircle.radius);
  }

  collidesWithRectangle(thisPos, rectPos, rect) {
    // Encontrar el punto más cercano del rectángulo al centro del círculo
    const closestX = Math.max(rectPos.x - rect.width / 2, Math.min(thisPos.x, rectPos.x + rect.width / 2));
    const closestY = Math.max(rectPos.y - rect.height / 2, Math.min(thisPos.y, rectPos.y + rect.height / 2));

    const dx = thisPos.x - closestX;
    const dy = thisPos.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < this.radius;
  }
}

class Rectangle extends Shape {
  constructor(width, height, offsetX = 0, offsetY = 0) {
    super('rectangle', offsetX, offsetY);
    this.width = width;
    this.height = height;
  }

  // Verificar colisión con otra forma
  collidesWith(other, thisHitbox, otherHitbox) {
    const thisPos = this.getWorldPosition(thisHitbox);
    const otherPos = other.getWorldPosition(otherHitbox);

    if (other.type === 'circle') {
      // Usar la lógica del círculo (invertida)
      return other.collidesWithRectangle(otherPos, thisPos, this);
    } else if (other.type === 'rectangle') {
      return this.collidesWithRectangle(thisPos, otherPos, other);
    }
    return false;
  }

  collidesWithRectangle(thisPos, otherPos, otherRect) {
    const thisLeft = thisPos.x - this.width / 2;
    const thisRight = thisPos.x + this.width / 2;
    const thisTop = thisPos.y - this.height / 2;
    const thisBottom = thisPos.y + this.height / 2;

    const otherLeft = otherPos.x - otherRect.width / 2;
    const otherRight = otherPos.x + otherRect.width / 2;
    const otherTop = otherPos.y - otherRect.height / 2;
    const otherBottom = otherPos.y + otherRect.height / 2;

    return !(thisRight < otherLeft || 
             thisLeft > otherRight || 
             thisBottom < otherTop || 
             thisTop > otherBottom);
  }
}

class Hitbox {
  constructor(x = 0, y = 0, shapes = []) {
    this.x = x;
    this.y = y;
    this.shapes = shapes; // Array de Shape (Circle, Rectangle, etc.)
  }

  // Actualizar posición de la hitbox
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // Agregar una forma a la hitbox
  addShape(shape) {
    this.shapes.push(shape);
  }

  // Verificar colisión con otra Hitbox
  collidesWith(otherHitbox) {
    // Verificar cada combinación de formas
    for (const thisShape of this.shapes) {
      for (const otherShape of otherHitbox.shapes) {
        if (thisShape.collidesWith(otherShape, this, otherHitbox)) {
          return true;
        }
      }
    }
    return false;
  }

  // Obtener datos para debug/visualización en cliente
  getState() {
    return {
      x: this.x,
      y: this.y,
      shapes: this.shapes.map((shape) => {
        if (shape.type === 'circle') {
          return {
            type: 'circle',
            radius: shape.radius,
            offsetX: shape.offsetX,
            offsetY: shape.offsetY,
          };
        } else if (shape.type === 'rectangle') {
          return {
            type: 'rectangle',
            width: shape.width,
            height: shape.height,
            offsetX: shape.offsetX,
            offsetY: shape.offsetY,
          };
        }
      }),
    };
  }
}

module.exports = { Hitbox, Shape, Circle, Rectangle };