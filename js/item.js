class Item {
    constructor(x, y, type) {
        this.position = new Vector2D(x, y);
        this.type = type;
        this.size = 10;
        this.pulse = 0;
    }

    update() {
        this.pulse += 0.1;
    }

    render(ctx) {
        this.update();
        
        const glowSize = this.size + Math.sin(this.pulse) * 3;
        
        if (this.type === 'health') {
            // Health pack
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, glowSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Cross symbol
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.position.x - 3, this.position.y - 8, 6, 16);
            ctx.fillRect(this.position.x - 8, this.position.y - 3, 16, 6);
        }
    }
}