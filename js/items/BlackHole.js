
class BlackHoleItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.color = "#333399";
        this.active = false;
        this.startTime = 0;
        this.duration = 3000; // 3 seconds
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
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            // Draw attraction effect
            ctx.beginPath();
            ctx.arc(this.x, this.y, 300, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(51, 51, 153, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
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
        this.game.player.activateItemEffect('blackHole', 10000); // 10 seconds
        
        // Set cooldown
        this.game.player.setItemCooldown('blackHole', 30000); // 30 seconds cooldown
        
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
                    color: '#333399',
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
            
            if (dist < 300) { // Within attraction range
                // Normalize direction
                const nx = dx / dist;
                const ny = dy / dist;
                
                // Apply attraction force
                const force = 0.5 * (1 - dist / 300); // Stronger closer to black hole
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
            
            if (dist < 300) {
                enemy.takeDamage(9999);
            }
        }
        
        // Add explosion effect
        if (this.game.particleSystem) {
            this.game.particleSystem.addExplosion(this.x, this.y, '#333399', 50, 3);
        }
        
        // Play explosion sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("explosion");
        }
    }
}
