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
        // Draw upward arrow
        ctx.beginPath();
        ctx.fillStyle = this.color;
        
        // Arrow shaft (vertical line)
        const arrowWidth = this.radius * 0.3;
        const arrowHeight = this.radius * 0.6;
        const arrowHeadHeight = this.radius * 0.4;
        const arrowHeadWidth = this.radius * 0.5;
        
        // Upward arrow
        // Draw arrow shaft
        ctx.fillRect(
            this.x - arrowWidth/2,
            this.y - arrowHeight/2,
            arrowWidth,
            arrowHeight
        );
        
        // Draw arrow head
        ctx.beginPath();
        ctx.moveTo(this.x - arrowHeadWidth, this.y - arrowHeight/2);
        ctx.lineTo(this.x, this.y - arrowHeight/2 - arrowHeadHeight);
        ctx.lineTo(this.x + arrowHeadWidth, this.y - arrowHeight/2);
        ctx.closePath();
        ctx.fill();
        
        // Downward arrow
        // Draw arrow shaft
        ctx.fillRect(
            this.x - arrowWidth/2,
            this.y + arrowHeight/2 - arrowHeight,
            arrowWidth,
            arrowHeight
        );
        
        // Draw arrow head
        ctx.beginPath();
        ctx.moveTo(this.x - arrowHeadWidth, this.y + arrowHeight/2);
        ctx.lineTo(this.x, this.y + arrowHeight/2 + arrowHeadHeight);
        ctx.lineTo(this.x + arrowHeadWidth, this.y + arrowHeight/2);
        ctx.closePath();
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
