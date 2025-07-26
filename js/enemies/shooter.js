class Shooter {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = 18;
        this.health = 50;
        this.maxHealth = 50;
        this.speed = 1.5;
        this.color = '#44ff44';
        this.activated = false;
        this.shootCooldown = 0;
        this.shootRange = 200;
        this.deathAnimation = 0;
        this.isDying = false;
        this.scanlineOffset = 0;
    }

    update(player) {
        if (this.isDying) {
            this.deathAnimation += 0.1;
            this.scanlineOffset += 0.5;
            return null;
        }

        if (!this.activated) return null;

        this.scanlineOffset += 0.2;

        // Movement - maintain distance
        const distanceToPlayer = Math.sqrt(
            (player.position.x - this.position.x) ** 2 +
            (player.position.y - this.position.y) ** 2
        );

        const direction = new Vector2D(
            player.position.x - this.position.x,
            player.position.y - this.position.y
        ).normalize();

        if (distanceToPlayer < 100) {
            // Move away from player
            this.velocity = direction.multiply(-this.speed);
        } else if (distanceToPlayer > 150) {
            // Move closer to player
            this.velocity = direction.multiply(this.speed);
        } else {
            this.velocity = new Vector2D(0, 0);
        }

        this.position = this.position.add(this.velocity);

        // Keep in bounds
        this.position.x = Math.max(this.size, Math.min(800 - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(600 - this.size, this.position.y));

        // Shooting
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        if (distanceToPlayer <= this.shootRange && this.shootCooldown <= 0) {
            this.shootCooldown = 60; // 1 second
            
            const direction = new Vector2D(
                player.position.x - this.position.x,
                player.position.y - this.position.y
            ).normalize();
            
            return new Bullet(
                this.position.x + direction.x * 25,
                this.position.y + direction.y * 25,
                direction.x * 5,
                direction.y * 5,
                15, // Damage
                '#44ff44',
                3,
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
                    15,
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
            // **GLITCH DEATH ANIMATION**
            const alpha = 1 - this.deathAnimation;
            if (alpha <= 0) return;
            
            ctx.globalAlpha = alpha;
            
            // Glitch effect
            for (let i = 0; i < 5; i++) {
                const glitchX = this.position.x + (Math.random() - 0.5) * 20;
                const glitchY = this.position.y + (Math.random() - 0.5) * 20;
                
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(glitchX, glitchY, this.size * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Scanlines
            ctx.strokeStyle = `rgba(0, 255, 0, ${alpha * 0.5})`;
            ctx.lineWidth = 1;
            for (let i = 0; i < 10; i++) {
                const y = this.position.y - this.size + (i * this.size * 2 / 10);
                ctx.beginPath();
                ctx.moveTo(this.position.x - this.size, y);
                ctx.lineTo(this.position.x + this.size, y);
                ctx.stroke();
            }
            
            ctx.globalAlpha = 1;
            return;
        }

        // **ENHANCED SHOOTER WITH SPACE DOOM EFFECTS**
        
        // Digital camouflage effect
        const camoPattern = Math.sin(this.scanlineOffset) * 0.3 + 0.7;
        
        // Main body with digital texture
        const gradient = ctx.createLinearGradient(
            this.position.x - this.size, this.position.y - this.size,
            this.position.x + this.size, this.position.y + this.size
        );
        gradient.addColorStop(0, '#66ff66');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, '#228822');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // **SCANLINE EFFECT**
        ctx.strokeStyle = `rgba(0, 255, 0, ${camoPattern * 0.3})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const y = this.position.y - this.size + (i * this.size * 2 / 6);
            ctx.beginPath();
            ctx.moveTo(this.position.x - this.size, y);
            ctx.lineTo(this.position.x + this.size, y);
            ctx.stroke();
        }
        
        // **ENHANCED CANNON WITH GLOW**
        ctx.shadowColor = '#44ff44';
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.position.x + 15, this.position.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // **CROSSHAIR TARGETING**
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.position.x - 8, this.position.y - 8);
        ctx.lineTo(this.position.x + 8, this.position.y + 8);
        ctx.moveTo(this.position.x + 8, this.position.y - 8);
        ctx.lineTo(this.position.x - 8, this.position.y + 8);
        ctx.stroke();
        
        // **TARGETING LASER**
        const player = window.game ? window.game.player : null;
        if (player && this.activated) {
            const distance = Math.sqrt(
                (player.position.x - this.position.x) ** 2 +
                (player.position.y - this.position.y) ** 2
            );
            
            if (distance <= this.shootRange) {
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y);
                ctx.lineTo(player.position.x, player.position.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Health bar
        const barWidth = 35;
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