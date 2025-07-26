class Healer extends Enemy {
    constructor(x, y) {
        super(x, y, 12, '#FF00FF', 8, 5);
        this.maxHealth = 30;
        this.health = this.maxHealth;
        this.healRadius = 100;
        this.healAmount = 1;
        this.healInterval = 2000;
        this.lastHeal = 0;
        this.shieldRadius = 60;
        this.deathAnimation = 0;
        this.isDying = false;
        this.healPulse = 0;
        this.energyField = 0;
    }

    update(player, currentTime) {
        if (this.isDying) {
            this.deathAnimation += 0.08;
            return null;
        }

        if (!this.activated) return null;

        this.healPulse += 0.1;
        this.energyField += 0.05;

        // Move away from player
        const dx = this.position.x - player.position.x;
        const dy = this.position.y - player.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;
            this.position.x += moveX;
            this.position.y += moveY;
        }

        // Heal nearby enemies
        if (currentTime - this.lastHeal > this.healInterval) {
            this.lastHeal = currentTime;
            // Healing is handled in game.js
        }

        // **PROJECTILE ATTACK - Basic shooting when player is in range**
        const shootRange = 200;
        const shootCooldown = 90; // 1.5 seconds
        
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
                '#FF00FF', // Pink color
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