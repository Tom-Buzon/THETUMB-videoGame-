# Snake Boss Configuration Implementation

## Overview
This document details the implementation plan for updating config.js with snake boss configurations. The configurations will define the snake boss's properties, behaviors, and visual characteristics.

## Current Configuration Structure

### Existing Boss Configuration
The current config.js contains a BOSS section:
```javascript
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
```

## New Snake Boss Configuration

### Configuration Section
A new SNAKE_BOSS section will be added to ENEMY_CONFIG:
```javascript
SNAKE_BOSS: {
  SIZE: 30,
  SEGMENT_SIZE: 15,
  SEGMENT_COUNT: 15,
  HEALTH: 600,
  MAX_HEALTH: 600,
  SPEED: 1.0,
  PHASE_THRESHOLDS: [420, 240, 120],
  ATTACK_COOLDOWNS: {
    PHASE_1: {
      basicProjectile: 100,
      sweep: 150
    },
    PHASE_2: {
      basicProjectile: 70,
      sweep: 100,
      homingMissile: 120
    },
    PHASE_3: {
      basicProjectile: 50,
      sweep: 80,
      homingMissile: 90,
      poisonCloud: 150
    },
    PHASE_4: {
      basicProjectile: 30,
      sweep: 50,
      homingMissile: 60,
      poisonCloud: 100,
      ultimate: 200
    }
  },
  COLORS: {
    PHASE_1: '#00ff00',
    PHASE_2: '#ffff00',
    PHASE_3: '#ff9900',
    PHASE_4: '#ff0000'
  },
  VITAL_POINT_COLOR: '#ffffff',
  TRAIL_PARTICLES: 20,
  AURA_RADIUS: 60,
  AURA_COLOR: '#00ff00',
  AURA_INTENSITY: 0.6
}
```

## Configuration Details

### Size and Structure
- **SIZE**: Overall size of the snake head
- **SEGMENT_SIZE**: Size of each body segment
- **SEGMENT_COUNT**: Total number of segments in the snake

### Health and Combat
- **HEALTH**: Starting health value
- **MAX_HEALTH**: Maximum health value
- **SPEED**: Base movement speed (modified by phases)
- **PHASE_THRESHOLDS**: Health percentages for phase transitions

### Attack System
- **ATTACK_COOLDOWNS**: Cooldown values for each attack per phase
- Each phase has different available attacks with varying cooldowns

### Visual Properties
- **COLORS**: Color scheme for each phase
- **VITAL_POINT_COLOR**: Color for vital point segments
- **TRAIL_PARTICLES**: Number of particles in trail effects
- **AURA_RADIUS**: Radius of aura effect
- **AURA_COLOR**: Color of aura effect
- **AURA_INTENSITY**: Intensity of aura effect

## Integration with Existing Systems

### Configuration Access
The snake boss will access configurations through:
```javascript
import { ENEMY_CONFIG } from '../config.js';

// Access snake boss configurations
const config = ENEMY_CONFIG.SNAKE_BOSS;
this.size = config.SIZE;
this.health = config.HEALTH;
// ... etc
```

### Consistency with Other Enemies
The configuration structure follows the same pattern as other enemies:
```javascript
// Similar to other enemy configurations
CHARGER: {
  SIZE: 25,
  HEALTH: 80,
  MAX_HEALTH: 80,
  SPEED: 3,
  COLOR: '#ff4444'
  // ... other properties
}
```

## Balance Considerations

### Health and Damage
- Snake boss has more health than regular boss (600 vs 500)
- This accounts for the vital point system making it harder to damage
- Phase thresholds are adjusted accordingly

### Speed Progression
- Base speed is slightly lower than regular boss
- Phase-based speed increases compensate for this
- Final phase speed exceeds regular boss speed

### Attack Frequency
- Attacks become more frequent as phases progress
- Cooldown values are balanced to increase difficulty
- Ultimate attack in phase 4 provides high impact

## Implementation Steps

### Step 1: Add Configuration Section
- Add SNAKE_BOSS section to ENEMY_CONFIG
- Define all required properties
- Ensure consistency with existing configuration patterns

### Step 2: Verify Configuration Access
- Test that configurations can be imported correctly
- Verify that all properties are accessible
- Check for any naming conflicts

### Step 3: Balance Tuning
- Adjust health values based on playtesting
- Fine-tune attack cooldowns
- Verify phase transition points

### Step 4: Documentation
- Add comments explaining each configuration property
- Document the reasoning behind balance decisions
- Update any relevant documentation

## Configuration Properties Breakdown

### Size Properties
```javascript
SIZE: 30,           // Head size - affects collision and visual presence
SEGMENT_SIZE: 15,   // Body segment size - smaller than head for visual hierarchy
SEGMENT_COUNT: 15   // Total segments - affects length and complexity
```

### Health Properties
```javascript
HEALTH: 600,        // Starting health - higher than regular boss
MAX_HEALTH: 600,    // Maximum health - same as starting for consistency
SPEED: 1.0,         // Base speed - modified by phase progression
PHASE_THRESHOLDS: [420, 240, 120] // 70%, 40%, 20% health points
```

### Attack Configuration
Each phase has different available attacks with specific cooldowns:
- **Phase 1**: Basic attacks only
- **Phase 2**: Adds homing missiles
- **Phase 3**: Adds poison cloud
- **Phase 4**: Adds ultimate attack

### Visual Configuration
```javascript
COLORS: {
  PHASE_1: '#00ff00',  // Green for initial phase
  PHASE_2: '#ffff00',  // Yellow for increased threat
  PHASE_3: '#ff9900',  // Orange for high threat
  PHASE_4: '#ff0000'   // Red for maximum threat
},
VITAL_POINT_COLOR: '#ffffff', // White for clear identification
TRAIL_PARTICLES: 20,          // Particle density for trail effects
AURA_RADIUS: 60,              // Aura size
AURA_COLOR: '#00ff00',        // Aura color (matches phase 1)
AURA_INTENSITY: 0.6           // Aura visibility
```

## Performance Considerations

### Memory Usage
- Configuration objects are loaded once at startup
- Minimal memory overhead
- No runtime performance impact

### Access Patterns
- Configurations are accessed during initialization
- Some properties accessed during gameplay (attack cooldowns)
- Cached values used where possible to minimize lookups

## Testing Plan

### Configuration Validation
- Verify all configuration values are correctly imported
- Check that default values are reasonable
- Test edge cases (zero values, negative values)

### Balance Testing
- Playtest with different health values
- Adjust attack cooldowns based on difficulty feedback
- Verify phase transitions occur at appropriate times

### Integration Testing
- Test with both boss types in room 3
- Verify that configurations don't conflict
- Check that scaling still works correctly

## Future Extensibility

### Additional Properties
The configuration structure allows for easy addition of new properties:
```javascript
// Future expansion possibilities
SNAKE_BOSS: {
  // ... existing properties
  SPECIAL_ABILITIES: {
    PHASE_2: ['temporary_invulnerability'],
    PHASE_3: ['segment_detachment'],
    PHASE_4: ['area_slow']
  },
  DEATH_EFFECTS: {
    PARTICLE_COUNT: 100,
    EXPLOSION_COUNT: 5,
    DURATION: 3000
  }
}
```

### Per-Dungeon Scaling
Configurations could be extended to support dungeon-specific scaling:
```javascript
SNAKE_BOSS: {
  // ... base properties
  DUNGEON_SCALING: {
    DUNGEON_1: { HEALTH_MULTIPLIER: 1.0, DAMAGE_MULTIPLIER: 1.0 },
    DUNGEON_2: { HEALTH_MULTIPLIER: 1.2, DAMAGE_MULTIPLIER: 1.1 },
    DUNGEON_3: { HEALTH_MULTIPLIER: 1.5, DAMAGE_MULTIPLIER: 1.3 },
    DUNGEON_4: { HEALTH_MULTIPLIER: 2.0, DAMAGE_MULTIPLIER: 1.6 },
    DUNGEON_5: { HEALTH_MULTIPLIER: 2.5, DAMAGE_MULTIPLIER: 2.0 }
  }
}
```

## Error Handling

### Default Values
Configuration properties should have sensible defaults:
```javascript
// In snake boss implementation
this.size = config.SIZE || 30;
this.health = config.HEALTH || 600;
this.maxHealth = config.MAX_HEALTH || 600;
```

### Validation
Basic validation can be performed during initialization:
```javascript
// Validate configuration values
if (config.SEGMENT_COUNT < 3) {
  console.warn('Snake boss should have at least 3 segments');
  config.SEGMENT_COUNT = 3;
}
```

## Documentation Updates

### Inline Comments
Add comments to explain complex configuration properties:
```javascript
SNAKE_BOSS: {
  // Size properties
  SIZE: 30,           // Head size in pixels
  SEGMENT_SIZE: 15,   // Body segment size in pixels
  SEGMENT_COUNT: 15,  // Number of segments (affects snake length)
  
  // Combat properties
  HEALTH: 600,        // Starting health points
  MAX_HEALTH: 600,    // Maximum health points
  SPEED: 1.0,         // Base movement speed (modified by phases)
  
  // Phase thresholds as health values (not percentages)
  PHASE_THRESHOLDS: [420, 240, 120], // 70%, 40%, 20% of max health
}
```

### External Documentation
Update any relevant documentation to include:
- Explanation of snake boss configurations
- Balance rationale
- Tuning guidelines

## Implementation Timeline

### Phase 1: Basic Configuration
- Add SNAKE_BOSS section to config.js
- Define all required properties
- Test configuration access

### Phase 2: Integration Testing
- Verify configurations work with snake boss implementation
- Test with existing boss for compatibility
- Check balance and adjust as needed

### Phase 3: Polish and Documentation
- Add comprehensive comments
- Update external documentation
- Final validation and testing

## Risk Assessment

### Low Risk Factors
- Configuration changes are isolated to one file
- Existing functionality is unaffected
- Easy to roll back if issues occur

### Medium Risk Factors
- Balance may need adjustment based on playtesting
- Configuration values may need fine-tuning
- Potential conflicts with future enemy types

### Mitigation Strategies
- Thorough playtesting and balance adjustments
- Clear documentation of configuration rationale
- Version control to track configuration changes