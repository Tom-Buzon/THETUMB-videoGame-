// Import configuration
import { PLAYER_CONFIG } from './config.js';
import { Vector2D } from './vector2d.js';
import { Weapon } from './weapon.js';
import { Bullet } from './bullet.js';

export class Player {
    constructor(x, y, game) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = PLAYER_CONFIG.SIZE;
        this.health = PLAYER_CONFIG.INITIAL_HEALTH;
        this.maxHealth = PLAYER_CONFIG.MAX_HEALTH;
        console.log(`Player initialized with health: ${this.health}/${this.maxHealth}`);
        this.speed = PLAYER_CONFIG.SPEED;
        this.color = PLAYER_CONFIG.COLOR;
        this.score = 0;
        this.game = game; // Add game reference
        
        // Item effect properties
        this.shield = 0;
        this.invincible = false;
        this.ghost = false;
        this.weaponMode = 'NORMAL'; // NORMAL, BAZOOKA, RICOCHET
        
        // Companions
        this.companions = [];
        this.companionAngle = 0; // For orbiting animation
        
        // Item effect timers and cooldowns
        this.itemEffects = {
            shield: { active: false, duration: 0, maxDuration: PLAYER_CONFIG.ITEM_EFFECTS.SHIELD.DURATION }, // 10 seconds
            ghost: { active: false, duration: 0, maxDuration: PLAYER_CONFIG.ITEM_EFFECTS.GHOST.DURATION }, // 5 seconds
            bazooka: { active: false, duration: 0, maxDuration: PLAYER_CONFIG.ITEM_EFFECTS.BAZOOKA.DURATION }, // 15 seconds
            ricochet: { active: false, duration: 0, maxDuration: PLAYER_CONFIG.ITEM_EFFECTS.RICOCHET.DURATION }, // 15 seconds
            valkyrie: { active: false, duration: 0, maxDuration: PLAYER_CONFIG.ITEM_EFFECTS.VALKYRIE.DURATION }, // 8 seconds
            timeBubble: { active: false, duration: 0, maxDuration: PLAYER_CONFIG.ITEM_EFFECTS.TIME_BUBBLE.DURATION }, // 5 seconds
            blackHole: { active: false, duration: 0, maxDuration: PLAYER_CONFIG.ITEM_EFFECTS.BLACK_HOLE.DURATION }, // 10 seconds
            companion: { active: false, duration: 0, maxDuration: PLAYER_CONFIG.ITEM_EFFECTS.COMPANION_ITEM.COOLDOWN }, // 30 seconds
            godPlan: { active: false, duration: 0, maxDuration: PLAYER_CONFIG.ITEM_EFFECTS.GOD_PLAN.DURATION } // 20 seconds
        };
        
        // Item cooldowns (in milliseconds)
        this.itemCooldowns = {
            medkit: 0,
            shield: 0,
            ghost: 0,
            bazooka: 0,
            ricochet: 0,
            valkyrie: 0,
            timeBubble: 0,
            blackHole: 0,
            companion: 0,
            godPlan: 0,
            randomBox: 0
        };
        
        // Current active effects for display
        this.activeEffects = [];
        
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            pressed: false
        };
        
        // Continuous shooting
        this.isShooting = false;
        this.shootInterval = null;
        
        this.weapon = new Weapon();
        
        // **CORRECTION : RECUL TOUJOURS ACTIF**
        this.recoilForce = new Vector2D(0, 0);
        this.friction = PLAYER_CONFIG.FRICTION;
    }

    update(keys) {
        // **MOUVEMENT INDÉPENDANT DU RECUL**
        this.handleMovement(keys);
        
        // **APPLICATION DU RECUL**
        this.applyRecoil();
        
        // **LIMITES**
        this.position.x = Math.max(this.size, Math.min(1400 - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(940 - this.size, this.position.y));

        this.velocity = this.velocity.add(this.acceleration);
        this.position = this.position.add(this.velocity);

        const totalMovement = this.velocity.add(this.recoilForce);
    this.position = this.position.add(totalMovement);

    const bounceDamping = PLAYER_CONFIG.BOUNCE_DAMPING;

    if (this.position.x - this.size < 0) {
        this.position.x = this.size;
        if (totalMovement.x < 0) {
            this.velocity.x *= -bounceDamping;
            this.recoilForce.x *= -bounceDamping;
        }
    }
    if (this.position.x + this.size > 1400) {
        this.position.x = 1400 - this.size;
        if (totalMovement.x > 0) {
            this.velocity.x *= -bounceDamping;
            this.recoilForce.x *= -bounceDamping;
        }
    }
    if (this.position.y - this.size < 0) {
        this.position.y = this.size;
        if (totalMovement.y < 0) {
            this.velocity.y *= -bounceDamping;
            this.recoilForce.y *= -bounceDamping;
        }
    }
    if (this.position.y + this.size > 1000) {
        this.position.y = 1000 - this.size;
        if (totalMovement.y > 0) {
            this.velocity.y *= -bounceDamping;
            this.recoilForce.y *= -bounceDamping;
        }
    }

        this.recoilForce = this.recoilForce.multiply(this.friction);

        this.velocity = this.velocity.multiply(0.8);  /////////////////////////////////////////////   Vitesse finale du player

        // Update item effect timers
        this.updateItemEffects();
        
        // Update item cooldowns
        this.updateItemCooldowns();
        
        // Update companions
        this.updateCompanions();
    }

    handleMovement(keys) {
    let moveX = 0;
    let moveY = 0;

    if (keys['KeyW'] || keys['KeyZ'] || keys['ArrowUp']) moveY -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
    if (keys['KeyA'] || keys['KeyQ'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX /= length;
        moveY /= length;
    }

    this.acceleration = new Vector2D(moveX * this.speed, moveY * this.speed);
    }

    applyRecoil() {
        // **APPLICATION DU RECUL (INDÉPENDANT DU MOUVEMENT)**
        this.position = this.position.add(this.recoilForce);
        this.recoilForce = this.recoilForce.multiply(this.friction);
    }

    shoot(direction = null) {
        // If no direction provided, use mouse direction
        if (!direction) {
            direction = new Vector2D(
                this.mouse.x - this.position.x,
                this.mouse.y - this.position.y
            ).normalize();
        }
        
        // Handle special weapon modes
        if (this.weaponMode === 'BAZOOKA') {
            // For bazooka, we might want to create a special bullet or handle it differently
            // For now, we'll just use the normal shooting mechanism
            const bullet = this.weapon.shoot(this.position.x, this.position.y, direction);
            
            if (bullet) {
                // **CALCUL DU RECUL CORRIGÉ**
                const recoilMultiplier = this.weapon.states[this.weapon.currentState].recoilMult;
                const recoil = direction.multiply(-bullet.damage * recoilMultiplier);
                this.recoilForce = this.recoilForce.add(recoil);
                
                // Add bazooka-specific effects
                if (this.game && this.game.particleSystem) {
                    this.game.particleSystem.addMuzzleFlash(
                        this.position.x + direction.x * 20,
                        this.position.y + direction.y * 20,
                        '#ff3333',
                        10
                    );
                }
                
                return bullet;
            }
        } else {
            const bullet = this.weapon.shoot(this.position.x, this.position.y, direction);
            
            if (bullet) {
                // **CALCUL DU RECUL CORRIGÉ**
                const recoilMultiplier = this.weapon.states[this.weapon.currentState].recoilMult;
                const recoil = direction.multiply(-bullet.damage * recoilMultiplier);
                this.recoilForce = this.recoilForce.add(recoil);
                
                // If ricochet effect is active, modify bullet to bounce
                if (this.itemEffects.ricochet.active) {
                    // Add bounce properties to bullet
                    bullet.bounceCount = 0;
                    bullet.maxBounces = 3;
                    bullet.originalUpdate = bullet.update;
                    
                    // Override bullet update method to handle bouncing
                    bullet.update = function() {
                        // Call original update
                        const expired = this.originalUpdate();
                        if (expired) return true;
                        
                        // Check wall collisions for bouncing
                        if (this.x - this.size < 0 || this.x + this.size > 1400) {
                            if (this.bounceCount < this.maxBounces) {
                                this.vx = -this.vx;
                                this.bounceCount++;
                                
                                // Add bounce effect
                                if (this.game && this.game.particleSystem) {
                                    this.game.particleSystem.addImpactSparks(this.x, this.y, this.color, 3);
                                }
                                
                                return false; // Continue bullet
                            } else {
                                return true; // Expire bullet
                            }
                        }
                        if (this.y - this.size < 0 || this.y + this.size > 1000) {
                            if (this.bounceCount < this.maxBounces) {
                                this.vy = -this.vy;
                                this.bounceCount++;
                                
                                // Add bounce effect
                                if (this.game && this.game.particleSystem) {
                                    this.game.particleSystem.addImpactSparks(this.x, this.y, this.color, 3);
                                }
                                
                                return false; // Continue bullet
                            } else {
                                return true; // Expire bullet
                            }
                        }
                        
                        return false; // Continue bullet
                    };
                }
                
                return bullet;
            }
        }
        
        return null;
    }
    
    shootBackward() {
        // Shoot in the opposite direction of the mouse (for bazooka right-click)
        const direction = new Vector2D(
            this.mouse.x - this.position.x,
            this.mouse.y - this.position.y
        ).normalize();
        
        // Reverse the direction
        const backwardDirection = direction.multiply(-1);
        
        // Shoot with the backward direction
        return this.shoot(backwardDirection);
    }
    
    dashForward() {
        // Dash forward in the direction of the mouse
        const direction = new Vector2D(
            this.mouse.x - this.position.x,
            this.mouse.y - this.position.y
        ).normalize();
        
        // Apply a strong force in the direction of the mouse
        const dashForce = direction.multiply(10); // Adjust strength as needed
        this.recoilForce = this.recoilForce.add(dashForce);
        
        // Add visual effect
        if (this.game.particleSystem) {
            this.game.particleSystem.addMuzzleFlash(
                this.position.x,
                this.position.y,
                '#ff3333',
                15
            );
        }
    }

    takeDamage(amount, source = 'unknown') {
        console.log(`Player taking ${amount} damage from ${source}. Current health: ${this.health}`);
        // If player is invincible or in ghost mode, take no damage
        if (this.invincible || this.ghost) {
            console.log('Player is invincible or in ghost mode, taking no damage');
            return;
        }
        
        // If player has shield, reduce damage from shield first
        if (this.shield > 0) {
            if (this.shield >= amount) {
                this.shield -= amount;
                amount = 0;
            } else {
                amount -= this.shield;
                this.shield = 0;
            }
        }
        
        // Apply remaining damage to health
        this.health = Math.max(0, this.health - amount);
        console.log(`Player health after damage: ${this.health}`);
        
        // **FLASH ROUGE QUAND TOUCHÉ**
        const flash = document.createElement('div');
        flash.className = 'damage-flash';
        //console.log(`Player health: ${this.health}/${this.maxHealth}, updating weapon state...`);
        const newWeaponName = this.weapon.updateState(this.health, this.maxHealth);
        //console.log(`Weapon state updated to: ${this.weapon.currentState}`);
        
        // Display weapon change message if weapon changed
        if (newWeaponName && this.game && this.game.ui) {
            this.game.ui.showWeaponChangeMessage(newWeaponName);
        }
        
        document.getElementById('gameContainer').appendChild(flash);
        setTimeout(() => flash.remove(), 200);
        
        // **DEATH CHECK - Always check if player should die**
        if (this.health <= 0 && this.game) {
            this.game.gameOver();
        }
    }
    
    addCompanion() {
        // Add a new companion
        if (this.companions.length < 3) {
            const companion = {
                id: this.companions.length,
                health: PLAYER_CONFIG.COMPANION.COMPANION_HEALTH,
                angle: this.companionAngle + (this.companions.length * Math.PI * 2 / 3), // Evenly space companions
                distance: PLAYER_CONFIG.COMPANION.COMPANION_DISTANCE, // Distance from player
                size: PLAYER_CONFIG.COMPANION.COMPANION_SIZE,
                lastShot: 0,
                color: PLAYER_CONFIG.COMPANION.COMPANION_COLOR
            };
            this.companions.push(companion);
        }
    }
    
    updateCompanions() {
        // Update companion positions and shooting
        for (let i = 0; i < this.companions.length; i++) {
            const companion = this.companions[i];
            
            // Update companion angle for orbiting
            companion.angle += 0.05; // Adjust speed as needed
            
            // Position companion in orbit around player
            companion.x = this.position.x + Math.cos(companion.angle) * companion.distance;
            companion.y = this.position.y + Math.sin(companion.angle) * companion.distance;
            
            // Companions shoot at nearby enemies
            const now = Date.now();
            if (now - companion.lastShot > PLAYER_CONFIG.COMPANION.FIRE_RATE) { // Use the configurable fire rate
                // Find nearest enemy
                let nearestEnemy = null;
                let nearestDistance = Infinity;
                
                for (const enemy of this.game.enemies) {
                    const dx = companion.x - enemy.position.x;
                    const dy = companion.y - enemy.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < nearestDistance && distance < 300) { // Within 300px range
                        nearestDistance = distance;
                        nearestEnemy = enemy;
                    }
                }
                
                // Shoot at nearest enemy
                if (nearestEnemy) {
                    const direction = new Vector2D(
                        nearestEnemy.position.x - companion.x,
                        nearestEnemy.position.y - companion.y
                    ).normalize();
                    
                    // Create companion bullet
                    const bullet = new Bullet(
                        companion.x + direction.x * 10,
                        companion.y + direction.y * 10,
                        direction.x * 6, // Bullet speed
                        direction.y * 6,
                        20, // Damage
                        '#ff99cc', // Color
                        3, // Size
                        'companion'
                    );
                    
                    // Add bullet to game
                    this.game.bullets.push(bullet);
                    
                    // Update last shot time
                    companion.lastShot = now;
                }
            }
        }
    }
    
    expandCanvasTemporarily() {
        // Implementation for temporarily expanding the canvas
        // This could be used for the GodPlan item effect
        console.log("Canvas expanded temporarily!");
    }
    
    addScore(points) {
        // Add score through the game's UI system
        if (this.game && this.game.ui) {
            this.game.ui.addScore(points);
        } else {
            // Fallback to direct score addition
            this.score += points;
        }
    }

    heal(amount) {
        console.log(`Player healing ${amount} points. Current health: ${this.health}`);
        this.health = Math.min(this.maxHealth, this.health + amount);
        console.log(`Player health after healing: ${this.health}`);
    }

    setTarget(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
    }

    

    render(ctx) {
        // **CORPS DU JOUEUR**
        // Save context to restore later
        ctx.save();
        
        // Apply ghost effect if active
        if (this.ghost) {
            ctx.globalAlpha = 0.5; // Make player semi-transparent
        }
        
        // Apply invincibility glow effect
        if (this.invincible) {
            // Add glow effect
            ctx.shadowColor = '#66ccff';
            ctx.shadowBlur = 20;
        }
        
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Restore context
        ctx.restore();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // **SHIELD BUBBLE EFFECT**
        if (this.shield > 0) {
            ctx.save();
            
            // Calculate shield opacity based on remaining shield points
            const maxShield = PLAYER_CONFIG.ITEM_EFFECTS.SHIELD.MAX_SHIELD; // This should match the shield value set in Shield.js
            const shieldRatio = Math.min(1, this.shield / maxShield);
            const opacity = 0.3 + (0.7 * shieldRatio); // Opacity ranges from 0.3 to 1.0
            
            // Draw shield bubble
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size + 10, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(102, 255, 255, ${opacity})`; // Blue color with variable opacity
            ctx.fill();
            
            // Draw shield border
            ctx.strokeStyle = '#66ffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Add glow effect
            ctx.shadowColor = '#66ffff';
            ctx.shadowBlur = 20 * shieldRatio; // Glow intensity decreases with shield health
            ctx.fill();
            
            ctx.restore();
        }
        
        // **DIRECTION DU JOUEUR**
        const direction = new Vector2D(
            this.mouse.x - this.position.x,
            this.mouse.y - this.position.y
        ).normalize();
        
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(
            this.position.x + direction.x * 20,
            this.position.y + direction.y * 20
        );
        ctx.stroke();
        
        // **BARRE DE VIE AU-DESSUS DU JOUEUR**
        const barWidth = 30;
        const barHeight = 4;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size - 10;
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);

        // Draw companions
        for (const companion of this.companions) {
            ctx.beginPath();
            ctx.arc(companion.x, companion.y, companion.size, 0, Math.PI * 2);
            ctx.fillStyle = companion.color;
            ctx.fill();
            
            // Draw companion health bar
            const barWidth = 15;
            const barHeight = 3;
            const barX = companion.x - barWidth / 2;
            const barY = companion.y - companion.size - 8;
            
            ctx.fillStyle = '#000000';
            ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
            
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(barX, barY, barWidth * (companion.health / PLAYER_CONFIG.COMPANION.COMPANION_HEALTH), barHeight);
        }
         
    }
    
    updateItemEffects() {
        // Update active item effects
        for (const [effectName, effect] of Object.entries(this.itemEffects)) {
            if (effect.active) {
                effect.duration += 16; // Assuming 60 FPS, 16ms per frame
                
                // Check if effect has expired
                if (effect.duration >= effect.maxDuration) {
                    effect.active = false;
                    effect.duration = 0;
                    
                    // Clean up effect
                    this.cleanupItemEffect(effectName);
                }
            }
        }
    }
    
    updateItemCooldowns() {
        // Update item cooldowns
        for (const [itemName, cooldown] of Object.entries(this.itemCooldowns)) {
            if (cooldown > 0) {
                this.itemCooldowns[itemName] = Math.max(0, cooldown - 16); // Assuming 60 FPS
            }
        }
    }
    
    cleanupItemEffect(effectName) {
        // Clean up specific item effects
        switch (effectName) {
            case 'shield':
                this.shield = 0;
                break;
            case 'ghost':
                this.ghost = false;
                break;
            case 'bazooka':
                // Show weapon change message
                if (this.game && this.game.ui) {
                    this.game.ui.showWeaponChangeMessage('NORMAL WEAPON');
                }
                this.weaponMode = 'NORMAL';
                break;
            case 'ricochet':
                // Show weapon change message
                if (this.game && this.game.ui) {
                    this.game.ui.showWeaponChangeMessage('NORMAL WEAPON');
                }
                this.weaponMode = 'NORMAL';
                break;
            // Add other effect cleanups as needed
        }
        
        // Remove from active effects list
        const index = this.activeEffects.indexOf(effectName);
        if (index > -1) {
            this.activeEffects.splice(index, 1);
        }
    }
    
    activateItemEffect(effectName, duration) {
        // Activate an item effect
        if (this.itemEffects[effectName]) {
            this.itemEffects[effectName].active = true;
            this.itemEffects[effectName].duration = 0;
            this.itemEffects[effectName].maxDuration = duration;
            
            // Add to active effects list
            if (!this.activeEffects.includes(effectName)) {
                this.activeEffects.push(effectName);
            }
        }
    }
    
    isItemOnCooldown(itemName) {
        // Check if an item is on cooldown
        return this.itemCooldowns[itemName] > 0;
    }
    
    setItemCooldown(itemName, cooldown) {
        // Set an item cooldown
        this.itemCooldowns[itemName] = cooldown;
    }
    
    startShooting() {
        if (this.isShooting) return;
        
        this.isShooting = true;
        
        // Start continuous shooting
        const shoot = () => {
            if (this.isShooting) {
                const bullet = this.shoot();
                if (bullet && this.game) {
                    this.game.bullets.push(bullet);
                }
                
                // Continue shooting at weapon's fire rate
                const fireRate = this.weapon.getFireRate();
                this.shootInterval = setTimeout(shoot, fireRate);
            }
        };
        
        // Start shooting immediately
        shoot();
    }
    
    stopShooting() {
        this.isShooting = false;
        if (this.shootInterval) {
            clearTimeout(this.shootInterval);
            this.shootInterval = null;
        }
    }
}