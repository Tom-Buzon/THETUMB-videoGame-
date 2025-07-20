class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player(400, 300);
        this.enemies = [];
        this.bullets = [];
        this.items = [];
        this.obstacles = [];
        this.currentRoom = 0;
        this.currentDungeon = 1;
        this.maxRooms = 3;
        this.gameState = 'playing';
        
        this.startTime = Date.now();
        this.combo = 0;
        this.comboTimer = 0;
        this.score = 0;
        this.lastKillTime = 0;
        
        this.audioSystem = new AudioSystem();
        this.particleSystem = new ParticleSystem();
        
        this.setupEventListeners();
        this.generateRoom();
        this.audioSystem.init();
        this.updateUI();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.player.keys[e.key.toLowerCase()] = true;
            if (e.code === 'Space' && (this.gameState === 'gameOver' || this.gameState === 'victory')) {
                this.restart();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.player.keys[e.key.toLowerCase()] = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.player.mouse.x = e.clientX - rect.left;
            this.player.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.player.mouse.pressed = true;
            this.audioSystem.resumeContext();
            this.handlePlayerShoot();
        });

        this.canvas.addEventListener('mouseup', (e) => {
            this.player.mouse.pressed = false;
        });
    }

    restart() {
        this.player = new Player(400, 300);
        this.enemies = [];
        this.bullets = [];
        this.items = [];
        this.obstacles = [];
        this.currentRoom = 0;
        this.currentDungeon = 1;
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.combo = 0;
        this.comboTimer = 0;
        this.score = 0;
        this.lastKillTime = 0;
        
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('victory').style.display = 'none';
        
        this.generateRoom();
        this.updateUI();
    }

    generateRoom() {
        this.enemies = [];
        this.items = [];
        this.obstacles = [];
        
        // Generate obstacles
        for (let i = 0; i < 3 + this.currentDungeon; i++) {
            this.obstacles.push(new Obstacle(
                Math.random() * 600 + 100,
                Math.random() * 400 + 100,
                30 + Math.random() * 50,
                30 + Math.random() * 50
            ));
        }

        // Generate enemies
        const enemyCount = 2 + this.currentDungeon + Math.floor(this.currentRoom / 2);
        
        for (let i = 0; i < enemyCount; i++) {
            let x, y;
            do {
                x = Math.random() * 700 + 50;
                y = Math.random() * 500 + 50;
            } while (this.isPositionOccupied(x, y));

            const enemyType = this.getRandomEnemyType();
            let enemy;
            
            switch (enemyType) {
                case 'swarmer':
                    enemy = new Swarmer(x, y);
                    break;
                case 'exploder':
                    enemy = new Exploder(x, y);
                    break;
                case 'shooter':
                    enemy = new Shooter(x, y);
                    break;
                case 'charger':
                    enemy = new Charger(x, y);
                    break;
                case 'sniper':
                    enemy = new Sniper(x, y);
                    break;
            }
            
            if (enemy) {
                enemy.activated = true;
                this.enemies.push(enemy);
            }
        }

        // Boss room
        if (this.currentRoom === this.maxRooms - 1) {
            this.enemies = [new Boss(400, 300)];
            this.enemies[0].activated = true;
        }

        // Generate items
        if (Math.random() < 0.3) {
            this.items.push(new Item(
                Math.random() * 700 + 50,
                Math.random() * 500 + 50,
                'health'
            ));
        }

        // Play room change sound
        this.audioSystem.playSound('roomChange');
    }

    getRandomEnemyType() {
        const types = ['swarmer', 'exploder', 'shooter'];
        if (this.currentDungeon >= 2) types.push('charger');
        if (this.currentDungeon >= 3) types.push('sniper');
        return types[Math.floor(Math.random() * types.length)];
    }

    isPositionOccupied(x, y) {
        const minDistance = 100;
        return this.obstacles.some(obs => 
            Math.sqrt((obs.x - x) ** 2 + (obs.y - y) ** 2) < minDistance
        );
    }

    handlePlayerShoot() {
        const playerBullet = this.player.shoot();
        if (playerBullet) {
            this.bullets.push(playerBullet);
            
            // Play correct weapon sound
            const weaponState = this.player.weapon.currentState;
            switch (weaponState) {
                case 'AUTO':
                    this.audioSystem.playSound('auto');
                    break;
                case 'SEMI':
                    this.audioSystem.playSound('semi');
                    break;
                case 'SINGLE':
                    this.audioSystem.playSound('single');
                    break;
                case 'BURST':
                    this.audioSystem.playSound('semi');
                    break;
            }
        }
    }

    update() {
        if (this.gameState !== 'playing') return;

        // Update combo timer
        if (this.combo > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.combo = 0;
                this.hideComboDisplay();
            }
        }

        this.player.update();
        
        // Update enemies and collect their bullets
        this.enemies.forEach((enemy, index) => {
            if (enemy.health <= 0) {
                this.particleSystem.addExplosion(
                    enemy.position.x,
                    enemy.position.y,
                    enemy.color,
                    8
                );
                
                if (enemy instanceof Exploder) {
                    this.audioSystem.playSound('explosion');
                }
                
                this.updateCombo();
                this.score += 100 * this.combo;
                this.enemies.splice(index, 1);
                return;
            }

            let enemyBullets = null;
            
            if (enemy instanceof Boss) {
                enemyBullets = enemy.update(this.player);
                if (enemy.minions) {
                    enemy.minions.forEach(minion => {
                        if (minion.shoot) {
                            const minionBullets = minion.shoot(this.player);
                            if (minionBullets && Array.isArray(minionBullets)) {
                                this.bullets.push(...minionBullets);
                            }
                        }
                    });
                }
            } else {
                enemyBullets = enemy.update(this.player);
            }
            
            if (enemyBullets && Array.isArray(enemyBullets)) {
                this.bullets.push(...enemyBullets);
            }
        });
        
        this.bullets.forEach(bullet => bullet.update());
        
        if (this.player.mouse.pressed && this.player.weapon.currentState === 'AUTO') {
            this.handlePlayerShoot();
        }

        // Check for weapon state change
        const previousWeaponState = this.player.weapon.currentState;
        this.player.weapon.updateState(this.player.health, this.player.maxHealth);
        const newWeaponState = this.player.weapon.currentState;
        
        if (previousWeaponState !== newWeaponState) {
            this.showWeaponChange(newWeaponState);
        }

        this.handleCollisions();

        if (this.enemies.length === 0) {
            this.nextRoom();
        }

        this.particleSystem.update();
        this.updateUI();
    }

    showWeaponChange(weaponState) {
        const weaponDiv = document.getElementById('weaponChange');
        const weaponNames = {
            'AUTO': 'AUTO RIFLE',
            'BURST': 'BURST RIFLE',
            'SEMI': 'SEMI-AUTO',
            'SINGLE': 'SINGLE SHOT'
        };
        
        weaponDiv.textContent = weaponNames[weaponState];
        weaponDiv.style.display = 'block';
        weaponDiv.classList.add('weapon-change-animation');
        
        setTimeout(() => {
            weaponDiv.style.display = 'none';
            weaponDiv.classList.remove('weapon-change-animation');
        }, 2000);
    }

    handleCollisions() {
        // Player bullets vs enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (bullet.type === 'player') {
                let hitObstacle = false;
                for (const obstacle of this.obstacles) {
                    if (obstacle.checkCollision(bullet)) {
                        this.bullets.splice(i, 1);
                        hitObstacle = true;
                        break;
                    }
                }
                
                if (!hitObstacle) {
                    for (let j = this.enemies.length - 1; j >= 0; j--) {
                        const enemy = this.enemies[j];
                        if (this.checkCollision(bullet, enemy)) {
                            enemy.takeDamage(bullet.damage);
                            this.bullets.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }

        // Enemy bullets vs player
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (bullet.type === 'enemy') {
                let hitObstacle = false;
                for (const obstacle of this.obstacles) {
                    if (obstacle.checkCollision(bullet)) {
                        this.bullets.splice(i, 1);
                        hitObstacle = true;
                        break;
                    }
                }
                
                if (!hitObstacle && this.checkCollision(bullet, this.player)) {
                    this.player.takeDamage(bullet.damage);
                    this.bullets.splice(i, 1);
                    
                    this.combo = 0;
                    this.comboTimer = 0;
                    this.hideComboDisplay();
                    
                    if (this.player.health <= 0) {
                        this.gameState = 'gameOver';
                        document.getElementById('gameOver').style.display = 'flex';
                        document.getElementById('finalScore').textContent = this.score;
                    }
                }
            }
        }

        // Player vs obstacles
        for (const obstacle of this.obstacles) {
            obstacle.resolveCollision(this.player);
        }

        // Enemies vs obstacles
        for (const enemy of this.enemies) {
            for (const obstacle of this.obstacles) {
                obstacle.resolveCollision(enemy);
            }
        }

        // Player vs items
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            if (this.checkCollision(this.player, item)) {
                if (item.type === 'health') {
                    this.player.heal(25);
                }
                this.items.splice(i, 1);
            }
        }

        // Remove off-screen bullets
        this.bullets = this.bullets.filter(bullet => 
            bullet.position.x > 0 && bullet.position.x < 800 &&
            bullet.position.y > 0 && bullet.position.y < 600
        );
    }

    updateCombo() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastKillTime < 2000) {
            this.combo = Math.min(this.combo + 1, 50);
        } else {
            this.combo = 1;
        }
        
        this.lastKillTime = currentTime;
        this.comboTimer = 120;
        
        this.showComboDisplay();
    }

    showComboDisplay() {
        const comboDiv = document.getElementById('combo');
        if (this.combo > 1) {
            comboDiv.textContent = `${this.combo}x KILL`;
            comboDiv.style.display = 'block';
            
            setTimeout(() => {
                comboDiv.style.display = 'none';
            }, 1000);
        }
    }

    hideComboDisplay() {
        document.getElementById('combo').style.display = 'none';
    }

    checkCollision(obj1, obj2) {
        const distance = Math.sqrt(
            (obj1.position.x - obj2.position.x) ** 2 +
            (obj1.position.y - obj2.position.y) ** 2
        );
        return distance < (obj1.size || obj1.radius || 10) + (obj2.size || obj2.radius || 10);
    }

    nextRoom() {
        this.currentRoom++;
        if (this.currentRoom >= this.maxRooms) {
            this.currentRoom = 0;
            this.currentDungeon++;
            
            if (this.currentDungeon > 4) {
                this.gameState = 'victory';
                document.getElementById('victory').style.display = 'flex';
                document.getElementById('victoryScore').textContent = this.score;
                return;
            }
        }
        
        this.generateRoom();
    }

    updateUI() {
        document.getElementById('scoreDisplay').textContent = `SCORE: ${this.score}`;
        
        const healthRatio = this.player.health / this.player.maxHealth;
        document.getElementById('healthFill').style.width = `${healthRatio * 100}%`;
        document.getElementById('healthText').textContent = `${this.player.health}/${this.player.maxHealth}`;
        
        document.getElementById('weaponName').textContent = this.player.weapon.getName().toUpperCase();
        document.getElementById('damage').textContent = `DMG: ${this.player.weapon.getDamage()}`;
        document.getElementById('fireRate').textContent = `RATE: ${this.player.weapon.getFireRate()}ms`;
        
        document.getElementById('dungeonName').textContent = `DUNGEON ${this.currentDungeon}`;
        document.getElementById('roomInfo').textContent = `ROOM ${this.currentRoom + 1}/${this.maxRooms}`;
        document.getElementById('enemiesLeft').textContent = `ENEMIES: ${this.enemies.length}`;
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${minutes}:${seconds}`;
    }

    render() {
        this.ctx.clearRect(0, 0, 800, 600);
        
        this.ctx.fillStyle = '#0a0000';
        this.ctx.fillRect(0, 0, 800, 600);
        
        this.obstacles.forEach(obstacle => obstacle.render(this.ctx));
        this.items.forEach(item => item.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        this.enemies.forEach(enemy => {
            if (enemy instanceof Boss && enemy.minions) {
                enemy.minions.forEach(minion => minion.render(this.ctx));
            }
        });
        
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.player.render(this.ctx);
        this.particleSystem.render(this.ctx);
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}