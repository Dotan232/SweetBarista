import { CONFIG } from '../config.js';

export class Timer {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxTime = 60;
        this.currentTime = 60;
        this.isPulsing = false;
        this.pulseTime = 0;
    }
    
    update(deltaTime, currentTime, maxTime) {
        this.currentTime = currentTime;
        this.maxTime = maxTime;
        
        if (this.currentTime <= 5 && this.currentTime > 0) {
            this.isPulsing = true;
            this.pulseTime += deltaTime;
        } else {
            this.isPulsing = false;
            this.pulseTime = 0;
        }
    }
    
    render(ctx) {
        const progress = this.currentTime / this.maxTime;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        let fillColor;
        if (progress > 0.5) {
            fillColor = CONFIG.COLORS.SUCCESS_GREEN;
        } else if (progress > 0.25) {
            fillColor = CONFIG.COLORS.WARNING_YELLOW;
        } else {
            fillColor = CONFIG.COLORS.DANGER_RED;
        }
        
        if (this.isPulsing) {
            const pulseAlpha = 0.5 + Math.sin(this.pulseTime * 0.01) * 0.5;
            const r = parseInt(fillColor.slice(1, 3), 16);
            const g = parseInt(fillColor.slice(3, 5), 16);
            const b = parseInt(fillColor.slice(5, 7), 16);
            fillColor = `rgba(${r}, ${g}, ${b}, ${pulseAlpha})`;
        }
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(this.x, this.y, this.width * progress, this.height);
        
        ctx.strokeStyle = CONFIG.COLORS.TEXT_DARK;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        this.renderTimeText(ctx);
    }
    
    renderTimeText(ctx) {
        ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        
        const seconds = Math.ceil(this.currentTime);
        ctx.fillText(`${seconds}s`, this.x + this.width/2, this.y + this.height/2 + 6);
    }
}