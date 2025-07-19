class Exploder extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.color = '#ff0000';
        this.health = 20;
        this.maxHealth = 20;
        this.speed = 0.5;
        this.explosionRange = 50;
        this.explosionDamage = 75;
        this.detectionRange = 200;
        this.exploding = false;
        this.explosionTimer = 0;
    }

    update(player, currentTime) {
        if (!this.activated) return null;

        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (this.exploding) {
            this.explosionTimer++;
            if (this.explosionTimer > 30) {
                this.health = 0;
                return null;
            }
            return null;
        }

        if (distance < this.detectionRange) {
            // Move towards player
            const direction = new Vector2D(dx, dy).normalize();
            this.position.x += direction.x * this.speed;
            this.position.y += direction.y * this.speed;

            // Check if close enough to explode
            if (distance < this.explosionRange) {
                this.exploding = true;
                this.color = '#ff6600';
            }
        }

        return null;
    }

    render(ctx) {
        super.render(ctx);
        
        if (this.exploding) {
            const pulse = Math.sin(this.explosionTimer * 0.5) * 5;
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size + pulse, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}