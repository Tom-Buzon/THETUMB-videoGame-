
class ValkyrieItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.color = "#66ccff";
    }

    update() {
        // Add floating animation
        // This could be implemented if needed
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('valkyrie')) {
            return;
        }
        
        // Activate valkyrie effect
        this.game.player.invincible = true;
        this.game.player.activateItemEffect('valkyrie', 8000); // 8 seconds total
        
        // Set cooldown
        this.game.player.setItemCooldown('valkyrie', 30000); // 30 seconds cooldown
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add valkyrie activation particles
            for (let i = 0; i < 50; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 3;
                this.game.particleSystem.addParticle({
                    x: this.game.player.position.x,
                    y: this.game.player.position.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 60,
                    decay: 0.95,
                    color: '#66ccff',
                    size: 3 + Math.random() * 3
                });
            }
        }
        
        // Play sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("itemPickup");
        }
        
        // After 3 seconds, send shockwave
        setTimeout(() => {
            // Send shockwave
            for (let i = this.game.enemies.length - 1; i >= 0; i--) {
                const enemy = this.game.enemies[i];
                const dx = enemy.position.x - this.game.player.position.x;
                const dy = enemy.position.y - this.game.player.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= 800) {
                    enemy.takeDamage(9999);
                    
                    // Check if enemy should be removed
                    if (enemy.health <= 0 || (enemy.isDying && enemy.deathAnimation >= 1)) {
                        this.game.enemies.splice(i, 1);
                    }
                }
            }
            
            // Add shockwave visual effect
            if (this.game.particleSystem) {
                this.game.particleSystem.addExplosion(
                    this.game.player.position.x,
                    this.game.player.position.y,
                    '#66ccff',
                    100,
                    2
                );
            }
            
            // Play shockwave sound
            if (window.audio && window.audio.playSound) {
                window.audio.playSound("explosion");
            }
        }, 3000);
        
        // After 8 seconds, remove invincibility
        setTimeout(() => {
            this.game.player.invincible = false;
        }, 8000);
    }
}
