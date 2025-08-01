import { ITEM_CONFIG, PLAYER_CONFIG } from '../config.js';

export class BazookaItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.BAZOOKA.COLOR;
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
        
        // Draw bazooka (side view with barrel, trigger, and handle)
        ctx.fillStyle = this.color;
        
        // Barrel (main tube)
        const barrelWidth = this.radius * 1.2;
        const barrelHeight = this.radius * 0.3;
        ctx.fillRect(
            this.x - barrelWidth/2,
            this.y - barrelHeight/2,
            barrelWidth,
            barrelHeight
        );
        
        // Darker shading for barrel (to give it a 3D look)
        ctx.fillStyle = '#cc2222'; // Darker red for shading
        ctx.fillRect(
            this.x - barrelWidth/2,
            this.y,
            barrelWidth,
            barrelHeight/2
        );
        
        // Trigger
        ctx.fillStyle = this.color;
        const triggerWidth = this.radius * 0.2;
        const triggerHeight = this.radius * 0.4;
        ctx.fillRect(
            this.x + barrelWidth/2 - triggerWidth - this.radius * 0.1,
            this.y - triggerHeight/2,
            triggerWidth,
            triggerHeight
        );
        
        // Handle (back of the bazooka)
        ctx.fillStyle = this.color;
        const handleWidth = this.radius * 0.5;
        const handleHeight = this.radius * 0.8;
        ctx.fillRect(
            this.x - barrelWidth/2 - handleWidth + this.radius * 0.1,
            this.y - handleHeight/2,
            handleWidth,
            handleHeight
        );
        
        // Darker shading for handle
        ctx.fillStyle = '#cc2222'; // Darker red for shading
        ctx.fillRect(
            this.x - barrelWidth/2 - handleWidth + this.radius * 0.1,
            this.y + this.radius * 0.1,
            handleWidth,
            handleHeight/2
        );
        
        // Muzzle (front of the barrel)
        ctx.fillStyle = '#333333'; // Dark gray for the muzzle
        const muzzleWidth = this.radius * 0.2;
        const muzzleHeight = this.radius * 0.4;
        ctx.fillRect(
            this.x + barrelWidth/2,
            this.y - muzzleHeight/2,
            muzzleWidth,
            muzzleHeight
        );
        
        ctx.restore(); // Restore context to remove shadow effects
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('bazooka')) {
            return;
        }
        
        // Activate bazooka effect
        this.game.player.weaponMode = 'BAZOOKA';
        this.game.player.activateItemEffect('bazooka', ITEM_CONFIG.BAZOOKA.DURATION); // Use duration from config
        
        // Set cooldown
        this.game.player.setItemCooldown('bazooka', ITEM_CONFIG.BAZOOKA.COOLDOWN); // Use cooldown from config
        
        // Show weapon change message
        if (this.game.ui) {
            this.game.ui.showWeaponChangeMessage('BAZOOKA');
        }
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add bazooka particles
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 2;
                this.game.particleSystem.addParticle({
                    x: this.game.player.position.x,
                    y: this.game.player.position.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 30,
                    decay: 0.9,
                    color: ITEM_CONFIG.BAZOOKA.COLOR,
                    size: 2 + Math.random() * 2
                });
            }
        }
        
        // Play sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("itemPickup");
        }
    }
}
