import { ITEM_CONFIG, PLAYER_CONFIG } from '../config.js';

export class BazookaItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.BAZOOKA.COLOR;
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
        if (this.game.player.isItemOnCooldown('bazooka')) {
            return;
        }
        
        // Activate bazooka effect
        this.game.player.weaponMode = 'BAZOOKA';
        // Show weapon change message
        if (this.game.ui) {
            this.game.ui.showWeaponChangeMessage('BAZOOKA');
        }
        this.game.player.activateItemEffect('bazooka', ITEM_CONFIG.BAZOOKA.DURATION); // 15 seconds
        
        // Set cooldown
        this.game.player.setItemCooldown('bazooka', ITEM_CONFIG.BAZOOKA.COOLDOWN); // 45 seconds cooldown
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add bazooka particles
            for (let i = 0; i < 25; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 3;
                this.game.particleSystem.addParticle({
                    x: this.game.player.position.x,
                    y: this.game.player.position.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 40,
                    decay: 0.92,
                    color: ITEM_CONFIG.BAZOOKA.COLOR,
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
