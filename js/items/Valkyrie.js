import { ITEM_CONFIG } from '../config.js';

export class ValkyrieItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.VALKYRIE.COLOR;
    }

    update() {
        // Add floating animation
        // This could be implemented if needed
    }

    draw(ctx) {
        // Draw nuclear bomb symbol
        ctx.fillStyle = this.color;
        
        // Draw bomb body (ellipse)
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius * 0.8, this.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw radiation symbol (three curved lines)
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        
        // Draw three curved lines representing radiation
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3;
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(angle) * this.radius * 0.3,
                this.y + Math.sin(angle) * this.radius * 0.3,
                this.radius * 0.4,
                angle + Math.PI * 0.7,
                angle + Math.PI * 1.3
            );
            ctx.stroke();
        }
        
        // Draw center circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('valkyrie')) {
            return;
        }
        // Activate valkyrie effect
        this.game.player.invincible = true;
        this.game.player.activateItemEffect('valkyrie', ITEM_CONFIG.VALKYRIE.DURATION); // 8 seconds total
        
        // Set cooldown
        this.game.player.setItemCooldown('valkyrie', ITEM_CONFIG.VALKYRIE.COOLDOWN); // 30 seconds cooldown
        
        
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
                    color: ITEM_CONFIG.VALKYRIE.COLOR,
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
        
        // After duration, remove invincibility
        setTimeout(() => {
            this.game.player.invincible = false;
        }, ITEM_CONFIG.VALKYRIE.DURATION);
    }
}
