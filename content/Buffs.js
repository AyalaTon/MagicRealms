const Buffs = {
  strengthBoost: {
    name: 'Aumento de Fuerza',  
    effect: {
      stat: 'strength',
      multiplier: 1.5,
      duration: 15000,
    }
  },
  speedBoost: {
    name:  'Aumento de Velocidad',
    effect: {
      stat: 'speed',
      multiplier: 1.5,
      duration: 10000,
    }
  },
  defenseBoost: {   
    name: 'Aumento de Defensa',
    effect: {
      stat: 'defense',
      multiplier:  1.5,
      duration: 20000,
    }
  }, 
  healthBoost: {
    name: 'Aumento de Regeneración de Salud',
    effect:  {
      stat: 'healthRegen',
      multiplier:  2,
      duration: 10000,
    }
  },
  energyBoost:  {
    name: 'Aumento de Regeneración de Energía',
    effect: {
      stat: 'energyRegen',
      multiplier:  2,
      duration: 10000,
    }
  }
};

module.exports = Buffs;