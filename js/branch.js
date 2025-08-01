// Branch class for the enhanced branching laser system
export class Branch {
    constructor(id, startX, startY, angle, maxLength, index, level, parent = null) {
        // Unique identifier for the branch
        this.id = id;
        
        // Position and angle data
        this.startX = startX;
        this.startY = startY;
        this.angle = angle;
        this.maxLength = maxLength;
        this.index = index;
        this.level = level;
        this.parent = parent;
        this.children = [];
        
        // Relative positioning data
        this.relativePosition = parent ? 
            { x: startX - parent.startX, y: startY - parent.startY } : 
            { x: 0, y: 0 };
        this.relativeAngle = parent ? angle - parent.angle : angle;
        
        // State data
        this.isActive = true;
        this.damage = this.calculateBaseDamage();
        this.startPoint = { x: startX, y: startY };
        this.endPoint = { x: 0, y: 0 };
    }
    
    // Update position based on parent position and angle
    updatePosition(parentStart, parentAngle) {
        if (this.parent) {
            // For sub-branches, position relative to parent
            this.startPoint.x = parentStart.x + this.relativePosition.x * Math.cos(parentAngle) - this.relativePosition.y * Math.sin(parentAngle);
            this.startPoint.y = parentStart.y + this.relativePosition.x * Math.sin(parentAngle) + this.relativePosition.y * Math.cos(parentAngle);
            this.angle = parentAngle + this.relativeAngle;
        }
    }
    
    // Calculate base damage for this branch
    calculateBaseDamage() {
        // Base damage - will be multiplied by weapon config
        return 30;
    }
    
    // Check collision with enemies
    checkCollision(enemies, currentLength) {
        const hitEnemies = [];
        this.endPoint = {
            x: this.startPoint.x + Math.cos(this.angle) * currentLength,
            y: this.startPoint.y + Math.sin(this.angle) * currentLength
        };
        
        for (const enemy of enemies) {
            if (this.isPointOnLineSegment(
                this.startPoint.x, this.startPoint.y,
                this.endPoint.x, this.endPoint.y,
                enemy.position.x, enemy.position.y,
                enemy.size
            )) {
                hitEnemies.push(enemy);
            }
        }
        
        return hitEnemies;
    }
    
    // Helper method to check if a point is near a line segment
    isPointOnLineSegment(x1, y1, x2, y2, px, py, radius) {
        // Check if a point is within radius distance of a line segment
        const A = x2 - x1;
        const B = y2 - y1;
        const C = px - x1;
        const D = py - y1;
        
        const dot = C * A + D * B;
        const lenSq = A * A + B * B;
        
        if (lenSq === 0) return Math.sqrt(C * C + D * D) <= radius;
        
        const param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * A;
            yy = y1 + param * B;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy) <= radius;
    }
}