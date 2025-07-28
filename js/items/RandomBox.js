
class RandomBoxItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.color = "#ffff33";
    }

    update() {}
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    activate() {
        // Exemple simple : 50% bonus, 50% malus
        const roll = Math.random();
        if (roll < 0.5) {
            this.game.player.speed *= 0.75; // malus
        } else {
            this.game.player.hp = Math.min(this.game.player.hp + 30, GameConfig.player.maxHP);
        }
    }
}
