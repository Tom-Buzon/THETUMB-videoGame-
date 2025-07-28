
class TimeBubbleItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.color = "#99ccff";
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
            enemy.speed = enemy.originalSpeed * 0.3; // 70% slower
            
            // Reset speed after 5 seconds
            setTimeout(() => {
                if (enemy.speed === enemy.originalSpeed * 0.3) {
                    enemy.speed = enemy.originalSpeed;
                }
            }, 5000);
        }
        
        // Activate time bubble effect
        this.game.player.activateItemEffect('timeBubble', 5000); // 5 seconds
        
        // Set cooldown
        this.game.player.setItemCooldown('timeBubble', 20000); // 20 seconds cooldown
        
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
                    color: '#99ccff',
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
