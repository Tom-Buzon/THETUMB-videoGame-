import { ENEMY_CONFIG } from '../config.js';
import { Vector2D } from '../vector2d.js';

export class Charger {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = ENEMY_CONFIG.CHARGER.SIZE;
        this.health = ENEMY_CONFIG.CHARGER.HEALTH;
        this.maxHealth = ENEMY_CONFIG.CHARGER.MAX_HEALTH;
        this.speed = ENEMY_CONFIG.CHARGER.SPEED;
        this.color = ENEMY_CONFIG.CHARGER.COLOR;
        this.activated = false;
        this.chargeCooldown = 0;
        this.chargeSpeed = ENEMY_CONFIG.CHARGER.CHARGE_SPEED;
        this.isCharging = false;
        this.chargeDirection = new Vector2D(0, 0);
        this.chargeDuration = 0;
        this.maxChargeDuration = ENEMY_CONFIG.CHARGER.MAX_CHARGE_DURATION;
        this.deathAnimation = 0;
        this.isDying = false;
        this.chargeGlow = 0;
    }

    update(player) {
        if (this.isDying) {
            this.deathAnimation += 0.08;
            return null;
        }

        if (!this.activated) return null;

        const distanceToPlayer = Math.sqrt(
            (player.position.x - this.position.x) ** 2 +
            (player.position.y - this.position.y) ** 2
        );

        if (this.isCharging) {
            // Charging state
            this.position = this.position.add(this.chargeDirection.multiply(this.chargeSpeed));
            this.chargeDuration++;
            
            // **CHARGE COLLISION DAMAGE - Check collision with player during charge**
            const distanceToPlayer = Math.sqrt(
                (player.position.x - this.position.x) ** 2 +
                (player.position.y - this.position.y) ** 2
            );
            
            if (distanceToPlayer < this.size + player.size) {
                player.takeDamage(ENEMY_CONFIG.CHARGER.CHARGE_DAMAGE, 'charger'); // Charger charge damage
                // End charge after hitting player
                this.isCharging = false;
                this.chargeCooldown = ENEMY_CONFIG.CHARGER.CHARGE_COOLDOWN;
                this.chargeDuration = 0;
            }
            
            if (this.chargeDuration >= this.maxChargeDuration) {
                this.isCharging = false;
                this.chargeCooldown = ENEMY_CONFIG.CHARGER.CHARGE_COOLDOWN;
                this.chargeDuration = 0;
            }
        } else if (this.chargeCooldown > 0) {
            // Cooldown state
            this.chargeCooldown--;
        } else {
            // Normal movement
            const direction = new Vector2D(
                player.position.x - this.position.x,
                player.position.y - this.position.y
            ).normalize();
            
            this.velocity = direction.multiply(this.speed);
            this.position = this.position.add(this.velocity);
            
            // Start charging when close enough
            if (distanceToPlayer < 700) {
                this.isCharging = true;
                this.chargeDirection = direction;
                this.chargeDuration = 0;
            }
        }

        // Update charge glow
        if (this.isCharging) {
            this.chargeGlow = Math.min(this.chargeGlow + 0.2, 1);
        } else {
            this.chargeGlow = Math.max(this.chargeGlow - 0.1, 0);
        }

        // Keep in bounds
        this.position.x = Math.max(this.size, Math.min(1400 - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(1000 - this.size, this.position.y));

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
                // Create large explosion for charger
                window.game.particleSystem.addExplosion(
                    this.position.x,
                    this.position.y,
                    this.color,
                    20,
                    1.5
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
                window.game.particleSystem.addScreenShake(4);
            }
        }
    }

    render(ctx) {
        if (this.isDying) {
            // **DEATH EXPLOSION ANIMATION**
            const alpha = 1 - this.deathAnimation;
            if (alpha <= 0) return;
            
            ctx.globalAlpha = alpha;
            
            // Explosion rings
            for (let i = 0; i < 3; i++) {
                const radius = this.size + (this.deathAnimation * 50 * (i + 1));
                const ringAlpha = alpha * (1 - this.deathAnimation * 0.5);
                
                ctx.strokeStyle = `rgba(255, 68, 68, ${ringAlpha})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Debris
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                const distance = this.deathAnimation * 30;
                const x = this.position.x + Math.cos(angle) * distance;
                const y = this.position.y + Math.sin(angle) * distance;
                
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.globalAlpha = 1;
            return;
        }

        // **ENHANCED CHARGER WITH SPACE DOOM EFFECTS**
        
        // Charge glow effect
        if (this.chargeGlow > 0) {
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20 * this.chargeGlow;
        }
        
        // Main body with metallic texture
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.size
        );
        gradient.addColorStop(0, '#ff6666');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, '#cc0000');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // **ARMOR PLATES**
        ctx.strokeStyle = '#aa0000';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 * i) / 4;
            const x1 = this.position.x + Math.cos(angle) * (this.size * 0.7);
            const y1 = this.position.y + Math.sin(angle) * (this.size * 0.7);
            const x2 = this.position.x + Math.cos(angle) * this.size;
            const y2 = this.position.y + Math.sin(angle) * this.size;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // **CHARGE INDICATOR**
        if (this.chargeGlow > 0) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.chargeGlow})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size + 5 + (this.chargeGlow * 5), 0, Math.PI * 2);
            ctx.stroke();
            
            // Lightning effect
            ctx.strokeStyle = `rgba(255, 255, 0, ${this.chargeGlow * 0.7})`;
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const x1 = this.position.x + Math.cos(angle) * (this.size + 5);
                const y1 = this.position.y + Math.sin(angle) * (this.size + 5);
                const x2 = this.position.x + Math.cos(angle) * (this.size + 15);
                const y2 = this.position.y + Math.sin(angle) * (this.size + 15);
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
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
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}