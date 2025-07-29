import { ENEMY_CONFIG, ROOM_CONFIG } from '../config.js';
import { Enemy } from '../enemy.js';
import { Vector2D } from '../vector2d.js';
import { Bullet } from '../bullet.js';

export class Healer extends Enemy {
    constructor(x, y, enemies = []) {
        super(x, y);
        this.size = ENEMY_CONFIG.HEALER.SIZE;
        this.color = ENEMY_CONFIG.HEALER.COLOR;
        this.speed = ENEMY_CONFIG.HEALER.SPEED;
        this.maxHealth = ENEMY_CONFIG.HEALER.MAX_HEALTH;
        this.health = this.maxHealth;
        this.healRadius = ENEMY_CONFIG.HEALER.HEAL_RANGE;
        this.healAmount = ENEMY_CONFIG.HEALER.HEAL_AMOUNT;
        this.healInterval = ENEMY_CONFIG.HEALER.HEAL_COOLDOWN;
        this.lastHeal = 0;
        this.shieldRadius = 60;
        this.deathAnimation = 0;
        this.isDying = false;
        this.healPulse = 0;
        this.energyField = 0;
        
        // Protection field properties
        this.protectionRadius = 80;
        this.protectedEnemy = null;
        this.originalEnemyVulnerability = null;
        
        // Choose a random enemy to protect (excluding self and other healers)
        this.chooseProtectedEnemy(enemies);
    }
    
    chooseProtectedEnemy(enemies) {
        // Filter out self and other healers
        const validEnemies = enemies.filter(enemy => 
            enemy !== this && !(enemy instanceof Healer) && enemy.health > 0
        );
        
        if (validEnemies.length > 0) {
            // Choose a random enemy to protect
            this.protectedEnemy = validEnemies[Math.floor(Math.random() * validEnemies.length)];
            // Store the original vulnerability state
            this.originalEnemyVulnerability = this.protectedEnemy.takeDamage;
            // Make the enemy invulnerable by overriding its takeDamage method
            this.protectedEnemy.takeDamage = (amount) => {
                // Enemy is invulnerable while healer is alive
                return;
            };
        }
    }
    
    // Restore the protected enemy's vulnerability when the healer dies
    restoreEnemyVulnerability() {
        if (this.protectedEnemy && this.originalEnemyVulnerability) {
            this.protectedEnemy.takeDamage = this.originalEnemyVulnerability;
        }
    }

    update(player, currentTime) {
        if (this.isDying) {
            this.deathAnimation += 0.08;
            return null;
        }

        if (!this.activated) return null;

        this.healPulse += 0.1;
        this.energyField += 0.05;

        // Canvas boundary checking (1400x1000)
        this.position.x = Math.max(this.size, Math.min(ROOM_CONFIG.CANVAS_WIDTH - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(ROOM_CONFIG.CANVAS_HEIGHT - this.size, this.position.y));

        // Move toward protected enemy instead of away from player
        if (this.protectedEnemy) {
            const dx = this.protectedEnemy.position.x - this.position.x;
            const dy = this.protectedEnemy.position.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Stay near the protected enemy (within a certain range)
            if (distance > 30) {
                const moveX = (dx / distance) * this.speed * 0.5; // Move slower toward protected enemy
                const moveY = (dy / distance) * this.speed * 0.5;
                this.position.x += moveX;
                this.position.y += moveY;
            }
        } else {
            // Move away from player if no protected enemy
            const dx = this.position.x - player.position.x;
            const dy = this.position.y - player.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 400) {
                const moveX = (dx / distance) * this.speed;
                const moveY = (dy / distance) * this.speed;
                this.position.x += moveX;
                this.position.y += moveY;
            }
        }

        // Heal nearby enemies
        if (currentTime - this.lastHeal > this.healInterval) {
            this.lastHeal = currentTime;
            // Healing is handled in game.js
        }

        // **PROJECTILE ATTACK - Basic shooting when player is in range**
        const shootRange = 800;
        const shootCooldown = 30; // 0.5 seconds
        
        if (distance <= shootRange && Math.random() < 0.02) { // Random chance to shoot
            const direction = new Vector2D(
                player.position.x - this.position.x,
                player.position.y - this.position.y
            ).normalize();
            
            return new Bullet(
                this.position.x + direction.x * 15,
                this.position.y + direction.y * 15,
                direction.x * 4,
                direction.y * 4,
                15, // Damage
                this.color, // Use enemy color
                2, // Size
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
            
            // Restore the protected enemy's vulnerability when the healer dies
            this.restoreEnemyVulnerability();
            
            // **ENHANCED DEATH EFFECTS**
            if (typeof game !== 'undefined' && game && game.particleSystem) {
                // Create death explosion
                game.particleSystem.addExplosion(
                    this.position.x,
                    this.position.y,
                    this.color,
                    12,
                    1
                );
                
                // Add dissolve effect
                game.particleSystem.addDissolveEffect(
                    this.position.x,
                    this.position.y,
                    this.color,
                    this.size
                );
                
                // Add energy drain
                game.particleSystem.addEnergyDrain(
                    this.position.x,
                    this.position.y,
                    this.color
                );
                
                // Screen shake
                game.particleSystem.addScreenShake(2);
            }
        }
    }

    render(ctx) {
        if (this.isDying) {
            // **HEALER DISSOLVE EFFECT**
            const alpha = 1 - this.deathAnimation;
            if (alpha <= 0) return;
            
            ctx.globalAlpha = alpha;
            
            // Healing energy dispersal
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 * i) / 12;
                const distance = this.deathAnimation * 60;
                const x = this.position.x + Math.cos(angle) * distance;
                const y = this.position.y + Math.sin(angle) * distance;
                
                ctx.fillStyle = `rgba(255, 0, 255, ${alpha * 0.5})`;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.globalAlpha = 1;
            return;
        }

        // **ENHANCED HEALER WITH SPACE DOOM EFFECTS**
        
        // Render protection field around protected enemy
        if (this.protectedEnemy) {
            const protectionAlpha = 0.4 + Math.sin(this.energyField * 2) * 0.2;
            ctx.strokeStyle = `rgba(128, 0, 128, ${protectionAlpha})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.arc(this.protectedEnemy.position.x, this.protectedEnemy.position.y, this.protectionRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Energy field effect
        const fieldAlpha = 0.3 + Math.sin(this.energyField) * 0.2;
        ctx.strokeStyle = `rgba(255, 0, 255, ${fieldAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.shieldRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Healing aura
        const healAlpha = 0.5 + Math.sin(this.healPulse) * 0.3;
        ctx.fillStyle = `rgba(255, 0, 255, ${healAlpha * 0.2})`;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.healRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Main body with energy core
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.size
        );
        gradient.addColorStop(0, '#ff66ff');
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, '#cc00cc');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // **ENERGY CORE**
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // **HEALING PARTICLES**
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + this.healPulse;
            const distance = this.size + 5 + Math.sin(this.healPulse * 2) * 3;
            const x = this.position.x + Math.cos(angle) * distance;
            const y = this.position.y + Math.sin(angle) * distance;
            
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // **PLUS SIGN WITH GLOW**
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.position.x - 5, this.position.y);
        ctx.lineTo(this.position.x + 5, this.position.y);
        ctx.moveTo(this.position.x, this.position.y - 5);
        ctx.lineTo(this.position.x, this.position.y + 5);
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // **HEALING WAVES**
        for (let i = 0; i < 3; i++) {
            const waveRadius = (this.healRadius * 0.5) + (i * 10) + (Math.sin(this.healPulse + i) * 5);
            const waveAlpha = 0.3 - (i * 0.1);
            
            ctx.strokeStyle = `rgba(255, 0, 255, ${waveAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Health bar
        const barWidth = 30;
        const barHeight = 3;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size - 8;
        
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