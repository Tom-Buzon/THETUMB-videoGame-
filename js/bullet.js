class Bullet {
    constructor(x, y, vx, vy, damage, color, size, source = 'player') {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(vx, vy);
        this.damage = damage;
        this.color = color;
        this.size = size;
        this.source = source;
        this.life = 100;
        this.maxLife = 100;
        this.trail = [];
        this.maxTrailLength = 8;
        this.trailAlpha = 0.7;
        this.muzzleFlash = 5;
        this.impactSparks = [];
        this.glowIntensity = 1;
        this.trailColor = this.getTrailColor();
    }

    getTrailColor() {
        // Color-coded trails based on damage source
        const trailColors = {
            'player': '#00ffff',
            'enemy': '#ff4444',
            'exploder': '#ff6600',
            'charger': '#ff0000',
            'shooter': '#44ff44',
            'sniper': '#8844ff',
            'healer': '#ff00ff',
            'swarmer': '#ff6600'
        };
        
        return trailColors[this.source] || this.color;
    }

    update() {
        // Update trail
        this.trail.unshift({
            x: this.position.x,
            y: this.position.y,
            size: this.size,
            alpha: this.trailAlpha
        });
        
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
        
        // Update trail alpha for fade effect
        this.trail.forEach((segment, index) => {
            segment.alpha = this.trailAlpha * (1 - index / this.maxTrailLength);
        });
        
        // Update muzzle flash
        if (this.muzzleFlash > 0) {
            this.muzzleFlash--;
        }
        
        // Update glow
        this.glowIntensity = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
        
        // Update position
        this.position = this.position.add(this.velocity);
        this.life--;
        
        return this.life <= 0;
    }

    addImpactSparks(x, y) {
        // Create impact sparks on collision
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.impactSparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 10,
                maxLife: 10,
                color: this.color,
                size: 1 + Math.random() * 2
            });
        }
    }

    updateImpactSparks() {
        this.impactSparks.forEach(spark => {
            spark.x += spark.vx;
            spark.y += spark.vy;
            spark.life--;
            spark.vx *= 0.95;
            spark.vy *= 0.95;
        });
        
        this.impactSparks = this.impactSparks.filter(spark => spark.life > 0);
    }

    render(ctx) {
        // Render trail
        this.trail.forEach((segment, index) => {
            const alpha = segment.alpha * (1 - index / this.maxTrailLength);
            const size = segment.size * (1 - index / (this.maxTrailLength * 1.5));
            
            // Glowing trail
            ctx.shadowColor = this.trailColor;
            ctx.shadowBlur = 5 * alpha;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.trailColor;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        });
        
        // Render muzzle flash
        if (this.muzzleFlash > 0) {
            const flashAlpha = this.muzzleFlash / 5;
            const flashSize = this.size * 3 * flashAlpha;
            
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10 * flashAlpha;
            ctx.globalAlpha = flashAlpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(
                this.position.x - this.velocity.x * 2,
                this.position.y - this.velocity.y * 2,
                flashSize,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
        
        // Render bullet with glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8 * this.glowIntensity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner bright core
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Render impact sparks
        this.impactSparks.forEach(spark => {
            const alpha = spark.life / spark.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = spark.color;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, spark.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // **ENHANCED BULLET EFFECTS**
        
        // Energy ring around bullet
        const ringSize = this.size + 2 + Math.sin(Date.now() * 0.02) * 1;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, ringSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // **SOURCE INDICATOR**
        if (this.source === 'player') {
            // Player bullets have blue-white core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Enemy bullets have red-orange core
            ctx.fillStyle = '#ff6666';
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // **VELOCITY INDICATOR**
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > 5) {
            // High velocity streak
            const streakLength = speed * 2;
            const streakX = this.position.x - (this.velocity.x / speed) * streakLength;
            const streakY = this.position.y - (this.velocity.y / speed) * streakLength;
            
            const gradient = ctx.createLinearGradient(
                streakX, streakY,
                this.position.x, this.position.y
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, this.color);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.size * 2;
            ctx.beginPath();
            ctx.moveTo(streakX, streakY);
            ctx.lineTo(this.position.x, this.position.y);
            ctx.stroke();
        }
    }

    checkCollision(obj) {
        const dx = this.position.x - obj.position.x;
        const dy = this.position.y - obj.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size + obj.size;
    }
}