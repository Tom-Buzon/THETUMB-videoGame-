# Snake Boss Vital Point Damage System

## Overview
This document details the implementation of the vital point damage system for the snake boss. Only specific segments of the snake will be able to take damage that affects the boss's health, while other segments will provide collision but not reduce health.

## Vital Point System Design

### Segment Classification
Each segment of the snake will be classified as either:
- **Vital Point**: Segments that can take damage and reduce the boss's health
- **Non-Vital Point**: Segments that provide collision but don't reduce health

### Vital Point Selection Algorithm
Vital points will be selected using a pattern-based approach:
```javascript
// Every 3rd segment is a vital point, starting with the head
isVitalPoint(segmentIndex) {
  return segmentIndex % 3 === 0;
}
```

This creates a pattern where segments 0, 3, 6, 9, 12, etc. are vital points.

### Visual Indicators
Vital points will be visually distinct:
- Different color (brighter/contrasting color)
- Glowing effect
- Pulsing animation
- Particle effects

## Damage Handling Implementation

### Damage Detection
When a bullet hits the snake, the system will:
1. Check which segment was hit
2. Determine if the segment is a vital point
3. Apply damage only if it's a vital point

### Collision Detection
```javascript
checkCollision(bullet) {
  // Check collision with each segment
  for (let i = 0; i < this.segments.length; i++) {
    const segment = this.segments[i];
    
    // Calculate distance between bullet and segment
    const dx = bullet.position.x - segment.position.x;
    const dy = bullet.position.y - segment.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if collision occurred
    if (distance < segment.size + bullet.size) {
      // Store which segment was hit
      bullet.hitSegment = i;
      return true;
    }
  }
  
  return false;
}
```

### Damage Application
```javascript
takeDamage(amount, segmentIndex) {
  // Only apply damage if the segment is a vital point
  if (this.isVitalPoint(segmentIndex)) {
    // Call parent takeDamage method
    super.takeDamage(amount);
    
    // Add visual feedback for hit
    this.addHitEffect(segmentIndex);
    
    return true; // Damage was applied
  }
  
  // Add visual feedback for blocked hit
  this.addBlockedHitEffect(segmentIndex);
  
  return false; // No damage was applied
}
```

## Visual Feedback System

### Hit Effects
When a vital point is hit:
- Particle explosion at the hit location
- Screen shake effect
- Damage numbers display
- Temporary color flash

### Blocked Hit Effects
When a non-vital point is hit:
- Spark particle effect
- Different sound effect
- Visual "shield" effect
- No damage numbers

### Implementation Example
```javascript
addHitEffect(segmentIndex) {
  const segment = this.segments[segmentIndex];
  
  // Add explosion particles
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10;
    const speed = 1 + Math.random() * 2;
    
    this.particleSystem.addParticle({
      x: segment.position.x,
      y: segment.position.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 20,
      decay: 0.95,
      color: '#ff0000',
      size: 2 + Math.random() * 3
    });
  }
  
  // Add screen shake
  if (window.game && window.game.particleSystem) {
    window.game.particleSystem.addScreenShake(3);
  }
  
  // Add damage number
  if (window.game && window.game.particleSystem) {
    window.game.particleSystem.addDamageNumber(
      segment.position.x,
      segment.position.y,
      amount,
      '#ff0000'
    );
  }
}
```

## Balance Considerations

### Damage Distribution
- Vital points should be challenging but not impossible to hit
- The head (segment 0) could take additional damage or have special properties
- Non-vital points should still provide some tactical value (blocking bullets)

### Hit Box Sizes
- Vital points might have slightly larger hit boxes
- Non-vital points might have smaller hit boxes
- Consistent sizing for predictable gameplay

## Performance Optimization

### Collision Optimization
- Use spatial partitioning for collision detection
- Only check nearby segments for collision
- Cache segment positions when possible

### Visual Effect Optimization
- Limit the number of particles per hit
- Reuse particle objects
- Reduce effects when many enemies are on screen

## Integration with Existing Systems

### Health System
The snake boss will use the existing health system:
- Same health bar display
- Same death animation triggers
- Same scoring system

### Weapon Compatibility
All existing weapons will work with the vital point system:
- Different weapons may have different effectiveness against segments
- Some weapons might hit multiple segments
- Ricochet weapons might bounce off non-vital points

## Implementation Steps

### Step 1: Segment Classification
- Implement `isVitalPoint()` method
- Add vital point property to segment objects
- Create visual distinction system

### Step 2: Collision Detection
- Implement segment-based collision detection
- Add segment index tracking to bullets
- Test collision accuracy

### Step 3: Damage Application
- Implement `takeDamage()` method with segment parameter
- Add damage validation logic
- Integrate with parent class damage system

### Step 4: Visual Feedback
- Implement hit effect system
- Add blocked hit effects
- Test visual feedback consistency

### Step 5: Balance Tuning
- Adjust vital point frequency
- Tune damage values
- Test difficulty progression

## Edge Cases

### Segment Destruction
- What happens when a vital point segment is "destroyed"?
- Do segments become detached?
- How does this affect movement?

### Multi-Segment Weapons
- How do weapons that hit multiple segments work?
- Do they need to hit vital points to do damage?
- What about area-of-effect weapons?

### Death Conditions
- Does the snake die when the head (segment 0) is destroyed?
- Or when health reaches zero?
- What visual effects occur on death?