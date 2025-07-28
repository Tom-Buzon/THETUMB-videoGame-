
class ValkyrieItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.collected = false;
        this.color = "#66ccff";
    }

    update() {
        // animation de flottement ?
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    activate() {
        if (this.collected) return;
        this.collected = true;

        const player = this.game.player;
        player.invincible = true;
        player.elevated = true;

        this.game.audioManager.playSound("itemPickup");

        setTimeout(() => {
            // Onde de choc
            for (let enemy of this.game.enemies) {
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= 800) {
                    enemy.takeDamage(9999);
                }
            }
            player.invincible = false;
            player.elevated = false;
        }, 3000);
    }
}
