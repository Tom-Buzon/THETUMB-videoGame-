import { PLAYER_CONFIG, ROOM_CONFIG, ENEMY_CONFIG } from './config.js';
import { Player } from './player.js';
import { DoomUI } from './ui.js';
import { ItemManager } from './items/ItemManager.js';
import { RoomGenerator } from './room.js';
import { ParticleSystem } from './particles.js';
import { DeathAnimationSystem } from './DeathAnimationSystem.js';

export class Game {
    constructor() {
        try {
            // Game constructor starting...
            
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }
            
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Could not get 2D context');
            }
            
            // Use fixed canvas dimensions as requested
            this.canvas.width = ROOM_CONFIG.CANVAS_WIDTH;
            this.canvas.height = ROOM_CONFIG.CANVAS_HEIGHT - 60; // Subtract HUD height
            
            // Initialize scaling factors
            this.scaleX = 1;
            this.scaleY = 1;
            
            // Canvas initialized successfully
            
            // Initialize player at the center of the canvas
            this.player = new Player(this.canvas.width / 2, this.canvas.height / 2, this);
            // Player created
            
            // Initialize game state
            this._isGameOver = false;
            // Game state initialized. Game over state: this._isGameOver
            
            // Calculate initial scaling factors
            this.calculateScaling();
            
            // Initialize UI
            this.ui = new DoomUI(this.canvas, this.ctx);
            this.ui.setGame(this);
            // Reset UI state to ensure clean start
            if (this.ui.reset) {
                this.ui.reset();
            }
            // UI created
            
            // Initialize ItemManager
            this.itemManager = new ItemManager(this);
            // ItemManager created
            
            // Progressive dungeon system
            this.currentDungeon = 1;
            this.currentRoom = 1;
            this.maxDungeons = ROOM_CONFIG.MAX_DUNGEONS;
            this.maxRooms = ROOM_CONFIG.MAX_ROOMS;
            this.roomGenerator = new RoomGenerator(this.canvas.width, this.canvas.height);
            
            this.enemies = [];
            this.bullets = [];
            this.obstacles = [];
            this.particleSystem = new ParticleSystem();
            this.deathAnimationSystem = new DeathAnimationSystem();
            this.gameTime = 0;
            this.nebulaOffset = 0;
            this.scanlineOffset = 0;
            this.crtGlow = 0;
            this.dynamicLighting = [];
            this.backgroundStars = [];
            this.glitchEffect = 0;
            
            // Game properties initialized
            
            // Initialize timeouts set for tracking
            this.timeouts = new Set();
            
            this.initializeBackground();
            // Background initialized
            
            this.loadRoom();
            // First room loaded
            
            this.keys = {};
            this.setupEventListeners();
            // Event listeners set up
            
            // Game constructor completed successfully
            
        } catch (error) {
            console.error('Error in Game constructor:', error);
            throw error;
        }
    }

    initializeBackground() {
        // Create background stars
        // Using canvas width/height to determine star count for scalability
        const starCount = Math.floor(this.canvas.width * this.canvas.height / 13000);
        for (let i = 0; i < starCount; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
        
        // Create dynamic lighting sources
        // Using a fixed count for now, could be made configurable
        const lightingCount = 5;
        for (let i = 0; i < lightingCount; i++) {
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
    
    calculateScaling() {
        // Get the game container element
        const container = document.getElementById('gameContainer');
        if (!container) return;
        
        // Get the actual display size of the container
        const containerRect = container.getBoundingClientRect();
        
        // Calculate scaling factors based on CSS transform
        // This is a simplified approach - in a real implementation, you might need
        // to parse the actual CSS transform matrix
        const scaleX = containerRect.width / ROOM_CONFIG.CANVAS_WIDTH;
        const scaleY = containerRect.height / (ROOM_CONFIG.CANVAS_HEIGHT - 60);
        
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        
        // Scaling factors: this.scaleX x this.scaleY
    }
    
    // Convert screen coordinates to game coordinates accounting for scaling and positioning
    screenToGameCoords(screenX, screenY) {
        // Get the canvas bounding rectangle
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate the offset caused by CSS transforms
        // We need to account for both scaling and positioning
        const offsetX = rect.left;
        const offsetY = rect.top;
        
        // Convert screen coordinates to canvas coordinates
        let canvasX = screenX - offsetX;
        let canvasY = screenY - offsetY;
        
        // If we have scaling information from the main.js, use it
        if (this.scaleFactor) {
            // Adjust for scaling
            canvasX = canvasX / this.scaleFactor;
            canvasY = canvasY / this.scaleFactor;
        }
        
        return { x: canvasX, y: canvasY };
    }

    loadRoom() {
        // Loading Dungeon this.currentDungeon, Room this.currentRoom
        
        // Clear existing entities
        this.enemies = [];
        this.obstacles = [];
        this.bullets = [];
        
        // Generate room content using RoomGenerator
        this.enemies = this.roomGenerator.generateEnemies(this.currentDungeon, this.currentRoom);
        this.obstacles = this.roomGenerator.generateObstacles(this.currentDungeon, this.currentRoom);
        
        // DIAGNOSTIC: Check obstacle types
        // Obstacles loaded: this.obstacles
        // First obstacle type: this.obstacles.length > 0 ? typeof this.obstacles[0].update : 'No obstacles'
        // First obstacle constructor: this.obstacles.length > 0 ? this.obstacles[0].constructor.name : 'No obstacles'
        
        // Update boundary colors for boss rooms
        const boundaryColor = this.currentRoom === 3 ? '#ff0000' : '#00ff00';
        this.updateBoundaryColors(boundaryColor);
        
        // Generate items using ItemManager
        this.roomGenerator.generateItems(this.itemManager);
        
        // Play room transition sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound('roomChange');
        }
        
        // Show room change message
        if (this.ui) {
            this.ui.showRoomChangeMessage(this.currentDungeon, this.currentRoom);
        }
        
        // Room loaded: this.enemies.length enemies, this.obstacles.length obstacles
    }

    updateBoundaryColors(color) {
        // Update boundary colors for visual feedback
        if (window.boundaries) {
            window.boundaries.forEach(boundary => {
                boundary.color = color;
            });
        }
    }

    checkRoomCompletion() {
        // Check if all enemies are defeated
        if (this.enemies.length === 0) {
            // Room this.currentRoom of Dungeon this.currentDungeon completed!
            
            // Progress to next room or dungeon
            if (this.currentRoom < this.maxRooms) {
                // Next room in same dungeon
                this.currentRoom++;
            } else if (this.currentDungeon < this.maxDungeons) {
                // Next dungeon, reset to room 1
                this.currentDungeon++;
                this.currentRoom = 1;
            } else {
                // Game completed
                // All dungeons completed! Victory!
                return true;
            }
            
            // Load the new room
            this.loadRoom();
            return true;
        }
        return false;
    }

    setupEventListeners() {
        // Store references to event listener functions so we can remove them later
        this.keydownHandler = (e) => {
            this.keys[e.code] = true;
        };
        
        this.keyupHandler = (e) => {
            this.keys[e.code] = false;
        };
        
        this.mousemoveHandler = (e) => {
            const gameCoords = this.screenToGameCoords(e.clientX, e.clientY);
            this.player.setTarget(gameCoords.x, gameCoords.y);
        };
        
        this.mousedownHandler = (e) => {
            if (e.button === 0) { // Left mouse button
                this.player.startShooting();
            }
        };
        
        this.mouseupHandler = (e) => {
            if (e.button === 0) { // Left mouse button
                this.player.stopShooting();
            }
        };
        
        this.mouseleaveHandler = () => {
            this.player.stopShooting();
        };
        
        this.contextmenuHandler = (e) => {
            e.preventDefault(); // Prevent context menu from appearing
            
            // Check if player has bazooka active
            if (this.player.weaponMode === 'BAZOOKA') {
                // Shoot backward or dash forward
                const gameCoords = this.screenToGameCoords(e.clientX, e.clientY);
                const mouseX = gameCoords.x;
                const mouseY = gameCoords.y;
                
                // For now, let's implement the dash forward functionality
                this.player.dashForward();
            }
        };
        
        this.clickHandler = (e) => {
            this.handleCanvasClick(e);
        };
        
        // Add event listeners
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        this.canvas.addEventListener('mousemove', this.mousemoveHandler);
        this.canvas.addEventListener('mousedown', this.mousedownHandler);
        this.canvas.addEventListener('mouseup', this.mouseupHandler);
        this.canvas.addEventListener('mouseleave', this.mouseleaveHandler);
        this.canvas.addEventListener('contextmenu', this.contextmenuHandler);
        this.canvas.addEventListener('click', this.clickHandler);
    }
    
    // Method to remove event listeners
    removeEventListeners() {
        if (this.canvas) {
            // Remove event listeners
            document.removeEventListener('keydown', this.keydownHandler);
            document.removeEventListener('keyup', this.keyupHandler);
            this.canvas.removeEventListener('mousemove', this.mousemoveHandler);
            this.canvas.removeEventListener('mousedown', this.mousedownHandler);
            this.canvas.removeEventListener('mouseup', this.mouseupHandler);
            this.canvas.removeEventListener('mouseleave', this.mouseleaveHandler);
            this.canvas.removeEventListener('contextmenu', this.contextmenuHandler);
            this.canvas.removeEventListener('click', this.clickHandler);
        }
    }
    
    handleCanvasClick(e) {
        // Handle canvas click events
        // Handle canvas click events
        if (this.isGameOver && this.ui && this.ui.showGameOver) {
            const gameCoords = this.screenToGameCoords(e.clientX, e.clientY);
            const clickX = gameCoords.x;
            const clickY = gameCoords.y;
            
            // Check if click is on restart button
            if (this.ui.isClickOnRestartButton(clickX, clickY)) {
                // Restart the game
                if (window.restartGame) {
                    window.restartGame();
                }
            }
        }
    }

    update() {
        this.gameTime++;
        this.nebulaOffset += 0.2;
        this.scanlineOffset += 0.5;
        this.crtGlow = 0.5 + Math.sin(this.gameTime * 0.01) * 0.3;
        
        // Log entity counts periodically for performance monitoring
        if (this.gameTime % 60 === 0) { // Every 60 frames (about 1 second at 60 FPS)
            console.log(`Entities - Enemies: ${this.enemies.length}, Bullets: ${this.bullets.length}, Obstacles: ${this.obstacles.length}`);
        }
        
        // Update UI
        if (this.ui) {
            this.ui.update(16); // Assuming 60 FPS, 16ms per frame
        }
        
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
        
        // Update death animations
        this.deathAnimationSystem.update();
        
        // Update enemies
        // Filter enemies: keep alive enemies and enemies whose death animations are not complete
        this.enemies = this.enemies.filter(enemy => {
            // Only update enemies that are not in the process of dying
            if (!this.deathAnimationSystem.isDying(enemy)) {
                const bullets = enemy.update(this.player, Date.now());
                if (bullets && Array.isArray(bullets)) {
                    this.bullets.push(...bullets);  // spread: ajoute chaque bullet individuellement
                } else if (bullets) {
                    this.bullets.push(bullets);     // au cas où un seul bullet est retourné (autres ennemis)
                }
                
                // Activate enemies near player
                const distance = Math.sqrt(
                    (enemy.position.x - this.player.position.x) ** 2 +
                    (enemy.position.y - this.player.position.y) ** 2
                );
                // Activate enemies within a certain range of the player
                const ENEMY_ACTIVATION_RANGE = 1000;
                if (distance < ENEMY_ACTIVATION_RANGE) {
                    enemy.activated = true;
                }
            }
            
            // Keep enemy if it's still alive or if its death animation is not complete
            if (enemy.health <= 0) {
                // Enemy is dead, keep it only if its death animation is not complete
                const keepEnemy = !this.deathAnimationSystem.isAnimationComplete(enemy);
                if (!keepEnemy) {
                    // Clean up completed animation tracking
                    this.deathAnimationSystem.cleanupCompletedAnimation(enemy);
                }
                return keepEnemy;
            }
            // Enemy is still alive, keep it
            return true;
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
            
            // Check collision with healer protection fields
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                // Check if this enemy is a healer with an active protection field
                if (enemy.constructor.name === 'Healer' && enemy.protectedEnemy && !enemy.isDying) {
                    // Calculate distance between bullet and protected enemy
                    const dx = bullet.position.x - enemy.protectedEnemy.position.x;
                    const dy = bullet.position.y - enemy.protectedEnemy.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Check if bullet is within the protection field
                    if (distance < enemy.protectionRadius) {
                        // Bullet is blocked by protection field, destroy it
                        bullet.addImpactSparks(bullet.position.x, bullet.position.y);
                        return false;
                    }
                }
            }
            
            // Check collision with enemies
            if (bullet.source === 'player' || bullet.source === 'companion') {
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.enemies[i];
                    if (bullet.checkCollision(enemy)) {
                        enemy.takeDamage(bullet.damage);
                        bullet.addImpactSparks(bullet.position.x, bullet.position.y);
                        
                        // Add score for killing enemy when health reaches zero
                        if (enemy.health <= 0 && this.ui) {
                            // Different enemies could have different point values
                            let points = 100;
                            if (enemy.constructor.name === 'Boss') {
                                points = 1000;
                            } else if (enemy.constructor.name === 'Exploder') {
                                points = 150;
                            } else if (enemy.constructor.name === 'Shooter') {
                                points = 120;
                            } else if (enemy.constructor.name === 'Charger') {
                                points = 80;
                            } else if (enemy.constructor.name === 'Swarmer') {
                                points = 50;
                            } else if (enemy.constructor.name === 'Healer') {
                                points = 200;
                            } else if (enemy.constructor.name === 'Sniper') {
                                points = 180;
                            }
                            this.ui.addScore(points);
                        }
                        
                        // Don't remove enemy immediately - let the enemy filtering logic handle it
                        // after the death animation completes
                        return false;
                    }
                }
            } else {
                // Check collision with healer protection fields for enemy bullets
                let blockedByProtectionField = false;
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.enemies[i];
                    // Check if this enemy is a healer with an active protection field
                    if (enemy.constructor.name === 'Healer' && enemy.protectedEnemy && !enemy.isDying) {
                        // Check if the protected enemy is the player
                        // Note: In the current implementation, the healer protects other enemies, not the player
                        // But we'll keep this check in case of future modifications
                        // For now, we're just checking if the bullet hits any protection field
                        
                        // Calculate distance between bullet and protected enemy
                        const dx = bullet.position.x - enemy.protectedEnemy.position.x;
                        const dy = bullet.position.y - enemy.protectedEnemy.position.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // Check if bullet is within the protection field
                        if (distance < enemy.protectionRadius) {
                            // Bullet is blocked by protection field, destroy it
                            bullet.addImpactSparks(bullet.position.x, bullet.position.y);
                            blockedByProtectionField = true;
                            break;
                        }
                    }
                }
                
                if (blockedByProtectionField) {
                    return false;
                }
                
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
        
        // Check for room completion
        this.checkRoomCompletion();
        
        // Update items
        this.itemManager.update();
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
        this.enemies.forEach(enemy => {
            if (this.deathAnimationSystem.isDying(enemy)) {
                // Render death animation
                this.deathAnimationSystem.renderDeathAnimation(enemy, this.ctx);
            } else {
                // Render normal enemy
                enemy.render(this.ctx);
            }
        });
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.player.render(this.ctx);
        this.particleSystem.render(this.ctx);
        
        // **GLITCH EFFECT**
        if (Math.random() < 0.001) {
            this.renderGlitch();
        }
        
        // Render items
        this.itemManager.draw(this.ctx);
        
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
        // Use the DoomUI to render the interface
        if (this.ui) {
            this.ui.draw();
            
            // Draw game over screen if game is over
            if (this.isGameOver && this.ui.showGameOver) {
                this.ui.drawGameOver();
            }
        }
    }

    gameOver() {
        // Game over logic
        this.isGameOver = true;
        
        // Display game over screen through UI
        if (this.ui) {
            this.ui.showGameOver = true;
        }
    }

    gameLoop() {
        // Add performance monitoring
        const frameStart = performance.now();
        
        if (!this.isGameOver) {
            this.update();
        }
        this.render();
        
        const frameEnd = performance.now();
        const frameTime = frameEnd - frameStart;
        
        // Log frame time if it's too slow (over 33ms = 30 FPS)
        if (frameTime > 33) {
            console.warn(`Slow frame: ${frameTime.toFixed(2)}ms`);
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
    
    // Helper method to manage timeouts
    setTimeout(callback, delay) {
        const timeoutId = setTimeout(() => {
            // Remove the timeout from the set when it completes
            this.timeouts.delete(timeoutId);
            callback();
        }, delay);
        
        // Add the timeout to the set
        this.timeouts.add(timeoutId);
        return timeoutId;
    }
    
    // Getter and setter for isGameOver property
    get isGameOver() {
        //console.log('Getting game over state:', this._isGameOver);
        return this._isGameOver;
    }
    
    set isGameOver(value) {
        //console.log('Setting game over state to:', value);
        if (value === true) {
            //console.trace('Game over state being set to true');
        }
        this._isGameOver = value;
    }
}