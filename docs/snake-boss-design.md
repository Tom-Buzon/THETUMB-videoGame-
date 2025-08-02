# Snake Boss Design Document

## Overview
This document outlines the design and implementation plan for a new snake boss enemy for the game. The snake boss will be an alternative to the existing boss in room 3, with unique mechanics and visual effects that provide a different challenge for players.

## Vital Point System

### Concept
The snake boss will consist of multiple segments forming a long, serpentine body. Only specific segments (vital points) will be able to take damage that affects the boss's health. Other segments will be visually part of the snake but won't reduce the boss's health when hit.

### Implementation Details
- The snake will have a head segment (primary vital point) and several body segments
- Every 3rd segment will be a vital point that can take damage
- Non-vital segments will still have collision detection but won't reduce health
- Visual indicators will show which segments are vital points (glowing effect)

## Phase Progression and Mechanics

### Phase Structure
The snake boss will have 4 phases similar to the existing boss, with health thresholds determining phase transitions:

1. **Phase 1** (100% - 70% health): Basic movement and attacks
2. **Phase 2** (70% - 40% health): Increased speed and new attack patterns
3. **Phase 3** (40% - 20% health): Complex movement and multiple simultaneous attacks
4. **Phase 4** (20% - 0% health): Maximum speed and all attacks combined

### Phase Mechanics
- Each phase increases the snake's movement speed
- Attack patterns become more complex in later phases
- Visual effects intensify as the boss takes more damage
- Special abilities unlock in higher phases (temporary invulnerability, area attacks)

## Attack Patterns

### Phase 1 Attacks
- **Basic Projectile**: Fire projectiles from the head in a spread pattern
- **Sweep Attack**: Move in a wide arc across the screen

### Phase 2 Attacks
- **Homing Missiles**: Launch homing projectiles that track the player
- **Body Slam**: Slam segments down in a line toward the player's position

### Phase 3 Attacks
- **Poison Cloud**: Create expanding clouds of poison that damage over time
- **Segment Detachment**: Detach non-vital segments that become independent enemies

### Phase 4 Attacks
- **All Attacks Combined**: Use all previous attacks simultaneously
- **Ultimate Attack**: Create a massive shockwave that pushes the player away

## Visual Effects

### Snake Appearance
- Segmented body with smooth, flowing movement
- Glowing vital points that pulse with energy
- Particle trails that follow the snake's movement
- Dynamic color changes based on phase (green → yellow → orange → red)

### Attack Effects
- Projectile trails with matching colors for each attack type
- Screen shake effects for powerful attacks
- Particle explosions on impact
- Aura effects around the snake that intensify with phase progression

### Death Animation
- The snake unravels and dissolves segment by segment
- Massive explosion effects at vital points
- Particle shower that fills the screen
- Screen flash and shake effects

## Integration with Existing Systems

### Boss System Integration
- Inherits from the base Enemy class like the current boss
- Compatible with the DeathAnimationSystem for death effects
- Uses the same particle system for visual effects
- Follows the same health and damage mechanics

### Room Mechanics Integration
- Appears in room 3 as an alternative to the current boss
- Random selection between current boss and snake boss
- Same victory conditions (defeat the boss to clear the room)
- Compatible with existing item spawning and obstacle systems

## Configuration Changes

### New Configuration Section
A new section will be added to config.js for the snake boss:

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
    PHASE_1: 100,
    PHASE_2: 70,
    PHASE_3: 50,
    PHASE_4: 35
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

## Random Boss Selection

### Implementation Plan
- Modify room.js to randomly select between current boss and snake boss
- 50% chance for each boss type
- Selection is consistent within a single game session
- Both bosses share the same position and basic behavior

### Code Changes
- Update RoomGenerator.generateEnemies() to support boss selection
- Add boss type parameter to boss constructors
- Maintain compatibility with existing boss spawning logic

## Class Structure

### SnakeBoss Class
The SnakeBoss class will inherit from the Enemy base class and implement:

- Segment-based rendering and collision detection
- Phase management system
- Attack pattern system
- Visual effects integration
- Vital point damage system

### Key Methods
- `update()`: Main update loop handling movement, attacks, and phase transitions
- `render()`: Render the snake with all visual effects
- `takeDamage()`: Handle damage to vital points
- `checkCollision()`: Check collision with player bullets
- `spawnMinions()`: Spawn additional enemies in later phases

## Implementation Steps

1. Create SnakeBoss class inheriting from Enemy
2. Implement snake rendering with segmented body
3. Implement vital point damage system
4. Implement phase system with different attacks
5. Implement visual effects using particle system
6. Update room.js to support random boss selection
7. Update config.js with snake boss configurations
8. Test integration with existing systems

## Compatibility Considerations

- The snake boss will work with all existing weapons and items
- Death animations will be handled by the existing DeathAnimationSystem
- Particle effects will use the existing ParticleSystem
- The boss will be compatible with all existing UI elements (health bars, etc.)
- Room clearing mechanics will work the same as with the current boss