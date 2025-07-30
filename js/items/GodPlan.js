import { ITEM_CONFIG } from '../config.js';

export class GodPlanItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.GOD_PLAN.COLOR;
    }

    update() {}
    draw(ctx) {
        // Draw arrows pointing outward
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = 2;
        
        // Arrow length and head size
        const arrowLength = this.radius * 0.7;
        const headLength = this.radius * 0.3;
        const headWidth = this.radius * 0.2;
        
        // Draw four arrows (up, down, left, right)
        // Up arrow
        this.drawArrow(ctx, this.x, this.y, 0, -arrowLength, headLength, headWidth);
        
        // Down arrow
        this.drawArrow(ctx, this.x, this.y, 0, arrowLength, headLength, headWidth);
        
        // Left arrow
        this.drawArrow(ctx, this.x, this.y, -arrowLength, 0, headLength, headWidth);
        
        // Right arrow
        this.drawArrow(ctx, this.x, this.y, arrowLength, 0, headLength, headWidth);
        
        // Draw center circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Helper function to draw an arrow
    drawArrow(ctx, fromX, fromY, dx, dy, headLength, headWidth) {
        const toX = fromX + dx;
        const toY = fromY + dy;
        
        // Draw arrow shaft
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(dy, dx);
        
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('godPlan')) {
            return;
        }
        // Make player invincible for 20 seconds
        this.game.player.invincible = true;
        this.game.player.activateItemEffect('godPlan', ITEM_CONFIG.GOD_PLAN.DURATION); // 20 seconds
        
        // Set cooldown
        this.game.player.setItemCooldown('godPlan', ITEM_CONFIG.GOD_PLAN.COOLDOWN); // 60 seconds cooldown
        
        
        // Expand canvas temporarily
        this.game.player.expandCanvasTemporarily();
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add god plan particles
            for (let i = 0; i < 60; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 3;
                this.game.particleSystem.addParticle({
                    x: this.game.player.position.x,
                    y: this.game.player.position.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 80,
                    decay: 0.96,
                    color: ITEM_CONFIG.GOD_PLAN.COLOR,
                    size: 3 + Math.random() * 3
                });
            }
        }
        
        // Play sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("itemPickup");
        }
        
        // Remove invincibility after duration
        this.game.setTimeout(() => {
            this.game.player.invincible = false;
        }, ITEM_CONFIG.GOD_PLAN.DURATION);
    }
}
