class Charger extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.color = '#ffff00';
        this.health = 40;
        this.maxHealth = 40;
        this.speed = 1;
        this.chargeSpeed = 6;
        this.chargeRange = 250;
        this.chargeDamage = 99;
        this.charging = false;
        this.chargeDirection = new Vector2D(0, 0);
        this.chargeCooldown = 0;
    }

    update(player, currentTime) {
        if (!this.activated) return null;

        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (this.charging) {
            // Continue charging
            this.position.x += this.chargeDirection.x * this.chargeSpeed;
            this.position.y += this.chargeDirection.y * this.chargeSpeed;
            
            // Check collision with player
            const playerDistance = Math.sqrt(
                (this.position.x - player.position.x) ** 2 + 
                (this.position.y - player.position.y) ** 2
            );
            
            if (playerDistance < this.size + 15) {
                player.takeDamage(this.chargeDamage);
                this.health = 0; // Die after charge
            }
            
            // Stop charging if out of bounds
            if (this.position.x < 0 || this.position.x > 800 || 
                this.position.y < 0 || this.position.y > 600) {
                this.health = 0;
            }
            
            return null;
        }

        if (this.chargeCooldown > 0) {
            this.chargeCooldown--;
        }

        if (distance < this.chargeRange && this.chargeCooldown <= 0) {
            // Start charging
            this.charging = true;
            this.chargeDirection = new Vector2D(dx, dy).normalize();
            this.color = '#ffaa00';
        } else if (distance < this.detectionRange) {
            // Move towards player
            const direction = new Vector2D(dx, dy).normalize();
            this.position.x += direction.x * this.speed;
            this.position.y += direction.y * this.speed;
        }

        return null;
    }

    render(ctx) {
        super.render(ctx);
        
        if (this.charging) {
            // Charging effect
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}