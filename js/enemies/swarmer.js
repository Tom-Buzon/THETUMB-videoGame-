import { ENEMY_CONFIG } from '../config.js';
import { Vector2D } from '../vector2d.js';

export class Swarmer {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = ENEMY_CONFIG.SWARMER.SIZE;
        this.health = ENEMY_CONFIG.SWARMER.HEALTH;
        this.maxHealth = ENEMY_CONFIG.SWARMER.MAX_HEALTH;
        this.speed = ENEMY_CONFIG.SWARMER.SPEED;
        this.color = ENEMY_CONFIG.SWARMER.COLOR;
        this.activated = false;
        this.deathAnimation = 0;
        this.isDying = false;
        this.pulsePhase = 0;
    }

    update(player) {
        if (this.isDying) {
            this.deathAnimation += 0.1;
            return null;
        }

        if (!this.activated) return null;

        // Update pulse effect
        this.pulsePhase += 0.2;

        // Simple chase behavior
        const direction = new Vector2D(
            player.position.x - this.position.x,
            player.position.y - this.position.y
        ).normalize();

        this.velocity = direction.multiply(this.speed);
        this.position = this.position.add(this.velocity);

        // Keep in bounds
        this.position.x = Math.max(this.size, Math.min(1400 - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(1000 - this.size, this.position.y));

        // **MELEE DAMAGE - Check collision with player**
        const distanceToPlayer = Math.sqrt(
            (player.position.x - this.position.x) ** 2 +
            (player.position.y - this.position.y) ** 2
        );
        
        if (distanceToPlayer < this.size + player.size) {
            player.takeDamage(ENEMY_CONFIG.SWARMER.HEALTH, 'swarmer'); // Swarmer melee damage
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
                    12,
                    1
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
                window.game.particleSystem.addScreenShake(2);
            }
        }
    }

    render(ctx) {
        if (this.isDying) {
            // **DEATH DISSOLVE ANIMATION**
            const alpha = 1 - this.deathAnimation;
            if (alpha <= 0) return;
            
            ctx.globalAlpha = alpha;
            
            // Dissolve particles
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const offset = this.deathAnimation * 20;
                const x = this.position.x + Math.cos(angle) * offset;
                const y = this.position.y + Math.sin(angle) * offset;
                
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.globalAlpha = 1;
            return;
        }

        // **ENHANCED SWARMER WITH SPACE DOOM EFFECTS**
        
        // Pulsing glow effect
        const pulseIntensity = 0.7 + Math.sin(this.pulsePhase) * 0.3;
        
        // Outer glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10 * pulseIntensity;
        
        // Main body with metallic texture
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.size
        );
        gradient.addColorStop(0, '#ff8844');
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, '#cc3300');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // **ENHANCED EYES WITH GLOW**
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.position.x - 4, this.position.y - 3, 2, 0, Math.PI * 2);
        ctx.arc(this.position.x + 4, this.position.y - 3, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // **DIGITAL NOISE PATTERN**
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 8; i++) {
            const noiseX = this.position.x + (Math.random() - 0.5) * this.size * 1.5;
            const noiseY = this.position.y + (Math.random() - 0.5) * this.size * 1.5;
            ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            ctx.fillRect(noiseX, noiseY, 1, 1);
        }
        ctx.globalAlpha = 1;
        
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