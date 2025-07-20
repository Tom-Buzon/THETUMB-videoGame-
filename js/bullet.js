class Bullet {
    constructor(x, y, vx, vy, damage, color, size, type) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(vx, vy);
        this.damage = damage;
        this.color = color;
        this.size = size || 3;
        this.type = type; // 'player' or 'enemy'
    }

    update() {
        this.position = this.position.add(this.velocity);
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}