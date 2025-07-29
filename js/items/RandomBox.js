import { ITEM_CONFIG } from '../config.js';

export class RandomBoxItem {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = ITEM_CONFIG.BASE.RADIUS;
        this.color = ITEM_CONFIG.RANDOM_BOX.COLOR;
    }

    update() {}
    draw(ctx) {
        // Draw question mark
        ctx.fillStyle = this.color;
        ctx.font = `${this.radius * 1.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', this.x, this.y);
    }

    activate() {
        // Check if item is on cooldown
        if (this.game.player.isItemOnCooldown('randomBox')) {
            return;
        }
        
        // Set cooldown
        this.game.player.setItemCooldown('randomBox', ITEM_CONFIG.RANDOM_BOX.COOLDOWN); // 10 seconds cooldown
        
        // Add visual feedback
        if (this.game.particleSystem) {
            // Add random box particles
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 3;
                this.game.particleSystem.addParticle({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 40,
                    decay: 0.92,
                    color: ITEM_CONFIG.RANDOM_BOX.COLOR,
                    size: 2 + Math.random() * 2
                });
            }
        }
        
        // Play sound
        if (window.audio && window.audio.playSound) {
            window.audio.playSound("itemPickup");
        }
        
        // Randomly select an effect
        const effects = [
            // Positive effects
            () => {
                // Heal
                this.game.player.heal(ITEM_CONFIG.MEDKIT.HEAL_AMOUNT);
                if (this.game.particleSystem) {
                    // Add healing particles
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
                            color: ITEM_CONFIG.MEDKIT.COLOR,
                            size: 2 + Math.random() * 2
                        });
                    }
                }
            },
            () => {
                // Shield
                this.game.player.shield = ITEM_CONFIG.SHIELD.SHIELD_AMOUNT;
                this.game.player.activateItemEffect('shield', ITEM_CONFIG.SHIELD.DURATION);
                if (this.game.particleSystem) {
                    // Add shield particles
                    for (let i = 0; i < 30; i++) {
                        const angle = (i / 30) * Math.PI * 2;
                        this.game.particleSystem.addParticle({
                            x: this.game.player.position.x,
                            y: this.game.player.position.y,
                            vx: Math.cos(angle) * 3,
                            vy: Math.sin(angle) * 3,
                            life: 60,
                            decay: 0.95,
                            color: ITEM_CONFIG.SHIELD.COLOR,
                            size: 3 + Math.random() * 2
                        });
                    }
                }
            },
            () => {
                // Speed boost
                const originalSpeed = this.game.player.speed;
                this.game.player.speed *= 1.5;
                this.game.player.activateItemEffect('speedBoost', 5000); // This doesn't have a config value
                setTimeout(() => {
                    this.game.player.speed = originalSpeed;
                }, 5000); // This doesn't have a config value
                if (this.game.particleSystem) {
                    // Add speed boost particles
                    for (let i = 0; i < 25; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 2 + Math.random() * 3;
                        this.game.particleSystem.addParticle({
                            x: this.game.player.position.x,
                            y: this.game.player.position.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 30,
                            decay: 0.92,
                            color: '#ff33ff',
                            size: 2 + Math.random() * 2
                        });
                    }
                }
            },
            // Negative effects
            () => {
                // Slow down
                const originalSpeed = this.game.player.speed;
                this.game.player.speed *= 0.75;
                this.game.player.activateItemEffect('slow', 180000); // 180 seconds - no config value
                setTimeout(() => {
                    this.game.player.speed = originalSpeed;
                }, 180000); // 180 seconds - no config value
                if (this.game.particleSystem) {
                    // Add slow particles
                    for (let i = 0; i < 25; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 0.5 + Math.random() * 1;
                        this.game.particleSystem.addParticle({
                            x: this.game.player.position.x,
                            y: this.game.player.position.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 60,
                            decay: 0.95,
                            color: '#666666',
                            size: 2 + Math.random() * 2
                        });
                    }
                }
            },
            () => {
                // Weakness (reduce damage)
                const originalDamage = this.game.player.weapon.getDamage();
                this.game.player.weapon.states[this.game.player.weapon.currentState].damage *= 0.5;
                this.game.player.activateItemEffect('weakness', 60000); // 60 seconds - no config value
                setTimeout(() => {
                    this.game.player.weapon.states[this.game.player.weapon.currentState].damage = originalDamage;
                }, 60000); // 60 seconds - no config value
                if (this.game.particleSystem) {
                    // Add weakness particles
                    for (let i = 0; i < 25; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 0.5 + Math.random() * 1;
                        this.game.particleSystem.addParticle({
                            x: this.game.player.position.x,
                            y: this.game.player.position.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 60,
                            decay: 0.95,
                            color: '#999999',
                            size: 2 + Math.random() * 2
                        });
                    }
                }
            }
        ];
        
        // Select a random effect
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        randomEffect();
    }
}
