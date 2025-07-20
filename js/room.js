class RoomGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generateEnemies(dungeon, room) {
        const enemies = [];
        
        // Boss room (room 3)
        if (room === 3) {
            const boss = new Boss(this.width/2, this.height/2, dungeon);
            enemies.push(boss);
            return enemies;
        }
        
        // Dungeon-specific enemy compositions
        let enemyTypes = [];
        let count = 3 + Math.floor(dungeon * 1.5) + room;
        
        switch(dungeon) {
            case 1:
                // Basic enemies - mostly chargers
                enemyTypes = ['charger', 'charger', 'shooter'];
                count = Math.min(count, 5);
                break;
            case 2:
                // Mixed enemies
                enemyTypes = ['charger', 'shooter', 'exploder'];
                count = Math.min(count, 6);
                break;
            case 3:
                // More advanced enemies
                enemyTypes = ['shooter', 'exploder', 'exploder', 'charger', 'swarmer'];
                count = Math.min(count, 7);
                break;
            case 4:
                // Elite enemies with healers
                enemyTypes = ['shooter', 'healer', 'exploder', 'charger', 'swarmer'];
                count = Math.min(count, 8);
                break;
            default:
                // High level - all types with increased difficulty
                enemyTypes = ['shooter', 'healer', 'exploder', 'charger', 'swarmer', 'healer'];
                count = Math.min(count, 10);
        }
        
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = 50 + Math.random() * (this.width - 100);
                y = 50 + Math.random() * (this.height - 100);
            } while (Math.abs(x - this.width/2) < 50 && Math.abs(y - this.height/2) < 50);
            
            const type = enemyTypes[i % enemyTypes.length];
            let enemy;
            
            switch(type) {
                case 'shooter':
                    enemy = new Shooter(x, y);
                    break;
                case 'charger':
                    enemy = new Charger(x, y);
                    break;
                case 'exploder':
                    enemy = new Exploder(x, y);
                    break;
                case 'swarmer':
                    enemy = new Swarmer(x, y);
                    break;
                case 'healer':
                    enemy = new Healer(x, y);
                    break;
            }
            
            this.scaleEnemyStats(enemy, dungeon);
            enemies.push(enemy);
        }
        return enemies;
    }

    scaleEnemyStats(enemy, dungeonLevel) {
        // Progressive scaling with exponential growth for higher dungeons
        const healthMultiplier = Math.pow(1.4, dungeonLevel - 1);
        const speedMultiplier = Math.pow(1.2, dungeonLevel - 1);
        const damageMultiplier = Math.pow(1.3, dungeonLevel - 1);
        
        enemy.maxHealth *= healthMultiplier;
        enemy.health = enemy.maxHealth;
        enemy.speed *= speedMultiplier;
        enemy.damage *= damageMultiplier;
        
        // Special abilities for higher dungeons
        if (dungeonLevel >= 3) {
            enemy.size *= 1.1; // Larger enemies
        }
        if (dungeonLevel >= 4) {
            enemy.attackSpeed *= 1.2; // Faster attacks
        }
        if (dungeonLevel >= 5) {
            enemy.color = '#FF0000'; // Red tint for elite enemies
        }
    }

    generateObstacles(dungeon, room) {
        const obstacles = [];
        let count = Math.min(2 + dungeon * 2, 12);
        
        // Dungeon-specific obstacle patterns
        switch(dungeon) {
            case 1:
                // Simple static obstacles
                count = 3;
                break;
            case 2:
                // More complex layouts
                count = 5;
                break;
            case 3:
                // Damaging obstacles introduced
                count = 6;
                break;
            case 4:
                // Complex maze-like patterns
                count = 8;
                break;
            default:
                // Maximum chaos
                count = 10 + Math.floor(dungeon / 2);
        }
        
        for (let i = 0; i < count; i++) {
            let x, y, width, height;
            do {
                // Different obstacle sizes per dungeon
                if (dungeon <= 2) {
                    width = 30 + Math.random() * 50;
                    height = 30 + Math.random() * 50;
                } else if (dungeon <= 4) {
                    width = 40 + Math.random() * 60;
                    height = 40 + Math.random() * 60;
                } else {
                    width = 50 + Math.random() * 80;
                    height = 50 + Math.random() * 80;
                }
                
                x = 50 + Math.random() * (this.width - width - 100);
                y = 50 + Math.random() * (this.height - height - 100);
            } while (Math.abs(x - this.width/2) < 80 && Math.abs(y - this.height/2) < 80);
            
            // Progressive damaging obstacles
            const isDamaging = Math.random() < Math.min(0.3 + dungeon * 0.15, 0.8);
            obstacles.push({ x, y, width, height, isDamaging });
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