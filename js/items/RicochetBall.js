
class RicochetBall {
    constructor(game, x, y, targetX, targetY) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.color = "#ff9900";
        this.bounceCount = 0;
        this.maxBounces = 3 + Math.floor(Math.random() * 3); // 3-5 bounces
        this.damage = 50;
        this.source = 'player';
        
        // Calculate direction to target
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / distance) * 5; // Speed of 5
        this.vy = (dy / distance) * 5;
    }

    update() {
        // Move the ball
        this.x += this.vx;
        this.y += this.vy;
        
        // Check wall collisions
        if (this.x - this.radius < 0 || this.x + this.radius > this.game.canvas.width) {
            this.vx = -this.vx;
            this.bounceCount++;
        }
        if (this.y - this.radius < 0 || this.y + this.radius > this.game.canvas.height) {
            this.vy = -this.vy;
            this.bounceCount++;
        }
        
        // Check if max bounces reached
        if (this.bounceCount >= this.maxBounces) {
            // Create explosion effect
            if (this.game.particleSystem) {
                this.game.particleSystem.addExplosion(this.x, this.y, '#ff9900', 15, 1);
            }
            return true; // Mark for removal
        }
        
        // Check enemy collisions
        for (let i = this.game.enemies.length - 1; i >= 0; i--) {
            const enemy = this.game.enemies[i];
            const dx = this.x - enemy.position.x;
            const dy = this.y - enemy.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.radius + enemy.size) {
                // Damage enemy
                enemy.takeDamage(this.damage);
                
                // Create hit effect
                if (this.game.particleSystem) {
                    this.game.particleSystem.addImpactSparks(this.x, this.y, '#ff9900', 5);
                }
                
                // Bounce off enemy
                this.bounceCount++;
                if (this.bounceCount >= this.maxBounces) {
                    // Create explosion effect
                    if (this.game.particleSystem) {
                        this.game.particleSystem.addExplosion(this.x, this.y, '#ff9900', 15, 1);
                    }
                    return true; // Mark for removal
                }
                break;
            }
        }
        
        return false; // Keep ball alive
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    checkCollision(entity) {
        const dx = this.x - entity.position.x;
        const dy = this.y - entity.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + entity.size;
    }
}
