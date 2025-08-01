import { ROOM_CONFIG, PROGRESSION_CONFIG, ITEM_CONFIG } from './config.js';
import { Charger } from './enemies/charger.js';
import { Shooter } from './enemies/shooter.js';
import { Exploder } from './enemies/exploder.js';
import { Swarmer } from './enemies/swarmer.js';
import { Protector } from './enemies/protector.js';
import { Sniper } from './enemies/sniper.js';
import { Boss } from './enemies/boss.js';

export class RoomGenerator {
    constructor(width, height) {
        this.width = width || ROOM_CONFIG.CANVAS_WIDTH;
        this.height = height || ROOM_CONFIG.CANVAS_HEIGHT;
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
                enemyTypes = ['charger', 'charger', 'shooter', 'sniper'];
                count = Math.min(count, ROOM_CONFIG.ENEMY_COUNT.DUNGEON_1);
                break;
            case 2:
                // Mixed enemies
                enemyTypes = ['charger', 'shooter', 'exploder', 'sniper'];
                count = Math.min(count, ROOM_CONFIG.ENEMY_COUNT.DUNGEON_2);
                break;
            case 3:
                // More advanced enemies
                enemyTypes = ['shooter', 'exploder', 'exploder', 'charger', 'swarmer', 'sniper'];
                count = Math.min(count, ROOM_CONFIG.ENEMY_COUNT.DUNGEON_3);
                break;
            case 4:
                // Elite enemies with protectors
                enemyTypes = ['shooter', 'protector', 'exploder', 'charger', 'swarmer', 'sniper'];
                count = Math.min(count, ROOM_CONFIG.ENEMY_COUNT.DUNGEON_4);
                break;
            default:
                // High level - all types with increased difficulty
                enemyTypes = ['shooter', 'protector', 'exploder', 'charger', 'swarmer', 'protector', 'sniper'];
                count = Math.min(count, ROOM_CONFIG.ENEMY_COUNT.DUNGEON_5);
        }
        
        // First, create all enemies without initializing healers
        const enemyObjects = [];
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
                case 'protector':
                    // Create protector without enemies list for now
                    enemy = new Protector(x, y);
                    break;
                case 'sniper':
                    enemy = new Sniper(x, y);
                    break;
            }
            
            this.scaleEnemyStats(enemy, dungeon);
            enemyObjects.push({
                type: type,
                object: enemy
            });
        }
        
        // Now initialize protectors with the complete enemy list
        const allEnemies = enemyObjects.map(item => item.object);
        enemyObjects.forEach(item => {
            if (item.type === 'protector') {
                // Re-initialize protector with enemies list
                item.object.chooseProtectedEnemy(allEnemies);
            }
        });
        
        // Extract enemy objects for return
        return allEnemies;
    }

    scaleEnemyStats(enemy, dungeonLevel) {
        // Progressive scaling with exponential growth for higher dungeons
        const healthMultiplier = Math.pow(PROGRESSION_CONFIG.ENEMY_SCALING.HEALTH_MULTIPLIER, dungeonLevel - 1);
        const speedMultiplier = Math.pow(PROGRESSION_CONFIG.ENEMY_SCALING.SPEED_MULTIPLIER, dungeonLevel - 1);
        const damageMultiplier = Math.pow(PROGRESSION_CONFIG.ENEMY_SCALING.DAMAGE_MULTIPLIER, dungeonLevel - 1);
        
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
        let count = Math.min(2 + dungeon * PROGRESSION_CONFIG.OBSTACLE_SCALING.COUNT_MULTIPLIER, 12);
        
        // Dungeon-specific obstacle patterns
        switch(dungeon) {
            case 1:
                // Simple static obstacles
                count = ROOM_CONFIG.OBSTACLE_COUNT.DUNGEON_1;
                break;
            case 2:
                // More complex layouts
                count = ROOM_CONFIG.OBSTACLE_COUNT.DUNGEON_2;
                break;
            case 3:
                // Damaging obstacles introduced
                count = ROOM_CONFIG.OBSTACLE_COUNT.DUNGEON_3;
                break;
            case 4:
                // Complex maze-like patterns
                count = ROOM_CONFIG.OBSTACLE_COUNT.DUNGEON_4;
                break;
            default:
                // Maximum chaos
                count = ROOM_CONFIG.OBSTACLE_COUNT.DUNGEON_5;
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
            const isDamaging = Math.random() < Math.min(0.3 + dungeon * PROGRESSION_CONFIG.OBSTACLE_SCALING.DAMAGE_INCREASE, 0.8);
            obstacles.push(new Obstacle(x, y, width, height, isDamaging));
        }
        return obstacles;
    }

    generateItems(itemManager) {
        // Spawn random items using the advanced ItemManager
        const itemTypes = ['Medkit', 'Valkyrie', 'Shield', 'Bazooka', 'BlackHole',
                          'Companion', 'Ghost', 'TimeBubble', 'GodPlan', 'RandomBox', 'Ricochet'];
        
        // Progressive item spawning based on dungeon level
        const dungeon = itemManager.game.currentDungeon;
        const room = itemManager.game.currentRoom;
        
        // Base item count with progression
        let baseItemCount = ROOM_CONFIG.BASE_ITEM_COUNT + Math.floor(dungeon * PROGRESSION_CONFIG.ITEM_SPAWNING.COUNT_MULTIPLIER) + Math.floor(room * PROGRESSION_CONFIG.ITEM_SPAWNING.ROOM_MULTIPLIER);
        // Add some randomness but keep it progressive
        const itemCount = Math.max(1, baseItemCount + Math.floor(Math.random() * 2) - 1);
        
        // Item rarity system - powerful items are rarer in early game
        const getItemByRarity = (dungeonLevel) => {
            // Define item rarities (common, uncommon, rare, epic)
            const rarities = {
                common: ROOM_CONFIG.ITEM_RARITY.COMMON,
                uncommon: ROOM_CONFIG.ITEM_RARITY.UNCOMMON,
                rare: ROOM_CONFIG.ITEM_RARITY.RARE,
                epic: ROOM_CONFIG.ITEM_RARITY.EPIC
            };
            
            // Adjust rarities based on dungeon level
            let availableItems = [];
            
            // Always include common items
            availableItems = availableItems.concat(rarities.common);
            
            // Add uncommon items from dungeon 1
            if (dungeonLevel >= 1) {
                availableItems = availableItems.concat(rarities.uncommon);
            }
            
            // Add rare items from dungeon 2
            if (dungeonLevel >= 2) {
                availableItems = availableItems.concat(rarities.rare);
            }
            
            // Add epic items from dungeon 3
            if (dungeonLevel >= 3) {
                availableItems = availableItems.concat(rarities.epic);
            }
            
            // Weighted selection - favor common items in early game
            let weightedItems = [];
            availableItems.forEach(item => {
                let weight = 1;
                if (rarities.common.includes(item)) weight = 5;
                else if (rarities.uncommon.includes(item)) weight = 3;
                else if (rarities.rare.includes(item)) weight = 2;
                else if (rarities.epic.includes(item)) weight = 1;
                
                // Reduce epic item chances in early dungeons
                if (rarities.epic.includes(item) && dungeonLevel < 3) {
                    weight = 0.1; // Even rarer in early game
                }
                
                // Special handling for the most powerful items
                if (item === 'BlackHole' && dungeonLevel < 4) {
                    weight = 0.05; // Extremely rare before dungeon 4
                }
                if (item === 'GodPlan' && dungeonLevel < 5) {
                    weight = 0.05; // Extremely rare before dungeon 5
                }
                
                for (let i = 0; i < weight; i++) {
                    weightedItems.push(item);
                }
            });
            
            return weightedItems[Math.floor(Math.random() * weightedItems.length)];
        };
        
        // Track spawned item positions to avoid clustering
        const spawnedPositions = [];
        const minDistance = 150; // Minimum distance between items
        
        for (let i = 0; i < itemCount; i++) {
            // Get item type based on rarity system
            const type = getItemByRarity(dungeon);
            
            // Find a position that's not too close to other items
            let x, y, validPosition = false;
            let attempts = 0;
            
            while (!validPosition && attempts < 20) {
                x = 100 + Math.random() * (this.width - 200);
                y = 100 + Math.random() * (this.height - 200);
                
                // Check distance to other spawned items
                validPosition = true;
                for (const pos of spawnedPositions) {
                    const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            // If we couldn't find a valid position, just use the last one
            if (!validPosition && spawnedPositions.length > 0) {
                const lastPos = spawnedPositions[spawnedPositions.length - 1];
                // Place it at a fixed offset from the last position
                x = (lastPos.x + minDistance) % (this.width - 200) + 100;
                y = (lastPos.y + minDistance) % (this.height - 200) + 100;
            }
            
            // Spawn the item
            const item = itemManager.spawnItem(type, x, y);
            
            // Add visual feedback when items spawn
            if (item && itemManager.game.particleSystem) {
                // Add spawn particles
                for (let j = 0; j < 20; j++) {
                    const angle = (j / 20) * Math.PI * 2;
                    const speed = 2 + Math.random() * 3;
                    itemManager.game.particleSystem.addParticle({
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 30,
                        decay: 0.95,
                        color: '#FFFF00', // Yellow particles for item spawn
                        size: 2 + Math.random() * 3
                    });
                }
                
                // Play spawn sound
                if (window.audio && window.audio.playSound) {
                    window.audio.playSound("itemSpawn");
                }
            }
            
            // Store position to avoid clustering
            spawnedPositions.push({x, y});
        }
    }
}