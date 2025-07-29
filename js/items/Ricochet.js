import { ITEM_CONFIG } from '../config.js';

export class RicochetItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.RICOCHET.COLOR;
    }

    update() {}
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('ricochet')) {
            return;
        }
        
        // Activate ricochet effect on player
        this.game.player.weaponMode = 'RICOCHET';
        // Show weapon change message
        if (this.game.ui) {
            this.game.ui.showWeaponChangeMessage('RICOCHET');
        }
        this.game.player.activateItemEffect('ricochet', ITEM_CONFIG.RICOCHET.DURATION); // 15 seconds
        
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
