import { ITEM_CONFIG, PLAYER_CONFIG } from '../config.js';

export class CompanionItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.COMPANION.COLOR;
        this.pulseTime = 0; // For aura pulsing effect
        this.pulseTime = 0; // For aura pulsing effect
    }

    update() {
        this.pulseTime += 0.1; // Increment pulse time for animation
    }
    
    draw(ctx) {
        // Calculate pulsing effect for aura
        const pulse = Math.sin(this.pulseTime) * 0.5 + 0.5; // Value between 0 and 1
        const auraIntensity = 10 + pulse * 10; // Pulsing blur between 10 and 20
        
        // Draw aura effect
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = auraIntensity;
        
        // Draw robot body (circle)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Draw robot head (rectangle)
        const headWidth = this.radius * 0.8;
        const headHeight = this.radius * 0.6;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x - headWidth / 2,
            this.y - this.radius * 1.1,
            headWidth,
            headHeight
        );
        
        // Draw eyes (small circles)
        ctx.beginPath();
        ctx.arc(
            this.x - headWidth * 0.25,
            this.y - this.radius * 0.9,
            this.radius * 0.1,
            0,
            2 * Math.PI
        );
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(
            this.x + headWidth * 0.25,
            this.y - this.radius * 0.9,
            this.radius * 0.1,
            0,
            2 * Math.PI
        );
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // Draw antenna (line and circle)
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.radius * 1.1);
        ctx.lineTo(this.x, this.y - this.radius * 1.4);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.radius * 0.15;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y - this.radius * 1.5,
            this.radius * 0.15,
            0,
            2 * Math.PI
        );
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // Draw arms (rectangles)
        const armWidth = this.radius * 0.2;
        const armHeight = this.radius * 0.5;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x - this.radius * 0.9,
            this.y - this.radius * 0.2,
            armWidth,
            armHeight
        );
        
        ctx.fillRect(
            this.x + this.radius * 0.7,
            this.y - this.radius * 0.2,
            armWidth,
            armHeight
        );
        
        ctx.restore(); // Restore context to remove shadow effects
    }

    activate() {
        // Activate companion effect
        this.game.player.addCompanion();
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add companion particles
            for (let i = 0; i < 25; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 3;
                this.game.particleSystem.addParticle({
                    x: this.game.player.position.x,
                    y: this.game.player.position.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 40,
                    decay: 0.92,
                    color: ITEM_CONFIG.COMPANION.COLOR,
                    size: 2 + Math.random() * 3
                });
            }
        }
        
        // Play sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("itemPickup");
        }
    }
}
