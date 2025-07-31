// Trail system for player movement effects
import { PLAYER_CONFIG } from './config.js';
console.log('Trail.js module loaded');

export class TrailBuffer {
    constructor(maxPoints = 100) {
        this.maxPoints = maxPoints;
        this.points = new Array(maxPoints);
        this.head = 0;
        this.count = 0;
        console.log('TrailBuffer constructor called');
        this.lastUpdateTime = 0;
    }

    /**
     * Add a new point to the trail
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} velocityX - X velocity component
     * @param {number} velocityY - Y velocity component
     * @param {number} recoilForceX - X recoil force component
     * @param {number} recoilForceY - Y recoil force component
     */
    addPoint(x, y, velocityX, velocityY, recoilForceX, recoilForceY) {
        const now = Date.now();
        // Only add points at most every 16ms (60 FPS) to prevent excessive points
        if (now - this.lastUpdateTime < 16) {
            return;
        }
        
        // Only add points if there's significant recoil force
        const recoilMagnitude = Math.sqrt(recoilForceX * recoilForceX + recoilForceY * recoilForceY);
        if (recoilMagnitude <= 0.5) {
            return;
        }
        
        this.lastUpdateTime = now;

        this.points[this.head] = {
            x: x,
            y: y,
            velocityX: velocityX,
            velocityY: velocityY,
            recoilForceX: recoilForceX,
            recoilForceY: recoilForceY,
            time: now,
            size: this.calculateSize(velocityX, velocityY, recoilForceX, recoilForceY)
        };

        this.head = (this.head + 1) % this.maxPoints;
        if (this.count < this.maxPoints) {
            this.count++;
        }
    }

    /**
     * Calculate the size of the trail point based on movement intensity
     * @param {number} velocityX - X velocity component
     * @param {number} velocityY - Y velocity component
     * @param {number} recoilForceX - X recoil force component
     * @param {number} recoilForceY - Y recoil force component
     * @returns {number} - Calculated size
     */
    calculateSize(velocityX, velocityY, recoilForceX, recoilForceY) {
        // Calculate movement intensity based on velocity and recoil
        const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        const recoilMagnitude = Math.sqrt(recoilForceX * recoilForceX + recoilForceY * recoilForceY);
        
        // Base size with intensity influence
        const baseSize = 3;
        const intensity = velocityMagnitude + recoilMagnitude * 0.5;
        return baseSize + Math.min(intensity * 2, 10); // Cap the size increase
    }

    /**
     * Get all valid points in order from oldest to newest
     * @returns {Array} - Array of trail points
     */
    getPoints() {
        const result = [];
        const now = Date.now();
        const fadeDuration = PLAYER_CONFIG.TRAIL.FADE_DURATION; // 1000ms

        // Calculate starting index (oldest point)
        let startIndex = (this.head - this.count + this.maxPoints) % this.maxPoints;

        for (let i = 0; i < this.count; i++) {
            const index = (startIndex + i) % this.maxPoints;
            const point = this.points[index];
            
            if (point) {
                // Calculate age and alpha for fading effect
                const age = now - point.time;
                const alpha = Math.max(0, 1 - (age / fadeDuration));
                
                if (alpha > 0) {
                    result.push({
                        ...point,
                        alpha: alpha
                    });
                }
            }
        }

        return result;
    }

    /**
     * Check if the trail should be visible based on movement
     * @param {number} velocityX - X velocity component
     * @param {number} velocityY - Y velocity component
     * @param {number} recoilForceX - X recoil force component
     * @param {number} recoilForceY - Y recoil force component
     * @returns {boolean} - Whether the trail should be visible
     */
    isVisible(velocityX, velocityY, recoilForceX, recoilForceY) {
        const recoilMagnitude = Math.sqrt(recoilForceX * recoilForceX + recoilForceY * recoilForceY);
        
        // Trail is visible only if there's significant recoil force
        return recoilMagnitude > 0.5; // Increased threshold to make it more selective
    }

    /**
     * Render the trail with glow effects and variable width
    render(ctx) {
        console.log('TrailBuffer render called');
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    render(ctx) {
        const points = this.getPoints();
        if (points.length < 2) return;

        const trailColor = PLAYER_CONFIG.TRAIL.COLOR; // '#FFFFFF'

        // Render each point with glow effect
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            
            // Set up glow effect using shadow
            ctx.shadowColor = trailColor;
            ctx.shadowBlur = 10 * point.alpha; // Glow intensity based on alpha
            ctx.globalAlpha = point.alpha;
            
            // Draw the trail point
            ctx.fillStyle = trailColor;
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.size * point.alpha, 0, Math.PI * 2);
            ctx.fill();
            
            // Reset shadow and alpha for next point
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        // Render smooth trail lines between points
        ctx.strokeStyle = trailColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw connecting lines with gradient alpha
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const nextPoint = i < points.length - 1 ? points[i + 1] : null;
            
            if (nextPoint) {
                // Set line width based on average size of points
                const avgSize = (point.size + nextPoint.size) / 2;
                ctx.lineWidth = avgSize * point.alpha;
                
                // Set shadow for glow effect
                ctx.shadowColor = trailColor;
                ctx.shadowBlur = 5 * point.alpha;
                ctx.globalAlpha = point.alpha * 0.7; // Slightly more transparent for lines
                
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                }
                ctx.lineTo(nextPoint.x, nextPoint.y);
            }
        }
        ctx.stroke();
        
        // Reset context
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }

    /**
     * Clear all points from the trail
     */
    clear() {
        this.head = 0;
        this.count = 0;
    }
}