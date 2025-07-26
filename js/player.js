class Player {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = 15;
        this.health = 500;
        this.maxHealth = 500;
        this.speed = 6;
        this.color = '#00ff00';
        this.score = 0;
        
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            pressed: false
        };
        
        this.weapon = new Weapon();
        
        // **CORRECTION : RECUL TOUJOURS ACTIF**
        this.recoilForce = new Vector2D(0, 0);
        this.friction = 0.85;
    }

    update(keys) {
        // **MOUVEMENT INDÉPENDANT DU RECUL**
        this.handleMovement(keys);
        
        // **APPLICATION DU RECUL**
        this.applyRecoil();
        
        // **LIMITES**
        this.position.x = Math.max(this.size, Math.min(1400 - this.size, this.position.x));
        this.position.y = Math.max(this.size, Math.min(1000 - this.size, this.position.y));
    }

    handleMovement(keys) {
        // **MOUVEMENT DE BASE (INDÉPENDANT DU RECUL)**
        let moveX = 0;
        let moveY = 0;
        
        if (keys['KeyW'] || keys['KeyZ'] || keys['ArrowUp']) moveY -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
        if (keys['KeyA'] || keys['KeyQ'] || keys['ArrowLeft']) moveX -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
        
        // **NORMALISATION DU MOUVEMENT**
        if (moveX !== 0 || moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
        }
        
        // **APPLICATION DU MOUVEMENT**
        this.position.x += moveX * this.speed;
        this.position.y += moveY * this.speed;
    }

    applyRecoil() {
        // **APPLICATION DU RECUL (INDÉPENDANT DU MOUVEMENT)**
        this.position = this.position.add(this.recoilForce);
        this.recoilForce = this.recoilForce.multiply(this.friction);
    }

    shoot() {
        const direction = new Vector2D(
            this.mouse.x - this.position.x,
            this.mouse.y - this.position.y
        ).normalize();
        
        const bullet = this.weapon.shoot(this.position.x, this.position.y, direction);
        
        if (bullet) {
            // **CALCUL DU RECUL CORRIGÉ**
            const healthFactor = 1 - (this.health / this.maxHealth);
            const recoilMultiplier = 0.5 + healthFactor * 2; // 0.5 à 2.5
            
            const recoil = direction.multiply(-bullet.damage * recoilMultiplier);
            this.recoilForce = this.recoilForce.add(recoil);
            
            return bullet;
        }
        
        return null;
    }

    takeDamage(amount, source = 'unknown') {
        this.health = Math.max(0, this.health - amount);
        console.log(`Player took ${amount} damage from ${source}`);
        
        // **FLASH ROUGE QUAND TOUCHÉ**
        const flash = document.createElement('div');
        flash.className = 'damage-flash';
        console.log(`Player health: ${this.health}/${this.maxHealth}, updating weapon state...`);
        this.weapon.updateState(this.health, this.maxHealth);
        console.log(`Weapon state updated to: ${this.weapon.currentState}`);
        document.getElementById('gameContainer').appendChild(flash);
        setTimeout(() => flash.remove(), 200);
        
        // **DEATH CHECK - Always check if player should die**
        if (this.health <= 0 && window.game) {
            window.game.handlePlayerDeath();
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    setTarget(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
    }

    render(ctx) {
        // **CORPS DU JOUEUR**
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // **DIRECTION DU JOUEUR**
        const direction = new Vector2D(
            this.mouse.x - this.position.x,
            this.mouse.y - this.position.y
        ).normalize();
        
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(
            this.position.x + direction.x * 20,
            this.position.y + direction.y * 20
        );
        ctx.stroke();
        
        // **BARRE DE VIE AU-DESSUS DU JOUEUR**
        const barWidth = 30;
        const barHeight = 4;
        const barX = this.position.x - barWidth / 2;
        const barY = this.position.y - this.size - 10;
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
    }
}