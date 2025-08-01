import { WEAPON_CONFIG } from './config.js';
import { Bullet } from './bullet.js';
import { Protector } from './enemies/protector.js';

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
        
        return true;
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
                return false;
            }
        }
        
        // Laser is active, deal damage to enemies
        if (this.laserEndpoint && player.game) {
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
        }
        
        return true;
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
    
    renderLaser(ctx, playerX, playerY) {
        if (!this.laserActive || !this.laserEndpoint) return;
        
        const now = Date.now();
        const elapsed = now - this.laserStartTime;
        const progress = Math.min(1, elapsed / this.laserDuration);
        
        // Pulsing effect for intensity
        const pulse = Math.sin(now * 0.01) * 0.3 + 0.7;
        const energyPulse = Math.sin(now * 0.02) * 0.4 + 0.6;
        
        // Draw pulsing energy field around the beam
        ctx.beginPath();
        ctx.moveTo(playerX, playerY);
        ctx.lineTo(this.laserEndpoint.x, this.laserEndpoint.y);
        
        // Create energy field gradient
        const energyGradient = ctx.createLinearGradient(
            playerX, playerY,
            this.laserEndpoint.x, this.laserEndpoint.y
        );
        energyGradient.addColorStop(0, 'rgba(255, 100, 100, 0.3)');
        energyGradient.addColorStop(0.5, 'rgba(255, 50, 50, 0.5)');
        energyGradient.addColorStop(1, 'rgba(255, 0, 0, 0.1)');
        
        ctx.strokeStyle = energyGradient;
        ctx.lineWidth = 15 * energyPulse;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw outer glow for energy field
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 25 * energyPulse;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Draw main laser beam with enhanced glow
        ctx.beginPath();
        ctx.moveTo(playerX, playerY);
        ctx.lineTo(this.laserEndpoint.x, this.laserEndpoint.y);
        
        // Create gradient for main laser effect
        const gradient = ctx.createLinearGradient(
            playerX, playerY,
            this.laserEndpoint.x, this.laserEndpoint.y
        );
        gradient.addColorStop(0, 'rgba(255, 50, 50, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(0.7, 'rgba(255, 100, 100, 0.9)');
        gradient.addColorStop(1, 'rgba(255, 200, 200, 0.3)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 5 * pulse;
        ctx.stroke();
        
        // Add intense glow effect
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 30 * pulse;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Draw core beam with bright white center
        ctx.beginPath();
        ctx.moveTo(playerX, playerY);
        ctx.lineTo(this.laserEndpoint.x, this.laserEndpoint.y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 * pulse;
        ctx.stroke();
        
        // Draw endpoint explosion effect
        ctx.beginPath();
        ctx.arc(this.laserEndpoint.x, this.laserEndpoint.y, 10 * pulse, 0, Math.PI * 2);
        const endpointGradient = ctx.createRadialGradient(
            this.laserEndpoint.x, this.laserEndpoint.y, 0,
            this.laserEndpoint.x, this.laserEndpoint.y, 10 * pulse
        );
        endpointGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        endpointGradient.addColorStop(0.5, 'rgba(255, 100, 100, 0.8)');
        endpointGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = endpointGradient;
        ctx.fill();
        
        // Add glow to endpoint
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20 * pulse;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Draw particle sparks along the beam
        const beamLength = Math.sqrt(
            Math.pow(this.laserEndpoint.x - playerX, 2) +
            Math.pow(this.laserEndpoint.y - playerY, 2)
        );
        const beamAngle = Math.atan2(
            this.laserEndpoint.y - playerY,
            this.laserEndpoint.x - playerX
        );
        
        // Add sparks at regular intervals along the beam
        for (let i = 0; i < beamLength; i += 30) {
            // Only show some sparks for performance
            if (Math.random() > 0.3) continue;
            
            const sparkX = playerX + Math.cos(beamAngle) * i;
            const sparkY = playerY + Math.sin(beamAngle) * i;
            
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