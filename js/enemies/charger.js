class Charger {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = 25;
        this.health = 80;
        this.maxHealth = 80;
        this.speed = 3;
        this.color = '#ff4444';
        this.activated = false;
        this.chargeCooldown = 0;
        this.chargeSpeed = 8;
        this.isCharging = false;
        this.chargeDirection = new Vector2D(0, 0);
        this.chargeDuration = 0;
        this.maxChargeDuration = 30;
    }

    update(player) {
        if (!this.activated) return null;

        const distanceToPlayer = Math.sqrt(
            (player.position.x - this.position.x) ** 2 +
            (player.position.y - this.position.y) ** 2
        );

        if (this.isCharging) {
            // Charging state
            this.position = this.position.add(this.chargeDirection.multiply(this.chargeSpeed));
            this.chargeDuration++;
            
            if (this.chargeDuration >= this.maxChargeDuration) {
                this.isCharging = false;
                this.chargeCooldown = 60;
                this.chargeDuration = 0;
            }
        } else if (this.chargeCooldown > 0) {
            // Cooldown state
            this.chargeCooldown--;
        } else {
            // Normal movement
            const direction = new Vector2D(
                player.position.x - this.position.x,
                player.position.y - this.position.y
            ).normalize();
            
            this.velocity = direction.multiply(this.speed);
            this.position = this.position.add(this.velocity);
            
            // Start charging when close enough
            if (distanceToPlayer < 150) {
                this.isCharging = true;
                this.chargeDirection = direction;
                this.chargeDuration = 0;
            }
        }

        // Keep in bounds
        this.position.x = Math.max(this.size, Math.min(800 - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(600 - this.size, this.position.y));

        return null; // No shooting
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
        
        // Charge indicator
        if (this.isCharging) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size + 5, 0, Math.PI * 2);
            ctx.stroke();
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