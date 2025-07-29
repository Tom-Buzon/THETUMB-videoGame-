import { ITEM_CONFIG } from '../config.js';

export class BlackHoleItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.BLACK_HOLE.COLOR;
        this.active = false;
        this.startTime = 0;
        this.duration = ITEM_CONFIG.BLACK_HOLE.DURATION; // 3 seconds
    }

    update() {
        if (this.active) {
            const now = Date.now();
            if (now - this.startTime >= this.duration) {
                // Explode and damage enemies
                this.explode();
                this.active = false;
                return;
            }
            
            // Attract enemies
            this.attractEnemies();
        }
    }
    
    draw(ctx) {
        if (this.active) {
            // Draw pulsing black hole effect
            const pulse = Math.sin(Date.now() * 0.01) * 5;
            const radius = this.radius + pulse;
            
            // Draw accretion disk (outer ring)
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(102, 102, 204, 0.7)'; // Lighter blue for accretion disk
            ctx.fill();
            
            // Draw black hole event horizon (darker center)
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = this.color; // Dark blue center
            ctx.fill();
            
            // Draw spiral effect
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)'; // Light blue for spiral
            ctx.lineWidth = 1;
            const spiralRadius = radius * 0.8;
            let prevX = this.x;
            let prevY = this.y;
            
            for (let i = 0; i < 3; i += 0.2) {
                const angle = i * Math.PI;
                const distance = (i / 3) * spiralRadius;
                const x = this.x + Math.cos(angle) * distance;
                const y = this.y + Math.sin(angle) * distance;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            // Draw attraction effect
            ctx.beginPath();
            ctx.arc(this.x, this.y, ITEM_CONFIG.BLACK_HOLE.ATTRACTION_RANGE, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(51, 51, 153, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Draw simplified black hole when not active
            // Draw outer ring (accretion disk)
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(102, 102, 204, 0.5)'; // Semi-transparent lighter blue
            ctx.fill();
            
            // Draw center
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = this.color; // Dark blue center
            ctx.fill();
        }
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('blackHole')) {
            return;
        }
        
        // Activate black hole effect
        this.active = true;
        this.startTime = Date.now();
        this.game.player.activateItemEffect('blackHole', ITEM_CONFIG.BLACK_HOLE.COOLDOWN); // 10 seconds
        
        // Set cooldown
        this.game.player.setItemCooldown('blackHole', ITEM_CONFIG.BLACK_HOLE.COOLDOWN); // 30 seconds cooldown
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add black hole particles
            for (let i = 0; i < 50; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 3;
                this.game.particleSystem.addParticle({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 60,
                    decay: 0.95,
                    color: ITEM_CONFIG.BLACK_HOLE.COLOR,
                    size: 3 + Math.random() * 3
                });
            }
        }
        
        // Play sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("blackHole");
        }
    }
    
    attractEnemies() {
        for (let enemy of this.game.enemies) {
            const dx = this.x - enemy.position.x;
            const dy = this.y - enemy.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < ITEM_CONFIG.BLACK_HOLE.ATTRACTION_RANGE) { // Within attraction range
                // Normalize direction
                const nx = dx / dist;
                const ny = dy / dist;
                
                // Apply attraction force
                const force = 0.5 * (1 - dist / ITEM_CONFIG.BLACK_HOLE.ATTRACTION_RANGE); // Stronger closer to black hole
                enemy.position.x += nx * force;
                enemy.position.y += ny * force;
            }
        }
    }
    
    explode() {
        // Damage all enemies within range
        for (let enemy of this.game.enemies) {
            const dx = this.x - enemy.position.x;
            const dy = this.y - enemy.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < ITEM_CONFIG.BLACK_HOLE.ATTRACTION_RANGE) {
                enemy.takeDamage(9999);
            }
        }
        
        // Add explosion effect
        if (this.game.particleSystem) {
            this.game.particleSystem.addExplosion(this.x, this.y, ITEM_CONFIG.BLACK_HOLE.COLOR, 50, 3);
        }
        
        // Play explosion sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("explosion");
        }
    }
}
