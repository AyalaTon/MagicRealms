const Potions = {
  energy: {
    name: 'Poción de Energía',
    buff: 'energyBoost',
    effect: {
      type: 'buff', // Aplica un buff 
      stat: 'energy', // Qué estadística afecta
      multiplier: 2, // Multiplicador de regeneración
      duration: 10000, // Duración en ms (10 segundos)
    }
  },
  health: {
    name: 'Poción de Vida',
    buff: 'healthBoost',
    effect: {
      type: 'buff',
      stat: 'health',
      multiplier: 2,
      duration: 10000,
    }
  },
  speed: {
    name: 'Poción de Velocidad',
    buff: 'speedBoost',
    effect: {
      type: 'buff',
      stat: 'speed',
      multiplier: 1.5,
      duration: 8000,
    }
  },
  instant_health: {
    name: 'Poción de Curación Instantánea',
    buff: null, // No tiene buff, efecto instantáneo
    effect: {
      type: 'instant',
      stat: 'health',
      amount: 50, // Restaura 50 de vida
    }
  },
  instant_energy: {
    name: 'Poción de Energía Instantánea',
    buff: null, // No tiene buff, efecto instantáneo
    effect: {
      type: 'instant',
      stat: 'energy',
      amount: 50, // Restaura 50 de energía
    }
  }
};

export { Potions };