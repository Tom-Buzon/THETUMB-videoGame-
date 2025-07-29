import { ENEMY_CONFIG } from '../config.js';
import { Vector2D } from '../vector2d.js';

export class Exploder {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = ENEMY_CONFIG.EXPLODER.SIZE;
        this.health = ENEMY_CONFIG.EXPLODER.HEALTH;
        this.maxHealth = ENEMY_CONFIG.EXPLODER.MAX_HEALTH;
        this.speed = ENEMY_CONFIG.EXPLODER.SPEED;
        this.color = ENEMY_CONFIG.EXPLODER.COLOR;
        this.activated = false;
        this.explosionRadius = ENEMY_CONFIG.EXPLODER.EXPLOSION_RADIUS;
        this.deathAnimation = 0;
        this.isDying = false;
        this.pulsePhase = 0;
        this.glowIntensity = 0;
        this.warningBeep = 0;
    }

    update(player) {
        if (this.isDying) {
            this.deathAnimation += 0.15;
            return null;
        }

        if (!this.activated) return null;

        this.pulsePhase += 0.3;
        this.warningBeep += 0.2;

        // Chase player
        const direction = new Vector2D(
            player.position.x - this.position.x,
            player.position.y - this.position.y
        ).normalize();

        this.velocity = direction.multiply(this.speed);
        this.position = this.position.add(this.velocity);

        // Keep in bounds
        this.position.x = Math.max(this.size, Math.min(1400 - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(1000 - this.size, this.position.y));

        // Update glow based on proximity to player
        const distanceToPlayer = Math.sqrt(
            (player.position.x - this.position.x) ** 2 +
            (player.position.y - this.position.y) ** 2
        );
        
        if (distanceToPlayer < this.explosionRadius) {
            this.glowIntensity = Math.min(this.glowIntensity + 0.1, 1);
        } else {
            this.glowIntensity = Math.max(this.glowIntensity - 0.05, 0);
        }

        return null;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        
        // **DAMAGE FLASH EFFECT**
        if (this.health <= 0 && !this.isDying) {
            this.isDying = true;
            this.deathAnimation = 0.15;
            this.explode();
        }
    }

    explode() {
        // **ENHANCED EXPLOSION EFFECTS**
        if (window.game && window.game.particleSystem) {
            const particleSystem = window.game.particleSystem;
            
            // Create massive explosion
            particleSystem.addExplosion(
                this.position.x,
                this.position.y,
                '#ff6600',
                30,
                2
            );
            
            // Create shockwave rings
            particleSystem.createShockwave(
                this.position.x,
                this.position.y,
                this.explosionRadius
            );
            
            // Add particle debris with physics
            particleSystem.addDebris(
                this.position.x,
                this.position.y,
                '#ff6600',
                15,
                this.explosionRadius
            );
            
            // Add dynamic lighting flash
            particleSystem.addFlash(
                this.position.x,
                this.position.y,
                this.explosionRadius * 2,
                '#ff6600'
            );
            
            // Add screen shake
            particleSystem.addScreenShake(6);
            
            // Add energy drain effect
            particleSystem.addEnergyDrain(
                this.position.x,
                this.position.y,
                '#ff6600'
            );
            
            // Add dissolve effect
            particleSystem.addDissolveEffect(
                this.position.x,
                this.position.y,
                '#ff6600',
                this.size
            );
        }
        
        // **EXPLOSION DAMAGE - Check if player is in explosion radius**
        const player = window.game ? window.game.player : null;
        if (player) {
            const distanceToPlayer = Math.sqrt(
                (player.position.x - this.position.x) ** 2 +
                (player.position.y - this.position.y) ** 2
            );
            
            if (distanceToPlayer <= this.explosionRadius) {
                // Damage decreases with distance
                const damageMultiplier = 1 - (distanceToPlayer / this.explosionRadius);
                const damage = Math.floor(ENEMY_CONFIG.EXPLODER.EXPLOSION_DAMAGE * damageMultiplier); // Max damage at center
                player.takeDamage(Math.max(damage, 5), 'exploder'); // Minimum 5 damage
            }
        }
    }

    render(ctx) {
        if (this.isDying) {
            // **MASSIVE EXPLOSION ANIMATION**
            const alpha = 1 - this.deathAnimation;
            if (alpha <= 0) return;
            
            ctx.globalAlpha = alpha;
            
            // Multiple explosion rings
            for (let i = 0; i < 5; i++) {
                const radius = (this.explosionRadius * 0.5) + (this.deathAnimation * 80 * (i + 1));
                const ringAlpha = alpha * (1 - this.deathAnimation * 0.3);
                
                ctx.strokeStyle = `rgba(255, 102, 0, ${ringAlpha})`;
                ctx.lineWidth = 4 - i;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Fire particles
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = this.deathAnimation * 100;
                const x = this.position.x + Math.cos(angle) * distance;
                const y = this.position.y + Math.sin(angle) * distance;
                
                ctx.fillStyle = `rgba(255, ${100 + Math.random() * 155}, 0, ${alpha * 0.8})`;
                ctx.beginPath();
                ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.globalAlpha = 1;
            return;
        }

        // **ENHANCED EXPLODER WITH SPACE DOOM EFFECTS**
        
        // Warning glow effect
        if (this.glowIntensity > 0) {
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20 * this.glowIntensity;
        }
        
        // Pulsing body
        const pulseSize = this.size * (1 + Math.sin(this.pulsePhase) * 0.2 * this.glowIntensity);
        
        // Main body with explosive texture
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, pulseSize
        );
        gradient.addColorStop(0, '#ff6666');
        gradient.addColorStop(0.5, '#ff3300');
        gradient.addColorStop(1, '#cc0000');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // **WARNING INDICATOR**
        if (this.glowIntensity > 0) {
            // Warning ring
            ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(this.warningBeep * 3) * 0.5})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, pulseSize + 5, 0, Math.PI * 2);
            ctx.stroke();
            
            // Warning text
            ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + Math.sin(this.warningBeep * 3) * 0.3})`;
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('!', this.position.x, this.position.y + 3);
        }
        
        // **EXPLOSIVE CORE**
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // **DIGITAL TIMER**
        if (this.glowIntensity > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            const timer = Math.floor(10 - (this.glowIntensity * 10));
            ctx.fillText(timer.toString(), this.position.x, this.position.y - 8);
        }
        
        // **ENERGY SPIKES**
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + this.pulsePhase * 0.5;
            const spikeLength = 5 + Math.sin(this.pulsePhase * 2) * 3;
            const x1 = this.position.x + Math.cos(angle) * pulseSize;
            const y1 = this.position.y + Math.sin(angle) * pulseSize;
            const x2 = this.position.x + Math.cos(angle) * (pulseSize + spikeLength);
            const y2 = this.position.y + Math.sin(angle) * (pulseSize + spikeLength);
            
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
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
        
        // **EXPLOSION RADIUS INDICATOR**
        if (this.glowIntensity > 0.5) {
            ctx.strokeStyle = `rgba(255, 0, 0, ${0.3 * this.glowIntensity})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.explosionRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}