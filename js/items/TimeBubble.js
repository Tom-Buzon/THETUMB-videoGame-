import { ITEM_CONFIG } from '../config.js';

export class TimeBubbleItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.TIME_BUBBLE.COLOR;
        this.pulseTime = 0; // For aura pulsing effect
        this.pulseTime = 0; // For aura pulsing effect
    }

    update() {
        this.pulseTime += 0.1; // Increment pulse time for animation
    }
    
    draw(ctx) {
        // Calculate pulsing effect for aura
        const pulse = Math.sin(this.pulseTime) * 0.5 + 0.5; // Value between 0 and 1
        const auraIntensity = 10 + pulse * 10; // Pulsing blur between 10 and 20
        
        // Draw aura effect
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = auraIntensity;
        
        // Draw clock symbol
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = 2;
        
        // Draw clock circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw clock hands
        const hourHandLength = this.radius * 0.4;
        const minuteHandLength = this.radius * 0.6;
        
        // Hour hand (shorter, pointing to 3 o'clock position)
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + hourHandLength, this.y);
        ctx.stroke();
        
        // Minute hand (longer, pointing to 12 o'clock position)
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y - minuteHandLength);
        ctx.stroke();
        
        // Draw center dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore(); // Restore context to remove shadow effects
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('timeBubble')) {
            return;
        }
        
        // Slow down all enemies for 5 seconds
        for (let enemy of this.game.enemies) {
            // Store original speed if not already stored
            if (!enemy.originalSpeed) {
                enemy.originalSpeed = enemy.speed;
            }
            
            // Slow down enemy
            enemy.speed = enemy.originalSpeed * ITEM_CONFIG.TIME_BUBBLE.SLOW_FACTOR; // 70% slower
            
            // Reset speed after duration
            this.game.setTimeout(() => {
                if (enemy.speed === enemy.originalSpeed * ITEM_CONFIG.TIME_BUBBLE.SLOW_FACTOR) {
                    enemy.speed = enemy.originalSpeed;
                }
            }, ITEM_CONFIG.TIME_BUBBLE.DURATION);
        }
        
        // Activate time bubble effect
        this.game.player.activateItemEffect('timeBubble', ITEM_CONFIG.TIME_BUBBLE.DURATION); // 5 seconds
        
        // Set cooldown
        this.game.player.setItemCooldown('timeBubble', ITEM_CONFIG.TIME_BUBBLE.COOLDOWN); // 20 seconds cooldown
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add time bubble particles
            for (let i = 0; i < 40; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 2;
                this.game.particleSystem.addParticle({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 50,
                    decay: 0.93,
                    color: ITEM_CONFIG.TIME_BUBBLE.COLOR,
                    size: 2 + Math.random() * 2
                });
            }
        }
        
        // Play sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("itemPickup");
        }
    }
}
