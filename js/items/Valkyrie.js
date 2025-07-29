import { ITEM_CONFIG } from '../config.js';

export class ValkyrieItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.VALKYRIE.COLOR;
        
        // Properties for visual effects
        this.activationTime = 0;
        this.isActivated = false;
        this.effectDuration = 3000; // 3 seconds
        this.shockwaveDuration = 150; // 0.5 seconds
        this.isShockwaveActive = false;
        this.shockwaveStartTime = 0;
        this.shockwaveRadius = 0;
        this.maxShockwaveRadius = 250;
        this.effectComplete = false;
    }

    update() {
        if (this.isActivated) {
            const now = Date.now();
            const elapsed = now - this.activationTime;
            
            // Check if effect duration has passed
            if (elapsed >= this.effectDuration && !this.isShockwaveActive) {
                // Start shockwave effect
                this.isShockwaveActive = true;
                this.shockwaveStartTime = now;
                this.shockwaveRadius = 0;
                
                // Deal damage to enemies
                for (let i = this.game.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.game.enemies[i];
                    const dx = enemy.position.x - this.game.player.position.x;
                    const dy = enemy.position.y - this.game.player.position.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= this.maxShockwaveRadius) {
                        enemy.takeDamage(9999);
                        
                        // Check if enemy should be removed
                        if (enemy.health <= 0 || (enemy.isDying && enemy.deathAnimation >= 1)) {
                            this.game.enemies.splice(i, 1);
                        }
                    }
                }
                
                // Add shockwave visual effect
                if (this.game.particleSystem) {
                    // Add multiple explosions for a more impressive effect
                    this.game.particleSystem.addExplosion(
                        this.game.player.position.x,
                        this.game.player.position.y,
                        '#FFFF00', // Yellow
                        150,
                        3
                    );
                    
                    // Add additional particles for the shockwave
                    for (let i = 0; i < 100; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 3 + Math.random() * 5;
                        this.game.particleSystem.addParticle({
                            x: this.game.player.position.x,
                            y: this.game.player.position.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 40,
                            decay: 0.94,
                            color: '#FFFF00', // Yellow
                            size: 2 + Math.random() * 3
                        });
                    }
                }
                
                // Add screen flash effect
                if (this.game.particleSystem) {
                    this.game.particleSystem.addParticle({
                        x: 0,
                        y: 0,
                        vx: 0,
                        vy: 0,
                        life: 10,
                        decay: 0.7,
                        color: 'rgba(255, 255, 0, 0.5)', // Semi-transparent yellow
                        size: 2000 // Large enough to cover the screen
                    });
                }
                
                // Play shockwave sound
                if (window.audio && window.audio.playSound) {
                    window.audio.playSound("explosion");
                }
            }
            
            // Update shockwave effect
            if (this.isShockwaveActive) {
                const shockwaveElapsed = now - this.shockwaveStartTime;
                if (shockwaveElapsed < this.shockwaveDuration) {
                    // Calculate shockwave radius
                    this.shockwaveRadius = (shockwaveElapsed / this.shockwaveDuration) * this.maxShockwaveRadius;
                } else {
                    // End shockwave effect
                    this.isShockwaveActive = false;
                    this.isActivated = false;
                    this.shockwaveRadius = 0;
                    this.effectComplete = true;
                }
            }
        }
        
        // Add continuous particle effects during the growing phase
        if (this.isActivated && !this.isShockwaveActive) {
            const now = Date.now();
            const elapsed = now - this.activationTime;
            if (elapsed < this.effectDuration && this.game.particleSystem) {
                // Add particles periodically
                if (Math.random() < 0.3) { // 30% chance each frame
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * this.maxShockwaveRadius * (elapsed / this.effectDuration);
                    const speed = 1 + Math.random() * 2;
                    this.game.particleSystem.addParticle({
                        x: this.game.player.position.x + Math.cos(angle) * distance,
                        y: this.game.player.position.y + Math.sin(angle) * distance,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 30,
                        decay: 0.92,
                        color: '#FFFF00', // Yellow
                        size: 2 + Math.random() * 2
                    });
                }
            }
        }
    }

    draw(ctx) {
        // Draw nuclear bomb symbol
        ctx.fillStyle = this.color;
        
        // Draw bomb body (ellipse)
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius * 0.8, this.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw radiation symbol (three curved lines)
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        
        // Draw three curved lines representing radiation
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3;
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(angle) * this.radius * 0.3,
                this.y + Math.sin(angle) * this.radius * 0.3,
                this.radius * 0.4,
                angle + Math.PI * 0.7,
                angle + Math.PI * 1.3
            );
            ctx.stroke();
        }
        
        // Draw center circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Draw visual effects if activated
        if (this.isActivated) {
            const now = Date.now();
            const elapsed = now - this.activationTime;
            
            // Only draw effects during the 3-second duration
            if (elapsed < this.effectDuration) {
                // Calculate progress (0 to 1)
                const progress = elapsed / this.effectDuration;
                
                // Draw yellow glowing aura around player
                if (this.game.player) {
                    ctx.save();
                    ctx.beginPath();
                    // Make aura larger than player size with pulsing effect
                    const pulse = Math.sin(now * 0.01) * 0.2 + 1; // Pulsing effect
                    const auraRadius = this.game.player.size * 3 * (0.5 + progress * 0.5) * pulse;
                    ctx.arc(this.game.player.position.x, this.game.player.position.y, auraRadius, 0, Math.PI * 2);
                    
                    // Create gradient for glowing effect
                    const gradient = ctx.createRadialGradient(
                        this.game.player.position.x, this.game.player.position.y, auraRadius * 0.3,
                        this.game.player.position.x, this.game.player.position.y, auraRadius
                    );
                    gradient.addColorStop(0, `rgba(255, 255, 0, ${0.7 * (1 - progress)})`);
                    gradient.addColorStop(1, `rgba(255, 255, 0, 0)`);
                    
                    ctx.fillStyle = gradient;
                    ctx.fill();
                    ctx.restore();
                    
                    // Add a secondary aura for more depth
                    ctx.save();
                    ctx.beginPath();
                    const secondaryAuraRadius = auraRadius * 0.7;
                    ctx.arc(this.game.player.position.x, this.game.player.position.y, secondaryAuraRadius, 0, Math.PI * 2);
                    
                    const secondaryGradient = ctx.createRadialGradient(
                        this.game.player.position.x, this.game.player.position.y, secondaryAuraRadius * 0.2,
                        this.game.player.position.x, this.game.player.position.y, secondaryAuraRadius
                    );
                    secondaryGradient.addColorStop(0, `rgba(255, 200, 0, ${0.4 * (1 - progress)})`);
                    secondaryGradient.addColorStop(1, `rgba(255, 200, 0, 0)`);
                    
                    ctx.fillStyle = secondaryGradient;
                    ctx.fill();
                    ctx.restore();
                }
                
                // Add invulnerability effect to player
                if (this.game.player && this.game.player.invincible) {
                    ctx.save();
                    ctx.beginPath();
                    // Draw a rotating triangle around the player
                    const triangleSize = this.game.player.size * 2;
                    const angle = now * 0.005; // Rotation speed
                    const x1 = this.game.player.position.x + Math.cos(angle) * triangleSize;
                    const y1 = this.game.player.position.y + Math.sin(angle) * triangleSize;
                    const x2 = this.game.player.position.x + Math.cos(angle + Math.PI * 2/3) * triangleSize;
                    const y2 = this.game.player.position.y + Math.sin(angle + Math.PI * 2/3) * triangleSize;
                    const x3 = this.game.player.position.x + Math.cos(angle + Math.PI * 4/3) * triangleSize;
                    const y3 = this.game.player.position.y + Math.sin(angle + Math.PI * 4/3) * triangleSize;
                    
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineTo(x3, y3);
                    ctx.closePath();
                    
                    ctx.strokeStyle = `rgba(255, 255, 0, ${0.5 * (1 - progress)})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.restore();
                }
                
                // Draw growing yellow circle at player position
                ctx.beginPath();
                const circleRadius = progress * this.maxShockwaveRadius;
                ctx.arc(this.game.player.position.x, this.game.player.position.y, circleRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 0, ${0.8 * (1 - progress)})`;
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // Draw inner circle for more depth
                ctx.beginPath();
                ctx.arc(this.game.player.position.x, this.game.player.position.y, circleRadius * 0.7, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 200, 0, ${0.6 * (1 - progress)})`;
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Draw growing yellow cross at player position
                const crossSize = progress * this.maxShockwaveRadius;
                ctx.strokeStyle = `rgba(255, 255, 0, ${0.8 * (1 - progress)})`;
                ctx.lineWidth = 3;
                
                // Horizontal line
                ctx.beginPath();
                ctx.moveTo(this.game.player.position.x - crossSize, this.game.player.position.y);
                ctx.lineTo(this.game.player.position.x + crossSize, this.game.player.position.y);
                ctx.stroke();
                
                // Vertical line
                ctx.beginPath();
                ctx.moveTo(this.game.player.position.x, this.game.player.position.y - crossSize);
                ctx.lineTo(this.game.player.position.x, this.game.player.position.y + crossSize);
                ctx.stroke();
                
                // Draw diagonal lines for more visual interest
                ctx.strokeStyle = `rgba(255, 200, 0, ${0.6 * (1 - progress)})`;
                ctx.lineWidth = 2;
                
                // Diagonal line 1
                ctx.beginPath();
                ctx.moveTo(this.game.player.position.x - crossSize * 0.7, this.game.player.position.y - crossSize * 0.7);
                ctx.lineTo(this.game.player.position.x + crossSize * 0.7, this.game.player.position.y + crossSize * 0.7);
                ctx.stroke();
                
                // Diagonal line 2
                ctx.beginPath();
                ctx.moveTo(this.game.player.position.x + crossSize * 0.7, this.game.player.position.y - crossSize * 0.7);
                ctx.lineTo(this.game.player.position.x - crossSize * 0.7, this.game.player.position.y + crossSize * 0.7);
                ctx.stroke();
            }
            
            // Draw shockwave effect
            if (this.isShockwaveActive) {
                const shockwaveElapsed = now - this.shockwaveStartTime;
                if (shockwaveElapsed < this.shockwaveDuration) {
                    const shockwaveProgress = shockwaveElapsed / this.shockwaveDuration;
                    
                    // Draw multiple shockwave circles for a more impressive effect
                    const rings = 3;
                    for (let i = 0; i < rings; i++) {
                        const ringRadius = this.shockwaveRadius * (0.8 + i * 0.1);
                        const ringAlpha = 0.8 * (1 - shockwaveProgress) * (1 - i * 0.2);
                        ctx.beginPath();
                        ctx.arc(this.game.player.position.x, this.game.player.position.y, ringRadius, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(255, 255, 0, ${ringAlpha})`;
                        ctx.lineWidth = 3 + i * 2;
                        ctx.stroke();
                    }
                    
                    // Add distortion effect to the screen during shockwave
                    if (shockwaveProgress < 0.5) {
                        // Create a temporary canvas for distortion
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = ctx.canvas.width;
                        tempCanvas.height = ctx.canvas.height;
                        const tempCtx = tempCanvas.getContext('2d');
                        
                        // Copy current canvas to temp canvas
                        tempCtx.drawImage(ctx.canvas, 0, 0);
                        
                        // Apply distortion effect
                        const distortionIntensity = (0.5 - shockwaveProgress) * 10;
                        ctx.save();
                        ctx.setTransform(1 + distortionIntensity * 0.1, 0, 0, 1 + distortionIntensity * 0.1, 0, 0);
                        ctx.drawImage(tempCanvas, 0, 0);
                        ctx.restore();
                    }
                }
            }
        }
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('valkyrie')) {
            return;
        }
        
        // Activate valkyrie effect
        this.game.player.invincible = true;
        this.game.player.activateItemEffect('valkyrie', 3500); // 3.5 seconds total
        
        // Set cooldown
        this.game.player.setItemCooldown('valkyrie', ITEM_CONFIG.VALKYRIE.COOLDOWN); // 30 seconds cooldown
        
        
        // Start visual effects
        this.isActivated = true;
        this.activationTime = Date.now();
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add valkyrie activation particles
            for (let i = 0; i < 50; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 3;
                this.game.particleSystem.addParticle({
                    x: this.game.player.position.x,
                    y: this.game.player.position.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 60,
                    decay: 0.95,
                    color: ITEM_CONFIG.VALKYRIE.COLOR,
                    size: 3 + Math.random() * 3
                });
            }
        }
        
        // Play sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("itemPickup");
        }
        
        // Remove invincibility after duration
        setTimeout(() => {
            this.game.player.invincible = false;
        }, 3500);
    }
}
