// Importar clases base
import Entity from './Entity.js';
import Hitbox, { Circle, Rectangle } from './Hitbox.js';

// Importar contenido de pociones y buffs
import Potions from './content/Potions.js';
import Buffs from "./content/Buffs.js";

// Importar inventario inicial
import Inventory from './content/Inventory.js';

class Player extends Entity {
  constructor(id, username, x, y) {
    super(id, 'player', x, y);
    this.username = username;
    // Estados actuales
    this.energy = 100; // Energía actual
    this.health = 100; // Salud actual

    this.stats = {
      // Stats incrementables
      strength: 10,
      defense: 5,
      maxHealth: 100,
      maxEnergy: 100,
      agility: 5,
      
      // Stats calculados en base a otros, modificables por buffs y equipamientos
      speed: 3,
      fireResistance: 0,
      iceResistance: 0,
      lightningResistance: 0,
      earthResistance: 0,
      healthRegen: 0.05,
      energyRegen:  0.2,

      // Otros stats
      experience: 0,
      freePoints: 0,
    };
    // Hitbox del jugador: un círculo principal
    this.hitbox = new Hitbox(x, y, [
      new Circle(20), // Radio de 20
    ]);
    // Buffs activos
    this.buffs = []
    // Poderes recientes usados por el jugador (para cooldowns, etc.)
    this.powers = [];
    // Equipamiento del jugador
    this.equipment = {
      rightHand: null,
      leftHand: null,
      chest: null,
      gloves: null,
      pants: null,
      boots: null,
      helmet: null,
      wings: null,
      gold: 0,
      jewelry: {
        ring1: null,
        ring2: null,
        necklace: null,
      },
      inventory: new Inventory(32), // Inventario con 32 slots
    };
    // socket asociado al jugador (servidor)
    this.owner = null;
  }

  update(entities) {
    // muevo el jugador normalmente
    super.update();
    
    // Actualizar buffs (eliminar expirados)
    this.updateBuffs();
    // Regenerar salud y energía
    this.regenerate();
  }

  updateBuffs() {
    const now = Date.now();
    // Filtrar buffs expirados
    this.buffs = this.buffs.filter((buff) => {
      const isActive = now - buff.appliedAt < buff.duration;  
      if (!isActive) {
        console.log(`Buff ${buff.name} de ${this.username} ha expirado. `);
      }
      return isActive;
    });
  }

  applyBuff(buffType) {
    const buffTemplate = Buffs[buffType];
    
    if (!buffTemplate) {
      console.log(`Buff desconocido: ${buffType}`);
      return { success: false, reason: 'unksnown_buff' };
    }

    // Verificar si ya tiene este buff activo
    const existingBuff = this.buffs.find((b) => b.type === buffType);
    
    if (existingBuff) {
      // Renovar duración del buff existente
      existingBuff.appliedAt = Date.now();
      console.log(`Buff ${buffTemplate.name} de ${this.username} renovado.`);
      return { success: true, renewed: true };
    }

    // Agregar nuevo buff a la lista
    const newBuff = {
      type: buffType,
      name: buffTemplate.name,
      stat: buffTemplate.effect.stat,
      multiplier: buffTemplate.effect.multiplier,
      duration: buffTemplate.effect.duration,
      appliedAt: Date.now(),
    };

    this.buffs.push(newBuff);
    console.log(`${this.username} activó buff ${buffTemplate.name} por ${buffTemplate.effect.duration / 1000}s`);
    
    return { success: true, renewed: false };
  }

  applyInstantEffect(effect) {
    switch (effect.stat) {
      case 'health':
        this.health = Math.min(this.maxHealth, this.health + effect. amount);
        console.log(`${this.username} recuperó ${effect.amount} de vida.  Vida actual: ${Math.round(this.health)}`);
        break;

      case 'energy':
        this. energy = Math.min(this. maxEnergy, this.energy + effect.amount);
        console.log(`${this.username} recuperó ${effect.amount} de energía. Energía actual: ${Math.round(this.energy)}`);
        break;

      default:
        console.log(`Estadística desconocida: ${effect.stat}`);
    }
  }

  // Obtener el multiplicador total para una stat
  getStatMultiplier(statName) {
    let multiplier = 1;

    this.buffs.forEach((buff) => {
      if (buff.stat === statName) {
        multiplier *= buff.multiplier;
      }
    });
    return multiplier;
  }

   // Obtener el valor efectivo de una stat (base * multiplicador)
  getStat(statName) {
    const baseValue = this.stats[statName] || 0;
    const multiplier = this.getStatMultiplier(statName);
    return baseValue * multiplier;
  }

  regenerate() {
    const maxHealth = this.getStat('maxHealth');
    const maxEnergy = this.getStat('maxEnergy');
    const healthRegen = this.getStat('healthRegen');
    const energyRegen = this.getStat('energyRegen');

    // Regenerar salud
    if (this.health < maxHealth) {
      this.health += healthRegen;
      if (this.health > maxHealth) {
        this.health = maxHealth;
      }
    }

    // Regenerar energía
    if (this.energy < maxEnergy) {
      this.energy += energyRegen;
      if (this.energy > maxEnergy) {
        this.energy = maxEnergy;
      }
    }
  }

  usePotion(potionType) {
    // Mapear tipo de poción al tipo de buff
    const potionToBuffMap = {
      strength:  'strengthBoost',
      speed: 'speedBoost',
      defense: 'defenseBoost',
      health: 'healthBoost',
      energy: 'energyBoost',
    };

    const buffType = potionToBuffMap[potionType];

    if (!buffType) {
      console.log(`Poción desconocida: ${potionType}`);
      return { success: false, reason: 'unknown_potion' };
    }

    // Aplicar buff
    const result = this.applyBuff(buffType);

    if (result.success) {
      this.potions[potionType]--;
      console.log(`${this.username} usó poción de ${potionType}.  Restantes: ${this.potions[potionType]}`);
    }
    return result;
  }

  die() {
    this.isDead = true;
    this.vx = 0;
    this.vy = 0;
    this.respawnTime = Date.now() + this.respawnDelay;
    
    // Desactivar todos los buffs al morir
    Object.keys(this.buffs).forEach((buffName) => {
      this.buffs[buffName].active = false;
      this.buffs[buffName]. appliedAt = null;
    });

    console.log(`Jugador ${this.username} murió.  Respawn en ${this.respawnDelay / 1000} segundos.`);
  }

  respawn() {
    this.isDead = false;
    this. health = this.maxHealth;
    this.energy = this.maxEnergy;
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.respawnTime = null;
    this.lastFireTime = 0;
    this. speed = this.baseSpeed;
    console.log(`Jugador ${this.username} ha reaparecido.`);
  }

  getState() {
    // Calcular tiempo restante de cada buff
    const activeBuffs = {};
    Object.keys(this. buffs).forEach((buffName) => {
      const buff = this.buffs[buffName];
      if (buff.active && buff.appliedAt) {
        activeBuffs[buffName] = {
          active: true,
          remaining: Math.max(0, buff.duration - (Date.now() - buff.appliedAt)),
        };
      }
    });

    return {
      ... super.getState(),
      username: this.username,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      maxHealth: this.maxHealth,
      owner: this.owner,
      radius: this.radius,
      respawnTime: this.respawnTime,
      speed: this.speed,
      buffs: activeBuffs, // Enviar buffs activos al cliente
    };
  }
}

export default Player;