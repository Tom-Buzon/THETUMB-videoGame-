import { ITEM_CONFIG } from '../config.js';

export class ShieldItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.SHIELD.COLOR;
    }

    update() {}
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('shield')) {
            return;
        }
        
        // Activate shield effect
        this.game.player.shield = ITEM_CONFIG.SHIELD.SHIELD_AMOUNT;
        this.game.player.activateItemEffect('shield', ITEM_CONFIG.SHIELD.DURATION); // 10 seconds
        
        // Set cooldown
        this.game.player.setItemCooldown('shield', ITEM_CONFIG.SHIELD.COOLDOWN); // 30 seconds cooldown
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add shield particles
            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2;
                this.game.particleSystem.addParticle({
                    x: this.game.player.position.x,
                    y: this.game.player.position.y,
                    vx: Math.cos(angle) * 3,
                    vy: Math.sin(angle) * 3,
                    life: 60,
                    decay: 0.95,
                    color: ITEM_CONFIG.SHIELD.COLOR,
                    size: 3 + Math.random() * 2
                });
            }
        }
        
        // Play sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("itemPickup");
        }
    }
}
