class Bullet {
    constructor(x, y, velocityX, velocityY, damage, color, size, owner) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(velocityX, velocityY);
        this.damage = damage;
        this.color = color;
        this.size = size;
        this.owner = owner;
    }

    update() {
        // Move the bullet based on its velocity
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}