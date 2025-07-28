
class ItemManager {
    constructor(game) {
        this.game = game;
        this.items = [];
    }

    spawnItem(type, x, y) {
        let item;
        switch(type) {
            case 'Valkyrie':
                item = new ValkyrieItem(this.game, x, y);
                break;
            // autres items à ajouter ici
        }
        if (item) this.items.push(item);
    }

    update() {
        for (let item of this.items) {
            item.update();
        }

        // Collision joueur/item
        this.items = this.items.filter(item => {
            if (this.game.player.collidesWith(item)) {
                item.activate();
                return false;
            }
            return true;
        });
    }

    draw(ctx) {
        for (let item of this.items) {
            item.draw(ctx);
        }
    }
}
