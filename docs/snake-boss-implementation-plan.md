# Snake Boss Implementation Plan

## Overview
This document outlines the implementation plan for the SnakeBoss class based on the design document. The implementation will be done in the code mode, but this plan provides the detailed steps and code structure.

## File Structure
The SnakeBoss class will be implemented in:
- File: `THETUMB-videoGame-/js/enemies/snakeBoss.js`

## Class Implementation

### Import Statements
The class will need to import the following modules:
```javascript
import { ENEMY_CONFIG, ROOM_CONFIG } from '../config.js';
import { Vector2D } from '../vector2d.js';
import { Bullet } from '../bullet.js';
import { Enemy } from '../enemy.js';
```

### Class Declaration
```javascript
export class SnakeBoss extends Enemy {
    constructor(x, y) {
        super(x, y);
        // Initialize snake-specific properties
    }
}
```

### Properties to Implement
1. **Segment System**:
   - `segments`: Array of segment positions
   - `segmentCount`: Number of segments
   - `segmentSize`: Size of each segment
   - `vitalPoints`: Array of indices for vital segments

2. **Phase System**:
   - `phase`: Current phase (1-4)
   - `phaseThresholds`: Health thresholds for phase transitions

3. **Attack System**:
   - `attackCooldown`: Cooldown between attacks
   - `attackPatterns`: Available attack patterns per phase
   - `currentAttack`: Currently selected attack

4. **Visual Effects**:
   - `auraRadius`: Radius of aura effect
   - `auraParticles`: Array of aura particles
   - `auraColor`: Current aura color
   - `auraIntensity`: Intensity of aura effect

### Key Methods to Implement

#### Constructor
- Initialize all snake-specific properties
- Set up initial segments
- Configure phase thresholds
- Initialize visual effects

#### Update Methods
- `update(player)`: Main update loop
- `updatePhase()`: Handle phase transitions
- `updateMovement(player)`: Handle snake movement
- `updateAttacks(player)`: Handle attack patterns
- `updateSegments()`: Update segment positions
- `updateAura()`: Update aura effects

#### Render Methods
- `render(ctx)`: Main render method
- `renderSegments(ctx)`: Render snake segments
- `renderVitalPoints(ctx)`: Highlight vital points
- `renderAura(ctx)`: Render aura effects

#### Combat Methods
- `takeDamage(amount)`: Handle damage to vital points
- `checkCollision(bullet)`: Check collision with segments
- `isVitalPoint(segmentIndex)`: Check if segment is vital point

#### Attack Pattern Methods
- `basicProjectileAttack(player)`: Phase 1 basic attack
- `homingMissileAttack(player)`: Phase 2 homing attack
- `poisonCloudAttack(player)`: Phase 3 area attack
- `ultimateAttack(player)`: Phase 4 ultimate attack

#### Utility Methods
- `getSegmentPosition(index)`: Get position of segment
- `getHeadPosition()`: Get position of snake head
- `getTailPosition()`: Get position of snake tail

## Integration Points

### Config.js Updates
Add SNAKE_BOSS configuration section:
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

### Room.js Updates
Modify `generateEnemies` method to support random boss selection:
```javascript
// Boss room (room 3)
if (room === 3) {
    // Randomly select between current boss and snake boss
    const bossType = Math.random() < 0.5 ? 'current' : 'snake';
    
    let boss;
    if (bossType === 'snake') {
        boss = new SnakeBoss(this.width/2, this.height/2);
    } else {
        boss = new Boss(this.width/2, this.height/2);
    }
    
    enemies.push(boss);
    return enemies;
}
```

## Implementation Steps

### Step 1: Create SnakeBoss Class Structure
- Set up class with basic properties
- Implement constructor
- Add placeholder methods

### Step 2: Implement Segment System
- Create segment array
- Implement segment positioning
- Add vital point identification

### Step 3: Implement Phase System
- Add phase transition logic
- Implement phase-specific properties

### Step 4: Implement Movement System
- Create snake-like movement
- Add smooth segment following
- Implement phase-based speed changes

### Step 5: Implement Attack System
- Add attack pattern methods
- Implement phase-specific attacks
- Add attack cooldowns

### Step 6: Implement Visual Effects
- Add segment rendering
- Implement aura effects
- Add particle trails

### Step 7: Implement Combat System
- Add vital point damage handling
- Implement collision detection
- Add death animation integration

### Step 8: Update Config.js
- Add SNAKE_BOSS configuration
- Ensure values are balanced

### Step 9: Update Room.js
- Add random boss selection
- Maintain compatibility

### Step 10: Testing and Balancing
- Test all phases
- Balance difficulty
- Verify visual effects
- Check integration with existing systems

## Dependencies
- Enemy base class
- Config.js
- Vector2D
- Bullet
- ParticleSystem (for visual effects)
- DeathAnimationSystem (for death effects)

## Compatibility Considerations
- The snake boss will work with all existing weapons
- Death animations will use the existing DeathAnimationSystem
- Particle effects will use the existing ParticleSystem
- The boss will be compatible with all existing UI elements
- Room clearing mechanics will work the same as with the current boss