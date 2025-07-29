import { ITEM_CONFIG } from '../config.js';

export class BlackHoleItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.BLACK_HOLE.COLOR;
        this.active = false;
        this.startTime = 0;
        this.duration = ITEM_CONFIG.BLACK_HOLE.DURATION; // 3 seconds
        
        // New properties for the visual effects
        this.activationTime = 0;
        this.isActivating = false;
        this.activationDuration = ITEM_CONFIG.BLACK_HOLE.DURATION; // 3.5 seconds for growing disk
        this.blinkStartTime = 0;
        this.isBlinking = false;
        this.blinkDuration = ITEM_CONFIG.BLACK_HOLE.BLINK_DURATION; // 1.5 seconds for blinking
        this.diskRadius = 0;
        this.maxDiskRadius = ITEM_CONFIG.BLACK_HOLE.ATTRACTION_RANGE;
        this.isAttracting = false;
        this.attractionStartTime = 0;
        this.attractionDuration = ITEM_CONFIG.BLACK_HOLE.EFFECT_DURATION; // 2 seconds for attraction and damage
        this.enemiesToDamage = [];
        this.effectComplete = false;
    }

    update() {
        if (this.isActivating) {
            const now = Date.now();
            const elapsed = now - this.activationTime;
            
            if (elapsed < this.activationDuration) {
                // Growing disk phase
                this.diskRadius = (elapsed / this.activationDuration) * this.maxDiskRadius;
            } else if (!this.isBlinking) {
                // Start blinking phase
                this.isBlinking = true;
                this.blinkStartTime = now;
                this.diskRadius = this.maxDiskRadius;
                
                // Collect enemies in the disk for damage
                this.enemiesToDamage = [];
                for (let enemy of this.game.enemies) {
                    const dx = this.x - enemy.position.x;
                    const dy = this.y - enemy.position.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < this.diskRadius) {
                        this.enemiesToDamage.push(enemy);
                    }
                }
            } else if (this.isBlinking && (now - this.blinkStartTime) < this.blinkDuration) {
                // Blinking phase - do nothing special here, handled in draw
            } else if (this.isBlinking && !this.isAttracting) {
                // Start attraction and damage phase
                this.isBlinking = false;
                this.isAttracting = true;
                this.attractionStartTime = now;
                
                // Add visual effects for attraction
                if (this.game.particleSystem) {
                    // Add particles for the darkening effect
                    for (let i = 0; i < 100; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = Math.random() * this.diskRadius;
                        const speed = 1 + Math.random() * 3;
                        this.game.particleSystem.addParticle({
                            x: this.x + Math.cos(angle) * distance,
                            y: this.y + Math.sin(angle) * distance,
                            vx: -Math.cos(angle) * speed,
                            vy: -Math.sin(angle) * speed,
                            life: 30,
                            decay: 0.9,
                            color: 'rgba(255, 255, 255, 0.7)',
                            size: 2 + Math.random() * 3
                        });
                    }
                    
                    // Add expanding yellow circle effect
                    this.game.particleSystem.createShockwave(this.x, this.y, this.diskRadius * 2);
                }
            } else if (this.isAttracting) {
                if ((now - this.attractionStartTime) < this.attractionDuration) {
                    // Attract enemies toward the center during the attraction phase
                    // Use the existing attractEnemies method but with a stronger force
                    for (let enemy of this.enemiesToDamage) {
                        const dx = this.x - enemy.position.x;
                        const dy = this.y - enemy.position.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        // Only attract enemies that are still alive and within the disk
                        if (enemy.health > 0 && dist < this.diskRadius) {
                            // Normalize direction
                            const nx = dx / dist;
                            const ny = dy / dist;
                            
                            // Apply attraction force - stronger than the original
                            const force = 2.0 * (1 - dist / this.diskRadius);
                            enemy.position.x += nx * force;
                            enemy.position.y += ny * force;
                        }
                    }
                } else {
                    // Apply damage to collected enemies at the end of attraction phase
                    for (let enemy of this.enemiesToDamage) {
                        // Only damage enemies that are still alive
                        if (enemy.health > 0) {
                            enemy.takeDamage(400);
                        }
                    }
                    
                    // End of attraction phase - reset
                    this.isActivating = false;
                    this.isAttracting = false;
                    this.diskRadius = 0;
                    this.enemiesToDamage = [];
                    
                    // Mark the item as complete so it can be removed
                    this.effectComplete = true;
                }
            }
        }
    }
    
    draw(ctx) {
        if (this.isActivating) {
            const now = Date.now();
            
            if (!this.isBlinking) {
                // Draw growing white transparent disk
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.diskRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // White transparent
                ctx.fill();
            } else if (this.isBlinking && (now - this.blinkStartTime) < this.blinkDuration) {
                // Draw blinking effect
                const blinkProgress = (now - this.blinkStartTime) / this.blinkDuration;
                const blink = Math.floor(blinkProgress * 10) % 2; // Blink 10 times during the duration
                
                if (blink === 0) {
                    // Draw white disk
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.diskRadius, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.fill();
                }
                // When blink is 1, we don't draw anything for the off phase
            } else if (this.isAttracting) {
                // Draw darkening and retracting effect
                const attractionProgress = (now - this.attractionStartTime) / this.attractionDuration;
                const currentRadius = this.diskRadius * (1 - attractionProgress);
                const alpha = 0.5 * (1 - attractionProgress);
                
                // Draw darkening disk
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(100, 100, 100, ${alpha})`; // Darkening gray
                ctx.fill();
                
                // Draw center point
                ctx.beginPath();
                ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 0, 0.8)'; // Yellow center
                ctx.fill();
            }
        } else {
            // Draw simplified black hole when not active
            // Draw outer ring (accretion disk)
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(102, 102, 204, 0.5)'; // Semi-transparent lighter blue
            ctx.fill();
            
            // Draw center
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = this.color; // Dark blue center
            ctx.fill();
        }
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('blackHole')) {
            return;
        }
        
        // Start the new black hole activation sequence
        this.isActivating = true;
        this.activationTime = Date.now();
        this.diskRadius = 0;
        
        // Set cooldown
        this.game.player.setItemCooldown('blackHole', ITEM_CONFIG.BLACK_HOLE.COOLDOWN); // 30 seconds cooldown
        
        // Play sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("blackHole");
        }
    }
    
    attractEnemies() {   // this feature doesn't work
        for (let enemy of this.game.enemies) {
            const dx = this.x - enemy.position.x;
            const dy = this.y - enemy.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < ITEM_CONFIG.BLACK_HOLE.ATTRACTION_RANGE) { // Within attraction range
                // Normalize direction
                const nx = dx / dist;
                const ny = dy / dist;
                
                // Apply attraction force
                const force = 0.5 * (1 - dist / ITEM_CONFIG.BLACK_HOLE.ATTRACTION_RANGE); // Stronger closer to black hole
                enemy.position.x += nx * force;
                enemy.position.y += ny * force;
            }
        }
    }
    
    explode() {
        // Damage all enemies within range
        for (let enemy of this.game.enemies) {
            const dx = this.x - enemy.position.x;
            const dy = this.y - enemy.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < ITEM_CONFIG.BLACK_HOLE.ATTRACTION_RANGE) {
                enemy.takeDamage(9999);
            }
        }
        
        // Add explosion effect
        if (this.game.particleSystem) {
            this.game.particleSystem.addExplosion(this.x, this.y, ITEM_CONFIG.BLACK_HOLE.COLOR, 50, 3);
        }
        
        // Play explosion sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("explosion");
        }
    }
}
