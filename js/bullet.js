// Import configuration
import { BULLET_CONFIG, PARTICLE_CONFIG } from './config.js';
import { Vector2D } from './vector2d.js';

export class Bullet {
    constructor(x, y, vx, vy, damage, color, size, source = 'player') {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(vx, vy);
        this.damage = damage;
        this.color = color;
        this.size = size || (source === 'player' ? BULLET_CONFIG.PLAYER_BULLET.SIZE : BULLET_CONFIG.ENEMY_BULLET.SIZE);
        this.source = source;
        this.life = source === 'player' ? BULLET_CONFIG.PLAYER_BULLET.LIFE : BULLET_CONFIG.ENEMY_BULLET.LIFE;
        this.maxLife = source === 'player' ? BULLET_CONFIG.PLAYER_BULLET.MAX_LIFE : BULLET_CONFIG.ENEMY_BULLET.MAX_LIFE;
        this.trail = [];
        this.maxTrailLength = BULLET_CONFIG.PLAYER_BULLET.MAX_TRAIL_LENGTH;
        this.trailAlpha = BULLET_CONFIG.PLAYER_BULLET.TRAIL_ALPHA;
        this.muzzleFlash = source === 'player' ? BULLET_CONFIG.PLAYER_BULLET.MUZZLE_FLASH_DURATION : 0;
        this.impactSparks = [];
        this.glowIntensity = 1;
        this.trailColor = this.getTrailColor();
    }

    getTrailColor() {
        // Color-coded trails based on damage source
        const trailColors = {
            'player': BULLET_CONFIG.TRAIL_COLORS.PLAYER,
            'enemy': BULLET_CONFIG.TRAIL_COLORS.ENEMY,
            'exploder': BULLET_CONFIG.TRAIL_COLORS.EXPLODER,
            'charger': BULLET_CONFIG.TRAIL_COLORS.CHARGER,
            'shooter': BULLET_CONFIG.TRAIL_COLORS.SHOOTER,
            'sniper': BULLET_CONFIG.TRAIL_COLORS.SNIPER,
            'healer': BULLET_CONFIG.TRAIL_COLORS.HEALER,
            'swarmer': BULLET_CONFIG.TRAIL_COLORS.SWARMER
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
        for (let i = 0; i < PARTICLE_CONFIG.IMPACT_SPARKS.COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.impactSparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: PARTICLE_CONFIG.IMPACT_SPARKS.LIFE,
                maxLife: PARTICLE_CONFIG.IMPACT_SPARKS.MAX_LIFE,
                color: this.color,
                size: PARTICLE_CONFIG.IMPACT_SPARKS.SIZE.MIN + Math.random() * (PARTICLE_CONFIG.IMPACT_SPARKS.SIZE.MAX - PARTICLE_CONFIG.IMPACT_SPARKS.SIZE.MIN)
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