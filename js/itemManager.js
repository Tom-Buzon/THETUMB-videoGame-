
class ItemManager {
    constructor(player, particleSystem, audioManager) {
        this.player = player;
        this.particleSystem = particleSystem;
        this.audioManager = audioManager;
        this.activeItems = [];
    }

    spawnItem(type, position) {
        const item = {
            type,
            position,
            collected: false
        };
        this.activeItems.push(item);
    }

    update() {
        this.activeItems = this.activeItems.filter(item => {
            if (!item.collected && this.player.position.distanceTo(item.position) < 50) {
                this.collectItem(item);
                return false;
            }
            return true;
        });
    }

    collectItem(item) {
        item.collected = true;
        switch (item.type) {
            case 'valkyrie':
                this.activateValkyrie();
                break;
            default:
                console.warn(`Item ${item.type} not implemented`);
        }
    }

    activateValkyrie() {
        this.audioManager.playSound('valkyrie');
        this.particleSystem.createExplosion(this.player.position, '#00ccff');
        this.player.invincible = true;

        setTimeout(() => {
            this.killNearbyEnemies();
            this.player.invincible = false;
        }, 2000);
    }

    killNearbyEnemies() {
        const radius = 800;
        window.game.enemies.forEach(enemy => {
            if (this.player.position.distanceTo(enemy.position) < radius) {
                enemy.takeDamage(9999);
                this.particleSystem.createExplosion(enemy.position, '#ff0000');
            }
        });
    }

    render(ctx) {
        this.activeItems.forEach(item => {
            ctx.beginPath();
            ctx.arc(item.position.x, item.position.y, 15, 0, Math.PI * 2);
            ctx.fillStyle = '#00ccff';
            ctx.fill();
        });
    }
}
