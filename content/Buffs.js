const Buffs = {
  strengthBoost: {
    name: 'Aumento de Fuerza',  
    effect: {
      stat: 'strength',
      multiplier: 1.5, 
      duration: 15000, // Duración del efecto hasta poder volver a usar
      appliedAt: null, // Marca de tiempo cuando se aplicó
    }
  },
  speedBoost: {
    name:  'Aumento de Velocidad',
    effect: {
      stat: 'speed',
      multiplier: 1.5,
      duration: 10000,
      appliedAt: null,
    }
  },
  defenseBoost: {   
    name: 'Aumento de Defensa',
    effect: {
      stat: 'defense',
      multiplier:  1.5,
      duration: 20000,
      appliedAt: null,
    }
  },
  healthBoost: {
    name: 'Aumento de Regeneración de Salud',
    effect:  {
      stat: 'healthRegen',
      multiplier:  2,
      duration: 10000,
      appliedAt: null,
    }
  },
  energyBoost:  {
    name: 'Aumento de Regeneración de Energía',
    effect: {
      stat: 'energyRegen',
      multiplier:  2,
      duration: 10000,
      appliedAt: null,
    }
  },
  instantHealth: {
    name: 'Curación Instantánea',
    effect: {
      stat: 'health',
      amount: 50, // Restaura 50 de vida
      duration: 3000, // Duración del efecto hasta poder volver a usar
      appliedAt: null,
    } 
  },
  instantEnergy: {
    name: 'Recuperación Instantánea de Energía',
    effect: {
      stat: 'energy',
      amount: 50, // Restaura 50 de energía
      duration: 3000, // Duración del efecto hasta poder volver a usar
      appliedAt: null,
    }
  },
  // Buffs para manejar cooldowns de poderes
  powerCooldown: {
    name: 'Cooldown de Poder',
    effect: { 
      power: null, // Se asignará el poder específico
      stat: 'cooldown',
      multiplier: 1,
      duration: null, // Duración variable según el poder
      appliedAt: null,
    }
  }
};

export default Buffs;
// module.exports = Buffs;