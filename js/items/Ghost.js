
class GhostItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.color = "#cccccc";
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
        if (this.game.player.isItemOnCooldown('ghost')) {
            return;
        }
        
        // Activate ghost effect
        this.game.player.ghost = true;
        this.game.player.activateItemEffect('ghost', 5000); // 5 seconds
        
        // Set cooldown
        this.game.player.setItemCooldown('ghost', 20000); // 20 seconds cooldown
        
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
                    color: '#cccccc',
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
