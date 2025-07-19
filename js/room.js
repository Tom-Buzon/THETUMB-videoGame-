class RoomGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generateEnemies(dungeon, room) {
        const enemies = [];
        const count = Math.min(3 + dungeon + room, 8);
        
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = 50 + Math.random() * (this.width - 100);
                y = 50 + Math.random() * (this.height - 100);
            } while (Math.abs(x - this.width/2) < 50 && Math.abs(y - this.height/2) < 50);
            
            const type = Math.random();
            if (type < 0.33) {
                enemies.push(new ShooterEnemy(x, y));
            } else if (type < 0.66) {
                enemies.push(new ChargerEnemy(x, y));
            } else {
                enemies.push(new ExploderEnemy(x, y));
            }
        }
        return enemies;
    }

    generateObstacles(dungeon, room) {
        const obstacles = [];
        const count = Math.min(2 + dungeon, 6);
        
        for (let i = 0; i < count; i++) {
            let x, y, width, height;
            do {
                width = 30 + Math.random() * 50;
                height = 30 + Math.random() * 50;
                x = 50 + Math.random() * (this.width - width - 100);
                y = 50 + Math.random() * (this.height - height - 100);
            } while (Math.abs(x - this.width/2) < 80 && Math.abs(y - this.height/2) < 80);
            
            obstacles.push({ x, y, width, height, isDamaging: Math.random() < 0.3 });
        }
        return obstacles;
    }

    generateItems(dungeon) {
        const items = [];
        if (Math.random() < 0.5) {
            items.push(new Item(
                100 + Math.random() * (this.width - 200),
                100 + Math.random() * (this.height - 200),
                'health'
            ));
        }
        return items;
    }
}