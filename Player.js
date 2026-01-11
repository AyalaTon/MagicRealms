// Importar clases base
import Entity from './Entity.js';
import Hitbox, { Circle, Rectangle } from './Hitbox.js';

// Importar contenido de buffs
import Buffs from "./content/Buffs.js";
// Importar definiciones de items
import { itemProperties } from './content/Items.js';

// Importar inventario inicial
import Inventory from './content/Inventory.js';
import { e, re } from 'mathjs';

class Player extends Entity {
  constructor(id, username, x, y) {
    super(id, 'player', x, y);
    this.speed = 3; // Velocidad base del jugador || se puede modificar con equipamiento y buffs
    this.username = username;
    // Estados actuales
    this.energy = 100; // Energía actual
    this.health = 100; // Salud actual

    this.respawnDelay = 5000; // 5 segundos
    this.respawnTime = null;

    this.direction = 0; // Dirección inicial (en radianes)
    
    this.stats = {
      // Stats incrementables por el jugador
      strength: 10,
      defense: 5,
      maxHealth: 100,
      maxEnergy: 100,
      agility: 5,
      
      // Otros stats
      healthRegen: 0.2, // Salud por tick
      energyRegen: 0.5, // Energía por tick
      experience: 0,
      freePoints: 0,
    };
    // Hitbox del jugador: un círculo principal
    this.hitbox = new Hitbox(x, y, [
      new Circle(20), // Radio de 20
    ]);
    // Buffs activos | los cooldowns se manejaran como buffs temporales de tipo cooldown
    this.buffs = [];
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
  
  update() { // ToDo 
    // muevo el jugador normalmente
    super.update();
    
    // Actualizar buffs (eliminar expirados)
    this.updateBuffs();
    // Regenerar salud y energía
    this.regenerate();
  }

  getState() { // ToDo
    return {
      ... super.getState(),
      username: this.username,
      energy: this.energy,
      health: this.health,
      maxEnergy: this.getStat('maxEnergy'),
      maxHealth: this.getStat('maxHealth'),
      owner: this.owner,
      radius: this.hitbox.shapes[0].radius,
      respawnTime: this.respawnTime,
      speed: this.getSpeed(),
      direction: this.direction,
      buffs: this.buffs, // Enviar buffs activos al cliente
    };
  }

  setDirection(angle) {
    this.direction = angle;
  }

  // Obtener todos los items equipados (excluyendo gold, inventory, etc.)
  getEquippedItems() {
    const items = [];
    const equipmentSlots = ['rightHand', 'leftHand', 'chest', 'gloves', 'pants', 'boots', 'helmet', 'wings'];
    const jewelrySlots = ['ring1', 'ring2', 'necklace'];

    equipmentSlots.forEach((slot) => {
      const item = this.equipment[slot];
      if (item && item instanceof ItemInstance) {
        items.push(item);
      }
    });

    jewelrySlots.forEach((slot) => {
      const item = this.equipment.jewelry[slot];
      if (item && item instanceof ItemInstance) {
        items.push(item);
      }
    });

    return items;
  }
  // APROBADO ###############################################################

  // Actualizar buffs activos
  updateBuffs() {
    // Obtener tiempo actual
    const now = Date.now();
    //Verificar si algún buff ha expirado y eliminarlo de lo contrario aplicar efectos instantáneos
    const expiredBuffs = [];
    this.buffs.forEach((buff) => {
      if (buff.effect.duration) {
        const elapsed = now - buff.effect.appliedAt;
        if (elapsed >= buff.effect.duration) {
          expiredBuffs.push(buff);
        } else {
          // Buff aún activo
          // Aplicar efectos instantáneos si los hay
          if (buff.effect.stat === 'health' && buff.effect.amount) {
            // Curación instantánea
            const healAmount = buff.effect.amount;
            this.health += healAmount;
            if (this.health > this.getStat('maxHealth')) {
              this.health = this.getStat('maxHealth');
            }
          } else if (buff.effect.stat === 'energy' && buff.effect.amount) {
            // Recuperación instantánea de energía
            const energyAmount = buff.effect.amount;
            this.energy += energyAmount;
            if (this.energy > this.getStat('maxEnergy')) {
              this.energy = this.getStat('maxEnergy');
            }
          } // Aquí se pueden agregar más efectos instantáneos según sea necesario
          // Marcar como aplicado para no repetir
          buff.effect.amount = 0; // <- para que no se aplique más de una vez
        }
      }
    });
    this.buffs = this.buffs.filter(buff => !expiredBuffs.includes(buff));

    expiredBuffs.forEach((buff) => {
      console.log(`Buff ${buff.name} de ${this.username} ha expirado.`);
    });
    return;
  }
  // Aplicar un buff al jugador
  applyBuff(buffType) {
    const buffTemplate = Buffs[buffType];
    if (!buffTemplate) {
      console.log(`Buff desconocido: ${buffType}`);
      return { success: false, reason: 'unknown_buff' };
    }
    // Verificar si ya tiene este buff activo
    const existingBuff = this.buffs.find((b) => b.type === buffType);
    if (existingBuff) {
      console.log(`${this.username} ya tiene el buff ${buffTemplate.name} activo.`);
      return { success: false, reason: 'buff_already_active' };
    }
    // Aplicar nuevo buff - ¡GUARDAR EL TYPE!
    const newBuff = {
      type: buffType,  // ← ¡IMPORTANTE!  Guardar la key
      name: buffTemplate.name,
      effect: { 
        ... buffTemplate.effect,
        appliedAt: Date.now()  // ← appliedAt va dentro de effect
      }
    };
    this.buffs.push(newBuff);

    console.log(`${this.username} activó buff ${buffTemplate.name} por ${buffTemplate.effect.duration / 1000}s`);
    return { success: true };
  }
  // Usar una poción del inventario
  usePotion(potion) {
    if (this.equipment.inventory.hasItem(potion) === false) {
      console.log(`${this.username} no tiene poción de ${potion} en el inventario.`);
      return { success: false, reason: 'no_potion' };
    }
    const itemDef = itemProperties[potion];
    if (!itemDef) {
      console.log(`Item desconocido: ${potion}`);
      return { success: false, reason: 'unknown_item' };
    }
    if (!itemDef.buff) {
      console.log(`${potion} no tiene buff asociado. `);
      return { success: false, reason: 'no_buff' };
    }
    const buffType = itemDef. buff;
    const buffTemplate = Buffs[buffType];
    if (!buffTemplate) {
      console.log(`Buff desconocido: ${buffType}`);
      return { success: false, reason: 'unknown_buff' };
    }
    const existingBuff = this.buffs.find((b) => b.type === buffType);
    if (existingBuff) {
      console.log(`${this.username} no puede usar poción de ${itemDef.name} aún (en cooldown).`);
      return { success: false, reason: 'on_cooldown' };
    }
    this.applyBuff(buffType);
    // ✅ CORRECTO: acceder al inventario dentro de equipment
    this.equipment.inventory. consumeItem(potion, 1);
    return { success: true, potion: potion };
  }
  // Manejar respawn del jugador
  respawn(x, y) {
    this.isDead = false;
    this.health = this.getStat('maxHealth');
    this.energy = this.getStat('maxEnergy');
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.respawnTime = null;
    this.speed = this.getSpeed();
    this.hitbox.setPosition(x, y);
    console.log(`Jugador ${this.username} ha reaparecido.`);
  }
  // Manejar la muerte del jugador
  die() {
    this.isDead = true;
    this.vx = 0;
    this.vy = 0;
    this.respawnTime = Date.now() + this.respawnDelay;
    
    // Desactivar todos los buffs al morir
    this.buffs = [];
    console.log(`Jugador ${this.username} murió.  Respawn en ${this.respawnDelay / 1000} segundos.`);
  }
  // Obtener tasas de regeneración actuales considerando buffs y equipamiento
  getRegenRates() {
    let healthRegen = this.stats. healthRegen;
    let energyRegen = this.stats. energyRegen;

    // Aplicar modificadores de equipamiento
    this.getEquippedItems().forEach((item) => {
      if (item. definition?. attributes?.healthRegen) {
        healthRegen += item.definition.attributes.healthRegen;
      }
      if (item. definition?.attributes?.energyRegen) {
        energyRegen += item.definition.attributes.energyRegen;
      }
      // Multipliers están en item, no en definition
      if (item.multipliers?.healthRegen) {
        healthRegen *= item.multipliers.healthRegen;
      }
      if (item.multipliers?.energyRegen) {
        energyRegen *= item.multipliers.energyRegen;
      }
    });

    // Aplicar modificadores de buffs
    this.buffs.forEach((buff) => {
      if (buff.effect.stat === 'healthRegen') {
        healthRegen *= buff. effect.multiplier;
      }
      if (buff.effect. stat === 'energyRegen') {
        energyRegen *= buff.effect.multiplier;
      }
    });

    return { healthRegen, energyRegen };
  }
  // Obtener resistencia total para un atributo específico
  getResistance(attribute) {
    let resistance = 0;
    const resistanceAttr = attribute + 'Resistance';

    this.getEquippedItems().forEach((item) => {
      if (item.definition?.attributes?.[resistanceAttr]) {
        resistance += item.definition.attributes[resistanceAttr];
      }
      if (item.multipliers?.[resistanceAttr]) {
        resistance *= item.multipliers[resistanceAttr];
      }
    });

    // Aplicar buffs de resistencia
    this.buffs.forEach((buff) => {
      if (buff.effect.stat === resistanceAttr) {
        resistance *= buff.effect.multiplier;
      }
    });

    return resistance;
  }
  // Obtener velocidad actual considerando buffs y equipamiento
  getSpeed() {
    let speed = this.speed;
    this.getEquippedItems().forEach((item) => {
      if (item. definition?.attributes?.speed) {
        speed += item.definition.attributes.speed;
      }
      if (item.multipliers?.speed) {
        speed *= item. multipliers.speed;
      }
    });

    this.buffs.forEach((buff) => {
      if (buff.effect. stat === 'speed') {
        speed *= buff.effect.multiplier;
      }
    });

    return speed;
  }
  // Obtener lista de poderes disponibles según equipamiento
  getAvailablePowers() {
    this.availablePowers = [];
    ['rightHand', 'leftHand'].forEach((hand) => {
      const weapon = this.equipment[hand];
      if (weapon?.definition?.powers) {
        this.availablePowers.push(...weapon.definition.powers);
      }
    });
    return this.availablePowers;
  }
  // Obtener el multiplicador total para una stat
  getStatMultiplier(statName) {
    let multiplier = 1;
    this.buffs.forEach((buff) => {
      if(buff.effect.stat && buff.effect.stat === statName) {
        multiplier *= buff.effect.multiplier;
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
  // Regenerar salud y energía calculando tasas con buffs y equipamiento
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
}

export default Player;