class Boundary {
    constructor(x, y, width, height, color) {
        this.position = new Vector2D(x, y);
        this.width = width;
        this.height = height;
        this.color = color;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // Add subtle border
        ctx.strokeStyle = this.color === '#ff0000' ? '#ff6666' : '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }

    checkCollision(entity) {
        const entityLeft = entity.position.x - entity.size;
        const entityRight = entity.position.x + entity.size;
        const entityTop = entity.position.y - entity.size;
        const entityBottom = entity.position.y + entity.size;

        const boundaryLeft = this.position.x;
        const boundaryRight = this.position.x + this.width;
        const boundaryTop = this.position.y;
        const boundaryBottom = this.position.y + this.height;

        if (entityRight > boundaryLeft && entityLeft < boundaryRight &&
            entityBottom > boundaryTop && entityTop < boundaryBottom) {
            
            // Calculate overlap
            const overlapLeft = entityRight - boundaryLeft;
            const overlapRight = boundaryRight - entityLeft;
            const overlapTop = entityBottom - boundaryTop;
            const overlapBottom = boundaryBottom - entityTop;

            // Find smallest overlap
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            // Push entity out
            if (minOverlap === overlapLeft) {
                entity.position.x = boundaryLeft - entity.size;
            } else if (minOverlap === overlapRight) {
                entity.position.x = boundaryRight + entity.size;
            } else if (minOverlap === overlapTop) {
                entity.position.y = boundaryTop - entity.size;
            } else if (minOverlap === overlapBottom) {
                entity.position.y = boundaryBottom + entity.size;
            }

            return true;
        }
        return false;
    }
}

class BoundaryManager {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.boundaries = [];
    }

    generate(roomNumber) {
        this.boundaries = [];
        
        // Choose color based on room
        const wallColor = roomNumber === 3 ? '#ff0000' : '#666666';
        
        // Top wall
        this.boundaries.push(new Boundary(0, 0, this.gameWidth, 10, wallColor));
        
        // Bottom wall
        this.boundaries.push(new Boundary(0, this.gameHeight - 10, this.gameWidth, 10, wallColor));
        
        // Left wall
        this.boundaries.push(new Boundary(0, 0, 10, this.gameHeight, wallColor));
        
        // Right wall
        this.boundaries.push(new Boundary(this.gameWidth - 10, 0, 10, this.gameHeight, wallColor));
    }

    render(ctx) {
        this.boundaries.forEach(boundary => boundary.render(ctx));
    }

    checkCollisions(entity) {
        this.boundaries.forEach(boundary => boundary.checkCollision(entity));
    }
}