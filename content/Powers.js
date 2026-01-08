const Powers = {
    fireball: {
        damage: 30,
        speed: 10,
        cooldown: 2000,
        energyCost: 15,
        attribute: 'fire'
    },
    iceblast: {
        damage: 25,
        speed: 12,
        cooldown: 2500,
        energyCost: 20,
        attribute: 'ice'
    },
    lightningstrike: {
        damage: 35,
        speed: 15,
        cooldown: 3000,
        energyCost: 25,
        attribute: 'lightning'
    },
    earthquake: {
        damage: 40,
        speed: 8,
        cooldown: 4000,
        energyCost: 30,
        attribute: 'earth'
    }
};

module.exports = Powers;