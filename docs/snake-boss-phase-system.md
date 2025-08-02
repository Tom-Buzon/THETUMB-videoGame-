# Snake Boss Phase System Implementation

## Overview
This document details the implementation of the phase system for the snake boss, including different attacks and patterns for each phase to prevent predictability and provide escalating challenge.

## Phase System Design

### Phase Structure
The snake boss will have 4 distinct phases:
1. **Phase 1** (100% - 70% health): Basic movement and attacks
2. **Phase 2** (70% - 40% health): Increased speed and new attack patterns
3. **Phase 3** (40% - 20% health): Complex movement and multiple simultaneous attacks
4. **Phase 4** (20% - 0% health): Maximum speed and all attacks combined

### Phase Transition Triggers
Phase transitions will be triggered by health thresholds:
```javascript
updatePhase() {
  const healthPercent = (this.health / this.maxHealth) * 100;
  
  if (healthPercent <= 20 && this.phase < 4) {
    this.phase = 4;
    this.onPhaseChange(4);
  } else if (healthPercent <= 40 && this.phase < 3) {
    this.phase = 3;
    this.onPhaseChange(3);
  } else if (healthPercent <= 70 && this.phase < 2) {
    this.phase = 2;
    this.onPhaseChange(2);
  }
}
```

## Attack Pattern System

### Attack Selection Mechanism
Each phase will have a different set of available attacks:
```javascript
getAvailableAttacks() {
  switch (this.phase) {
    case 1:
      return ['basicProjectile', 'sweep'];
    case 2:
      return ['basicProjectile', 'sweep', 'homingMissile'];
    case 3:
      return ['basicProjectile', 'sweep', 'homingMissile', 'poisonCloud'];
    case 4:
      return ['basicProjectile', 'sweep', 'homingMissile', 'poisonCloud', 'ultimate'];
    default:
      return ['basicProjectile'];
  }
}
```

### Attack Cooldown System
Each attack will have its own cooldown that varies by phase:
```javascript
updateAttackCooldowns() {
  // Reduce cooldowns based on phase
  const cooldownMultiplier = [1.0, 0.8, 0.6, 0.4][this.phase - 1];
  
  for (const attack in this.attackCooldowns) {
    if (this.attackCooldowns[attack] > 0) {
      this.attackCooldowns[attack] -= cooldownMultiplier;
    }
  }
}
```

## Phase-Specific Implementations

### Phase 1: Basic Introduction
**Characteristics:**
- Slow movement speed
- Basic attack patterns
- Limited attack frequency
- Simple visual effects

**Attacks:**
1. **Basic Projectile**: Fire projectiles from the head in a spread pattern
2. **Sweep Attack**: Move in a wide arc across the screen

**Implementation:**
```javascript
phase1Attacks() {
  if (this.attackCooldowns.basicProjectile <= 0) {
    this.basicProjectileAttack();
    this.attackCooldowns.basicProjectile = 100;
  }
  
  if (this.attackCooldowns.sweep <= 0) {
    this.sweepAttack();
    this.attackCooldowns.sweep = 150;
  }
}
```

### Phase 2: Increased Challenge
**Characteristics:**
- Increased movement speed (1.5x)
- New homing missile attack
- More frequent basic attacks
- Enhanced visual effects

**Attacks:**
1. **Basic Projectile**: Increased projectile count
2. **Sweep Attack**: Faster sweep movement
3. **Homing Missiles**: Launch homing projectiles that track the player

**Implementation:**
```javascript
phase2Attacks() {
  // More frequent basic attacks
  if (this.attackCooldowns.basicProjectile <= 0) {
    this.basicProjectileAttack();
    this.attackCooldowns.basicProjectile = 70;
  }
  
  if (this.attackCooldowns.sweep <= 0) {
    this.sweepAttack();
    this.attackCooldowns.sweep = 100;
  }
  
  // New homing missile attack
  if (this.attackCooldowns.homingMissile <= 0) {
    this.homingMissileAttack();
    this.attackCooldowns.homingMissile = 120;
  }
}
```

### Phase 3: Complex Patterns
**Characteristics:**
- High movement speed (2x)
- Area-of-effect attacks
- Multiple simultaneous attacks
- Intense visual effects

**Attacks:**
1. **Basic Projectile**: Even more projectiles
2. **Sweep Attack**: Multiple sweeps
3. **Homing Missiles**: Missile salvos
4. **Poison Cloud**: Create expanding clouds of poison

**Implementation:**
```javascript
phase3Attacks() {
  // Frequent basic attacks
  if (this.attackCooldowns.basicProjectile <= 0) {
    this.basicProjectileAttack();
    this.attackCooldowns.basicProjectile = 50;
  }
  
  // Multiple sweep attacks
  if (this.attackCooldowns.sweep <= 0) {
    this.sweepAttack();
    // Queue another sweep shortly after
    this.queueAttack('sweep', 30);
    this.attackCooldowns.sweep = 80;
  }
  
  // Missile salvos
  if (this.attackCooldowns.homingMissile <= 0) {
    this.homingMissileAttack(3); // Launch 3 missiles
    this.attackCooldowns.homingMissile = 90;
  }
  
  // New poison cloud attack
  if (this.attackCooldowns.poisonCloud <= 0) {
    this.poisonCloudAttack();
    this.attackCooldowns.poisonCloud = 150;
  }
}
```

### Phase 4: Maximum Intensity
**Characteristics:**
- Maximum movement speed (3x)
- All attacks combined
- Continuous attack patterns
- Maximum visual effects

**Attacks:**
1. **All Previous Attacks**: Use all phase 1-3 attacks
2. **Ultimate Attack**: Create a massive shockwave

**Implementation:**
```javascript
phase4Attacks() {
  // All attacks become available with minimal cooldowns
  if (this.attackCooldowns.basicProjectile <= 0) {
    this.basicProjectileAttack(12); // Maximum projectile count
    this.attackCooldowns.basicProjectile = 30;
  }
  
  if (this.attackCooldowns.sweep <= 0) {
    this.sweepAttack();
    this.queueAttack('sweep', 15); // Rapid consecutive sweeps
    this.attackCooldowns.sweep = 50;
  }
  
  if (this.attackCooldowns.homingMissile <= 0) {
    this.homingMissileAttack(5); // Large missile salvo
    this.attackCooldowns.homingMissile = 60;
  }
  
  if (this.attackCooldowns.poisonCloud <= 0) {
    this.poisonCloudAttack();
    this.attackCooldowns.poisonCloud = 100;
  }
  
  // Ultimate attack
  if (this.attackCooldowns.ultimate <= 0) {
    this.ultimateAttack();
    this.attackCooldowns.ultimate = 200;
  }
}
```

## Attack Implementation Details

### Basic Projectile Attack
```javascript
basicProjectileAttack(projectileCount = 6) {
  const bullets = [];
  
  for (let i = 0; i < projectileCount; i++) {
    const angle = (i / projectileCount) * Math.PI * 2;
    const direction = new Vector2D(
      Math.cos(angle),
      Math.sin(angle)
    );
    
    bullets.push(new Bullet(
      this.headPosition.x + direction.x * 30,
      this.headPosition.y + direction.y * 30,
      direction.x * 4,
      direction.y * 4,
      15,
      this.getPhaseColor(),
      5,
      'enemy'
    ));
  }
  
  return bullets;
}
```

### Homing Missile Attack
```javascript
homingMissileAttack(missileCount = 1) {
  const bullets = [];
  
  for (let i = 0; i < missileCount; i++) {
    // Add slight variation to missile directions
    const angleVariation = (Math.random() - 0.5) * 0.5;
    
    bullets.push(new Bullet(
      this.headPosition.x,
      this.headPosition.y,
      Math.cos(angleVariation) * 3,
      Math.sin(angleVariation) * 3,
      20,
      '#ff00ff',
      7,
      'enemy',
      true // homing flag
    ));
  }
  
  return bullets;
}
```

### Poison Cloud Attack
```javascript
poisonCloudAttack() {
  // Create a poison cloud effect
  const cloud = {
    x: this.headPosition.x,
    y: this.headPosition.y,
    radius: 50,
    maxRadius: 150,
    growthRate: 2,
    damage: 2,
    duration: 180,
    color: '#00ff00'
  };
  
  this.poisonClouds.push(cloud);
  
  // Add particle effects
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50;
    
    this.particleSystem.addParticle({
      x: cloud.x + Math.cos(angle) * distance,
      y: cloud.y + Math.sin(angle) * distance,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 60,
      decay: 0.98,
      color: '#00ff00',
      size: 3 + Math.random() * 2
    });
  }
}
```

### Ultimate Attack
```javascript
ultimateAttack() {
  // Create massive shockwave
  if (window.game && window.game.particleSystem) {
    window.game.particleSystem.createShockwave(
      this.headPosition.x,
      this.headPosition.y,
      300
    );
    
    window.game.particleSystem.addScreenShake(15);
  }
  
  // Push player away
  this.pushPlayerAway();
  
  // Add massive particle explosion
  for (let i = 0; i < 100; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 5;
    
    this.particleSystem.addParticle({
      x: this.headPosition.x,
      y: this.headPosition.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 40,
      decay: 0.95,
      color: this.getPhaseColor(),
      size: 2 + Math.random() * 4
    });
  }
}
```

## Phase Change Effects

### Visual Transitions
When changing phases, the snake will have visual indicators:
```javascript
onPhaseChange(newPhase) {
  // Flash effect
  if (window.game && window.game.particleSystem) {
    window.game.particleSystem.addFlash(
      this.headPosition.x,
      this.headPosition.y,
      200,
      '#ffffff'
    );
  }
  
  // Change color scheme
  this.updatePhaseColors(newPhase);
  
  // Add phase change particles
  this.addPhaseChangeParticles();
  
  // Play phase change sound
  if (window.audio && window.audio.playSound) {
    window.audio.playSound('phaseChange');
  }
}
```

### Movement Adjustments
Each phase will have different movement characteristics:
```javascript
updateMovementSpeed() {
  const speedMultipliers = [1.0, 1.5, 2.0, 3.0];
  this.speed = ENEMY_CONFIG.SNAKE_BOSS.SPEED * speedMultipliers[this.phase - 1];
}
```

## Integration with Existing Systems

### Config.js Integration
Phase configurations will be defined in config.js:
```javascript
SNAKE_BOSS: {
  // ... other properties
  PHASE_THRESHOLDS: [70, 40, 20], // Health percentages
  ATTACK_COOLDOWNS: {
    PHASE_1: { basicProjectile: 100, sweep: 150 },
    PHASE_2: { basicProjectile: 70, sweep: 100, homingMissile: 120 },
    PHASE_3: { basicProjectile: 50, sweep: 80, homingMissile: 90, poisonCloud: 150 },
    PHASE_4: { basicProjectile: 30, sweep: 50, homingMissile: 60, poisonCloud: 100, ultimate: 200 }
  }
}
```

### Attack Pattern Randomization
To prevent predictability, attack patterns will have some randomness:
```javascript
selectRandomAttack() {
  const availableAttacks = this.getAvailableAttacks();
  return availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
}
```

## Implementation Steps

### Step 1: Phase System Foundation
- Implement phase tracking
- Add phase transition logic
- Create phase change effects

### Step 2: Attack Pattern Framework
- Implement attack cooldown system
- Create attack selection mechanism
- Add attack queuing system

### Step 3: Phase-Specific Attacks
- Implement Phase 1 attacks
- Implement Phase 2 attacks
- Implement Phase 3 attacks
- Implement Phase 4 attacks

### Step 4: Visual and Audio Feedback
- Add phase change visual effects
- Implement attack-specific particle effects
- Add phase-appropriate sound effects

### Step 5: Balancing and Tuning
- Adjust phase transition points
- Tune attack frequencies and damage
- Test difficulty progression

## Performance Considerations

### Attack Optimization
- Limit simultaneous attacks per phase
- Optimize particle generation per attack
- Use object pooling for bullets

### Memory Management
- Clean up completed attacks
- Remove expired particles
- Manage poison cloud lifecycle

## Testing Plan

### Phase Transition Testing
- Verify health thresholds trigger correct phases
- Check visual effects during transitions
- Confirm movement speed changes

### Attack Pattern Testing
- Test all attacks in each phase
- Verify cooldown systems work correctly
- Check attack damage values

### Balance Testing
- Ensure difficulty progression feels natural
- Test with different weapon types
- Verify boss is defeatable but challenging