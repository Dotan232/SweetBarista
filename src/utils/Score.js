import { CONFIG } from '../config.js';

export class Score {
    constructor() {
        this.currentScore = 0;
        this.levelScore = 0;
        this.totalScore = 0;
    }
    
    calculateLevelScore(timeRemaining, maxTime, cupsCompleted, totalCups) {
        const timeBonus = Math.floor((timeRemaining / maxTime) * 1000);
        const completionBonus = Math.floor((cupsCompleted / totalCups) * 500);
        const perfectionBonus = cupsCompleted === totalCups ? 500 : 0;
        
        this.levelScore = timeBonus + completionBonus + perfectionBonus;
        this.totalScore += this.levelScore;
        
        return this.levelScore;
    }
    
    renderLevelIndicator(ctx, level, x, y) {
        ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Level ${level}`, x, y);
    }
    
    renderScore(ctx, x, y) {
        ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
        ctx.font = '18px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`Score: ${this.totalScore}`, x, y);
    }
    
    renderLevelComplete(ctx, canvasWidth, canvasHeight, level, timeRemaining, maxTime) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.fillStyle = CONFIG.COLORS.SUCCESS_GREEN;
        ctx.fillRect(centerX - 200, centerY - 150, 400, 300);
        
        ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Level Complete!', centerX, centerY - 80);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Level ${level}`, centerX, centerY - 40);
        
        const timeBonus = Math.floor((timeRemaining / maxTime) * 1000);
        ctx.fillText(`Time Bonus: ${timeBonus}`, centerX, centerY);
        ctx.fillText(`Level Score: ${this.levelScore}`, centerX, centerY + 30);
        ctx.fillText(`Total Score: ${this.totalScore}`, centerX, centerY + 60);
        
        this.renderNextButton(ctx, centerX, centerY + 100);
    }
    
    renderLevelFailed(ctx, canvasWidth, canvasHeight, level) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.fillStyle = CONFIG.COLORS.DANGER_RED;
        ctx.fillRect(centerX - 200, centerY - 150, 400, 300);
        
        ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time\'s Up!', centerX, centerY - 40);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Level ${level} Failed`, centerX, centerY);
        
        this.renderRetryButton(ctx, centerX, centerY + 60);
    }
    
    renderNextButton(ctx, x, y) {
        ctx.fillStyle = CONFIG.COLORS.BUTTON_PRIMARY;
        ctx.fillRect(x - 60, y - 20, 120, 40);
        
        ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Next Level', x, y + 6);
    }
    
    renderRetryButton(ctx, x, y) {
        ctx.fillStyle = CONFIG.COLORS.BUTTON_PRIMARY;
        ctx.fillRect(x - 60, y - 20, 120, 40);
        
        ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Retry', x, y + 6);
    }
    
    reset() {
        this.currentScore = 0;
        this.levelScore = 0;
        this.totalScore = 0;
    }
}