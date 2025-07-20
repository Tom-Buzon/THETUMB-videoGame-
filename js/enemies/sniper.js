class Sniper {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = 20;
        this.health = 60;
        this.maxHealth = 60;
        this.speed = 1.5;
        this.color = '#8844ff';
        this.activated = false;
        this.shootCooldown = 0;
        this.shootRange = 300;
        this.retreatDistance = 200;
    }

    update(player) {
        if (!this.activated) return null;

        const distanceToPlayer = Math.sqrt(
            (player.position.x - this.position.x) ** 2 +
            (player.position.y - this.position.y) ** 2
        );

        // Movement logic - keep distance
        const direction = new Vector2D(
            player.position.x - this.position.x,
            player.position.y - this.position.y
        ).normalize();

        if (distanceToPlayer < this.retreatDistance) {
            // Retreat from player
            this.velocity = direction.multiply(-this.speed);
        } else if (distanceToPlayer > this.shootRange) {
            // Move closer to player
            this.velocity = direction.multiply(this.speed);
        } else {
            // Stay still and shoot
            this.velocity = new Vector2D(0, 0);
        }

        this.position = this.position.add(this.velocity);

        // Keep in bounds
        this.position.x = Math.max(this.size, Math.min(800 - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(600 - this.size, this.position.y));

        // Shooting
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        if (distanceToPlayer <= this.shootRange && this.shootCooldown <= 0) {
            this.shootCooldown = 120; // 2 seconds
            
            const bulletDirection = direction;
            return new Bullet(
                this.position.x + bulletDirection.x * 25,
                this.position.y + bulletDirection.y * 25,
                bulletDirection.x * 8,
                bulletDirection.y * 8,
                25,
                '#8844ff',
                4,
                'enemy'
            );
        }

        return null;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    render(ctx) {
        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Sniper scope indicator
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Laser sight
        const player = window.game ? window.game.player : null;
        if (player && this.activated) {
            const distance = Math.sqrt(
                (player.position.x - this.position.x) ** 2 +
                (player.position.y - this.position.y) ** 2
            );
            
            if (distance <= this.shootRange) {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y);
                ctx.lineTo(player.position.x, player.position.y);
                ctx.stroke();
            }
        }
        
        // Health bar
        const barWidth = 40;
        const barHeight = 4;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size - 10;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
    }
}