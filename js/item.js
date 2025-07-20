class Item {
    constructor(x, y, type) {
        this.position = new Vector2D(x, y);
        this.type = type;
        this.size = 15;
        this.color = type === 'health' ? '#ff0000' : '#00ff00';
        this.pulse = 0;
    }

    update() {
        this.pulse += 0.1;
    }

    render(ctx) {
        const scale = 1 + Math.sin(this.pulse) * 0.2;
        
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.scale(scale, scale);
        
        // Draw item
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        
        // Draw inner circle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}