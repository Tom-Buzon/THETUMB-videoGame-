class Swarmer {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = 12;
        this.health = 30;
        this.maxHealth = 30;
        this.speed = 2.5;
        this.color = '#ff6600';
        this.activated = false;
    }

    update(player) {
        if (!this.activated) return null;

        // Simple chase behavior
        const direction = new Vector2D(
            player.position.x - this.position.x,
            player.position.y - this.position.y
        ).normalize();

        this.velocity = direction.multiply(this.speed);
        this.position = this.position.add(this.velocity);

        // Keep in bounds
        this.position.x = Math.max(this.size, Math.min(800 - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(600 - this.size, this.position.y));

        return null; // No shooting
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    render(ctx) {
        // **CORPS AVEC BORDURE POUR VISIBILITÉ**
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // **YEUX ROUGES POUR IDENTIFICATION**
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.position.x - 4, this.position.y - 3, 2, 0, Math.PI * 2);
        ctx.arc(this.position.x + 4, this.position.y - 3, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Health bar
        const barWidth = 30;
        const barHeight = 3;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size - 8;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
    }
}