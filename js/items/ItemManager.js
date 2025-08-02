import { ITEM_CONFIG } from '../config.js';
import { MedkitItem } from './Medkit.js';
import { ValkyrieItem } from './Valkyrie.js';
import { ShieldItem } from './Shield.js';
import { BazookaItem } from './Bazooka.js';
import { BlackHoleItem } from './BlackHole.js';
import { CompanionItem } from './Companion.js';
import { GhostItem } from './Ghost.js';
import { TimeBubbleItem } from './TimeBubble.js';
import { GodPlanItem } from './GodPlan.js';
import { RandomBoxItem } from './RandomBox.js';
import { RicochetItem } from './Ricochet.js';
import { FireBallItem } from './FireBall.js';

export class ItemManager {
    constructor(game) {
        this.game = game;
        this.items = [];
    }

    spawnItem(type, x, y) {
        let item;
        switch(type) {
            case 'Medkit':
                item = new MedkitItem(this.game, x, y);
                break;
            case 'Valkyrie':
                item = new ValkyrieItem(this.game, x, y);
                break;
            case 'Shield':
                item = new ShieldItem(this.game, x, y);
                break;
            case 'Bazooka':
                item = new BazookaItem(this.game, x, y);
                break;
            case 'BlackHole':
                item = new BlackHoleItem(this.game, x, y);
                break;
            case 'Companion':
                item = new CompanionItem(this.game, x, y);
                break;
            case 'Ghost':
                item = new GhostItem(this.game, x, y);
                break;
            case 'FireBall':
                item = new FireBallItem(this.game, x, y);
                break;
            case 'TimeBubble':
                item = new TimeBubbleItem(this.game, x, y);
                break;
            case 'GodPlan':
                item = new GodPlanItem(this.game, x, y);
                break;
            case 'RandomBox':
                item = new RandomBoxItem(this.game, x, y);
                break;
            case 'Ricochet':
                item = new RicochetItem(this.game, x, y);
                break;

        }
        if (item) {
            this.items.push(item);
            return item;
        }
        return null;
    }

    update() {
        // Update all items first
        for (let item of this.items) {
            item.update();
        }

        // Check for collisions with player
        this.items = this.items.filter(item => {
            const distance = Math.sqrt(
                Math.pow(this.game.player.position.x - item.x, 2) +
                Math.pow(this.game.player.position.y - item.y, 2)
            );
            const collisionDistance = this.game.player.size + item.radius;
            
            if (distance < collisionDistance) {
                // Get item name from class name
                const itemName = this.getItemName(item);
                
                // Add collection particles
                if (this.game.particleSystem) {
                    // Add collection particles
                    for (let j = 0; j < 15; j++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 1 + Math.random() * 2;
                        this.game.particleSystem.addParticle({
                            x: item.x,
                            y: item.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 20,
                            decay: 0.9,
                            color: '#FFFF00', // Yellow particles for collection - no config value
                            size: 2 + Math.random() * 2
                        });
                    }
                }
                
                // Activate the item
                item.activate();
                
                // Display item collection message using DOM-based system
                this.showItemCollectionMessage(itemName);
                
                // Play collection sound
                if (window.audio && window.audio.playSound) {
                    window.audio.playSound("itemPickup");
                }
                
                // For BlackHoleItem, don't remove it immediately as it needs to continue its effect
                if (item.constructor.name === 'BlackHoleItem') {
                    // Keep the item in the array for BlackHoleItem
                    return true;
                }
                
                // For ValkyrieItem, don't remove it immediately as it needs to continue its effect
                if (item.constructor.name === 'ValkyrieItem') {
                    // Keep the item in the array for ValkyrieItem
                    return true;
                }
                
                // Remove item from array for other items
                return false;
            }
            // Keep item in array
            return true;
        });
        
        // Remove BlackHoleItem from array when its effect is complete
        this.items = this.items.filter(item => {
            if (item.constructor.name === 'BlackHoleItem' && item.effectComplete) {
                return false;
            }
            // Remove ValkyrieItem from array when its effect is complete
            if (item.constructor.name === 'ValkyrieItem' && item.effectComplete) {
                return false;
            }
            return true;
        });
    }

    getItemName(item) {
        // Derive item name from class name
        const className = item.constructor.name;
        // Remove "Item" suffix and add spaces before capital letters
        let name = className.replace(/Item$/, '');
        name = name.replace(/([A-Z])/g, ' $1').trim();
        return name;
    }

    showItemCollectionMessage(itemName) {
        // Create and display item collection message
        const message = document.createElement('div');
        message.className = 'item-collection-message';
        message.textContent = itemName;
        message.style.position = 'fixed';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.fontSize = '72px';
        message.style.fontWeight = 'bold';
        message.style.color = '#FF0000';
        message.style.textShadow = '0 0 10px #FFFF00, 0 0 20px #FFFF00, 0 0 30px #FFFF00';
        message.style.zIndex = '1000';
        message.style.pointerEvents = 'none';
        message.style.animation = 'fadeOut 2s forwards';
        message.style.fontFamily = 'Courier New, monospace';
        message.style.letterSpacing = '2px';
        
        // Add fade out animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(message);
        
        // Remove message after animation completes
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
                // Remove style element if no more messages
                if (document.querySelectorAll('.item-collection-message').length === 0) {
                    document.head.removeChild(style);
                }
            }
        }, 2000);
    }

    draw(ctx) {
        for (let item of this.items) {
            item.draw(ctx);
        }
    }
}
