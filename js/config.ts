// Game Configuration File
// Contains all configurable values for the game

// Player Configuration
export const PLAYER_CONFIG = {
  SIZE: 15,
  INITIAL_HEALTH: 500,
  MAX_HEALTH: 500,
  SPEED: 1,
  COLOR: '#00ff00',
  FRICTION: 0.85,
  BOUNCE_DAMPING: 0.9,
  
  // Companion Configuration
  COMPANION: {
    FIRE_RATE: 200, // milliseconds
    MAX_COMPANIONS: 3,
    COMPANION_HEALTH: 150,
    COMPANION_SIZE: 8,
    COMPANION_DISTANCE: 40,
    COMPANION_COLOR: '#ff99cc'
  },
  
  // Item Effects Configuration
  ITEM_EFFECTS: {
    SHIELD: {
      DURATION: 10000, // 10 seconds
      MAX_SHIELD: 200
    },
    GHOST: {
      DURATION: 5000, // 5 seconds
      COOLDOWN: 20000 // 20 seconds
    },
    BAZOOKA: {
      DURATION: 15000, // 15 seconds
      COOLDOWN: 45000 // 45 seconds
    },
    RICOCHET: {
      DURATION: 15000, // 15 seconds
      COOLDOWN: 45000 // 45 seconds
    },
    VALKYRIE: {
      DURATION: 8000, // 8 seconds
      COOLDOWN: 30000 // 30 seconds
    },
    TIME_BUBBLE: {
      DURATION: 5000, // 5 seconds
      COOLDOWN: 20000 // 20 seconds
    },
    BLACK_HOLE: {
      DURATION: 10000, // 10 seconds
      COOLDOWN: 30000, // 30 seconds
      EFFECT_DURATION: 3000, // 3 seconds
      ATTRACTION_RANGE: 300
    },
    COMPANION_ITEM: {
      COOLDOWN: 30000 // 30 seconds
    },
    GOD_PLAN: {
      DURATION: 20000, // 20 seconds
      COOLDOWN: 60000 // 60 seconds
    }
  },
  
  // Item Cooldowns (in milliseconds)
  ITEM_COOLDOWNS: {
    MEDKIT: 10000, // 10 seconds
    SHIELD: 30000, // 30 seconds
    GHOST: 20000, // 20 seconds
    BAZOOKA: 45000, // 45 seconds
    RICOCHET: 45000, // 45 seconds
    VALKYRIE: 30000, // 30 seconds
    TIME_BUBBLE: 20000, // 20 seconds
    BLACK_HOLE: 30000, // 30 seconds
    COMPANION: 30000, // 30 seconds
    GOD_PLAN: 60000, // 60 seconds
    RANDOM_BOX: 15000 // 15 seconds
  }
};

// Weapon Configuration
export const WEAPON_CONFIG = {
  STATES: {
    MINIGUN: {
      NAME: 'MINI GUN',
      HP_RANGE: [90, 100] as [number, number],
      FIRE_RATE: 50, // milliseconds
      DAMAGE: 6,
      RECOIL_MULT: 0.1,
      COLOR: '#00ff00'
    },
    AUTO: {
      NAME: 'AUTO RIFLE',
      HP_RANGE: [75, 89] as [number, number],
      FIRE_RATE: 100, // milliseconds
      DAMAGE: 10,
      RECOIL_MULT: 0.3,
      COLOR: '#00ff00'
    },
    BURST: {
      NAME: 'BURST RIFLE',
      HP_RANGE: [50, 74] as [number, number],
      FIRE_RATE: 300, // milliseconds
      DAMAGE: 25,
      RECOIL_MULT: 0.5,
      COLOR: '#ffff00'
    },
    SEMI: {
      NAME: 'SEMI-AUTO',
      HP_RANGE: [25, 49] as [number, number],
      FIRE_RATE: 600, // milliseconds
      DAMAGE: 80,
      RECOIL_MULT: 0.7,
      COLOR: '#ff6600'
    },
    SINGLE: {
      NAME: 'SINGLE SHOT',
      HP_RANGE: [11, 24] as [number, number],
      FIRE_RATE: 1200, // milliseconds
      DAMAGE: 200,
      RECOIL_MULT: 0.9,
      COLOR: '#ff0000'
    },
    LASER: {
      NAME: 'LASER',
      HP_RANGE: [1, 10] as [number, number],
      FIRE_RATE: 1200, // milliseconds
      DAMAGE: 800,
      RECOIL_MULT: 1,
      COLOR: '#ff0000'
    }
  }
};

// Bullet Configuration
export const BULLET_CONFIG = {
  PLAYER_BULLET: {
    SIZE: 5,
    LIFE: 150,
    MAX_LIFE: 150,
    MAX_TRAIL_LENGTH: 8,
    TRAIL_ALPHA: 0.7,
    MUZZLE_FLASH_DURATION: 5
  },
  ENEMY_BULLET: {
    SIZE: 3,
    LIFE: 150,
    MAX_LIFE: 150
  },
  COMPANION_BULLET: {
    SIZE: 3,
    DAMAGE: 20,
    COLOR: '#ff99cc',
    SPEED: 6
  },
  TRAIL_COLORS: {
    PLAYER: '#00ffff',
    ENEMY: '#ff4444',
    EXPLODER: '#ff6600',
    CHARGER: '#ff0000',
    SHOOTER: '#44ff44',
    SNIPER: '#8844ff',
    HEALER: '#ff00ff',
    SWARMER: '#ff6600'
  }
};

// Enemy Configuration
export const ENEMY_CONFIG = {
  BASE: {
    SIZE: 12,
    HEALTH: 20,
    MAX_HEALTH: 20,
    SPEED: 1,
    COLOR: '#ff0000'
  },
  CHARGER: {
    SIZE: 25,
    HEALTH: 80,
    MAX_HEALTH: 80,
    SPEED: 3,
    COLOR: '#ff4444',
    CHARGE_SPEED: 8,
    CHARGE_COOLDOWN: 60,
    MAX_CHARGE_DURATION: 30,
    CHARGE_DAMAGE: 25
  },
  SHOOTER: {
    SIZE: 18,
    HEALTH: 50,
    MAX_HEALTH: 50,
    SPEED: 1.5,
    COLOR: '#44ff44',
    SHOOT_RANGE: 800,
    SHOOT_COOLDOWN: 30, // 1 second
    BULLET_DAMAGE: 15,
    BULLET_SPEED: 5
  },
  EXPLODER: {
    SIZE: 15,
    HEALTH: 30,
    MAX_HEALTH: 30,
    SPEED: 2,
    COLOR: '#ff6600',
    EXPLOSION_DAMAGE: 50,
    EXPLOSION_RADIUS: 50,
    DETONATION_RANGE: 30
  },
  SWARMER: {
    SIZE: 8,
    HEALTH: 10,
    MAX_HEALTH: 10,
    SPEED: 4,
    COLOR: '#ff6600'
  },
  HEALER: {
    SIZE: 20,
    HEALTH: 40,
    MAX_HEALTH: 40,
    SPEED: 1,
    COLOR: '#ff00ff',
    HEAL_AMOUNT: 20,
    HEAL_RANGE: 100,
    HEAL_COOLDOWN: 120
  },
  SNIPER: {
    SIZE: 16,
    HEALTH: 60,
    MAX_HEALTH: 60,
    SPEED: 0.8,
    COLOR: '#8844ff',
    SHOOT_RANGE: 1000,
    SHOOT_COOLDOWN: 90, // 1.5 seconds
    BULLET_DAMAGE: 30,
    BULLET_SPEED: 7,
    PRECISION: 0.95
  },
  BOSS: {
    SIZE: 45,
    HEALTH: 500,
    MAX_HEALTH: 500,
    SPEED: 1.2,
    COLOR: '#8B0000',
    PHASE_THRESHOLDS: [350, 200, 100],
    ATTACK_COOLDOWNS: {
      PHASE_1: 90,
      PHASE_2: 60,
      PHASE_3: 45,
      PHASE_4: 30
    },
    AURA_RADIUS: 80,
    AURA_COLOR: '#ff0000',
    AURA_INTENSITY: 0.5,
    MINION_SPAWN_COOLDOWN: 180,
    TELEPORT_COOLDOWN: 180,
    SHIELD_COOLDOWN: 300,
    SHIELD_DURATION: 2000,
    SHIELD_DAMAGE_REDUCTION: 0.3
  }
};

// Item Configuration
export const ITEM_CONFIG = {
  BASE: {
    RADIUS: 15
  },
  MEDKIT: {
    COLOR: "#00ff99",
    HEAL_AMOUNT: 50,
    COOLDOWN: 10000 // 10 seconds
  },
  SHIELD: {
    COLOR: "#66ffff",
    SHIELD_AMOUNT: 200,
    DURATION: 10000, // 10 seconds
    COOLDOWN: 30000 // 30 seconds
  },
  BAZOOKA: {
    COLOR: "#ff3333",
    DURATION: 15000, // 15 seconds
    COOLDOWN: 45000 // 45 seconds
  },
  COMPANION: {
    COLOR: "#ff99cc"
  },
  GHOST: {
    COLOR: "#cccccc",
    DURATION: 5000, // 5 seconds
    COOLDOWN: 20000 // 20 seconds
  },
  TIME_BUBBLE: {
    COLOR: "#99ccff",
    DURATION: 5000, // 5 seconds
    COOLDOWN: 20000, // 20 seconds
    SLOW_FACTOR: 0.3 // 70% slower
  },
  BLACK_HOLE: {
    COLOR: "#333399",
    DURATION: 3000, // 3 seconds
    COOLDOWN: 30000, // 30 seconds
    ATTRACTION_RANGE: 300
  },
  VALKYRIE: {
    COLOR: "#ffcc00",
    DURATION: 8000, // 8 seconds
    COOLDOWN: 30000 // 30 seconds
  },
  RANDOM_BOX: {
    COLOR: "#9966ff",
    COOLDOWN: 15000 // 15 seconds
  },
  RICOCHET: {
    COLOR: "#00ccff",
    DURATION: 15000, // 15 seconds
    COOLDOWN: 45000, // 45 seconds
    MAX_BOUNCES: 3
  },
  GOD_PLAN: {
    COLOR: "#ffffff",
    DURATION: 20000, // 20 seconds
    COOLDOWN: 60000 // 60 seconds
  }
};

// Room Configuration
export const ROOM_CONFIG = {
  CANVAS_WIDTH: 1400,
  CANVAS_HEIGHT: 1000,
  MAX_DUNGEONS: 5,
  MAX_ROOMS: 3,
  
  ENEMY_COUNT: {
    DUNGEON_1: 5,
    DUNGEON_2: 6,
    DUNGEON_3: 7,
    DUNGEON_4: 8,
    DUNGEON_5: 10
  },
  
  OBSTACLE_COUNT: {
    DUNGEON_1: 7,
    DUNGEON_2: 10,
    DUNGEON_3: 13,
    DUNGEON_4: 15,
    DUNGEON_5: 18
  },
  
  BASE_ITEM_COUNT: 1,
  
  ITEM_RARITY: {
    COMMON: ['Medkit', 'Valkyrie'],
    UNCOMMON: ['Shield', 'Ghost', 'Companion'],
    RARE: ['Bazooka', 'Ricochet', 'TimeBubble'],
    EPIC: ['BlackHole', 'GodPlan', 'RandomBox']
  }
};

// Particle Configuration
export const PARTICLE_CONFIG = {
  EXPLOSION: {
    COUNT: 20,
    LIFE: 30,
    MAX_LIFE: 50,
    SIZE: { MIN: 2, MAX: 6 }
  },
  MUZZLE_FLASH: {
    COUNT: 10,
    LIFE: 10,
    MAX_LIFE: 10,
    SIZE: { MIN: 1, MAX: 4 }
  },
  IMPACT_SPARKS: {
    COUNT: 6,
    LIFE: 10,
    MAX_LIFE: 10,
    SIZE: { MIN: 1, MAX: 3 }
  },
  DEATH_BURST: {
    COUNT_MULTIPLIER: 3,
    LIFE: 60,
    MAX_LIFE: 90,
    SIZE: { MIN: 1, MAX: 4 }
  },
  DISSOLVE_EFFECT: {
    COUNT_MULTIPLIER: 3,
    LIFE: 40,
    MAX_LIFE: 60,
    SIZE: { MIN: 1, MAX: 3 }
  }
};

// UI Configuration
export const UI_CONFIG = {
  HUD_HEIGHT: 60,
  HEALTH_BAR: {
    WIDTH: 200,
    HEIGHT: 20,
    X: 20,
    Y: 20
  },
  COMBO: {
    MAX_TIME: 2000 // 2 seconds
  },
  COLORS: {
    RED: '#FF0000',
    ORANGE: '#FF6600',
    YELLOW: '#FFFF00',
    GREEN: '#00FF00',
    CYAN: '#00FFFF',
    WHITE: '#FFFFFF',
    DARK_RED: '#8B0000',
    DARK_GRAY: '#333333'
  }
};

// Audio Configuration
export const AUDIO_CONFIG = {
  SOUNDS: {
    ITEM_PICKUP: "itemPickup",
    ITEM_SPAWN: "itemSpawn",
    BLACK_HOLE: "blackHole",
    EXPLOSION: "explosion",
    ROOM_CHANGE: "roomChange",
    GUNSHOT: "gunshot"
  }
};

// Game Progression Configuration
export const PROGRESSION_CONFIG = {
  ENEMY_SCALING: {
    HEALTH_MULTIPLIER: 1.4,
    SPEED_MULTIPLIER: 1.2,
    DAMAGE_MULTIPLIER: 1.3
  },
  OBSTACLE_SCALING: {
    COUNT_MULTIPLIER: 2,
    DAMAGE_INCREASE: 0.15
  },
  ITEM_SPAWNING: {
    COUNT_MULTIPLIER: 0.5,
    ROOM_MULTIPLIER: 0.3
  }
};