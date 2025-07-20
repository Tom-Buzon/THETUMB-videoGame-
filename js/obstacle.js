class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = '#444444';
    }

    render(ctx) {
        // Doom-style obstacle
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 3D effect
        ctx.fillStyle = '#666666';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        // Highlight
        ctx.fillStyle = '#888888';
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
    }

    checkCollision(obj) {
        const objX = obj.position.x;
        const objY = obj.position.y;
        const objRadius = obj.size || obj.radius || 10;
        
        // Find closest point on rectangle to circle
        const closestX = Math.max(this.x, Math.min(objX, this.x + this.width));
        const closestY = Math.max(this.y, Math.min(objY, this.y + this.height));
        
        // Calculate distance
        const distance = Math.sqrt(
            (objX - closestX) ** 2 + (objY - closestY) ** 2
        );
        
        return distance < objRadius;
    }

    resolveCollision(obj) {
        const objX = obj.position.x;
        const objY = obj.position.y;
        const objRadius = obj.size || obj.radius || 10;
        
        // Find closest point
        const closestX = Math.max(this.x, Math.min(objX, this.x + this.width));
        const closestY = Math.max(this.y, Math.min(objY, this.y + this.height));
        
        // Calculate overlap
        const dx = objX - closestX;
        const dy = objY - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < objRadius && distance > 0) {
            const overlap = objRadius - distance;
            const pushX = (dx / distance) * overlap;
            const pushY = (dy / distance) * overlap;
            
            obj.position.x += pushX;
            obj.position.y += pushY;
        }
    }
}