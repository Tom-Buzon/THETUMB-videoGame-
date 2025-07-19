class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    addExplosion(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 2 + Math.random() * 3,
                life: 30,
                maxLife: 30
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
                size: 1 + Math.random() * 2,
                life: 15,
                maxLife: 15
            });
        }
    }

    addBossAura(x, y) {
        if (Math.random() < 0.1) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 200;
            this.particles.push({
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                vx: Math.cos(angle + Math.PI) * 0.5,
                vy: Math.sin(angle + Math.PI) * 0.5,
                color: '#ff0000',
                size: 1 + Math.random() * 2,
                life: 60,
                maxLife: 60
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow effect
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
    }
}