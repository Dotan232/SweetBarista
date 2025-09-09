import { CONFIG } from '../config.js';

export class Menu {
    constructor(canvas) {
        this.canvas = canvas;
        this.buttons = [];
        this.hoveredButton = null;
    }
    
    renderMainMenu(ctx) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        ctx.fillStyle = CONFIG.COLORS.BG_BLUE;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Sweet Barista', centerX, centerY - 100);
        
        ctx.font = '24px Arial';
        ctx.fillText('Coffee Shop', centerX, centerY - 60);
        
        this.renderButton(ctx, centerX, centerY, 'Start Game', 'start');
        this.renderButton(ctx, centerX, centerY + 60, 'Options', 'options');
    }
    
    renderButton(ctx, x, y, text, id) {
        const isHovered = this.hoveredButton === id;
        const buttonColor = isHovered ? CONFIG.COLORS.BUTTON_HOVER : CONFIG.COLORS.BUTTON_PRIMARY;
        
        ctx.fillStyle = buttonColor;
        ctx.fillRect(x - 100, y - 25, 200, 50);
        
        ctx.strokeStyle = CONFIG.COLORS.TEXT_DARK;
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 100, y - 25, 200, 50);
        
        ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y + 6);
        
        this.buttons.push({
            id: id,
            x: x - 100,
            y: y - 25,
            width: 200,
            height: 50
        });
    }
    
    renderOptions(ctx) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        ctx.fillStyle = CONFIG.COLORS.BG_BLUE;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Options', centerX, centerY - 120);
        
        ctx.font = '20px Arial';
        ctx.fillText('Sound Effects', centerX - 100, centerY - 60);
        ctx.fillText('Background Music', centerX - 100, centerY - 20);
        
        this.renderToggleButton(ctx, centerX + 50, centerY - 75, 'sfx', true);
        this.renderToggleButton(ctx, centerX + 50, centerY - 35, 'music', true);
        
        this.renderButton(ctx, centerX, centerY + 40, 'Back', 'back');
    }
    
    renderToggleButton(ctx, x, y, id, isOn) {
        const buttonColor = isOn ? CONFIG.COLORS.SUCCESS_GREEN : CONFIG.COLORS.DANGER_RED;
        const buttonText = isOn ? 'ON' : 'OFF';
        
        ctx.fillStyle = buttonColor;
        ctx.fillRect(x, y, 80, 30);
        
        ctx.strokeStyle = CONFIG.COLORS.TEXT_DARK;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 80, 30);
        
        ctx.fillStyle = CONFIG.COLORS.TEXT_LIGHT;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(buttonText, x + 40, y + 20);
    }
    
    handleClick(x, y) {
        for (let button of this.buttons) {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                return button.id;
            }
        }
        return null;
    }
    
    handleMouseMove(x, y) {
        this.hoveredButton = null;
        for (let button of this.buttons) {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                this.hoveredButton = button.id;
                break;
            }
        }
    }
    
    clearButtons() {
        this.buttons = [];
    }
}