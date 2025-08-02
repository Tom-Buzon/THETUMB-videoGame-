import { ITEM_CONFIG } from '../config.js';

export class FireBallItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.FIREBALL.COLOR;
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
        
        // Draw fireball (orange circle with flame details)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color; // Orange background
        ctx.fill();
        
        // Draw flame details
        ctx.fillStyle = '#ffcc00'; // Yellow for flame core
        
        // Draw flame core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw flame highlights
        ctx.fillStyle = '#ffffff'; // White for flame highlights
        
        // Draw small flame highlights
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x + this.radius * 0.4, this.y + this.radius * 0.2, this.radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore(); // Restore context to remove shadow effects
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('fireball')) {
            return;
        }
        
        // Activate fireball effect - make player invulnerable and deal contact damage
        this.game.player.activateItemEffect('fireball', ITEM_CONFIG.FIREBALL.DURATION); // Use duration from config
        
        // Make player completely invulnerable during fireball effect
        this.game.player.invincible = true;
        
        // Set cooldown
        this.game.player.setItemCooldown('fireball', ITEM_CONFIG.FIREBALL.COOLDOWN); // Use cooldown from config
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add fireball particles
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 3;
                this.game.particleSystem.addParticle({
                    x: this.game.player.position.x,
                    y: this.game.player.position.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 40,
                    decay: 0.92,
                    color: ITEM_CONFIG.FIREBALL.COLOR,
                    size: 2 + Math.random() * 3
                });
            }
        }
        
        // Play sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("itemPickup");
        }
    }
}