import { ENEMY_CONFIG } from '../config.js';
import { Vector2D } from '../vector2d.js';
import { Bullet } from '../bullet.js';

export class Sniper {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = ENEMY_CONFIG.SNIPER.SIZE;
        this.health = ENEMY_CONFIG.SNIPER.HEALTH;
        this.maxHealth = ENEMY_CONFIG.SNIPER.MAX_HEALTH;
        this.speed = ENEMY_CONFIG.SNIPER.SPEED;
        this.color = ENEMY_CONFIG.SNIPER.COLOR;
        this.activated = false;
        this.shootCooldown = 0;
        this.shootRange = ENEMY_CONFIG.SNIPER.SHOOT_RANGE;
        this.retreatDistance = 800;
        this.deathAnimation = 0;
        this.isDying = false;
        this.scopeGlow = 0;
        this.laserIntensity = 0;
    }

    update(player) {
        if (this.isDying) {
            this.deathAnimation += 0.05;
            return null;
        }

        if (!this.activated) return null;

        const distanceToPlayer = Math.sqrt(
            (player.position.x - this.position.x) ** 2 +
            (player.position.y - this.position.y) ** 2
        );

        // Movement logic - keep distance
        const direction = new Vector2D(
            player.position.x - this.position.x,
            player.position.y - this.position.y
        ).normalize();

        if (distanceToPlayer < this.retreatDistance) {
            // Retreat from player
            this.velocity = direction.multiply(-this.speed);
        } else if (distanceToPlayer > this.shootRange) {
            // Move closer to player
            this.velocity = direction.multiply(this.speed);
        } else {
            // Stay still and shoot
            this.velocity = new Vector2D(0, 0);
        }

        this.position = this.position.add(this.velocity);

        // Keep in bounds
        this.position.x = Math.max(this.size, Math.min(800 - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(600 - this.size, this.position.y));

        // Update targeting effects
        if (distanceToPlayer <= this.shootRange) {
            this.scopeGlow = Math.min(this.scopeGlow + 0.1, 1);
            this.laserIntensity = Math.min(this.laserIntensity + 0.05, 1);
        } else {
            this.scopeGlow = Math.max(this.scopeGlow - 0.1, 0);
            this.laserIntensity = Math.max(this.laserIntensity - 0.05, 0);
        }

        // Shooting
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        if (distanceToPlayer <= this.shootRange && this.shootCooldown <= 0) {
            this.shootCooldown = ENEMY_CONFIG.SNIPER.SHOOT_COOLDOWN; // 2 seconds
            
            const bulletDirection = direction;
            return new Bullet(
                this.position.x + bulletDirection.x * 25,
                this.position.y + bulletDirection.y * 25,
                bulletDirection.x * ENEMY_CONFIG.SNIPER.BULLET_SPEED,
                bulletDirection.y * ENEMY_CONFIG.SNIPER.BULLET_SPEED,
                ENEMY_CONFIG.SNIPER.BULLET_DAMAGE, // Damage
                this.color,
                4,
                'enemy'
            );
        }

        return null;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        
        // **DAMAGE FLASH EFFECT**
        if (this.health <= 0 && !this.isDying) {
            this.isDying = true;
            this.deathAnimation = 0;
            
            // **ENHANCED DEATH EFFECTS**
            if (window.game && window.game.particleSystem) {
                // Create death explosion
                window.game.particleSystem.addExplosion(
                    this.position.x,
                    this.position.y,
                    this.color,
                    18,
                    1.2
                );
                
                // Add dissolve effect
                window.game.particleSystem.addDissolveEffect(
                    this.position.x,
                    this.position.y,
                    this.color,
                    this.size
                );
                
                // Add energy drain
                window.game.particleSystem.addEnergyDrain(
                    this.position.x,
                    this.position.y,
                    this.color
                );
                
                // Screen shake
                window.game.particleSystem.addScreenShake(3);
            }
        }
    }

    render(ctx) {
        if (this.isDying) {
            // **SNIPER SCOPE SHATTER EFFECT**
            const alpha = 1 - this.deathAnimation;
            if (alpha <= 0) return;
            
            ctx.globalAlpha = alpha;
            
            // Shattered scope pieces
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 * i) / 6;
                const distance = this.deathAnimation * 40;
                const x = this.position.x + Math.cos(angle) * distance;
                const y = this.position.y + Math.sin(angle) * distance;
                
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Glass shard effect
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - 3, y - 3);
                ctx.lineTo(x + 3, y + 3);
                ctx.moveTo(x + 3, y - 3);
                ctx.lineTo(x - 3, y + 3);
                ctx.stroke();
            }
            
            ctx.globalAlpha = 1;
            return;
        }

        // **ENHANCED SNIPER WITH SPACE DOOM EFFECTS**
        
        // Scope glow effect
        if (this.scopeGlow > 0) {
            ctx.shadowColor = '#8844ff';
            ctx.shadowBlur = 15 * this.scopeGlow;
        }
        
        // Main body with scope texture
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.size
        );
        gradient.addColorStop(0, '#aa66ff');
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, '#442288');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // **ENHANCED SNIPER SCOPE**
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + this.scopeGlow * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // **SCOPE CROSSHAIRS**
        ctx.strokeStyle = `rgba(255, 0, 0, ${0.3 + this.scopeGlow * 0.7})`;
        ctx.lineWidth = 1;
        
        // Horizontal crosshair
        ctx.beginPath();
        ctx.moveTo(this.position.x - this.size - 8, this.position.y);
        ctx.lineTo(this.position.x + this.size + 8, this.position.y);
        ctx.stroke();
        
        // Vertical crosshair
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y - this.size - 8);
        ctx.lineTo(this.position.x, this.position.y + this.size + 8);
        ctx.stroke();
        
        // **TARGETING LASER**
        const player = window.game ? window.game.player : null;
        if (player && this.activated) {
            const distance = Math.sqrt(
                (player.position.x - this.position.x) ** 2 +
                (player.position.y - this.position.y) ** 2
            );
            
            if (distance <= this.shootRange) {
                // Laser sight
                ctx.strokeStyle = `rgba(255, 0, 0, ${0.2 + this.laserIntensity * 0.3})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y);
                ctx.lineTo(player.position.x, player.position.y);
                ctx.stroke();
                
                // Laser dots
                ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + this.laserIntensity * 0.5})`;
                for (let i = 0; i < 5; i++) {
                    const t = i / 5;
                    const x = this.position.x + (player.position.x - this.position.x) * t;
                    const y = this.position.y + (player.position.y - this.position.y) * t;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Health bar
        const barWidth = 40;
        const barHeight = 4;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size - 10;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
        
        // **DAMAGE INDICATOR**
        if (this.health < this.maxHealth) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}