class Obstacle {
    constructor(x, y, width, height, isHazardous = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isHazardous = isHazardous;
        
        if (this.isHazardous) {
            this.color = '#ff0000';
            this.damage = 25;
            this.bounceMultiplier = 30;
            this.pulsePhase = 0;
            this.energyField = 0;
            this.warningGlow = 0;
            this.scanlineOffset = 0;
        } else {
            this.color = '#444444';
            this.damage = 0;
            this.bounceMultiplier = 1;
            this.pulsePhase = 0;
            this.energyField = 0;
        }
    }

    update(player) {
        if (this.isHazardous) {
            this.pulsePhase += 0.15;
            this.energyField += 0.1;
            this.scanlineOffset += 0.5;
            
            // Update warning glow based on player proximity
            const distance = Math.sqrt(
                (player.position.x - (this.x + this.width/2)) ** 2 +
                (player.position.y - (this.y + this.height/2)) ** 2
            );
            
            const maxDistance = 100;
            if (distance < maxDistance) {
                this.warningGlow = Math.min(this.warningGlow + 0.1, 1);
            } else {
                this.warningGlow = Math.max(this.warningGlow - 0.05, 0);
            }
        }
    }

    render(ctx) {
        if (this.isHazardous) {
            // **ENHANCED HAZARDOUS OBSTACLE WITH SPACE DOOM EFFECTS**
            
            // Pulsing red glow
            const pulseIntensity = 0.5 + Math.sin(this.pulsePhase) * 0.3;
            const glowSize = 10 + Math.sin(this.pulsePhase * 2) * 5;
            
            // Outer glow
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = glowSize * pulseIntensity;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Energy field effect
            const fieldAlpha = 0.2 + Math.sin(this.energyField) * 0.1;
            ctx.strokeStyle = `rgba(255, 0, 0, ${fieldAlpha})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
            
            // Inner glow layers
            ctx.shadowBlur = 5;
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
            
            // Bright center with scanlines
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ff6666';
            ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
            
            // **SCANLINE EFFECT**
            ctx.strokeStyle = `rgba(255, 0, 0, ${0.3 + Math.sin(this.scanlineOffset) * 0.2})`;
            ctx.lineWidth = 1;
            for (let i = 0; i < this.height; i += 4) {
                const alpha = 0.5 + Math.sin(this.scanlineOffset + i * 0.1) * 0.3;
                ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + i);
                ctx.lineTo(this.x + this.width, this.y + i);
                ctx.stroke();
            }
            
            // **WARNING INDICATOR WHEN PLAYER IS NEAR**
            if (this.warningGlow > 0) {
                // Warning border
                ctx.strokeStyle = `rgba(255, 255, 0, ${this.warningGlow * 0.8})`;
                ctx.lineWidth = 3;
                ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
                
                // Warning triangles
                ctx.fillStyle = `rgba(255, 255, 0, ${this.warningGlow})`;
                const triangleSize = 8;
                
                // Top-left triangle
                ctx.beginPath();
                ctx.moveTo(this.x - triangleSize, this.y);
                ctx.lineTo(this.x, this.y - triangleSize);
                ctx.lineTo(this.x, this.y);
                ctx.closePath();
                ctx.fill();
                
                // Top-right triangle
                ctx.beginPath();
                ctx.moveTo(this.x + this.width + triangleSize, this.y);
                ctx.lineTo(this.x + this.width, this.y - triangleSize);
                ctx.lineTo(this.x + this.width, this.y);
                ctx.closePath();
                ctx.fill();
                
                // Bottom-left triangle
                ctx.beginPath();
                ctx.moveTo(this.x - triangleSize, this.y + this.height);
                ctx.lineTo(this.x, this.y + this.height + triangleSize);
                ctx.lineTo(this.x, this.y + this.height);
                ctx.closePath();
                ctx.fill();
                
                // Bottom-right triangle
                ctx.beginPath();
                ctx.moveTo(this.x + this.width + triangleSize, this.y + this.height);
                ctx.lineTo(this.x + this.width, this.y + this.height + triangleSize);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.closePath();
                ctx.fill();
                
                // Warning text
                ctx.fillStyle = `rgba(255, 255, 255, ${this.warningGlow})`;
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('DANGER', this.x + this.width/2, this.y - 15);
            }
            
            // **ENERGY SPIKES**
            const spikeLength = 5 + Math.sin(this.pulsePhase * 3) * 3;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            
            // Top spikes
            for (let x = this.x + 5; x < this.x + this.width - 5; x += 10) {
                ctx.beginPath();
                ctx.moveTo(x, this.y);
                ctx.lineTo(x, this.y - spikeLength);
                ctx.stroke();
            }
            
            // Bottom spikes
            for (let x = this.x + 5; x < this.x + this.width - 5; x += 10) {
                ctx.beginPath();
                ctx.moveTo(x, this.y + this.height);
                ctx.lineTo(x, this.y + this.height + spikeLength);
                ctx.stroke();
            }
            
            // Left spikes
            for (let y = this.y + 5; y < this.y + this.height - 5; y += 10) {
                ctx.beginPath();
                ctx.moveTo(this.x, y);
                ctx.lineTo(this.x - spikeLength, y);
                ctx.stroke();
            }
            
            // Right spikes
            for (let y = this.y + 5; y < this.y + this.height - 5; y += 10) {
                ctx.beginPath();
                ctx.moveTo(this.x + this.width, y);
                ctx.lineTo(this.x + this.width + spikeLength, y);
                ctx.stroke();
            }
            
            // **DIGITAL NOISE EFFECT**
            for (let i = 0; i < 20; i++) {
                const noiseX = this.x + Math.random() * this.width;
                const noiseY = this.y + Math.random() * this.height;
                const noiseAlpha = 0.3 + Math.random() * 0.4;
                
                ctx.fillStyle = `rgba(255, 100, 100, ${noiseAlpha})`;
                ctx.fillRect(noiseX, noiseY, 1, 1);
            }
            
        } else {
            // **ENHANCED NEUTRAL OBSTACLE**
            
            // 3D metallic effect
            const gradient = ctx.createLinearGradient(
                this.x, this.y,
                this.x + this.width, this.y + this.height
            );
            gradient.addColorStop(0, '#666666');
            gradient.addColorStop(0.5, '#555555');
            gradient.addColorStop(1, '#333333');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Highlight edges
            ctx.strokeStyle = '#888888';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // Inner highlight
            ctx.fillStyle = '#777777';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
            
            // Metallic shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 4);
            ctx.fillRect(this.x + 2, this.y + 2, 4, this.height - 4);
        }
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
            const pushX = (dx / distance) * overlap * this.bounceMultiplier;
            const pushY = (dy / distance) * overlap * this.bounceMultiplier;
            
            obj.position.x += pushX;
            obj.position.y += pushY;
            
            // **IMPACT SPARKS ON COLLISION**
            if (this.isHazardous && window.game && window.game.particleSystem) {
                window.game.particleSystem.addImpactSparks(
                    closestX,
                    closestY,
                    '#ff0000',
                    8
                );
            }
            
            // Apply damage if this is a hazardous obstacle and obj is player
            if (this.isHazardous && obj.takeDamage) {
                obj.takeDamage(this.damage, 'hazard');
            }
        }
    }
}