class Healer extends Enemy {
    constructor(x, y) {
        super(x, y, 12, '#FF00FF', 8, 5);
        this.maxHealth = 30;
        this.health = this.maxHealth;
        this.healRadius = 100;
        this.healAmount = 1;
        this.healInterval = 2000;
        this.lastHeal = 0;
        this.shieldRadius = 60;
    }

    update(player, currentTime) {
        if (!this.activated) return null;

        // Move away from player
        const dx = this.position.x - player.position.x;
        const dy = this.position.y - player.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;
            this.position.x += moveX;
            this.position.y += moveY;
        }

        // Heal nearby enemies
        if (currentTime - this.lastHeal > this.healInterval) {
            this.lastHeal = currentTime;
            // Healing is handled in game.js
        }

        return null;
    }

    render(ctx) {
        // Draw healer as pink circle with healing aura
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw healing aura
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.healRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw plus sign
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.position.x - 5, this.position.y);
        ctx.lineTo(this.position.x + 5, this.position.y);
        ctx.moveTo(this.position.x, this.position.y - 5);
        ctx.lineTo(this.position.x, this.position.y + 5);
        ctx.stroke();
    }
}