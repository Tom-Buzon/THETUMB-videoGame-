import { ENEMY_CONFIG, ROOM_CONFIG } from '../config.js';
import { Enemy } from '../enemy.js';
import { Vector2D } from '../vector2d.js';
import { Bullet } from '../bullet.js';

export class Protector extends Enemy {
    // Check if an enemy is protected by a living protector
    static isProtected(enemy, allEnemies) {
        // Look for a living protector that has created a shield
        for (const e of allEnemies) {
            if (e instanceof Protector && e.health > 0 && e.protectedEnemy) {
                // Check if the enemy is within the protection radius of the protected enemy
                const dx = enemy.position.x - e.protectedEnemy.position.x;
                const dy = enemy.position.y - e.protectedEnemy.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= e.protectionRadius) {
                    return true;
                }
            }
        }
        return false;
    }
    constructor(x, y, enemies = []) {
        super(x, y);
        this.size = ENEMY_CONFIG.HEALER.SIZE;
        this.color = ENEMY_CONFIG.HEALER.COLOR;
        this.speed = ENEMY_CONFIG.HEALER.SPEED;
        this.maxHealth = ENEMY_CONFIG.HEALER.MAX_HEALTH;
        this.health = this.maxHealth;
        this.shieldRadius = 60;
        this.energyField = 0;
        
        // Protection field properties
        this.protectionRadius = 80;
        this.protectedEnemy = null;
        
        // Choose a random enemy to protect (excluding self and other protectors)
        this.chooseProtectedEnemy(enemies);
    }
    
    chooseProtectedEnemy(enemies) {
        // Filter out self and other protectors
        const validEnemies = enemies.filter(enemy =>
            enemy !== this && !(enemy instanceof Protector) && enemy.health > 0
        );
        
        console.log(`Protector: Found ${validEnemies.length} valid enemies to protect`);
        
        if (validEnemies.length > 0) {
            // Choose a random enemy to protect
            this.protectedEnemy = validEnemies[Math.floor(Math.random() * validEnemies.length)];
            console.log(`Protector: Now protecting enemy of type ${this.protectedEnemy.constructor.name}`);
        } else {
            console.log("Protector: No valid enemies to protect");
        }
    }

    update(player, currentTime) {
        if (!this.activated) return null;

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

        // **PROJECTILE ATTACK - Basic shooting when player is in range**
        const distanceToPlayer = Math.sqrt(
            Math.pow(player.position.x - this.position.x, 2) + 
            Math.pow(player.position.y - this.position.y, 2)
        );
        const shootRange = 800;
        const shootCooldown = 30; // 0.5 seconds
        
        if (distanceToPlayer <= shootRange && Math.random() < 0.02) { // Random chance to shoot
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
        console.log(`Protector: Taking ${amount} damage, health now ${this.health - amount}`);
        this.health = Math.max(0, this.health - amount);
        
        // Call parent takeDamage method which handles death animation triggering
        super.takeDamage(amount);
    }

    render(ctx) {
        // **PROTECTOR DISSOLVE EFFECT**
        // Removed individual death animation rendering logic as it's now handled by DeathAnimationSystem

        // **ENHANCED PROTECTOR WITH SPACE DOOM EFFECTS**
        
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