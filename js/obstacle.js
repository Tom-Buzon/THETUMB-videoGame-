class Obstacle {
    constructor(x, y, width, height, type = 'wall') {
        this.position = new Vector2D(x, y);
        this.width = width;
        this.height = height;
        this.type = type;
        
        switch(type) {
            case 'wall':
                this.color = '#444';
                this.solid = true;
                break;
            case 'spike':
                this.color = '#ff4444';
                this.solid = false;
                this.damage = 20;
                break;
            case 'barrier':
                this.color = '#8888ff';
                this.solid = true;
                this.health = 50;
                this.maxHealth = 50;
                break;
        }
    }

    checkCollision(entity) {
        const closestX = clamp(entity.position.x, this.position.x, this.position.x + this.width);
        const closestY = clamp(entity.position.y, this.position.y, this.position.y + this.height);
        
        const distance = entity.position.distance(new Vector2D(closestX, closestY));
        
        if (distance < entity.size) {
            if (this.solid) {
                // Push entity away from obstacle
                const pushDirection = entity.position.subtract(new Vector2D(
                    this.position.x + this.width/2,
                    this.position.y + this.height/2
                )).normalize();
                
                entity.position = entity.position.add(pushDirection.multiply(entity.size - distance + 1));
            }
            
            if (this.type === 'spike') {
                return { damage: this.damage };
            }
        }
        
        return null;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        if (this.type === 'barrier' && this.health < this.maxHealth) {
            // Health bar for barriers
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = '#333';
            ctx.fillRect(this.position.x, this.position.y - 10, this.width, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.position.x, this.position.y - 10, this.width * healthPercent, 4);
        }
    }

    takeDamage(amount) {
        if (this.type === 'barrier') {
            this.health = Math.max(0, this.health - amount);
            return this.health <= 0;
        }
        return false;
    }
}