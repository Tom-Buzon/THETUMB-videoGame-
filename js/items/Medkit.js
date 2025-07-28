
class MedkitItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.color = "#00ff99";
    }

    update() {}
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    activate() {
        this.game.player.hp = Math.min(this.game.player.hp + 50, GameConfig.player.maxHP);
        this.game.audioManager.playSound("itemPickup");
    }
}
