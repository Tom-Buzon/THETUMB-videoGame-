class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player(400, 300);
        this.enemies = [];
        this.bullets = [];
        this.particleSystem = new ParticleSystem();
        this.roomGenerator = new RoomGenerator(800, 600);
        this.currentDungeon = 1;
        this.currentRoom = 1;
        this.gameRunning = true;
        this.keys = {};
        this.obstacles = [];
        this.items = [];
        
        this.setupInput();
        this.generateRoom();
    }

    setupInput() {
        // Keyboard events - capture all keys
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            e.preventDefault();
        });
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                const bullet = this.player.shoot(this.getMousePos(e));
                if (bullet) {
                    this.bullets.push(bullet);
                    // Add muzzle flash particles
                    const mousePos = this.getMousePos(e);
                    const direction = new Vector2D(
                        mousePos.x - this.player.position.x,
                        mousePos.y - this.player.position.y
                    ).normalize();
                    this.particleSystem.addMuzzleFlash(
                        this.player.position.x + direction.x * 20,
                        this.player.position.y + direction.y * 20,
                        '#ffffff',
                        5
                    );
                }
            }
            e.preventDefault();
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const mousePos = this.getMousePos(e);
            this.player.setAim(mousePos.x, mousePos.y);
        });
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    generateRoom() {
        // Clear previous room
        this.enemies = [];
        this.bullets = [];
        this.obstacles = [];
        this.items = [];
        
        // Generate obstacles
        this.obstacles = this.roomGenerator.generateObstacles(this.currentRoom);
        
        // Generate enemies based on room
        const enemyCount = Math.min(3 + this.currentRoom, 8);
        for (let i = 0; i < enemyCount; i++) {
            this.spawnEnemy();
        }
        
        // Add health pack in room 2
        if (this.currentRoom === 2) {
            this.items.push(new Item(
                100 + Math.random() * 600,
                100 + Math.random() * 400,
                'health'
            ));
        }
    }

    spawnEnemy() {
        let x, y;
        let attempts = 0;
        do {
            x = 50 + Math.random() * 700;
            y = 50 + Math.random() * 500;
            attempts++;
        } while (this.isPositionOccupied(x, y) && attempts < 50);
        
        if (attempts < 50) {
            const enemyType = Math.random();
            let enemy;
            
            if (enemyType < 0.33) {
                enemy = new Shooter(x, y);
            } else if (enemyType < 0.66) {
                enemy = new Exploder(x, y);
            } else {
                enemy = new Charger(x, y);
            }
            
            this.enemies.push(enemy);
        }
    }

    isPositionOccupied(x, y) {
        const minDistance = 50;
        
        // Check player distance
        if (Math.sqrt((x - this.player.position.x) ** 2 + (y - this.player.position.y) ** 2) < minDistance) {
            return true;
        }
        
        // Check obstacle distance
        for (let obstacle of this.obstacles) {
            if (Math.sqrt((x - obstacle.x - obstacle.width/2) ** 2 + (y - obstacle.y - obstacle.height/2) ** 2) < minDistance) {
                return true;
            }
        }
        
        return false;
    }

    update(currentTime) {
        if (!this.gameRunning) return;

        // Update player
        this.player.update(this.keys, this.obstacles);
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Activate enemies after 1 second delay
            if (!enemy.activated && currentTime - enemy.spawnTime > 1000) {
                enemy.activated = true;
            }
            
            if (enemy.activated) {
                const enemyBullet = enemy.update(this.player, currentTime);
                
                if (enemyBullet) {
                    this.bullets.push(new Bullet(
                        enemyBullet.position.x,
                        enemyBullet.position.y,
                        enemyBullet.velocity.x,
                        enemyBullet.velocity.y,
                        enemyBullet.damage,
                        enemyBullet.color,
                        enemyBullet.size,
                        enemyBullet.owner
                    ));
                }
            }
            
            if (enemy.health <= 0) {
                this.enemies.splice(i, 1);
                this.particleSystem.addExplosion(enemy.position.x, enemy.position.y, enemy.color, 12);
            }
        }
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();
            
            // Check bullet-enemy collisions
            if (bullet.owner === 'player') {
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    const distance = Math.sqrt(
                        (bullet.position.x - enemy.position.x) ** 2 + 
                        (bullet.position.y - enemy.position.y) ** 2
                    );
                    
                    if (distance < bullet.size + enemy.size) {
                        enemy.takeDamage(bullet.damage);
                        this.bullets.splice(i, 1);
                        this.particleSystem.addExplosion(bullet.position.x, bullet.position.y, '#ffffff', 6);
                        break;
                    }
                }
            }
            
            // Check bullet-player collisions
            if (bullet.owner === 'enemy') {
                const distance = Math.sqrt(
                    (bullet.position.x - this.player.position.x) ** 2 + 
                    (bullet.position.y - this.player.position.y) ** 2
                );
                
                if (distance < bullet.size + this.player.size) {
                    this.player.takeDamage(bullet.damage);
                    this.bullets.splice(i, 1);
                    this.particleSystem.addExplosion(bullet.position.x, bullet.position.y, '#ff0000', 8);
                    continue;
                }
            }
            
            // Remove out-of-bounds bullets
            if (bullet.position.x < 0 || bullet.position.x > 800 || 
                bullet.position.y < 0 || bullet.position.y > 600) {
                this.bullets.splice(i, 1);
            }
        }
        
        // Update particle system
        this.particleSystem.update();
        
        // Check room completion
        if (this.enemies.length === 0) {
            this.nextRoom();
        }
        
        // Check player death
        if (this.player.health <= 0) {
            this.gameOver();
        }
        
        // Check item collection
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const distance = Math.sqrt(
                (item.position.x - this.player.position.x) ** 2 + 
                (item.position.y - this.player.position.y) ** 2
            );
            
            if (distance < item.size + this.player.size) {
                if (item.type === 'health') {
                    this.player.heal(25);
                    this.particleSystem.addExplosion(item.position.x, item.position.y, '#00ff00', 10);
                }
                this.items.splice(i, 1);
            }
        }
    }

    nextRoom() {
        this.currentRoom++;
        if (this.currentRoom > 3) {
            this.currentRoom = 1;
            this.currentDungeon++;
        }
        this.generateRoom();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, 800, 600);
        
        // Boss room effect
        if (this.currentRoom === 3) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, 800, 600);
            this.particleSystem.addBossAura(400, 300);
        }
        
        // Render obstacles
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = obstacle.isDamaging ? '#ff0000' : '#444444';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Render items
        this.items.forEach(item => item.render(this.ctx));
        
        // Render player
        this.player.render(this.ctx);
        
        // Render enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Render bullets
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        
        // Render particle system
        this.particleSystem.render(this.ctx);
        
        // Render UI
        this.renderUI();
    }

    renderUI() {
        // Health bar
        const healthPercent = this.player.health / this.player.maxHealth;
        document.getElementById('healthFill').style.width = `${healthPercent * 100}%`;
        document.getElementById('healthText').textContent = `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;
        
        // Weapon info
        const weaponState = this.player.weapon.getCurrentState();
        document.getElementById('weaponName').textContent = weaponState.name;
        
        // Dungeon info
        document.getElementById('dungeonName').textContent = `Dungeon ${this.currentDungeon}`;
        document.getElementById('roomInfo').textContent = `Room ${this.currentRoom}/3`;
    }

    gameOver() {
        this.gameRunning = false;
        alert(`Game Over! You reached Dungeon ${this.currentDungeon}, Room ${this.currentRoom}`);
    }

    gameLoop() {
        if (this.gameRunning) {
            this.update(Date.now());
            this.render();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}