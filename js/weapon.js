class Weapon {
    constructor() {
        this.lastFireTime = 0;
        this.currentHealth = 100;
        this.maxHealth = 100;
    }

    update() {
        // Update weapon state based on current health
        // This method is called every frame
    }

    updateHealthState(health) {
        this.currentHealth = health;
    }

    getCurrentState() {
        const healthPercent = (this.currentHealth / this.maxHealth) * 100;
        
        // Fixed progression: starts with auto, gets slower as HP decreases
        if (healthPercent >= 75) {
            return {
                name: 'Auto Rifle',
                fireRate: 100,      // Very fast
                damage: 8,          // Low damage
                recoilMultiplier: 0.5,
                color: '#00ff00'
            };
        } else if (healthPercent >= 50) {
            return {
                name: 'Burst Rifle',
                fireRate: 300,      // Medium
                damage: 15,         // Medium damage
                recoilMultiplier: 1.0,
                color: '#ffff00'
            };
        } else if (healthPercent >= 25) {
            return {
                name: 'Semi-Auto',
                fireRate: 800,      // Slow
                damage: 30,         // High damage
                recoilMultiplier: 2.0,
                color: '#ff8800'
            };
        } else {
            return {
                name: 'Single Shot',
                fireRate: 1500,     // Very slow
                damage: 60,         // Massive damage
                recoilMultiplier: 5.0,
                color: '#ff0000'
            };
        }
    }

    canFire(currentTime) {
        const state = this.getCurrentState();
        return currentTime - this.lastFireTime >= state.fireRate;
    }

    shoot(fromX, fromY, directionX, directionY, owner) {
        const currentTime = Date.now();
        if (this.canFire(currentTime)) {
            this.lastFireTime = currentTime;
            const state = this.getCurrentState();
            
            const direction = new Vector2D(directionX, directionY).normalize();
            const bulletSpeed = 8;
            
            return new Bullet(
                fromX,
                fromY,
                direction.x * bulletSpeed,
                direction.y * bulletSpeed,
                state.damage,
                state.color,
                4,
                owner
            );
        }
        return null;
    }

    fire(fromPosition, targetPosition, currentHealth, maxHealth) {
        const currentTime = Date.now();
        if (this.canFire(currentTime)) {
            this.lastFireTime = currentTime;
            const state = this.getCurrentState();
            
            const direction = new Vector2D(
                targetPosition.x - fromPosition.x,
                targetPosition.y - fromPosition.y
            ).normalize();
            
            const bulletSpeed = 8;
            const recoil = 50 * state.recoilMultiplier * (1 - currentHealth/maxHealth);
            
            return {
                position: new Vector2D(fromPosition.x, fromPosition.y),
                velocity: direction.multiply(bulletSpeed),
                damage: state.damage,
                color: state.color,
                size: 4,
                recoil: recoil
            };
        }
        return null;
    }
}