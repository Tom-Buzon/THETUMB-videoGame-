class Enemy {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = 12;
        this.health = 20;
        this.maxHealth = 20;
        this.speed = 1;
        this.color = '#ff0000';
        this.activated = false;
        this.spawnTime = Date.now();
        this.lastShot = 0;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    render(ctx) {
        // Enemy body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Health bar
        const healthPercent = this.health / this.maxHealth;
        const barWidth = 20;
        const barHeight = 3;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.position.x - barWidth/2, this.position.y - this.size - 8, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.position.x - barWidth/2, this.position.y - this.size - 8, barWidth * healthPercent, barHeight);
    }
}