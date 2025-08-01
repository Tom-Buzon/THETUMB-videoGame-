import { UI_CONFIG } from './config.js';

export class DoomUI {
    constructor(canvas, ctx) {
        console.log('Creating new DoomUI instance');
        this.canvas = canvas;
        this.ctx = ctx;
        this.game = null;
        this.messages = [];
        this._showGameOver = false;
        this.timer = 0;
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.maxComboTime = UI_CONFIG.COMBO.MAX_TIME;
        this.lastKillTime = 0;
        
        this.colors = UI_CONFIG.COLORS;
    }

    setGame(game) {
        this.game = game;
    }

    update(deltaTime) {
        this.timer += deltaTime;
        
        if (this.combo > 0 && Date.now() - this.lastKillTime > this.maxComboTime) {
            this.combo = 0;
        }
        
        this.messages = this.messages.filter(msg => Date.now() - msg.startTime < msg.duration);
    }

    addMessage(text, color = 'red', size = 48, duration = 3000) {
        this.messages.push({
            text: text.toUpperCase(),
            color: this.colors[color] || color,
            size: size,
            startTime: Date.now(),
            duration: duration,
            y: this.canvas.height / 2 - 100
        });
    }
    
    showWeaponChangeMessage(weaponName) {
        // Create and display weapon change message
        const message = document.createElement('div');
        message.className = 'weapon-change-message';
        message.textContent = weaponName;
        message.style.position = 'fixed';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.fontSize = '72px';
        message.style.fontWeight = 'bold';
        message.style.color = '#00FFFF';
        message.style.textShadow = '0 0 10px #00FF00, 0 0 20px #00FF00, 0 0 30px #00FF00';
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
                if (document.querySelectorAll('.weapon-change-message').length === 0) {
                    document.head.removeChild(style);
                }
            }
        }, 2000);
    }
    
    showRoomChangeMessage(dungeon, room) {
        // Create and display room change message
        const message = document.createElement('div');
        message.className = 'room-change-message';
        message.textContent = `DUNGEON ${dungeon} - ROOM ${room}`;
        message.style.position = 'fixed';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.fontSize = '72px';
        message.style.fontWeight = 'bold';
        message.style.color = '#FFFF00';
        message.style.textShadow = '0 0 10px #FF0000, 0 0 20px #FF0000, 0 0 30px #FF0000';
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
                if (document.querySelectorAll('.room-change-message').length === 0) {
                    document.head.removeChild(style);
                }
            }
        }, 2000);
    }

    addScore(points) {
        this.score += points * (1 + this.combo * 0.5);
        this.combo++;
        this.lastKillTime = Date.now();
        
        if (this.combo > 1) {
            this.addMessage(`${this.combo}x COMBO!`, 'yellow', 36, 1000);
        }
    }

    draw() {
        this.updateHUD();
        this.drawMessages();
        this.drawCombo();
    }

    updateHUD() {
        // Update health bar
        const healthPercent = this.game && this.game.player ? this.game.player.health / this.game.player.maxHealth : 1;
        const healthFill = document.getElementById('health-fill');
        const healthText = document.getElementById('health-text');
        
        if (healthFill) {
            healthFill.style.width = `${healthPercent * 100}%`;
        }
        
        if (healthText && this.game && this.game.player) {
            healthText.textContent = `HEALTH: ${Math.ceil(this.game.player.health)}/${this.game.player.maxHealth}`;
        }
        
        // Update weapon info
        const weaponInfo = document.getElementById('weapon-info');
        if (weaponInfo && this.game && this.game.player) {
            const weaponName = this.game.player.weapon.getName();
            weaponInfo.textContent = `WEAPON: ${weaponName}`;
        }
        
        // Update dungeon info
        const dungeonInfo = document.getElementById('dungeon-info');
        if (dungeonInfo && this.game) {
            dungeonInfo.textContent = `DUNGEON ${this.game.currentDungeon} - ROOM ${this.game.currentRoom}/3`;
        }
        
        // Update score
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `SCORE: ${Math.floor(this.score)}`;
        }
        
        // Update timer
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            const minutes = Math.floor(this.timer / 60000);
            const seconds = Math.floor((this.timer % 60000) / 1000);
            timerDisplay.textContent = `TIME: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    drawMessages() {
        const ctx = this.ctx;
        
        this.messages.forEach((msg, index) => {
            const elapsed = Date.now() - msg.startTime;
            const progress = elapsed / msg.duration;
            
            if (progress < 1) {
                ctx.save();
                
                ctx.shadowColor = msg.color;
                ctx.shadowBlur = 20;
                ctx.fillStyle = msg.color;
                ctx.font = `bold ${msg.size}px Courier New`;
                ctx.textAlign = 'center';
                
                const alpha = 1 - progress;
                ctx.globalAlpha = alpha;
                
                const y = msg.y + Math.sin(elapsed * 0.01) * 10;
                ctx.fillText(msg.text, this.canvas.width / 2, y);
                
                ctx.restore();
            }
        });
    }

    drawCombo() {
        if (this.combo > 1) {
            const ctx = this.ctx;
            ctx.save();
            
            ctx.shadowColor = this.colors.yellow;
            ctx.shadowBlur = 15;
            ctx.fillStyle = this.colors.yellow;
            ctx.font = 'bold 32px Courier New';
            ctx.textAlign = 'center';
            
            const comboText = `${this.combo}x COMBO!`;
            const x = this.canvas.width / 2;
            const y = 150 + Math.sin(Date.now() * 0.01) * 5;
            
            ctx.fillText(comboText, x, y);
            
            ctx.restore();
        }
    }

    drawGameOver() {
        const ctx = this.ctx;
        
        // Red overlay
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game Over text
        ctx.save();
        ctx.shadowColor = '#ff0000ff';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 72px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 150);
        
        // Stats
        ctx.shadowBlur = 15;
        ctx.font = 'bold 36px Courier New';
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`FINAL SCORE: ${Math.floor(this.score)}`, this.canvas.width / 2, this.canvas.height / 2 - 80);
        
        // Format time as MM:SS
        const minutes = Math.floor(this.timer / 60000);
        const seconds = Math.floor((this.timer % 60000) / 1000);
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`PLAY TIME: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        if (this.game) {
            ctx.fillStyle = '#ffaa00';
            ctx.fillText(`DUNGEON: ${this.game.currentDungeon}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            ctx.fillText(`ROOM: ${this.game.currentRoom}`, this.canvas.width / 2, this.canvas.height / 2 + 70);
        }
        
        // Restart button
        const buttonX = this.canvas.width / 2 - 100;
        const buttonY = this.canvas.height / 2 + 120;
        const buttonWidth = 200;
        const buttonHeight = 50;
        
        ctx.fillStyle = this.colors.green;
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button border
        ctx.strokeStyle = this.colors.white;
        ctx.lineWidth = 3;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#ff0000ff';
        ctx.font = 'bold 24px Courier New';
        ctx.fillText('RESTART', this.canvas.width / 2, this.canvas.height / 2 + 150);
        
        // Store button position for click detection
        this.restartButton = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
        
        ctx.restore();
    }

    drawVictory() {
        const ctx = this.ctx;
        
        // Gold overlay
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Victory text
        ctx.save();
        ctx.shadowColor = this.colors.yellow;
        ctx.shadowBlur = 30;
        ctx.fillStyle = this.colors.yellow;
        ctx.font = 'bold 72px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Stats
        ctx.shadowBlur = 15;
        ctx.font = 'bold 36px Courier New';
        ctx.fillStyle = this.colors.white;
        ctx.fillText(`FINAL SCORE: ${Math.floor(this.score)}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        ctx.fillText(`TIME: ${Math.floor(this.timer / 1000)}s`, this.canvas.width / 2, this.canvas.height / 2 + 60);
        if (this.game) {
            ctx.fillText(`DUNGEON ${this.game.currentDungeon} CLEARED`, this.canvas.width / 2, this.canvas.height / 2 + 100);
        }
        
        ctx.restore();
    }
    
    isClickOnRestartButton(x, y) {
        // Check if the click coordinates are within the restart button bounds
     // console.log('Checking if click is on restart button at', x, y);
     // console.log('Restart button position:', this.restartButton);
        if (this.restartButton) {
            const isOnButton = (
                x >= this.restartButton.x &&
                x <= this.restartButton.x + this.restartButton.width &&
                y >= this.restartButton.y &&
                y <= this.restartButton.y + this.restartButton.height
            );
            console.log('Is click on restart button:', isOnButton);
            return isOnButton;
        }
        console.log('No restart button position stored');
        return false;
    }
    
    // Method to reset UI state, including clearing the restart button position
    reset() {
     // console.log('Resetting UI state');
      //console.log('Restart button position before reset:', this.restartButton);
        this.restartButton = undefined;
        this.showGameOver = false;
        console.log('UI state reset complete');
        // Reset other UI states as needed
    }
    
    // Override setter for showGameOver to track when it's being set
    set showGameOverState(value) {
       // console.log('Setting UI showGameOver state to:', value);
        if (value === true) {
        //    console.trace('UI showGameOver state being set to true');
        }
        this._showGameOver = value;
    }
    
    get showGameOver() {
        //console.log('Getting UI showGameOver state:', this._showGameOver);
        return this._showGameOver;
    }
    
    set showGameOver(value) {
        this.showGameOverState = value;
    }
}