import { ParticleSystem } from './particles.js';

export class DeathAnimationSystem {
    constructor() {
        this.animations = [];
        this.completedAnimations = new Set(); // Track completed animations
        this.defaultAnimationSpeed = 0.08; // Standardized speed
    }
    
    // Initialize death animation for an enemy
    startAnimation(enemy, enemyType) {
        const animation = {
            enemy: enemy,
            type: enemyType,
            progress: 0,
            speed: enemy.deathAnimationSpeed || this.defaultAnimationSpeed,
            isComplete: false,
            startTime: Date.now()
        };
        
        this.animations.push(animation);
        
        // Trigger enhanced particle effects based on enemy type
        this.triggerEnhancedDeathEffects(enemy, enemyType);
        
        return animation;
    }
    
    // Trigger enhanced particle effects based on enemy type
    triggerEnhancedDeathEffects(enemy, enemyType) {
        if (typeof window !== 'undefined' && window.game && window.game.particleSystem) {
            const particleSystem = window.game.particleSystem;
            
            switch (enemyType) {
                case 'Boss':
                    // Create multiple explosions for boss death
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            particleSystem.addExplosion(
                                enemy.position.x + (Math.random() - 0.5) * 50,
                                enemy.position.y + (Math.random() - 0.5) * 50,
                                enemy.color,
                                30, // More particles for boss
                                2  // Higher intensity for boss
                            );
                        }, i * 200); // Staggered explosions
                    }
                    
                    // Add large dissolve effect
                    particleSystem.addDissolveEffect(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        enemy.size * 2 // Larger dissolve for boss
                    );
                    
                    // Add energy drain
                    particleSystem.addEnergyDrain(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color
                    );
                    
                    // Add debris
                    particleSystem.addDebris(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        20, // More debris for boss
                        enemy.size
                    );
                    
                    // Add shockwave
                    particleSystem.createShockwave(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.size * 3
                    );
                    
                    // Screen shake
                    particleSystem.addScreenShake(10); // Stronger shake for boss
                    
                    // Flash effect
                    particleSystem.addFlash(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.size * 4,
                        '#ffffff'
                    );
                    break;
                    
                case 'Healer':
                    // Create death explosion
                    particleSystem.addExplosion(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        12,
                        1
                    );
                    
                    // Add dissolve effect
                    particleSystem.addDissolveEffect(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        enemy.size
                    );
                    
                    // Add energy drain
                    particleSystem.addEnergyDrain(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color
                    );
                    
                    // Screen shake
                    particleSystem.addScreenShake(2);
                    break;
                    
                case 'Shooter':
                    // Create death explosion
                    particleSystem.addExplosion(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        15,
                        1
                    );
                    
                    // Add dissolve effect
                    particleSystem.addDissolveEffect(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        enemy.size
                    );
                    
                    // Add energy drain
                    particleSystem.addEnergyDrain(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color
                    );
                    
                    // Screen shake
                    particleSystem.addScreenShake(2);
                    break;
                    
                case 'Charger':
                    // Create large explosion for charger
                    particleSystem.addExplosion(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        20,
                        1.5
                    );
                    
                    // Add dissolve effect
                    particleSystem.addDissolveEffect(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        enemy.size
                    );
                    
                    // Add energy drain
                    particleSystem.addEnergyDrain(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color
                    );
                    
                    // Screen shake
                    particleSystem.addScreenShake(4);
                    break;
                    
                case 'Exploder':
                    // Create massive explosion
                    particleSystem.addExplosion(
                        enemy.position.x,
                        enemy.position.y,
                        '#ff6600',
                        30,
                        2
                    );
                    
                    // Create shockwave rings
                    particleSystem.createShockwave(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.explosionRadius
                    );
                    
                    // Add particle debris with physics
                    particleSystem.addDebris(
                        enemy.position.x,
                        enemy.position.y,
                        '#ff6600',
                        15,
                        enemy.explosionRadius
                    );
                    
                    // Add dynamic lighting flash
                    particleSystem.addFlash(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.explosionRadius * 2,
                        '#ff6600'
                    );
                    
                    // Add screen shake
                    particleSystem.addScreenShake(6);
                    
                    // Add energy drain effect
                    particleSystem.addEnergyDrain(
                        enemy.position.x,
                        enemy.position.y,
                        '#ff6600'
                    );
                    
                    // Add dissolve effect
                    particleSystem.addDissolveEffect(
                        enemy.position.x,
                        enemy.position.y,
                        '#ff6600',
                        enemy.size
                    );
                    break;
                    
                case 'Sniper':
                    // Create death explosion
                    particleSystem.addExplosion(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        18,
                        1.2
                    );
                    
                    // Add dissolve effect
                    particleSystem.addDissolveEffect(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        enemy.size
                    );
                    
                    // Add energy drain
                    particleSystem.addEnergyDrain(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color
                    );
                    
                    // Screen shake
                    particleSystem.addScreenShake(3);
                    break;
                    
                case 'Swarmer':
                default:
                    // Create death explosion
                    particleSystem.addExplosion(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        12,
                        1
                    );
                    
                    // Add dissolve effect
                    particleSystem.addDissolveEffect(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color,
                        enemy.size
                    );
                    
                    // Add energy drain
                    particleSystem.addEnergyDrain(
                        enemy.position.x,
                        enemy.position.y,
                        enemy.color
                    );
                    
                    // Screen shake
                    particleSystem.addScreenShake(2);
                    break;
            }
        }
    }
    
    // Update all active animations
    update() {
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const animation = this.animations[i];
            animation.progress += animation.speed;
            
            if (animation.progress >= 1.0) {
                animation.isComplete = true;
                // Add enemy to completed set before removing from animations array
                this.completedAnimations.add(animation.enemy);
                this.animations.splice(i, 1);
            }
        }
    }
    
    // Check if an enemy's death animation is complete
    isAnimationComplete(enemy) {
        // Check if animation is currently active and complete, or if it was previously completed
        return this.animations.some(anim => anim.enemy === enemy && anim.isComplete) ||
               this.completedAnimations.has(enemy);
    }
    
    // Check if an enemy is currently dying
    isDying(enemy) {
        return this.animations.some(anim => anim.enemy === enemy);
    }
    
    // Get animation progress for an enemy
    getAnimationProgress(enemy) {
        const animation = this.animations.find(anim => anim.enemy === enemy);
        return animation ? animation.progress : 0;
    }
    
    // Remove enemy from completed animations (call when enemy is removed from game)
    cleanupCompletedAnimation(enemy) {
        this.completedAnimations.delete(enemy);
    }
    
    // Render death animation for an enemy
    renderDeathAnimation(enemy, ctx) {
        const progress = this.getAnimationProgress(enemy);
        const alpha = 1 - progress;
        
        if (alpha <= 0) return;
        
        ctx.globalAlpha = alpha;
        
        // Call specific animation renderer based on enemy type
        switch (enemy.constructor.name) {
            case 'Boss':
                this.renderBossDeathAnimation(enemy, ctx, progress);
                break;
            case 'Healer':
                this.renderHealerDeathAnimation(enemy, ctx, progress);
                break;
            case 'Shooter':
                this.renderShooterDeathAnimation(enemy, ctx, progress);
                break;
            case 'Charger':
                this.renderChargerDeathAnimation(enemy, ctx, progress);
                break;
            case 'Exploder':
                this.renderExploderDeathAnimation(enemy, ctx, progress);
                break;
            case 'Sniper':
                this.renderSniperDeathAnimation(enemy, ctx, progress);
                break;
            case 'Swarmer':
                this.renderSwarmerDeathAnimation(enemy, ctx, progress);
                break;
            default:
                // Default simple dissolve animation
                this.renderDefaultDeathAnimation(enemy, ctx, progress);
        }
        
        ctx.globalAlpha = 1;
    }
    
    // Boss death animation
    renderBossDeathAnimation(boss, ctx, progress) {
        const alpha = 1 - progress;
        if (alpha <= 0) return;
        
        ctx.globalAlpha = alpha;
        
        // Pulsing effect during death
        const pulse = Math.sin(progress * 20) * 0.2 + 0.8;
        
        // Render main body with glitch effect
        for (let i = 0; i < 5; i++) {
            const glitchX = boss.position.x + (Math.random() - 0.5) * 20 * progress;
            const glitchY = boss.position.y + (Math.random() - 0.5) * 20 * progress;
            const glitchSize = boss.size * pulse * (1 - progress * 0.5);
            
            ctx.fillStyle = boss.color;
            ctx.beginPath();
            ctx.arc(glitchX, glitchY, glitchSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Render eyes with flickering effect
        ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(boss.position.x - 15, boss.position.y - 10, 5 * pulse, 0, Math.PI * 2);
        ctx.arc(boss.position.x + 15, boss.position.y - 10, 5 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Render mouth with distortion
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(boss.position.x, boss.position.y + 10, 8 * pulse, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Healer death animation
    renderHealerDeathAnimation(healer, ctx, progress) {
        const alpha = 1 - progress;
        if (alpha <= 0) return;
        
        ctx.globalAlpha = alpha;
        
        // Healing energy dispersal
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const distance = progress * 60;
            const x = healer.position.x + Math.cos(angle) * distance;
            const y = healer.position.y + Math.sin(angle) * distance;
            
            ctx.fillStyle = `rgba(255, 0, 255, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Shooter death animation
    renderShooterDeathAnimation(shooter, ctx, progress) {
        const alpha = 1 - progress;
        if (alpha <= 0) return;
        
        ctx.globalAlpha = alpha;
        
        // Glitch effect
        for (let i = 0; i < 5; i++) {
            const glitchX = shooter.position.x + (Math.random() - 0.5) * 20;
            const glitchY = shooter.position.y + (Math.random() - 0.5) * 20;
            
            ctx.fillStyle = shooter.color;
            ctx.beginPath();
            ctx.arc(glitchX, glitchY, shooter.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Scanlines
        ctx.strokeStyle = `rgba(0, 255, 0, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            const y = shooter.position.y - shooter.size + (i * shooter.size * 2 / 10);
            ctx.beginPath();
            ctx.moveTo(shooter.position.x - shooter.size, y);
            ctx.lineTo(shooter.position.x + shooter.size, y);
            ctx.stroke();
        }
    }
    
    // Charger death animation
    renderChargerDeathAnimation(charger, ctx, progress) {
        const alpha = 1 - progress;
        if (alpha <= 0) return;
        
        ctx.globalAlpha = alpha;
        
        // Explosion rings
        for (let i = 0; i < 3; i++) {
            const radius = charger.size + (progress * 50 * (i + 1));
            const ringAlpha = alpha * (1 - progress * 0.5);
            
            ctx.strokeStyle = `rgba(255, 68, 68, ${ringAlpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(charger.position.x, charger.position.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Debris
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const distance = progress * 30;
            const x = charger.position.x + Math.cos(angle) * distance;
            const y = charger.position.y + Math.sin(angle) * distance;
            
            ctx.fillStyle = charger.color;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Exploder death animation
    renderExploderDeathAnimation(exploder, ctx, progress) {
        const alpha = 1 - progress;
        if (alpha <= 0) return;
        
        ctx.globalAlpha = alpha;
        
        // Multiple explosion rings
        for (let i = 0; i < 5; i++) {
            const radius = (exploder.explosionRadius * 0.5) + (progress * 80 * (i + 1));
            const ringAlpha = alpha * (1 - progress * 0.3);
            
            ctx.strokeStyle = `rgba(255, 102, 0, ${ringAlpha})`;
            ctx.lineWidth = 4 - i;
            ctx.beginPath();
            ctx.arc(exploder.position.x, exploder.position.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Fire particles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = progress * 100;
            const x = exploder.position.x + Math.cos(angle) * distance;
            const y = exploder.position.y + Math.sin(angle) * distance;
            
            ctx.fillStyle = `rgba(255, ${100 + Math.random() * 155}, 0, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Sniper death animation
    renderSniperDeathAnimation(sniper, ctx, progress) {
        const alpha = 1 - progress;
        if (alpha <= 0) return;
        
        ctx.globalAlpha = alpha;
        
        // Shattered scope pieces
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            const distance = progress * 40;
            const x = sniper.position.x + Math.cos(angle) * distance;
            const y = sniper.position.y + Math.sin(angle) * distance;
            
            ctx.fillStyle = sniper.color;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Glass shard effect
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - 3, y - 3);
            ctx.lineTo(x + 3, y + 3);
            ctx.moveTo(x + 3, y - 3);
            ctx.lineTo(x - 3, y + 3);
            ctx.stroke();
        }
    }
    
    // Swarmer death animation
    renderSwarmerDeathAnimation(swarmer, ctx, progress) {
        const alpha = 1 - progress;
        if (alpha <= 0) return;
        
        ctx.globalAlpha = alpha;
        
        // Dissolve particles
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const offset = progress * 20;
            const x = swarmer.position.x + Math.cos(angle) * offset;
            const y = swarmer.position.y + Math.sin(angle) * offset;
            
            ctx.fillStyle = swarmer.color;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Default death animation
    renderDefaultDeathAnimation(enemy, ctx, progress) {
        const alpha = 1 - progress;
        if (alpha <= 0) return;
        
        ctx.globalAlpha = alpha;
        
        // Simple dissolve effect
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const offset = progress * 15;
            const x = enemy.position.x + Math.cos(angle) * offset;
            const y = enemy.position.y + Math.sin(angle) * offset;
            
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}