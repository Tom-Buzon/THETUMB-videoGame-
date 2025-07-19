class Player {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = 15;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 2;
        this.aimX = 0;
        this.aimY = 0;
        this.weapon = new Weapon();
    }

    update(keys, obstacles) {
        // Reset velocity
        this.velocity.x = 0;
        this.velocity.y = 0;

        // Movement with AZERTY layout (ZQSD)
        if (keys['z'] || keys['Z']) this.velocity.y = -this.speed;
        if (keys['s'] || keys['S']) this.velocity.y = this.speed;
        if (keys['q'] || keys['Q']) this.velocity.x = -this.speed;
        if (keys['d'] || keys['D']) this.velocity.x = this.speed;

        // Diagonal movement normalization
        if (this.velocity.x !== 0 && this.velocity.y !== 0) {
            this.velocity.x *= 0.707; // 1/sqrt(2)
            this.velocity.y *= 0.707;
        }

        // Apply movement
        const newX = this.position.x + this.velocity.x;
        const newY = this.position.y + this.velocity.y;

        // Check collision with obstacles
        let canMoveX = true;
        let canMoveY = true;

        for (let obstacle of obstacles) {
            if (this.checkCollision(newX, this.position.y, obstacle)) {
                canMoveX = false;
            }
            if (this.checkCollision(this.position.x, newY, obstacle)) {
                canMoveY = false;
            }
        }

        // Apply movement if no collision
        if (canMoveX) this.position.x = Math.max(this.size, Math.min(800 - this.size, newX));
        if (canMoveY) this.position.y = Math.max(this.size, Math.min(600 - this.size, newY));

        // Update weapon
        this.weapon.updateHealthState(this.health);
    }

    checkCollision(x, y, obstacle) {
        return x - this.size < obstacle.x + obstacle.width &&
               x + this.size > obstacle.x &&
               y - this.size < obstacle.y + obstacle.height &&
               y + this.size > obstacle.y;
    }

    setAim(x, y) {
        this.aimX = x;
        this.aimY = y;
    }

    shoot(target) {
        const direction = new Vector2D(target.x - this.position.x, target.y - this.position.y).normalize();
        const bullet = this.weapon.shoot(this.position.x, this.position.y, direction.x, direction.y, 'player');
        
        if (bullet) {
            // Apply recoil to player
            const state = this.weapon.getCurrentState();
            const recoilForce = 50 * state.recoilMultiplier * (1 - this.health/this.maxHealth);
            
            // Push player in opposite direction
            const recoilDirection = direction.multiply(-recoilForce);
            this.position.x += recoilDirection.x;
            this.position.y += recoilDirection.y;
            
            // Keep player in bounds
            this.position.x = Math.max(this.size, Math.min(800 - this.size, this.position.x));
            this.position.y = Math.max(this.size, Math.min(600 - this.size, this.position.y));
        }
        
        return bullet;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.weapon.updateHealthState(this.health);
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.weapon.updateHealthState(this.health);
    }

    render(ctx) {
        // Player body
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Player direction indicator
        const direction = new Vector2D(this.aimX - this.position.x, this.aimY - this.position.y).normalize();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.position.x + direction.x * 20, this.position.y + direction.y * 20);
        ctx.stroke();
    }
}