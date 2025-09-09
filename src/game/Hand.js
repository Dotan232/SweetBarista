import { CONFIG } from '../config.js';

export class Hand {
    constructor(x, y, canvas, assetLoader = null) {
        this.assetLoader = assetLoader;
        console.log(`🖐️ Hand constructor: assetLoader=${!!assetLoader}, images=${assetLoader ? Object.keys(assetLoader.images).length : 0}`);
        this.canvas = canvas;
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        
        // Mobile-responsive sizing
        const isMobile = window.innerWidth <= 768;
        const mobileScale = isMobile ? 0.7 : 1.0; // Reduce size on mobile
        this.width = Math.floor(110 * mobileScale);  // Increased from 80 for better visibility, scaled for mobile
        this.height = Math.floor(110 * mobileScale); // Increased from 80 for better visibility, scaled for mobile
        
        // Animation states
        this.state = 'idle'; // idle, dropping, returning
        this.dropAnimationTime = 0;
        this.maxDropAnimationTime = 200;
        this.returnSpeed = 300; // pixels per second
        
        // Position management
        this.targetX = x;
        this.moveSpeed = 400; // pixels per second
        this.boundaryLeft = 50;
        this.boundaryRight = canvas.width - 50;
        
        // Visual properties
        this.scale = 1;
        this.rotation = 0;
        this.opacity = 1;
        
        // Sugar cube holding
        this.hasSugar = true;
        this.sugarOffset = { x: 0, y: 25 };
    }
    
    update(deltaTime) {
        const dt = deltaTime / 1000; // Convert to seconds
        
        // Handle horizontal movement to target
        if (Math.abs(this.x - this.targetX) > 1) {
            const direction = this.targetX > this.x ? 1 : -1;
            this.x += direction * this.moveSpeed * dt;
            
            // Snap to target when close enough
            if (Math.abs(this.x - this.targetX) < this.moveSpeed * dt) {
                this.x = this.targetX;
            }
        }
        
        // Handle animation states
        switch(this.state) {
            case 'dropping':
                this.updateDroppingAnimation(deltaTime);
                break;
            case 'returning':
                this.updateReturningAnimation(deltaTime);
                break;
            case 'idle':
                this.updateIdleAnimation(deltaTime);
                break;
        }
        
        // Update canvas boundaries if canvas resized
        this.boundaryRight = this.canvas.width - 50;
    }
    
    updateDroppingAnimation(deltaTime) {
        this.dropAnimationTime += deltaTime;
        const progress = Math.min(this.dropAnimationTime / this.maxDropAnimationTime, 1);
        
        // Drop animation curve (ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        this.y = this.startY + (easedProgress * 15); // Move down slightly
        this.scale = 1 - (easedProgress * 0.1); // Slight shrink
        this.rotation = easedProgress * 0.1; // Slight rotation
        
        if (progress >= 1) {
            this.state = 'returning';
            this.dropAnimationTime = 0;
            this.hasSugar = false;
        }
    }
    
    updateReturningAnimation(deltaTime) {
        this.dropAnimationTime += deltaTime;
        const returnTime = 300; // ms
        const progress = Math.min(this.dropAnimationTime / returnTime, 1);
        
        // Return animation (ease-in)
        const easedProgress = Math.pow(progress, 2);
        this.y = this.startY + (15 * (1 - easedProgress));
        this.scale = 0.9 + (easedProgress * 0.1);
        this.rotation = 0.1 * (1 - easedProgress);
        
        if (progress >= 1) {
            this.state = 'idle';
            this.dropAnimationTime = 0;
            this.y = this.startY;
            this.scale = 1;
            this.rotation = 0;
            this.hasSugar = true;
        }
    }
    
    updateIdleAnimation(deltaTime) {
        // Subtle idle breathing animation
        const time = Date.now() * 0.002;
        this.scale = 1 + Math.sin(time) * 0.02;
        this.y = this.startY + Math.sin(time * 1.5) * 1;
    }
    
    drop() {
        if (this.state === 'idle' && this.hasSugar) {
            this.state = 'dropping';
            this.dropAnimationTime = 0;
            return true; // Successfully initiated drop
        }
        return false; // Cannot drop (already dropping or no sugar)
    }
    
    render(ctx) {
        ctx.save();
        
        // Apply transformations
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        
        // Draw hand (placeholder - will be replaced with sprite)
        this.renderPlaceholderHand(ctx);
        
        // Draw sugar cube only when dropping (hand_idle.png already has built-in sugar cube)
        // This allows the sugar cube to animate separately from the hand during drop
        if (this.hasSugar && this.state === 'dropping') {
            this.renderSugarCube(ctx);
        }
        
        // Keep existing hand asset only - no emoji overlay
        
        ctx.restore();
    }
    
    renderPlaceholderHand(ctx) {
        // Try to use image asset first, fallback to geometric shape
        const imageName = this.state === 'dropping' ? 'hand_dropping' : 'hand_idle';
        const handImage = this.assetLoader ? this.assetLoader.getImage(imageName) : null;
        
        if (window.DEBUG_MODE) {
            console.log(`🖐️ Hand render: state=${this.state}, imageName=${imageName}, assetLoader=${!!this.assetLoader}, handImage=${!!handImage}`);
        }
        
        if (handImage) {
            // Render image centered
            const imageWidth = this.width;
            const imageHeight = this.height;
            ctx.drawImage(handImage, -imageWidth/2, -imageHeight/2, imageWidth, imageHeight);
        } else {
            // Fallback to geometric rendering
            ctx.fillStyle = '#D2691E';
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height/2);
            
            // Fingers
            ctx.fillStyle = '#B8860B';
            for (let i = 0; i < 4; i++) {
                const fingerX = -this.width/2 + 8 + (i * 12);
                ctx.fillRect(fingerX, -this.height/2, 8, 20);
            }
            
            // Thumb
            ctx.fillRect(-this.width/2 - 5, -this.height/2 + 10, 8, 15);
            
            // Hand outline
            ctx.strokeStyle = CONFIG.COLORS.TEXT_DARK;
            ctx.lineWidth = 2;
            ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height/2);
        }
    }
    
    renderV0HandEmoji(ctx) {
        // v0 Design: Add hand emoji (🤏) as visual enhancement matching mockup
        const emojiSize = Math.floor(this.width * 0.8); // Emoji size relative to hand size
        
        // Position emoji slightly above the existing hand for visual clarity
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${emojiSize}px Arial`;
        
        // Add subtle glow effect
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        
        // Render the pinching hand emoji from v0 mockup
        ctx.fillText('🤏', 0, -this.height * 0.1);
        
        ctx.restore();
    }
    
    renderSugarCube(ctx) {
        const cubeSize = 18; // Increased from 12 for better visibility
        const cubeX = this.sugarOffset.x - cubeSize/2;
        const cubeY = this.sugarOffset.y - cubeSize/2;
        
        // Try to use image asset first, fallback to geometric shape
        const sugarCubeImage = this.assetLoader ? this.assetLoader.getImage('sugar_cube') : null;
        
        if (window.DEBUG_MODE) {
            console.log(`🧊 Sugar cube render: assetLoader=${!!this.assetLoader}, sugarCubeImage=${!!sugarCubeImage}`);
        }
        
        if (sugarCubeImage) {
            // Render sugar cube image
            ctx.drawImage(sugarCubeImage, cubeX, cubeY, cubeSize, cubeSize);
            
            // Add sparkle effect overlay if idle
            if (this.state === 'idle') {
                const time = Date.now() * 0.005;
                const sparkleAlpha = (Math.sin(time) + 1) / 2 * 0.2;
                ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
                ctx.fillRect(cubeX + 2, cubeY + 2, 3, 3);
                ctx.fillRect(cubeX + 7, cubeY + 4, 2, 2);
            }
        } else {
            // Fallback to geometric rendering
            ctx.fillStyle = CONFIG.COLORS.SUGAR_WHITE;
            ctx.fillRect(cubeX, cubeY, cubeSize, cubeSize);
            
            // Sugar cube outline
            ctx.strokeStyle = CONFIG.COLORS.TEXT_DARK;
            ctx.lineWidth = 1;
            ctx.strokeRect(cubeX, cubeY, cubeSize, cubeSize);
            
            // Sugar sparkle effect
            if (this.state === 'idle') {
                const time = Date.now() * 0.005;
                const sparkleAlpha = (Math.sin(time) + 1) / 2 * 0.3;
                ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
                ctx.fillRect(cubeX + 2, cubeY + 2, 3, 3);
                ctx.fillRect(cubeX + 7, cubeY + 4, 2, 2);
            }
        }
    }
    
    setPosition(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.targetX = x;
    }
    
    moveToX(targetX) {
        // Constrain movement within boundaries
        this.targetX = Math.max(this.boundaryLeft, Math.min(this.boundaryRight, targetX));
    }
    
    getCurrentPosition() {
        return { x: this.x, y: this.y };
    }
    
    getSugarDropPosition() {
        return { 
            x: this.x, 
            y: this.y + this.height/2 + 10 
        };
    }
    
    canDrop() {
        return this.state === 'idle' && this.hasSugar;
    }
    
    isIdle() {
        return this.state === 'idle';
    }
    
    isDropping() {
        return this.state === 'dropping';
    }
    
    reset() {
        this.state = 'idle';
        this.x = this.startX;
        this.y = this.startY;
        this.targetX = this.startX;
        this.scale = 1;
        this.rotation = 0;
        this.opacity = 1;
        this.hasSugar = true;
        this.dropAnimationTime = 0;
    }
}