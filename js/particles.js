import { PARTICLE_CONFIG } from './config.js';

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.screenShake = 0;
        this.flashIntensity = 0;
        this.dissolveEffects = [];
        this.energyDrains = [];
        this.debris = [];
        this.shockwaves = [];
        this.damageNumbers = [];
        
        // Particle pool for reusing particle objects
        this.particlePool = [];
        this.poolSize = 0;
        this.activeParticles = 0;
        this.poolHits = 0;
        this.poolMisses = 0;
    }

    /**
     * Acquire a particle from the pool or create a new one if pool is empty
     * @returns {Object} A particle object
     */
    acquireParticle() {
        if (this.particlePool.length > 0) {
            this.poolHits++;
            this.activeParticles++;
            return this.particlePool.pop();
        } else {
            this.poolMisses++;
            this.activeParticles++;
            this.poolSize++;
            return {};
        }
    }

    /**
     * Return a particle to the pool
     * @param {Object} particle - The particle to return to the pool
     */
    releaseParticle(particle) {
        // Reset particle properties to default values
        for (let key in particle) {
            if (particle.hasOwnProperty(key)) {
                delete particle[key];
            }
        }
        
        this.particlePool.push(particle);
        this.activeParticles--;
    }

    /**
     * Get pool statistics for performance monitoring
     * @returns {Object} Pool statistics
     */
    getPoolStats() {
        return {
            poolSize: this.poolSize,
            activeParticles: this.activeParticles,
            poolHits: this.poolHits,
            poolMisses: this.poolMisses,
            hitRate: this.poolHits / (this.poolHits + this.poolMisses || 1)
        };
    }

    addExplosion(x, y, color, count = PARTICLE_CONFIG.EXPLOSION.COUNT, intensity = 1) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = (2 + Math.random() * 3) * intensity;
            const particle = this.acquireParticle();
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.color = color;
            particle.life = PARTICLE_CONFIG.EXPLOSION.LIFE + Math.random() * (PARTICLE_CONFIG.EXPLOSION.MAX_LIFE - PARTICLE_CONFIG.EXPLOSION.LIFE);
            particle.maxLife = PARTICLE_CONFIG.EXPLOSION.MAX_LIFE;
            particle.size = PARTICLE_CONFIG.EXPLOSION.SIZE.MIN + Math.random() * (PARTICLE_CONFIG.EXPLOSION.SIZE.MAX - PARTICLE_CONFIG.EXPLOSION.SIZE.MIN);
            particle.type = 'explosion';
            particle.gravity = 0.1;
            this.particles.push(particle);
        }
    }

    addMuzzleFlash(x, y, color, count = PARTICLE_CONFIG.MUZZLE_FLASH.COUNT) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            const particle = this.acquireParticle();
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.color = color;
            particle.life = PARTICLE_CONFIG.MUZZLE_FLASH.LIFE;
            particle.maxLife = PARTICLE_CONFIG.MUZZLE_FLASH.MAX_LIFE;
            particle.size = PARTICLE_CONFIG.MUZZLE_FLASH.SIZE.MIN + Math.random() * (PARTICLE_CONFIG.MUZZLE_FLASH.SIZE.MAX - PARTICLE_CONFIG.MUZZLE_FLASH.SIZE.MIN);
            particle.type = 'muzzle';
            this.particles.push(particle);
        }
    }

    createExplosion(x, y, color, count = PARTICLE_CONFIG.EXPLOSION.COUNT, radius) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const distance = Math.random() * radius;
            const particle = this.acquireParticle();
            particle.x = x + Math.cos(angle) * distance * 0.5;
            particle.y = y + Math.sin(angle) * distance * 0.5;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.color = color;
            particle.life = PARTICLE_CONFIG.EXPLOSION.LIFE + Math.random() * (PARTICLE_CONFIG.EXPLOSION.MAX_LIFE - PARTICLE_CONFIG.EXPLOSION.LIFE);
            particle.maxLife = PARTICLE_CONFIG.EXPLOSION.MAX_LIFE;
            particle.size = PARTICLE_CONFIG.EXPLOSION.SIZE.MIN + Math.random() * (PARTICLE_CONFIG.EXPLOSION.SIZE.MAX - PARTICLE_CONFIG.EXPLOSION.SIZE.MIN);
            particle.type = 'explosion';
            this.particles.push(particle);
        }
    }

    createShockwave(x, y, radius) {
        // Create expanding ring effect
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const particle = this.acquireParticle();
            particle.x = x;
            particle.y = y;
            particle.angle = angle;
            particle.radius = 0;
            particle.maxRadius = radius;
            particle.speed = radius / 10;
            particle.color = '#ffffff';
            particle.life = 20;
            particle.maxLife = 20;
            particle.width = 3;
            this.shockwaves.push(particle);
        }
    }

    addDebris(x, y, color, count, radius) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const particle = this.acquireParticle();
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.color = color;
            particle.life = 60 + Math.random() * 40;
            particle.maxLife = 60 + Math.random() * 40;
            particle.size = 1 + Math.random() * 2;
            particle.rotation = Math.random() * Math.PI * 2;
            particle.rotationSpeed = (Math.random() - 0.5) * 0.2;
            particle.gravity = 0.05;
            this.debris.push(particle);
        }
    }

    addFlash(x, y, radius, color) {
        this.flashIntensity = 1;
        this.flashX = x;
        this.flashY = y;
        this.flashRadius = radius;
        this.flashColor = color;
    }

    addScreenShake(intensity) {
        this.screenShake = Math.max(this.screenShake, intensity);
    }

    addEnergyDrain(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const particle = this.acquireParticle();
            particle.x = x;
            particle.y = y;
            particle.angle = angle;
            particle.radius = 0;
            particle.maxRadius = 50;
            particle.speed = 2;
            particle.color = color;
            particle.life = 30;
            particle.maxLife = 30;
            particle.particles = [];
            this.energyDrains.push(particle);
        }
    }

    addDissolveEffect(x, y, color, size) {
        for (let i = 0; i < size * PARTICLE_CONFIG.DISSOLVE_EFFECT.COUNT_MULTIPLIER; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size;
            const particle = this.acquireParticle();
            particle.x = x + Math.cos(angle) * distance;
            particle.y = y + Math.sin(angle) * distance;
            particle.vx = Math.cos(angle) * 0.5;
            particle.vy = Math.sin(angle) * 0.5;
            particle.color = color;
            particle.life = PARTICLE_CONFIG.DISSOLVE_EFFECT.LIFE + Math.random() * (PARTICLE_CONFIG.DISSOLVE_EFFECT.MAX_LIFE - PARTICLE_CONFIG.DISSOLVE_EFFECT.LIFE);
            particle.maxLife = PARTICLE_CONFIG.DISSOLVE_EFFECT.MAX_LIFE;
            particle.size = PARTICLE_CONFIG.DISSOLVE_EFFECT.SIZE.MIN + Math.random() * (PARTICLE_CONFIG.DISSOLVE_EFFECT.SIZE.MAX - PARTICLE_CONFIG.DISSOLVE_EFFECT.SIZE.MIN);
            particle.dissolve = 0;
            this.dissolveEffects.push(particle);
        }
    }

    addImpactSparks(x, y, color, count = PARTICLE_CONFIG.IMPACT_SPARKS.COUNT) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const particle = this.acquireParticle();
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.color = color;
            particle.life = PARTICLE_CONFIG.IMPACT_SPARKS.LIFE;
            particle.maxLife = PARTICLE_CONFIG.IMPACT_SPARKS.MAX_LIFE;
            particle.size = PARTICLE_CONFIG.IMPACT_SPARKS.SIZE.MIN + Math.random() * (PARTICLE_CONFIG.IMPACT_SPARKS.SIZE.MAX - PARTICLE_CONFIG.IMPACT_SPARKS.SIZE.MIN);
            particle.type = 'spark';
            this.particles.push(particle);
        }
    }

    addParticle(particle) {
        // Add a generic particle with custom properties
        // For backward compatibility, we'll use the pool if the particle is a plain object
        if (particle && typeof particle === 'object' && !Array.isArray(particle)) {
            const pooledParticle = this.acquireParticle();
            // Copy all properties from the input particle to the pooled particle
            for (let key in particle) {
                if (particle.hasOwnProperty(key)) {
                    pooledParticle[key] = particle[key];
                }
            }
            this.particles.push(pooledParticle);
        } else {
            // For backward compatibility with non-object particles, push directly
            this.particles.push(particle);
        }
    }
    
    addDamageNumber(x, y, damage, color = '#ffffff') {
        const particle = this.acquireParticle();
        particle.x = x;
        particle.y = y;
        particle.damage = damage;
        particle.color = color;
        particle.life = 60; // 60 frames = 1 second at 60 FPS
        particle.maxLife = 60;
        particle.vy = -1; // Float upward
        this.damageNumbers.push(particle);
    }

    addDeathBurst(x, y, color, size) {
        // Create corpse fade-out effect
        for (let i = 0; i < size * PARTICLE_CONFIG.DEATH_BURST.COUNT_MULTIPLIER; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size;
            const particle = this.acquireParticle();
            particle.x = x + Math.cos(angle) * distance;
            particle.y = y + Math.sin(angle) * distance;
            particle.vx = Math.cos(angle) * 0.3;
            particle.vy = Math.sin(angle) * 0.3;
            particle.color = color;
            particle.life = PARTICLE_CONFIG.DEATH_BURST.LIFE + Math.random() * (PARTICLE_CONFIG.DEATH_BURST.MAX_LIFE - PARTICLE_CONFIG.DEATH_BURST.LIFE);
            particle.maxLife = PARTICLE_CONFIG.DEATH_BURST.MAX_LIFE;
            particle.size = PARTICLE_CONFIG.DEATH_BURST.SIZE.MIN + Math.random() * (PARTICLE_CONFIG.DEATH_BURST.SIZE.MAX - PARTICLE_CONFIG.DEATH_BURST.SIZE.MIN);
            particle.type = 'death';
            particle.fade = true;
            this.particles.push(particle);
        }
    }

    update() {
        // Update regular particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.gravity) {
                particle.vy += particle.gravity;
            }
            
            if (particle.life <= 0) {
                const removed = this.particles.splice(i, 1)[0];
                this.releaseParticle(removed);
            }
        }
        
        // Update shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const wave = this.shockwaves[i];
            wave.radius += wave.speed;
            wave.life--;
            
            if (wave.life <= 0) {
                const removed = this.shockwaves.splice(i, 1)[0];
                this.releaseParticle(removed);
            }
        }
        
        // Update debris
        for (let i = this.debris.length - 1; i >= 0; i--) {
            const debris = this.debris[i];
            debris.x += debris.vx;
            debris.y += debris.vy;
            debris.life--;
            debris.rotation += debris.rotationSpeed;
            
            if (debris.gravity) {
                debris.vy += debris.gravity;
            }
            
            if (debris.life <= 0) {
                const removed = this.debris.splice(i, 1)[0];
                this.releaseParticle(removed);
            }
        }
        
        // Update energy drains
        for (let i = this.energyDrains.length - 1; i >= 0; i--) {
            const drain = this.energyDrains[i];
            drain.radius += drain.speed;
            drain.life--;
            
            // Create energy particles
            if (drain.life % 3 === 0) {
                const particle = this.acquireParticle();
                particle.x = drain.x + Math.cos(drain.angle) * drain.radius;
                particle.y = drain.y + Math.sin(drain.angle) * drain.radius;
                particle.vx = -Math.cos(drain.angle) * 1;
                particle.vy = -Math.sin(drain.angle) * 1;
                particle.color = drain.color;
                particle.life = 10;
                particle.maxLife = 10;
                particle.size = 1;
                drain.particles.push(particle);
            }
            
            // Update energy particles
            for (let j = drain.particles.length - 1; j >= 0; j--) {
                const particle = drain.particles[j];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life--;
                
                if (particle.life <= 0) {
                    const removed = drain.particles.splice(j, 1)[0];
                    this.releaseParticle(removed);
                }
            }
            
            if (drain.life <= 0) {
                // Release all energy particles first
                for (let j = drain.particles.length - 1; j >= 0; j--) {
                    const particle = drain.particles[j];
                    this.releaseParticle(particle);
                }
                const removed = this.energyDrains.splice(i, 1)[0];
                this.releaseParticle(removed);
            }
        }
        
        // Update dissolve effects
        for (let i = this.dissolveEffects.length - 1; i >= 0; i--) {
            const effect = this.dissolveEffects[i];
            effect.x += effect.vx;
            effect.y += effect.vy;
            effect.life--;
            effect.dissolve += 0.02;
            
            if (effect.life <= 0) {
                const removed = this.dissolveEffects.splice(i, 1)[0];
                this.releaseParticle(removed);
            }
        }
        
        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake *= 0.9;
        }
        
        // Update flash
        if (this.flashIntensity > 0) {
            this.flashIntensity *= 0.9;
        }
        
        // Update damage numbers
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const number = this.damageNumbers[i];
            number.y += number.vy;
            number.life--;
            
            if (number.life <= 0) {
                const removed = this.damageNumbers.splice(i, 1)[0];
                this.releaseParticle(removed);
            }
        }
    }

    render(ctx) {
        // Apply screen shake
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            ctx.translate(shakeX, shakeY);
        }
        
        // Render flash effect
        if (this.flashIntensity > 0) {
            const gradient = ctx.createRadialGradient(
                this.flashX, this.flashY, 0,
                this.flashX, this.flashY, this.flashRadius
            );
            
            gradient.addColorStop(0, `${this.flashColor}${Math.floor(this.flashIntensity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
        
        // Render regular particles
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.globalAlpha = alpha;
            
            if (particle.type === 'death' && particle.fade) {
                // Death particles with dissolve effect
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Regular particles
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Add glow for explosion particles
            if (particle.type === 'explosion') {
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = 5 * alpha;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
        
        // Render shockwaves
        this.shockwaves.forEach(wave => {
            const alpha = wave.life / wave.maxLife;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = wave.width * alpha;
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        // Render debris
        this.debris.forEach(debris => {
            const alpha = debris.life / debris.maxLife;
            ctx.save();
            ctx.translate(debris.x, debris.y);
            ctx.rotate(debris.rotation);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = debris.color;
            ctx.fillRect(-debris.size/2, -debris.size/2, debris.size, debris.size);
            ctx.restore();
        });
        
        // Render energy drains
        this.energyDrains.forEach(drain => {
            const alpha = drain.life / drain.maxLife;
            ctx.strokeStyle = `${drain.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(drain.x, drain.y, drain.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Render energy particles
            drain.particles.forEach(particle => {
                const pAlpha = particle.life / particle.maxLife;
                ctx.globalAlpha = pAlpha;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
        
        // Render damage numbers
        this.damageNumbers.forEach(number => {
            const alpha = number.life / number.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = number.color;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Add glow effect
            ctx.shadowColor = number.color;
            ctx.shadowBlur = 10;
            ctx.fillText(number.damage.toString(), number.x, number.y);
            ctx.shadowBlur = 0;
        });
        });
        
        // Render dissolve effects
        this.dissolveEffects.forEach(effect => {
            const alpha = (1 - effect.dissolve) * (effect.life / effect.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        
        // Reset screen shake
        if (this.screenShake > 0) {
            ctx.translate(0, 0);
        }
    }
}