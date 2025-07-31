export class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = [];
        
        // Initialize grid
        for (let i = 0; i < this.cols * this.rows; i++) {
            this.grid.push([]);
        }
    }
    
    // Convert 2D coordinates to 1D index
    getIndex(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        // Clamp to grid bounds
        const clampedCol = Math.max(0, Math.min(col, this.cols - 1));
        const clampedRow = Math.max(0, Math.min(row, this.rows - 1));
        
        return clampedRow * this.cols + clampedCol;
    }
    
    // Insert an entity into the grid
    insert(entity) {
        // Handle different entity types
        if (entity.position) {
            // Player, enemy, or bullet
            const x = entity.position.x;
            const y = entity.position.y;
            const index = this.getIndex(x, y);
            this.grid[index].push(entity);
        } else if (entity.x !== undefined && entity.y !== undefined) {
            // Obstacle
            // For obstacles, we insert them into all cells they overlap
            const startX = Math.floor(entity.x / this.cellSize);
            const startY = Math.floor(entity.y / this.cellSize);
            const endX = Math.floor((entity.x + entity.width) / this.cellSize);
            const endY = Math.floor((entity.y + entity.height) / this.cellSize);
            
            // Clamp to grid bounds
            const clampedStartX = Math.max(0, Math.min(startX, this.cols - 1));
            const clampedStartY = Math.max(0, Math.min(startY, this.rows - 1));
            const clampedEndX = Math.max(0, Math.min(endX, this.cols - 1));
            const clampedEndY = Math.max(0, Math.min(endY, this.rows - 1));
            
            // Insert into all overlapping cells
            for (let y = clampedStartY; y <= clampedEndY; y++) {
                for (let x = clampedStartX; x <= clampedEndX; x++) {
                    const index = y * this.cols + x;
                    this.grid[index].push(entity);
                }
            }
        }
    }
    
    // Query entities in the same cell as the given entity
    query(entity) {
        const entities = new Set();
        
        if (entity.position) {
            // Player, enemy, or bullet
            const x = entity.position.x;
            const y = entity.position.y;
            const index = this.getIndex(x, y);
            for (const other of this.grid[index]) {
                entities.add(other);
            }
        } else if (entity.x !== undefined && entity.y !== undefined) {
            // Obstacle
            // For obstacles, we query all cells they overlap
            const startX = Math.floor(entity.x / this.cellSize);
            const startY = Math.floor(entity.y / this.cellSize);
            const endX = Math.floor((entity.x + entity.width) / this.cellSize);
            const endY = Math.floor((entity.y + entity.height) / this.cellSize);
            
            // Clamp to grid bounds
            const clampedStartX = Math.max(0, Math.min(startX, this.cols - 1));
            const clampedStartY = Math.max(0, Math.min(startY, this.rows - 1));
            const clampedEndX = Math.max(0, Math.min(endX, this.cols - 1));
            const clampedEndY = Math.max(0, Math.min(endY, this.rows - 1));
            
            // Query all overlapping cells
            for (let y = clampedStartY; y <= clampedEndY; y++) {
                for (let x = clampedStartX; x <= clampedEndX; x++) {
                    const index = y * this.cols + x;
                    for (const other of this.grid[index]) {
                        entities.add(other);
                    }
                }
            }
        }
        
        return Array.from(entities);
    }
    
    // Query entities in a circular area
    queryInCircle(x, y, radius) {
        const entities = new Set();
        
        // Determine which cells the circle overlaps
        const startCol = Math.max(0, Math.floor((x - radius) / this.cellSize));
        const startRow = Math.max(0, Math.floor((y - radius) / this.cellSize));
        const endCol = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
        const endRow = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));
        
        // Check all entities in overlapping cells
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const index = row * this.cols + col;
                for (const entity of this.grid[index]) {
                    entities.add(entity);
                }
            }
        }
        
        return Array.from(entities);
    }
    
    // Clear the grid
    clear() {
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = [];
        }
    }
    
    // Utility method to calculate squared distance (more efficient than Math.sqrt)
    static getSquaredDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }
}