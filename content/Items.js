const itemProperties = {
    sword_001: {
        name: "Espada Corta", // Nombre del item
        type: "weapon", // Tipo de item
        equipmentSlot: ["rightHand", "leftHand"], // Puede ser empuñada en ambas manos
        dualWieldable: false, // Ocupado por una mano
        stackSize: 1, // No apilable
        rarity: "common", // Rareza común [común, raro, épico, legendario, mítico, único, etc.]
        powers: ["slash", "stab"], // Poderes asociados al arma
        sprite: "sword_001.png", // Sprite del item
        attributes: {
            damage: 15, // Daño base
            attackSpeed: 1.2, // Velocidad de ataque
        },
    },
    potion_health_small: {
        name: "Poción de Vida Pequeña",
        buff: "instantHealth", // Buff asociado al uso
        type: "consumable",
        stackSize: 10, // Apilable hasta 10
        rarity: "common",
        sprite: "potion_health_small.png",
        attributes: {
            healAmount: 50, // Restaura 50 de vida
        },
    },
    potion_energy_small: {
        name: "Poción de Energía Pequeña",
        buff: "instantEnergy",
        type: "consumable",
        stackSize: 10,
        rarity: "common",
        sprite: "potion_energy_small.png",
        attributes: {
            energyAmount: 50, // Restaura 50 de energía
        },
    },
};

const itemMultipliers = {
    damage: 1.0,
    attackSpeed: 1.0,
    defense: 1.0,
    reflex: 1.0,
    speed: 1.0,
    healthRegen: 1.0,
    energyRegen: 1.0,
    maxHealth: 1.0,
    maxEnergy: 1.0,
    criticRatio: 1.0,
    fireResistance: 1.0,
    iceResistance: 1.0,
    lightningResistance: 1.0,
    earthResistance: 1.0,
    fireDamage: 1.0,
    iceDamage: 1.0,
    lightningDamage: 1.0,
    earthDamage: 1.0,
};

class ItemInstance {
    constructor(itemId, { quantity = 1, uniqueId = null, multipliers = {} } = {}) {
        if (!itemProperties[itemId]) {
            throw new Error(`ItemDefinition inválida: ${itemId}`);
        }

        this.itemId = itemId;
        this.uniqueId = uniqueId;

        // Blindar cantidad
        const stackSize = itemProperties[itemId].stackSize;
        this.quantity = stackSize === 1 ? 1 : Math.min(quantity, stackSize);

        this.multipliers = uniqueId
            ? { ...itemMultipliers, ...multipliers }
            : null;
    }

    get definition() {
        return itemProperties[this.itemId];
    }

    isStackable() {
        return this.definition.stackSize > 1;
    }

    maxStack() {
        return this.definition.stackSize;
    }
}

export default ItemInstance;
export { itemProperties, itemMultipliers };