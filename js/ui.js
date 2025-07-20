class DoomUI {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.game = null;
        this.messages = [];
        this.timer = 0;
        this.score = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.maxComboTime = 2000;
        this.lastKillTime = 0;
        
        this.colors = {
            red: '#FF0000',
            orange: '#FF6600',
            yellow: '#FFFF00',
            green: '#00FF00',
            cyan: '#00FFFF',
            white: '#FFFFFF',
            darkRed: '#8B0000',
            darkGray: '#333333'
        };
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

    addScore(points) {
        this.score += points * (1 + this.combo * 0.5);
        this.combo++;
        this.lastKillTime = Date.now();
        
        if (this.combo > 1) {
            this.addMessage(`${this.combo}x COMBO!`, 'yellow', 36, 1000);
        }
    }

    draw() {
        this.drawHUD();
        this.drawMessages();
        this.drawCombo();
    }

    drawHUD() {
        const ctx = this.ctx;
        
        // Background HUD bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.canvas.width, 60);
        
        // Health bar
        const healthPercent = this.game && this.game.player ? this.game.player.health / this.game.player.maxHealth : 1;
        const healthBarWidth = 200;
        const healthBarHeight = 20;
        const healthBarX = 20;
        const healthBarY = 20;
        
        ctx.fillStyle = this.colors.darkRed;
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        const healthColor = healthPercent > 0.6 ? this.colors.green :
                           healthPercent > 0.3 ? this.colors.orange : this.colors.red;
        ctx.fillStyle = healthColor;
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);
        
        ctx.fillStyle = this.colors.white;
        ctx.font = 'bold 16px Courier New';
        if (this.game && this.game.player) {
            ctx.fillText(`HEALTH: ${Math.ceil(this.game.player.health)}/${this.game.player.maxHealth}`, healthBarX, healthBarY - 5);
        }
        
        // Score
        ctx.fillStyle = this.colors.cyan;
        ctx.font = 'bold 24px Courier New';
        ctx.fillText(`SCORE: ${Math.floor(this.score)}`, this.canvas.width / 2 - 50, 35);
        
        // Timer
        const minutes = Math.floor(this.timer / 60000);
        const seconds = Math.floor((this.timer % 60000) / 1000);
        ctx.fillStyle = this.colors.yellow;
        ctx.font = 'bold 20px Courier New';
        ctx.fillText(`TIME: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, this.canvas.width - 150, 35);
        
        // Dungeon info
        ctx.fillStyle = this.colors.orange;
        ctx.font = 'bold 18px Courier New';
        if (this.game) {
            ctx.fillText(`DUNGEON ${this.game.currentDungeon} - ROOM ${this.game.currentRoom}/3`, this.canvas.width / 2 - 100, 60);
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
        ctx.shadowColor = this.colors.red;
        ctx.shadowBlur = 30;
        ctx.fillStyle = this.colors.red;
        ctx.font = 'bold 72px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        // Stats
        ctx.shadowBlur = 15;
        ctx.font = 'bold 36px Courier New';
        ctx.fillStyle = this.colors.white;
        ctx.fillText(`FINAL SCORE: ${Math.floor(this.score)}`, this.canvas.width / 2, this.canvas.height / 2 - 20);
        ctx.fillText(`TIME: ${Math.floor(this.timer / 1000)}s`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        if (this.game) {
            ctx.fillText(`DUNGEON ${this.game.currentDungeon} CLEARED`, this.canvas.width / 2, this.canvas.height / 2 + 60);
        }
        
        // Restart button
        const buttonX = this.canvas.width / 2 - 100;
        const buttonY = this.canvas.height / 2 + 100;
        const buttonWidth = 200;
        const buttonHeight = 50;
        
        ctx.fillStyle = this.colors.green;
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = this.colors.white;
        ctx.font = 'bold 24px Courier New';
        ctx.fillText('RESTART', this.canvas.width / 2, this.canvas.height / 2 + 130);
        
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
}