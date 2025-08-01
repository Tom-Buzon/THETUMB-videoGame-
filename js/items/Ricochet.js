import { ITEM_CONFIG } from '../config.js';

export class RicochetItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.RICOCHET.COLOR;
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
        
        // Draw bouncing symbol >|
        ctx.fillStyle = this.color;
        ctx.font = `${this.radius * 1.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('>|', this.x, this.y);
        
        ctx.restore(); // Restore context to remove shadow effects
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('ricochet')) {
            return;
        }
        
        // Activate ricochet effect on player
        // Show weapon change message
        if (this.game.ui) {
            this.game.ui.showWeaponChangeMessage('RICOCHET');
        }
        this.game.player.activateItemEffect('ricochet', ITEM_CONFIG.RICOCHET.DURATION); // 10 seconds
        
        // Set cooldown
        this.game.player.setItemCooldown('ricochet', ITEM_CONFIG.RICOCHET.COOLDOWN); // 30 seconds cooldown
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add ricochet particles
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 3;
                this.game.particleSystem.addParticle({
                    x: this.game.player.position.x,
                    y: this.game.player.position.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 30,
                    decay: 0.92,
                    color: ITEM_CONFIG.RICOCHET.COLOR,
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
