import { ITEM_CONFIG } from '../config.js';

export class GhostItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.GHOST.COLOR;
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
        
        // Draw ghost body with wavy bottom edge
        ctx.beginPath();
        ctx.fillStyle = this.color;
        
        // Start from the top center
        ctx.moveTo(this.x, this.y - this.radius * 0.8);
        
        // Draw the top arc
        ctx.arc(this.x, this.y - this.radius * 0.2, this.radius * 0.8, Math.PI, 0, false);
        
        // Draw wavy bottom edge with 3 waves
        const waveCount = 3;
        const waveHeight = this.radius * 0.2;
        const waveWidth = (this.radius * 1.6) / waveCount;
        
        for (let i = 0; i < waveCount; i++) {
            const waveX = this.x - this.radius * 0.8 + (i * 2 + 1) * waveWidth / 2;
            const waveY = this.y + this.radius * 0.6;
            ctx.lineTo(waveX - waveWidth / 2, waveY);
            ctx.quadraticCurveTo(waveX, waveY + waveHeight, waveX + waveWidth / 2, waveY);
        }
        
        // Close the path back to the starting point
        ctx.lineTo(this.x, this.y - this.radius * 0.8);
        ctx.fill();
        
        // Draw eyes
        ctx.beginPath();
        ctx.fillStyle = 'white';
        // Left eye
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.1, this.radius * 0.15, 0, 2 * Math.PI);
        // Right eye
        ctx.arc(this.x + this.radius * 0.3, this.y - this.radius * 0.1, this.radius * 0.15, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw mouth
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.arc(this.x, this.y + this.radius * 0.2, this.radius * 0.2, 0, Math.PI, false);
        ctx.stroke();
        
        ctx.restore(); // Restore context to remove shadow effects
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('ghost')) {
            return;
        }
        // Activate ghost effect
        this.game.player.ghost = true;
        this.game.player.activateItemEffect('ghost', ITEM_CONFIG.GHOST.DURATION); // 5 seconds
        
        // Set cooldown
        this.game.player.setItemCooldown('ghost', ITEM_CONFIG.GHOST.COOLDOWN); // 20 seconds cooldown
        
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add ghost particles
            for (let i = 0; i < 20; i++) {
                this.game.particleSystem.addParticle({
                    x: this.game.player.position.x + (Math.random() - 0.5) * 30,
                    y: this.game.player.position.y + (Math.random() - 0.5) * 30,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 30,
                    decay: 0.9,
                    color: ITEM_CONFIG.GHOST.COLOR,
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
