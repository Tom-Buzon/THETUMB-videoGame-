class Shooter extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.color = '#00ff00';
        this.health = 30;
        this.maxHealth = 30;
        this.speed = 1;
        this.shootCooldown = 0;
        this.shootInterval = 2000;
        this.detectionRange = 300;
        this.bulletDamage = 5;
    }

    update(player, currentTime) {
        if (!this.activated) return null;

        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.detectionRange) {
            // Move towards player
            const direction = new Vector2D(dx, dy).normalize();
            this.position.x += direction.x * this.speed;
            this.position.y += direction.y * this.speed;

            // Shoot at player
            if (currentTime - this.lastShot > this.shootInterval) {
                this.lastShot = currentTime;
                const bulletDirection = new Vector2D(dx, dy).normalize();
                
                return {
                    position: new Vector2D(this.position.x, this.position.y),
                    velocity: bulletDirection.multiply(4),
                    damage: this.bulletDamage,
                    color: '#00ff00',
                    size: 3,
                    owner: 'enemy'
                };
            }
        }

        return null;
    }

    render(ctx) {
        super.render(ctx);
        
        // Add gun barrel
        const player = { position: { x: 400, y: 300 } }; // Approximate
        const dx = player.position.x - this.position.x;
        const dy = player.position.y - this.position.y;
        const direction = new Vector2D(dx, dy).normalize();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x + direction.x * 15, this.position.y + direction.y * 15);
        ctx.stroke();
    }
}