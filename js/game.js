class Game {
    constructor() {
        try {
            console.log('Game constructor starting...');
            
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Could not get 2D context');
            }
            
            this.canvas.width = 800;
            this.canvas.height = 600;
            
            console.log('Canvas initialized successfully');
            
            this.player = new Player(400, 300);
            console.log('Player created');
            
            this.enemies = [];
            this.bullets = [];
            this.obstacles = [];
            this.particleSystem = new ParticleSystem();
            this.gameTime = 0;
            this.nebulaOffset = 0;
            this.scanlineOffset = 0;
            this.crtGlow = 0;
            this.dynamicLighting = [];
            this.backgroundStars = [];
            this.glitchEffect = 0;
            
            console.log('Game properties initialized');
            
            this.initializeBackground();
            console.log('Background initialized');
            
            this.spawnEnemies();
            console.log('Enemies spawned');
            
            this.spawnObstacles();
            console.log('Obstacles spawned');
            
            this.keys = {};
            this.setupEventListeners();
            console.log('Event listeners set up');
            
            console.log('Game constructor completed successfully');
            
        } catch (error) {
            console.error('Error in Game constructor:', error);
            throw error;
        }
    }

    initializeBackground() {
        // Create background stars
        for (let i = 0; i < 150; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
        
        // Create dynamic lighting sources
        for (let i = 0; i < 5; i++) {
            this.dynamicLighting.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 50 + Math.random() * 100,
                color: this.getRandomSpaceColor(),
                intensity: Math.random() * 0.3 + 0.2,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    getRandomSpaceColor() {
        const colors = ['#ff0044', '#4400ff', '#00ff44', '#ff4400', '#440044'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    spawnEnemies() {
        const enemyTypes = [Swarmer, Charger, Shooter, Sniper, Healer, Exploder];
        for (let i = 0; i < 15; i++) {
            const EnemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const x = Math.random() * (this.canvas.width - 100) + 50;
            const y = Math.random() * (this.canvas.height - 100) + 50;
            this.enemies.push(new EnemyType(x, y));
        }
    }

    spawnObstacles() {
        // Add some hazardous obstacles
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * (this.canvas.width - 60) + 30;
            const y = Math.random() * (this.canvas.height - 60) + 30;
            const width = 20 + Math.random() * 40;
            const height = 20 + Math.random() * 40;
            this.obstacles.push(new Obstacle(x, y, width, height, Math.random() > 0.5));
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            this.player.setTarget(mouseX, mouseY);
        });
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const bullet = this.player.shoot(mouseX, mouseY);
            if (bullet) {
                this.bullets.push(bullet);
            }
        });
    }

    update() {
        this.gameTime++;
        this.nebulaOffset += 0.2;
        this.scanlineOffset += 0.5;
        this.crtGlow = 0.5 + Math.sin(this.gameTime * 0.01) * 0.3;
        
        // Update background stars
        this.backgroundStars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });
        
        // Update dynamic lighting
        this.dynamicLighting.forEach(light => {
            light.phase += 0.02;
            light.intensity = 0.2 + Math.sin(light.phase) * 0.1;
        });
        
        // Update player
        this.player.update(this.keys);
        
        // Update weapon state based on player health
        this.player.weapon.updateState(this.player.health, this.player.maxHealth);
        
        // Update enemies
        this.enemies.forEach(enemy => {
            const bullet = enemy.update(this.player, Date.now());
            if (bullet) {
                this.bullets.push(bullet);
            }
            
            // Activate enemies near player
            const distance = Math.sqrt(
                (enemy.position.x - this.player.position.x) ** 2 +
                (enemy.position.y - this.player.position.y) ** 2
            );
            if (distance < 200) {
                enemy.activated = true;
            }
        });
        
        // Update obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.update(this.player);
            obstacle.resolveCollision(this.player);
        });
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            const expired = bullet.update();
            if (expired) return false;
            
            // Check collision with enemies
            if (bullet.source === 'player') {
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.enemies[i];
                    if (bullet.checkCollision(enemy)) {
                        enemy.takeDamage(bullet.damage);
                        bullet.addImpactSparks(bullet.position.x, bullet.position.y);
                        
                        if (enemy.health <= 0 || (enemy.isDying && enemy.deathAnimation >= 1)) {
                            this.enemies.splice(i, 1);
                        }
                        return false;
                    }
                }
            } else {
                // Enemy bullets hitting player
                if (bullet.checkCollision(this.player)) {
                    this.player.takeDamage(bullet.damage, bullet.source);
                    bullet.addImpactSparks(bullet.position.x, bullet.position.y);
                    return false;
                }
            }
            
            // Check collision with obstacles
            for (const obstacle of this.obstacles) {
                if (obstacle.checkCollision(bullet)) {
                    bullet.addImpactSparks(bullet.position.x, bullet.position.y);
                    return false;
                }
            }
            
            return true;
        });
        
        // Update particle system
        this.particleSystem.update();
        
        // Check for game over
        if (this.player.health <= 0) {
            this.gameOver();
        }
    }

    render() {
        // **SPACE DOOM BACKGROUND**
        this.renderBackground();
        
        // **DYNAMIC LIGHTING**
        this.renderDynamicLighting();
        
        // **BACKGROUND STARS**
        this.renderStars();
        
        // **SCANLINE OVERLAY**
        this.renderScanlines();
        
        // **CRT MONITOR GLOW**
        this.renderCRTGlow();
        
        // Render game objects
        this.obstacles.forEach(obstacle => obstacle.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.player.render(this.ctx);
        this.particleSystem.render(this.ctx);
        
        // **GLITCH EFFECT**
        if (Math.random() < 0.001) {
            this.renderGlitch();
        }
        
        // Render UI
        this.renderUI();
    }

    renderBackground() {
        // Deep space nebula background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
        );
        
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.3, '#1a0a1a');
        gradient.addColorStop(0.6, '#0a1a2a');
        gradient.addColorStop(1, '#000000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Nebula clouds
        for (let i = 0; i < 5; i++) {
            const x = (this.nebulaOffset + i * 200) % (this.canvas.width + 100) - 50;
            const y = 100 + i * 80;
            const radius = 150 + Math.sin(this.nebulaOffset * 0.01 + i) * 50;
            
            const nebulaGradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            nebulaGradient.addColorStop(0, `rgba(${50 + i * 30}, 0, ${100 + i * 20}, 0.1)`);
            nebulaGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = nebulaGradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    renderStars() {
        this.backgroundStars.forEach(star => {
            const alpha = star.brightness * (0.5 + Math.sin(this.gameTime * 0.02 + star.x) * 0.5);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Star glow
            this.ctx.shadowColor = '#ffffff';
            this.ctx.shadowBlur = star.size * 2;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }

    renderDynamicLighting() {
        this.dynamicLighting.forEach(light => {
            const gradient = this.ctx.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y, light.radius
            );
            
            gradient.addColorStop(0, `${light.color}${Math.floor(light.intensity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        });
    }

    renderScanlines() {
        this.ctx.fillStyle = `rgba(0, 255, 255, 0.03)`;
        for (let y = 0; y < this.canvas.height; y += 2) {
            const alpha = 0.02 + Math.sin(this.scanlineOffset + y * 0.1) * 0.01;
            this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            this.ctx.fillRect(0, y, this.canvas.width, 1);
        }
    }

    renderCRTGlow() {
        // CRT monitor glow effect
        const glowGradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        
        glowGradient.addColorStop(0, `rgba(0, 255, 255, ${this.crtGlow * 0.05})`);
        glowGradient.addColorStop(0.7, `rgba(255, 0, 255, ${this.crtGlow * 0.02})`);
        glowGradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Screen vignette
        const vignette = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.3,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.5
        );
        
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        
        this.ctx.fillStyle = vignette;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderGlitch() {
        // Random glitch effect
        const glitchHeight = 20 + Math.random() * 30;
        const glitchY = Math.random() * (this.canvas.height - glitchHeight);
        
        // Create glitch line
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(0, glitchY, this.canvas.width, glitchHeight);
        
        // Add color separation
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
        this.ctx.fillRect(2, glitchY, this.canvas.width, glitchHeight);
        this.ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
        this.ctx.fillRect(-2, glitchY, this.canvas.width, glitchHeight);
        this.ctx.globalCompositeOperation = 'source-over';
    }

    renderUI() {
        // Health bar
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(10, 10, 200, 20);
        
        this.ctx.fillStyle = '#00ff00';
        console.log(`Health bar rendering: ${this.player.health}/${this.player.maxHealth} = ${(this.player.health / this.player.maxHealth) * 100}%`);
        this.ctx.fillRect(10, 10, 200 * (this.player.health / this.player.maxHealth), 20);
        
        // Health text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`HEALTH: ${this.player.health}/${this.player.maxHealth}`, 15, 25);
        
        // Score
        this.ctx.fillText(`SCORE: ${this.player.score}`, 15, 45);
        
        // Enemy count
        this.ctx.fillText(`ENEMIES: ${this.enemies.length}`, 15, 65);
        
        // Game over screen
        if (this.player.health <= 0) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '48px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.font = '24px monospace';
            this.ctx.fillText('Press F5 to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }

    gameOver() {
        // Game over logic
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}