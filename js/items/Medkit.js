import { ITEM_CONFIG, PLAYER_CONFIG } from '../config.js';

export class MedkitItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.MEDKIT.COLOR;
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
        
        // Draw green background circle with aura
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color; // Green background
        ctx.fill();
        
        // Reset shadow for inner elements
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Draw white cross
        ctx.fillStyle = 'white';
        
        // Cross dimensions
        const crossWidth = this.radius * 0.4;
        const crossHeight = this.radius * 0.8;
        const crossThickness = this.radius * 0.25;
        
        // Draw vertical bar of cross
        ctx.fillRect(
            this.x - crossThickness / 2,
            this.y - crossHeight / 2,
            crossThickness,
            crossHeight
        );
        
        // Draw horizontal bar of cross
        ctx.fillRect(
            this.x - crossWidth / 2,
            this.y - crossThickness / 2,
            crossWidth,
            crossThickness
        );
        
        ctx.restore(); // Restore context to remove shadow effects
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('medkit')) {
            return;
        }
        
        // Heal player
        this.game.player.heal(ITEM_CONFIG.MEDKIT.HEAL_AMOUNT);
        
        // Set cooldown
        this.game.player.setItemCooldown('medkit', ITEM_CONFIG.MEDKIT.COOLDOWN); // 10 seconds cooldown
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add healing particles
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 2;
                this.game.particleSystem.addParticle({
                    x: this.game.player.position.x,
                    y: this.game.player.position.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 30,
                    decay: 0.9,
                    color: ITEM_CONFIG.MEDKIT.COLOR,
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
