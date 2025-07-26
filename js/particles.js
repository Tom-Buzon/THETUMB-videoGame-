class ParticleSystem {
    constructor() {
        this.particles = [];
        this.screenShake = 0;
        this.flashIntensity = 0;
        this.dissolveEffects = [];
        this.energyDrains = [];
        this.debris = [];
        this.shockwaves = [];
    }

    addExplosion(x, y, color, count, intensity = 1) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = (2 + Math.random() * 3) * intensity;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: 30 + Math.random() * 20,
                maxLife: 30 + Math.random() * 20,
                size: 2 + Math.random() * 3,
                type: 'explosion',
                gravity: 0.1
            });
        }
    }

    addMuzzleFlash(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: 10,
                maxLife: 10,
                size: 1 + Math.random() * 2,
                type: 'muzzle'
            });
        }
    }

    createExplosion(x, y, color, count, radius) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const distance = Math.random() * radius;
            this.particles.push({
                x: x + Math.cos(angle) * distance * 0.5,
                y: y + Math.sin(angle) * distance * 0.5,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: 40,
                maxLife: 40,
                size: 3 + Math.random() * 4,
                type: 'explosion'
            });
        }
    }

    createShockwave(x, y, radius) {
        // Create expanding ring effect
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.shockwaves.push({
                x: x,
                y: y,
                angle: angle,
                radius: 0,
                maxRadius: radius,
                speed: radius / 10,
                color: '#ffffff',
                life: 20,
                maxLife: 20,
                width: 3
            });
        }
    }

    addDebris(x, y, color, count, radius) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.debris.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: 60 + Math.random() * 40,
                maxLife: 60 + Math.random() * 40,
                size: 1 + Math.random() * 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                gravity: 0.05
            });
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
            this.energyDrains.push({
                x: x,
                y: y,
                angle: angle,
                radius: 0,
                maxRadius: 50,
                speed: 2,
                color: color,
                life: 30,
                maxLife: 30,
                particles: []
            });
        }
    }

    addDissolveEffect(x, y, color, size) {
        for (let i = 0; i < size * 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size;
            this.dissolveEffects.push({
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                vx: Math.cos(angle) * 0.5,
                vy: Math.sin(angle) * 0.5,
                color: color,
                life: 40 + Math.random() * 20,
                maxLife: 40 + Math.random() * 20,
                size: 1 + Math.random() * 2,
                dissolve: 0
            });
        }
    }

    addImpactSparks(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: 15,
                maxLife: 15,
                size: 1 + Math.random() * 2,
                type: 'spark'
            });
        }
    }

    addDeathBurst(x, y, color, size) {
        // Create corpse fade-out effect
        for (let i = 0; i < size * 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size;
            this.particles.push({
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                vx: Math.cos(angle) * 0.3,
                vy: Math.sin(angle) * 0.3,
                color: color,
                life: 60 + Math.random() * 30,
                maxLife: 60 + Math.random() * 30,
                size: 1 + Math.random() * 3,
                type: 'death',
                fade: true
            });
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
                this.particles.splice(i, 1);
            }
        }
        
        // Update shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const wave = this.shockwaves[i];
            wave.radius += wave.speed;
            wave.life--;
            
            if (wave.life <= 0) {
                this.shockwaves.splice(i, 1);
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
                this.debris.splice(i, 1);
            }
        }
        
        // Update energy drains
        for (let i = this.energyDrains.length - 1; i >= 0; i--) {
            const drain = this.energyDrains[i];
            drain.radius += drain.speed;
            drain.life--;
            
            // Create energy particles
            if (drain.life % 3 === 0) {
                drain.particles.push({
                    x: drain.x + Math.cos(drain.angle) * drain.radius,
                    y: drain.y + Math.sin(drain.angle) * drain.radius,
                    vx: -Math.cos(drain.angle) * 1,
                    vy: -Math.sin(drain.angle) * 1,
                    color: drain.color,
                    life: 10,
                    maxLife: 10,
                    size: 1
                });
            }
            
            // Update energy particles
            for (let j = drain.particles.length - 1; j >= 0; j--) {
                const particle = drain.particles[j];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life--;
                
                if (particle.life <= 0) {
                    drain.particles.splice(j, 1);
                }
            }
            
            if (drain.life <= 0) {
                this.energyDrains.splice(i, 1);
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
                this.dissolveEffects.splice(i, 1);
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