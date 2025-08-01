class Obstacle {
    constructor(x, y, width, height, isHazardous = false, isHealthBoost = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isHazardous = isHazardous;
        this.isHealthBoost = isHealthBoost; // New property for health-boosting obstacles
        
        if (this.isHazardous) {
            this.color = '#ff0000';
            this.damage = 50;
            this.bounceMultiplier = 30;
            this.pulsePhase = 0;
            this.energyField = 0;
            this.warningGlow = 0;
            this.scanlineOffset = 0;
            // Electric arc properties for hazardous obstacles
            this.arcPhase = 0;
            this.arcPoints = [];
            this.arcColor = '#ff0000';
        } else if (this.isHealthBoost) {
            // Health-boosting obstacle properties
            this.color = '#00ff00'; // Green color
            this.healAmount = 50; // Amount of health to restore
            this.bounceMultiplier = 60; // 2x normal bounce strength
            this.pulsePhase = 0;
            this.energyField = 0;
            this.glowIntensity = 0;
            // Electric arc properties for health-boosting obstacles
            this.arcPhase = 0;
            this.arcPoints = [];
            this.arcColor = '#00ff00';
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
            this.arcPhase += 0.2;
            
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
            
            // Update electric arc points
            this.updateElectricArcs();
        } else if (this.isHealthBoost) {
            // Update health-boosting obstacle effects
            this.pulsePhase += 0.1;
            this.energyField += 0.05;
            this.arcPhase += 0.15;
            
            // Update glow intensity based on player proximity
            const distance = Math.sqrt(
                (player.position.x - (this.x + this.width/2)) ** 2 +
                (player.position.y - (this.y + this.height/2)) ** 2
            );
            
            const maxDistance = 100;
            if (distance < maxDistance) {
                this.glowIntensity = Math.min(this.glowIntensity + 0.1, 1);
            } else {
                this.glowIntensity = Math.max(this.glowIntensity - 0.05, 0);
            }
            
            // Update electric arc points
            this.updateElectricArcs();
        }
    }

    updateElectricArcs() {
        // Clear existing arc points
        this.arcPoints = [];
        
        // Generate arc points around the perimeter
        const pointSpacing = 15; // Distance between arc points
        const arcVariation = 5; // Random variation in arc positions
        
        // Top edge
        for (let x = this.x; x <= this.x + this.width; x += pointSpacing) {
            const variation = (Math.random() - 0.5) * arcVariation;
            this.arcPoints.push({
                x: x + variation,
                y: this.y + variation
            });
        }
        
        // Right edge
        for (let y = this.y; y <= this.y + this.height; y += pointSpacing) {
            const variation = (Math.random() - 0.5) * arcVariation;
            this.arcPoints.push({
                x: this.x + this.width + variation,
                y: y + variation
            });
        }
        
        // Bottom edge
        for (let x = this.x + this.width; x >= this.x; x -= pointSpacing) {
            const variation = (Math.random() - 0.5) * arcVariation;
            this.arcPoints.push({
                x: x + variation,
                y: this.y + this.height + variation
            });
        }
        
        // Left edge
        for (let y = this.y + this.height; y >= this.y; y -= pointSpacing) {
            const variation = (Math.random() - 0.5) * arcVariation;
            this.arcPoints.push({
                x: this.x + variation,
                y: y + variation
            });
        }
    }

    renderElectricArcs(ctx) {
        if (!this.arcPoints || this.arcPoints.length === 0) return;
        
        // Set up electric arc rendering properties
        ctx.strokeStyle = this.arcColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = this.arcColor;
        ctx.shadowBlur = 10;
        
        // Draw electric arcs between points
        ctx.beginPath();
        for (let i = 0; i < this.arcPoints.length - 1; i++) {
            const pointA = this.arcPoints[i];
            const pointB = this.arcPoints[i + 1];
            
            // Add some randomness to the arc path for a more dynamic effect
            const midX = (pointA.x + pointB.x) / 2 + (Math.random() - 0.5) * 10;
            const midY = (pointA.y + pointB.y) / 2 + (Math.random() - 0.5) * 10;
            
            if (i === 0) {
                ctx.moveTo(pointA.x, pointA.y);
            }
            
            // Create a curved path for the electric arc effect
            ctx.quadraticCurveTo(midX, midY, pointB.x, pointB.y);
        }
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Draw additional sparks at random points for more dynamic effect
        for (let i = 0; i < this.arcPoints.length; i += 3) {
            if (Math.random() < 0.3) { // 30% chance to draw a spark
                const point = this.arcPoints[i];
                ctx.fillStyle = this.arcColor;
                ctx.shadowColor = this.arcColor;
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 1 + Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
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
            
            // **ELECTRIC ARCS**
            this.renderElectricArcs(ctx);
            
        } else if (this.isHealthBoost) {
            // **HEALTH-BOOSTING OBSTACLE**
            
            // Pulsing green glow
            const pulseIntensity = 0.5 + Math.sin(this.pulsePhase) * 0.4;
            const glowSize = 8 + Math.sin(this.pulsePhase * 2) * 4;
            
            // Outer glow
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = glowSize * pulseIntensity;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Energy field effect
            const fieldAlpha = 0.3 + Math.sin(this.energyField) * 0.15;
            ctx.strokeStyle = `rgba(0, 255, 0, ${fieldAlpha})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
            
            // Inner glow layers
            ctx.shadowBlur = 4;
            ctx.fillStyle = '#44ff44';
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
            
            // Bright center
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#66ff66';
            ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
            
            // **HEALTH SYMBOL**
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', this.x + this.width/2, this.y + this.height/2);
            
            // **GLOW INDICATOR WHEN PLAYER IS NEAR**
            if (this.glowIntensity > 0) {
                // Healing border
                ctx.strokeStyle = `rgba(0, 255, 0, ${this.glowIntensity * 0.8})`;
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);
                
                // Healing text
                ctx.fillStyle = `rgba(255, 255, 255, ${this.glowIntensity})`;
                ctx.font = 'bold 10px monospace';
                ctx.fillText('HEAL', this.x + this.width/2, this.y - 10);
            }
            
            // **ENERGY WAVES**
            const waveRadius = 3 + Math.sin(this.pulsePhase * 4) * 2;
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            
            // Top waves
            for (let x = this.x + 5; x < this.x + this.width - 5; x += 8) {
                ctx.beginPath();
                ctx.arc(x, this.y, waveRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Bottom waves
            for (let x = this.x + 5; x < this.x + this.width - 5; x += 8) {
                ctx.beginPath();
                ctx.arc(x, this.y + this.height, waveRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Left waves
            for (let y = this.y + 5; y < this.y + this.height - 5; y += 8) {
                ctx.beginPath();
                ctx.arc(this.x, y, waveRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Right waves
            for (let y = this.y + 5; y < this.y + this.height - 5; y += 8) {
                ctx.beginPath();
                ctx.arc(this.x + this.width, y, waveRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // **ELECTRIC ARCS**
            this.renderElectricArcs(ctx);
            
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
        
        // Calculate squared distance
        const dx = objX - closestX;
        const dy = objY - closestY;
        const distanceSquared = dx * dx + dy * dy;
        
        return distanceSquared < objRadius * objRadius;
    }

    resolveCollision(obj) {
        const objX = obj.position.x;
        const objY = obj.position.y;
        const objRadius = obj.size || obj.radius || 10;
        
        // Find closest point
        const closestX = Math.max(this.x, Math.min(objX, this.x + this.width));
        const closestY = Math.max(this.y, Math.min(objY, this.y + this.height));
        
        // Calculate overlap using squared distance
        const dx = objX - closestX;
        const dy = objY - closestY;
        const distanceSquared = dx * dx + dy * dy;
        
        if (distanceSquared < objRadius * objRadius && distanceSquared > 0) {
            const distance = Math.sqrt(distanceSquared);
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
            } else if (this.isHealthBoost && window.game && window.game.particleSystem) {
                // Add green sparks for health-boosting obstacles
                window.game.particleSystem.addImpactSparks(
                    closestX,
                    closestY,
                    '#00ff00',
                    8
                );
            }
            
            // Apply damage if this is a hazardous obstacle and obj is player
            if (this.isHazardous && obj.takeDamage) {
                obj.takeDamage(this.damage, 'hazard');
            }
            // Apply health gain if this is a health-boosting obstacle and obj is player
            else if (this.isHealthBoost && obj.heal) {
                obj.heal(this.healAmount);
                
                // Add visual feedback for health gain
                if (window.game && window.game.particleSystem) {
                    // Add healing particles
                    for (let i = 0; i < 15; i++) {
                        const angle = (Math.PI * 2 * i) / 15;
                        const speed = 1 + Math.random() * 2;
                        window.game.particleSystem.addParticle({
                            x: obj.position.x,
                            y: obj.position.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            color: '#00ff00',
                            life: 30,
                            maxLife: 30,
                            size: 2 + Math.random() * 2
                        });
                    }
                    
                    // Add screen flash effect
                    window.game.particleSystem.addFlash(
                        obj.position.x,
                        obj.position.y,
                        50,
                        '#00ff00'
                    );
                }
            }
        }
    }
}