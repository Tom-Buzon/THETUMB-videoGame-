import { WEAPON_CONFIG } from './config.js';
import { Bullet } from './bullet.js';
import { Protector } from './enemies/protector.js';
import { Branch } from './branch.js';

export class Weapon {
    constructor() {
        this.states = {
            MINIGUN: {
                name: WEAPON_CONFIG.STATES.MINIGUN.NAME,
                hpRange: WEAPON_CONFIG.STATES.MINIGUN.HP_RANGE,
                fireRate: WEAPON_CONFIG.STATES.MINIGUN.FIRE_RATE,
                damage: WEAPON_CONFIG.STATES.MINIGUN.DAMAGE,
                recoilMult: WEAPON_CONFIG.STATES.MINIGUN.RECOIL_MULT,
                color: WEAPON_CONFIG.STATES.MINIGUN.COLOR
            },
            AUTO: {
                name: WEAPON_CONFIG.STATES.AUTO.NAME,
                hpRange: WEAPON_CONFIG.STATES.AUTO.HP_RANGE,
                fireRate: WEAPON_CONFIG.STATES.AUTO.FIRE_RATE,
                damage: WEAPON_CONFIG.STATES.AUTO.DAMAGE,
                recoilMult: WEAPON_CONFIG.STATES.AUTO.RECOIL_MULT,
                color: WEAPON_CONFIG.STATES.AUTO.COLOR
            },
            BURST: {
                name: WEAPON_CONFIG.STATES.BURST.NAME,
                hpRange: WEAPON_CONFIG.STATES.BURST.HP_RANGE,
                fireRate: WEAPON_CONFIG.STATES.BURST.FIRE_RATE,
                damage: WEAPON_CONFIG.STATES.BURST.DAMAGE,
                recoilMult: WEAPON_CONFIG.STATES.BURST.RECOIL_MULT,
                color: WEAPON_CONFIG.STATES.BURST.COLOR
            },
            SEMI: {
                name: WEAPON_CONFIG.STATES.SEMI.NAME,
                hpRange: WEAPON_CONFIG.STATES.SEMI.HP_RANGE,
                fireRate: WEAPON_CONFIG.STATES.SEMI.FIRE_RATE,
                damage: WEAPON_CONFIG.STATES.SEMI.DAMAGE,
                recoilMult: WEAPON_CONFIG.STATES.SEMI.RECOIL_MULT,
                color: WEAPON_CONFIG.STATES.SEMI.COLOR
            },
            SINGLE: {
                name: WEAPON_CONFIG.STATES.SINGLE.NAME,
                hpRange: WEAPON_CONFIG.STATES.SINGLE.HP_RANGE,
                fireRate: WEAPON_CONFIG.STATES.SINGLE.FIRE_RATE,
                damage: WEAPON_CONFIG.STATES.SINGLE.DAMAGE,
                recoilMult: WEAPON_CONFIG.STATES.SINGLE.RECOIL_MULT,
                color: WEAPON_CONFIG.STATES.SINGLE.COLOR
            },
            LASER: {
                name: WEAPON_CONFIG.STATES.LASER.NAME,
                hpRange: WEAPON_CONFIG.STATES.LASER.HP_RANGE,
                fireRate: WEAPON_CONFIG.STATES.LASER.FIRE_RATE,
                damage: WEAPON_CONFIG.STATES.LASER.DAMAGE,
                recoilMult: WEAPON_CONFIG.STATES.LASER.RECOIL_MULT,
                color: WEAPON_CONFIG.STATES.LASER.COLOR
            }
        
        };
        
        this.currentState = 'AUTO';
        this.lastFireTime = 0;
        
        // Laser weapon properties
        this.laserActive = false;
        this.laserStartTime = 0;
        this.laserDuration = WEAPON_CONFIG.STATES.LASER.DURATION; // 1.5 seconds
        this.laserCooldown = WEAPON_CONFIG.STATES.LASER.COOLDOWN; // 5 seconds
        this.laserEndpoint = null;
        this.laserDirection = null;
        this.laserRecoilApplied = false;
        this.laserDeactivated = false;
        
        // Bazooka branch structure (created once when laser is fired)
        this.bazookaBranches = [];
        this.initialLaserEndpoint = null;
        this.initialLaserDirection = null;
    }

    updateState(playerHealth, maxHealth) {
        const healthPercent = (playerHealth / maxHealth) * 100;
        //console.log(`Weapon state update: ${playerHealth}/${maxHealth} = ${healthPercent}%`);
        //console.log(`Weapon state update: ${playerHealth}/${maxHealth} = ${healthPercent}%`);
        
        // Store the current state before updating
        const previousState = this.currentState;
        
        // Check states in a specific order from highest health to lowest health
        const stateOrder = ['MINIGUN', 'AUTO', 'BURST', 'SEMI', 'SINGLE', 'LASER'];
        for (const state of stateOrder) {
            const config = this.states[state];
            if (healthPercent >= config.hpRange[0] && healthPercent <= config.hpRange[1]) {
                this.currentState = state;
                break;
            }
        }
        
        // Return the new weapon name if the state changed
        if (previousState !== this.currentState) {
            return this.states[this.currentState].name;
        }
        
        // Return null if no change occurred
        return null;
    }

    shoot(x, y, direction, player) {
        const now = Date.now();
        const state = this.states[this.currentState];
        
        // Don't check fire rate for LASER state as fireLaser handles its own cooldown
        if (this.currentState !== 'LASER' && now - this.lastFireTime < state.fireRate) {
            return null;
        }
        
        // Only update lastFireTime for non-LASER states
        if (this.currentState !== 'LASER') {
            this.lastFireTime = now;
        }
        
        // If player health is below 10%, activate laser instead of shooting a bullet
        if (this.currentState === 'SINGLE' && player.health <= player.maxHealth * 0.1) {
            // Try to fire the laser
            const success = this.fireLaser(player, x + direction.x * 20, y + direction.y * 20);
            if (success) {
                // Add enhanced visual effect for laser firing
                if (player.game && player.game.particleSystem) {
                    // Enhanced muzzle flash with more particles
                    player.game.particleSystem.addMuzzleFlash(
                        x + direction.x * 20,
                        y + direction.y * 20,
                        '#ff0000',
                        25
                    );
                    
                    // Add additional energy particles for more intensity
                    for (let i = 0; i < 15; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 2 + Math.random() * 3;
                        player.game.particleSystem.addParticle({
                            x: x + direction.x * 20,
                            y: y + direction.y * 20,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            color: '#ff5555',
                            life: 20,
                            maxLife: 20,
                            size: 1 + Math.random() * 2,
                            type: 'muzzle'
                        });
                    }
                }
                
                // Add screen flash on activation
                if (player.game && player.game.particleSystem) {
                    player.game.particleSystem.addFlash(
                        x,
                        y,
                        300,
                        '#ff0000'
                    );
                }
                
                // Play laser activation sound
                if (window.audio && window.audio.playSound) {
                    window.audio.playSound('autoFire', 0.8);
                }
            }
            return null; // Laser doesn't return a bullet
        }
        
        // If current state is LASER, fire the laser weapon
        if (this.currentState === 'LASER') {
            // Try to fire the laser
            const success = this.fireLaser(player, x + direction.x * 20, y + direction.y * 20);
            if (success) {
                // Add enhanced visual effect for laser firing
                if (player.game && player.game.particleSystem) {
                    // Enhanced muzzle flash with more particles
                    player.game.particleSystem.addMuzzleFlash(
                        x + direction.x * 20,
                        y + direction.y * 20,
                        '#ff0000',
                        25
                    );
                    
                    // Add additional energy particles for more intensity
                    for (let i = 0; i < 15; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 2 + Math.random() * 3;
                        player.game.particleSystem.addParticle({
                            x: x + direction.x * 20,
                            y: y + direction.y * 20,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            color: '#ff5555',
                            life: 20,
                            maxLife: 20,
                            size: 1 + Math.random() * 2,
                            type: 'muzzle'
                        });
                    }
                }
                
                // Add screen flash on activation
                if (player.game && player.game.particleSystem) {
                    player.game.particleSystem.addFlash(
                        x,
                        y,
                        300,
                        '#ff0000'
                    );
                }
                
                // Play laser activation sound
                if (window.audio && window.audio.playSound) {
                    window.audio.playSound('autoFire', 0.8);
                }
            }
            return null; // Laser doesn't return a bullet
        }
        
        return new Bullet(
            x + direction.x * 20,
            y + direction.y * 20,
            direction.x * 8,
            direction.y * 8,
            state.damage,
            state.color,
            5,
            'player'
        );
    }

    getName() {
        return this.states[this.currentState].name;
    }

    getDamage() {
        return this.states[this.currentState].damage;
    }

    getFireRate() {
        return this.states[this.currentState].fireRate;
    }

    getColor() {
        return this.states[this.currentState].color;
    }
        
    
    // Laser weapon methods
    fireLaser(player, mouseX, mouseY) {
        // Check if laser is on cooldown
        const now = Date.now();
        if (this.laserActive || (now - this.lastFireTime) < this.laserCooldown) {
            return false;
        }
        
        // Activate laser
        this.laserActive = true;
        this.laserStartTime = now;
        this.laserRecoilApplied = false;
        this.laserDeactivated = false;
        
        // Calculate laser direction
        const dx = mouseX - player.position.x;
        const dy = mouseY - player.position.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        this.laserDirection = { x: dx / length, y: dy / length };
        
        // Calculate laser endpoint
        this.laserEndpoint = this.calculateLaserEndpoint(
            player.position.x,
            player.position.y,
            this.laserDirection.x,
            this.laserDirection.y,
            player.game
        );
        
        // Store initial laser direction and endpoint for bazooka branches
        this.initialLaserDirection = { x: this.laserDirection.x, y: this.laserDirection.y };
        this.initialLaserEndpoint = { x: this.laserEndpoint.x, y: this.laserEndpoint.y };
        
        // Create bazooka branch structure if player has BAZOOKA weapon mode active
        if (player && player.weaponMode === 'BAZOOKA') {
            this.createBazookaBranches(player.position.x, player.position.y, this.initialLaserEndpoint.x, this.initialLaserEndpoint.y);
        }
        
        return true;
    }
    
    createBazookaBranches(playerX, playerY, endX, endY) {
        // Create enhanced branching laser system with hierarchical structure
        this.bazookaBranches = []; // Clear any existing branches
        
        // Create 5 primary branches
        for (let i = 0; i < 5; i++) {
            // Calculate position along the main laser beam (20%, 35%, 50%, 65%, 80%)
            const t = 0.2 + (i * 0.15);
            const branchStartX = playerX + (endX - playerX) * t;
            const branchStartY = playerY + (endY - playerY) * t;
            
            // Calculate angle relative to main laser direction
            const mainAngle = Math.atan2(endY - playerY, endX - playerX);
            
            // For primary branches: Use angles of mainAngle + (index * Math.PI / 2) for indices 0-3
            // For the 5th branch (index 4), place it opposite to the first branch
            let branchAngle;
            if (i < 4) {
                branchAngle = mainAngle + (i * Math.PI / 2);
            } else {
                // 5th branch opposite to first branch
                branchAngle = mainAngle + Math.PI;
            }
            
            // Create primary branch
            const primaryBranch = new Branch(
                `branch-${i}`,
                branchStartX,
                branchStartY,
                branchAngle,
                200, // Max length
                i,
                1 // Level 1
            );
            
            // Create 2 sub-branches for each primary branch
            for (let j = 0; j < 2; j++) {
                // Position sub-branch at 30% and 70% along the primary branch
                const subT = j === 0 ? 0.3 : 0.7;
                const subLength = 140; // 70% of primary branch length
                
                // For sub-branches: Use parentAngle ± Math.PI / 2 for the two sub-branches
                const subAngle = primaryBranch.angle + (j === 0 ? Math.PI / 2 : -Math.PI / 2);
                
                const subBranch = new Branch(
                    `sub-branch-${i}-${j}`,
                    primaryBranch.startX + Math.cos(primaryBranch.angle) * (primaryBranch.maxLength * subT),
                    primaryBranch.startY + Math.sin(primaryBranch.angle) * (primaryBranch.maxLength * subT),
                    subAngle,
                    subLength,
                    j,
                    2, // Level 2
                    primaryBranch
                );
                
                primaryBranch.children.push(subBranch);
                this.bazookaBranches.push(subBranch);
            }
            
            this.bazookaBranches.push(primaryBranch);
        }
    }
    
    calculateLaserEndpoint(startX, startY, dirX, dirY, game) {
        // Calculate endpoint at maximum distance (we'll check for collisions)
        const maxDistance = 2000;
        let endX = startX + dirX * maxDistance;
        let endY = startY + dirY * maxDistance;
        
        // Check for collisions with boundaries
        // Left boundary
        if (dirX < 0) {
            const t = (0 - startX) / dirX;
            const y = startY + dirY * t;
            if (y >= 0 && y <= 1000 && t > 0) {
                endX = 0;
                endY = y;
            }
        }
        // Right boundary
        if (dirX > 0) {
            const t = (1400 - startX) / dirX;
            const y = startY + dirY * t;
            if (y >= 0 && y <= 1000 && t > 0) {
                endX = 1400;
                endY = y;
            }
        }
        // Top boundary
        if (dirY < 0) {
            const t = (0 - startY) / dirY;
            const x = startX + dirX * t;
            if (x >= 0 && x <= 1400 && t > 0) {
                endX = x;
                endY = 0;
            }
        }
        // Bottom boundary
        if (dirY > 0) {
            const t = (1000 - startY) / dirY;
            const x = startX + dirX * t;
            if (x >= 0 && x <= 1400 && t > 0) {
                endX = x;
                endY = 1000;
            }
        }
        
        // Check for collisions with obstacles
        if (game && game.obstacles) {
            for (const obstacle of game.obstacles) {
                // Calculate intersection with obstacle rectangle
                const t = this.intersectRayRectangle(
                    startX, startY, dirX, dirY,
                    obstacle.x, obstacle.y, obstacle.width, obstacle.height
                );
                
                if (t > 0 && t < maxDistance) {
                    const x = startX + dirX * t;
                    const y = startY + dirY * t;
                    // Check if this intersection is closer than current endpoint
                    const currentDistance = Math.sqrt(
                        (endX - startX) * (endX - startX) +
                        (endY - startY) * (endY - startY)
                    );
                    if (t < currentDistance) {
                        endX = x;
                        endY = y;
                    }
                }
            }
        }
        
        return { x: endX, y: endY };
    }
    
    intersectRayRectangle(rayX, rayY, rayDirX, rayDirY, rectX, rectY, rectWidth, rectHeight) {
        // Calculate intersection of ray with rectangle
        let tMin = -Infinity;
        let tMax = Infinity;
        
        if (rayDirX !== 0) {
            const t1 = (rectX - rayX) / rayDirX;
            const t2 = (rectX + rectWidth - rayX) / rayDirX;
            tMin = Math.max(tMin, Math.min(t1, t2));
            tMax = Math.min(tMax, Math.max(t1, t2));
        }
        
        if (rayDirY !== 0) {
            const t1 = (rectY - rayY) / rayDirY;
            const t2 = (rectY + rectHeight - rayY) / rayDirY;
            tMin = Math.max(tMin, Math.min(t1, t2));
            tMax = Math.min(tMax, Math.max(t1, t2));
        }
        
        if (tMax >= tMin && tMax >= 0) {
            return tMin >= 0 ? tMin : tMax;
        }
        
        return -1; // No intersection
    }
    
    updateLaser(player, enemies) {
        if (!this.laserActive) return false;
        
        const now = Date.now();
        const elapsed = now - this.laserStartTime;
        
        // Update laser direction and endpoint to follow mouse
        if (player.mouse) {
            const mouseX = player.mouse.x;
            const mouseY = player.mouse.y;
            
            // Calculate laser direction
            const dx = mouseX - player.position.x;
            const dy = mouseY - player.position.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            this.laserDirection = { x: dx / length, y: dy / length };
            
            // Calculate laser endpoint
            this.laserEndpoint = this.calculateLaserEndpoint(
                player.position.x,
                player.position.y,
                this.laserDirection.x,
                this.laserDirection.y,
                player.game
            );
        }
        
        // Update branch positions to match current laser direction
        if (player && player.weaponMode === 'BAZOOKA' && this.laserEndpoint) {
            this.updateBranchPositions(
                player.position.x,
                player.position.y,
                this.laserEndpoint,
                Math.atan2(this.laserEndpoint.y - player.position.y, this.laserEndpoint.x - player.position.x)
            );
        }
        
        // Check if laser duration has expired
        if (elapsed >= this.laserDuration) {
            // Apply recoil after laser duration
            if (!this.laserRecoilApplied && this.laserDirection) {
                const recoil = {
                    x: -this.laserDirection.x * this.states.LASER.damage * this.states.LASER.recoilMult,
                    y: -this.laserDirection.y * this.states.LASER.damage * this.states.LASER.recoilMult
                };
                player.recoilForce = player.recoilForce.add(recoil);
                this.laserRecoilApplied = true;
            }
            
            // Deactivate laser after duration (not waiting for cooldown)
            if (!this.laserDeactivated) {
                this.laserDeactivated = true;
                this.laserActive = false;
                this.lastFireTime = now;
                
                // Clear bazooka branches when laser is deactivated
                const isBazookaMode = player && player.weaponMode === 'BAZOOKA';
                if (isBazookaMode) {
                    this.bazookaBranches = [];
                    this.initialLaserEndpoint = null;
                    this.initialLaserDirection = null;
                }
                
                return false;
            }
        }
        
        // Laser is active, deal damage to enemies
        if (this.laserEndpoint && player.game) {
            // Check damage for main laser beam
            for (const enemy of enemies) {
                if (this.isPointOnLineSegment(
                    player.position.x, player.position.y,
                    this.laserEndpoint.x, this.laserEndpoint.y,
                    enemy.position.x, enemy.position.y,
                    enemy.size
                )) {
                    // Check if the enemy is protected by a living protector
                    if (Protector.isProtected(enemy, player.game.enemies)) {
                        // Enemy is protected, don't apply damage but still show visual effects
                        console.log(`Laser damage blocked! ${enemy.constructor.name} is protected by a living Protector`);
                        
                        // Add visual effect for blocked hit
                        if (player.game.particleSystem) {
                            // Add blocked effect sparks
                            player.game.particleSystem.addImpactSparks(
                                enemy.position.x,
                                enemy.position.y,
                                '#8888ff', // Blue color for blocked hits
                                5
                            );
                        }
                    } else {
                        // Enemy is not protected, apply damage
                        enemy.takeDamage(this.states.LASER.damage);
                        
                        // Add enhanced visual effect for hit
                        if (player.game.particleSystem) {
                            // Add more impact sparks
                            player.game.particleSystem.addImpactSparks(
                                enemy.position.x,
                                enemy.position.y,
                                '#ff0000',
                                10
                            );
                            
                            // Add additional energy particles
                            for (let i = 0; i < 8; i++) {
                                const angle = Math.random() * Math.PI * 2;
                                const speed = 1 + Math.random() * 3;
                                player.game.particleSystem.addParticle({
                                    x: enemy.position.x,
                                    y: enemy.position.y,
                                    vx: Math.cos(angle) * speed,
                                    vy: Math.sin(angle) * speed,
                                    color: '#ff5555',
                                    life: 15,
                                    maxLife: 15,
                                    size: 1 + Math.random() * 2,
                                    type: 'spark'
                                });
                            }
                        }
                        
                        // Add screen shake on enemy hit
                        if (player.game.particleSystem) {
                            player.game.particleSystem.addScreenShake(5);
                            
                            // Add damage number display
                            player.game.particleSystem.addDamageNumber(
                                enemy.position.x,
                                enemy.position.y - 20, // Display above the enemy
                                100, // Damage amount
                                '#ff0000' // Red color for damage
                            );
                        }
                    }
                }
            }
            
            // Check damage for branches if BAZOOKA mode is active
            if (player && player.weaponMode === 'BAZOOKA') {
                this.checkBranchCollisions(enemies);
            }
        }
        
        return true;
    }
    
    // Update branch positions to maintain relative positions during movement
    updateBranchPositions(playerX, playerY, newEndpoint, newDirection) {
        // Update each branch position relative to the main laser
        for (const branch of this.bazookaBranches) {
            if (branch.parent) {
                // For sub-branches, update based on parent position
                branch.updatePosition(branch.parent.startPoint, branch.parent.angle);
            } else {
                // For primary branches, update based on main laser
                // Calculate position along the main laser beam
                const t = 0.2 + (branch.index * 0.15);
                const newStartX = playerX + (newEndpoint.x - playerX) * t;
                const newStartY = playerY + (newEndpoint.y - playerY) * t;
                
                // Update branch angle relative to main laser
                const newAngle = newDirection + branch.relativeAngle;
                
                branch.startPoint = { x: newStartX, y: newStartY };
                branch.angle = newAngle;
            }
            
            // Update children positions
            for (const child of branch.children) {
                child.updatePosition(branch.startPoint, branch.angle);
            }
        }
    }
    
    // Check collisions for all branches and apply damage
    checkBranchCollisions(enemies) {
        const hitEnemies = new Set();
        const now = Date.now();
        const elapsed = now - this.laserStartTime;
        const progress = Math.min(1, elapsed / (this.laserDuration * 0.5)); // Branches grow faster than main laser
        
        // Check collisions for each branch
        for (const branch of this.bazookaBranches) {
            // Calculate current length based on progress
            const currentLength = branch.maxLength * progress;
            
            // Check collision with enemies
            const enemiesHit = branch.checkCollision(enemies, currentLength);
            for (const enemy of enemiesHit) {
                hitEnemies.add(enemy);
            }
        }
        
        // Apply damage to all hit enemies
        for (const enemy of hitEnemies) {
            // Branches deal 30% of main laser damage
            const branchDamage = this.states.LASER.damage * 0.3;
            enemy.takeDamage(branchDamage);
            
            // Add visual effects for branch hits
            if (this.player && this.player.game && this.player.game.particleSystem) {
                this.player.game.particleSystem.addImpactSparks(
                    enemy.position.x,
                    enemy.position.y,
                    '#00ff00', // Green color for branch hits
                    5
                );
            }
        }
        
        return hitEnemies.size > 0;
    }
    
    isPointOnLineSegment(x1, y1, x2, y2, px, py, radius) {
        // Check if a point is within radius distance of a line segment
        const A = x2 - x1;
        const B = y2 - y1;
        const C = px - x1;
        const D = py - y1;
        
        const dot = C * A + D * B;
        const lenSq = A * A + B * B;
        
        if (lenSq === 0) return Math.sqrt(C * C + D * D) <= radius;
        
        const param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * A;
            yy = y1 + param * B;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy) <= radius;
    }
    
    renderLaser(ctx, playerX, playerY, player) {
        if (!this.laserActive || !this.laserEndpoint) return;
        
        // Store reference to player for use in other methods
        this.player = player;
        
        const now = Date.now();
        const elapsed = now - this.laserStartTime;
        const progress = Math.min(1, elapsed / this.laserDuration);
        
        // Pulsing effect for intensity
        const pulse = Math.sin(now * 0.01) * 0.3 + 0.7;
        const energyPulse = Math.sin(now * 0.02) * 0.4 + 0.6;
        
        // Check if player has BAZOOKA weapon mode active
        const isBazookaMode = player && player.weaponMode === 'BAZOOKA';
        
        // Draw main laser beam
        this.drawLaserBeam(ctx, playerX, playerY, this.laserEndpoint.x, this.laserEndpoint.y, pulse, energyPulse, isBazookaMode);
        
        // If BAZOOKA mode is active, draw branching lasers
        if (isBazookaMode && this.initialLaserEndpoint) {
            this.drawBazookaBranches(ctx, playerX, playerY, this.initialLaserEndpoint.x, this.initialLaserEndpoint.y, pulse, energyPulse);
        }
        
        // Draw particle sparks along the main beam
        this.drawLaserSparks(ctx, playerX, playerY, this.laserEndpoint.x, this.laserEndpoint.y, pulse);
    }
    
    drawLaserBeam(ctx, startX, startY, endX, endY, pulse, energyPulse, isBazookaMode) {
        // Draw pulsing energy field around the beam
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        
        // Create energy field gradient
        const energyGradient = ctx.createLinearGradient(
            startX, startY,
            endX, endY
        );
        
        // Different colors for BAZOOKA mode
        if (isBazookaMode) {
            energyGradient.addColorStop(0, 'rgba(159, 33, 170, 0.4)');  // Green for BAZOOKA
            energyGradient.addColorStop(0.5, 'rgba(156, 3, 144, 0.6)');
            energyGradient.addColorStop(1, 'rgba(175, 16, 56, 0.2)');
        } else {
            energyGradient.addColorStop(0, 'rgba(255, 100, 100, 0.3)');
            energyGradient.addColorStop(0.5, 'rgba(255, 50, 50, 0.5)');
            energyGradient.addColorStop(1, 'rgba(255, 0, 0, 0.1)');
        }
        
        ctx.strokeStyle = energyGradient;
        ctx.lineWidth = 15 * energyPulse;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw outer glow for energy field
        ctx.shadowColor = isBazookaMode ? '#00ff00' : '#ff0000';
        ctx.shadowBlur = 25 * energyPulse;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Draw main laser beam with enhanced glow
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        
        // Create gradient for main laser effect
        const gradient = ctx.createLinearGradient(
            startX, startY,
            endX, endY
        );
        
        // Different colors for BAZOOKA mode
        if (isBazookaMode) {
            gradient.addColorStop(0, 'rgba(100, 255, 100, 0.9)');  // Green for BAZOOKA
            gradient.addColorStop(0.3, 'rgba(0, 255, 0, 1)');
            gradient.addColorStop(0.7, 'rgba(100, 255, 100, 0.9)');
            gradient.addColorStop(1, 'rgba(200, 255, 200, 0.3)');
        } else {
            gradient.addColorStop(0, 'rgba(255, 50, 50, 0.9)');
            gradient.addColorStop(0.3, 'rgba(255, 0, 0, 1)');
            gradient.addColorStop(0.7, 'rgba(255, 100, 100, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 200, 200, 0.3)');
        }
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 5 * pulse;
        ctx.stroke();
        
        // Add intense glow effect
        ctx.shadowColor = isBazookaMode ? '#00ff00' : '#ff0000';
        ctx.shadowBlur = 30 * pulse;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Draw core beam with bright white center
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 * pulse;
        ctx.stroke();
        
        // Draw endpoint explosion effect
        ctx.beginPath();
        ctx.arc(endX, endY, 10 * pulse, 0, Math.PI * 2);
        const endpointGradient = ctx.createRadialGradient(
            endX, endY, 0,
            endX, endY, 10 * pulse
        );
        
        // Different colors for BAZOOKA mode
        if (isBazookaMode) {
            endpointGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            endpointGradient.addColorStop(0.5, 'rgba(100, 255, 100, 0.8)');
            endpointGradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        } else {
            endpointGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            endpointGradient.addColorStop(0.5, 'rgba(255, 100, 100, 0.8)');
            endpointGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        }
        
        ctx.fillStyle = endpointGradient;
        ctx.fill();
        
        // Add glow to endpoint
        ctx.shadowColor = isBazookaMode ? '#00ff00' : '#ff0000';
        ctx.shadowBlur = 20 * pulse;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    drawBazookaBranches(ctx, playerX, playerY, endX, endY, pulse, energyPulse) {
        // Draw all branches using the enhanced branching system
        for (const branch of this.bazookaBranches) {
            // Draw the branch with a "printed circuit" pattern
            this.drawCircuitBranch(ctx, branch, pulse, energyPulse);
        }
    }
    
    drawCircuitBranch(ctx, branch, pulse, energyPulse) {
        // Draw a branch with a "printed circuit" pattern that grows outward
        // Calculate how much of the branch should be visible based on time
        const now = Date.now();
        const elapsed = now - this.laserStartTime;
        const progress = Math.min(1, elapsed / (this.laserDuration * 0.5)); // Branches grow faster than main laser
        
        // Calculate current length based on progress
        const currentLength = branch.maxLength * progress;
        
        // Calculate endpoint based on angle and current length
        const endX = branch.startPoint.x + Math.cos(branch.angle) * currentLength;
        const endY = branch.startPoint.y + Math.sin(branch.angle) * currentLength;
        
        // Update branch end point
        branch.endPoint = { x: endX, y: endY };
        
        // Draw main branch line
        ctx.beginPath();
        ctx.moveTo(branch.startPoint.x, branch.startPoint.y);
        ctx.lineTo(endX, endY);
        
        // Validate coordinates before creating gradient
        if (!isFinite(branch.startPoint.x) || !isFinite(branch.startPoint.y) ||
            !isFinite(endX) || !isFinite(endY)) {
            return; // Skip drawing if coordinates are not finite
        }
        
        // Create gradient for branch
        const gradient = ctx.createLinearGradient(branch.startPoint.x, branch.startPoint.y, endX, endY);
        gradient.addColorStop(0, 'rgba(100, 255, 100, 0.8)');  // Bright green start
        gradient.addColorStop(0.5, 'rgba(0, 255, 0, 1)');     // Pure green middle
        gradient.addColorStop(1, 'rgba(0, 150, 0, 0.6)');     // Darker green end
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3 * pulse;
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 15 * pulse;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Draw "printed circuit" elements along the branch
        const segmentLength = 30;
        const segments = Math.floor(currentLength / segmentLength);
        
        for (let i = 1; i < segments; i++) {
            // Position along the branch
            const segmentX = branch.startPoint.x + Math.cos(branch.angle) * (i * segmentLength);
            const segmentY = branch.startPoint.y + Math.sin(branch.angle) * (i * segmentLength);
            
            // Every few segments, draw a circuit element
            if (i % 3 === 0) {
                // Draw a small perpendicular line (like a circuit trace)
                const perpAngle = branch.angle + Math.PI / 2; // 90 degrees perpendicular
                const perpLength = 10 + (branch.index * 2); // Vary length by branch
                
                ctx.beginPath();
                ctx.moveTo(segmentX, segmentY);
                ctx.lineTo(
                    segmentX + Math.cos(perpAngle) * perpLength,
                    segmentY + Math.sin(perpAngle) * perpLength
                );
                
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 1.5 * pulse;
                ctx.stroke();
                
                // Add a small circle at the end (like a component)
                ctx.beginPath();
                ctx.arc(
                    segmentX + Math.cos(perpAngle) * perpLength,
                    segmentY + Math.sin(perpAngle) * perpLength,
                    3 * pulse,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = '#00ffcc';
                ctx.fill();
            }
            
            // Draw small dots along the branch (like circuit nodes)
            if (i % 2 === 0) {
                ctx.beginPath();
                ctx.arc(segmentX, segmentY, 2 * pulse, 0, Math.PI * 2);
                ctx.fillStyle = '#00ffaa';
                ctx.fill();
            }
        }
        
        // Draw endpoint effect
        ctx.beginPath();
        ctx.arc(endX, endY, 5 * pulse, 0, Math.PI * 2);
        const endpointGradient = ctx.createRadialGradient(
            endX, endY, 0,
            endX, endY, 5 * pulse
        );
        endpointGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        endpointGradient.addColorStop(0.5, 'rgba(100, 255, 100, 0.8)');
        endpointGradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        ctx.fillStyle = endpointGradient;
        ctx.fill();
    }
    
    drawLaserSparks(ctx, startX, startY, endX, endY, pulse) {
        // Draw particle sparks along the beam
        const beamLength = Math.sqrt(
            Math.pow(endX - startX, 2) +
            Math.pow(endY - startY, 2)
        );
        const beamAngle = Math.atan2(endY - startY, endX - startX);
        
        // Add sparks at regular intervals along the beam
        for (let i = 0; i < beamLength; i += 30) {
            // Only show some sparks for performance
            if (Math.random() > 0.3) continue;
            
            const sparkX = startX + Math.cos(beamAngle) * i;
            const sparkY = startY + Math.sin(beamAngle) * i;
            
            // Add small random offset for spark effect
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;
            
            ctx.beginPath();
            ctx.arc(sparkX + offsetX, sparkY + offsetY, 1 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            
            // Add glow to sparks
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 5;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}