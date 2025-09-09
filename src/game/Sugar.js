import { CONFIG } from '../config.js';

export class Sugar {
    constructor(x, y, assetLoader = null) {
        this.assetLoader = assetLoader;
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        
        // Physics
        this.velocityX = (Math.random() - 0.5) * 20; // Small horizontal variance
        this.velocityY = 5; // Very small initial downward velocity
        this.gravity = CONFIG.PHYSICS.GRAVITY;
        
        console.log(`Sugar cube created at (${x}, ${y}) with gravity ${this.gravity}`);
        
        // Visual properties
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 8; // rad/s
        this.scale = 1;
        this.opacity = 1;
        
        // State management
        this.isActive = true;
        this.isFalling = true;
        this.isSplashing = false;
        this.isBouncing = false;
        this.hasLanded = false;
        
        // Animation timers
        this.splashTime = 0;
        this.maxSplashTime = 300; // ms
        this.bounceTime = 0;
        this.maxBounceTime = 500; // ms
        this.bounceHeight = 30; // pixels
        this.lifetime = 0;
        this.maxLifetime = 5000; // 5 seconds max
        
        // Motion trail
        this.trail = [];
        this.maxTrailLength = 8;
    }
    
    update(deltaTime, canvasHeight) {
        this.lifetime += deltaTime;
        const dt = deltaTime / 1000; // Convert to seconds
        
        if (this.isSplashing) {
            this.updateSplashAnimation(deltaTime);
            return;
        }
        
        if (this.isBouncing) {
            this.updateBounceAnimation(deltaTime);
            return;
        }
        
        if (this.isFalling) {
            this.updateFallingPhysics(dt, canvasHeight);
        }
        
        // Cleanup if lifetime exceeded
        if (this.lifetime > this.maxLifetime) {
            this.isActive = false;
        }
    }
    
    updateFallingPhysics(dt, canvasHeight) {
        // Store previous position for trail
        this.trail.push({ x: this.x, y: this.y, time: this.lifetime });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Apply gravity
        this.velocityY += this.gravity * dt;
        
        // Update position
        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;
        
        // Apply air resistance to horizontal movement
        this.velocityX *= 0.995;
        
        // Update rotation
        this.rotation += this.rotationSpeed * dt;
        
        // Check if hit ground
        if (this.y + this.height/2 >= canvasHeight - 50) { // Leave some margin for UI
            this.hitGround(canvasHeight);
        }
    }
    
    updateSplashAnimation(deltaTime) {
        this.splashTime += deltaTime;
        const progress = this.splashTime / this.maxSplashTime;
        
        // Fade out and scale up
        this.opacity = Math.max(0, 1 - progress);
        this.scale = 1 + progress * 1.5;
        
        if (this.splashTime >= this.maxSplashTime) {
            this.isActive = false;
        }
    }
    
    hitGround(canvasHeight) {
        if (!this.hasLanded) {
            this.hasLanded = true;
            this.isFalling = false;
            this.y = canvasHeight - 50 - this.height/2;
            this.velocityY = 0;
            this.splash();
        }
    }
    
    render(ctx) {
        if (!this.isActive) return;
        
        // Render trail first (without transformations)
        if (this.isFalling && !this.isSplashing) {
            this.renderTrail(ctx);
        }
        
        // Then render the cube with transformations
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.rotation);
        
        if (this.isSplashing) {
            this.renderSplash(ctx);
        } else {
            this.renderCube(ctx);
        }
        
        ctx.restore();
    }
    
    renderTrail(ctx) {
        if (!this.isFalling || this.trail.length < 2) return;
        
        // Draw motion trail
        for (let i = 0; i < this.trail.length; i++) {
            const current = this.trail[i];
            const alpha = (i / this.trail.length) * 0.4; // Fade trail
            const size = 6 + (i / this.trail.length) * 4; // Smaller trail particles
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = CONFIG.COLORS.SUGAR_WHITE;
            ctx.fillRect(current.x - size/2, current.y - size/2, size, size);
            ctx.restore();
        }
    }
    
    renderCube(ctx) {
        // Try to use image asset first, fallback to geometric shape
        const cubeImage = this.assetLoader ? this.assetLoader.getImage('sugar_cube') : null;
        
        if (cubeImage) {
            // Render image centered
            const imageWidth = this.width;
            const imageHeight = this.height;
            ctx.drawImage(cubeImage, -imageWidth/2, -imageHeight/2, imageWidth, imageHeight);
            
            // Add sparkle effects while falling (on top of image)
            if (this.isFalling) {
                const time = this.lifetime * 0.01;
                const sparkleAlpha = (Math.sin(time * 2) + 1) / 2 * 0.4;
                ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
                ctx.fillRect(-2, -2, 4, 4);
                ctx.fillRect(4, 3, 2, 2);
                ctx.fillRect(-5, 2, 3, 3);
            }
        } else {
            // Fallback to geometric rendering
            // Main cube body
            ctx.fillStyle = CONFIG.COLORS.SUGAR_WHITE;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            
            // Cube outline
            ctx.strokeStyle = CONFIG.COLORS.TEXT_DARK;
            ctx.lineWidth = 2;
            ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
            
            // Inner highlight for 3D effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(-this.width/2 + 2, -this.height/2 + 2, this.width - 6, this.height - 6);
            
            // Small shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(-this.width/2 + 1, this.height/2 - 2, this.width - 2, 2);
            
            // Sparkle effects while falling
            if (this.isFalling) {
                const time = this.lifetime * 0.01;
                const sparkleAlpha = (Math.sin(time * 2) + 1) / 2 * 0.4;
                ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
                ctx.fillRect(-2, -2, 4, 4);
                ctx.fillRect(4, 3, 2, 2);
                ctx.fillRect(-5, 2, 3, 3);
            }
        }
    }
    
    renderSplash(ctx) {
        const progress = this.splashTime / this.maxSplashTime;
        
        // Try to use image asset first, fallback to geometric shape
        const splashImage = this.assetLoader ? this.assetLoader.getImage('sugar_splash') : null;
        
        if (window.DEBUG_MODE) {
            console.log(`🔍 Sugar splash: assetLoader=${!!this.assetLoader}, splashImage=${!!splashImage}, typeof=${typeof splashImage}`);
        }
        
        if (splashImage) {
            // Render splash image with scaling and fading
            const imageWidth = this.width * (1 + progress * 2); // Scale up over time
            const imageHeight = this.height * (1 + progress * 2);
            const alpha = 1 - progress; // Fade out
            
            console.log(`🎨 Rendering sugar_splash image: ${imageWidth}x${imageHeight}, alpha: ${alpha}`);
            
            ctx.globalAlpha = alpha;
            ctx.drawImage(splashImage, -imageWidth/2, -imageHeight/2, imageWidth, imageHeight);
            ctx.globalAlpha = 1; // Reset alpha
        } else {
            // Fallback to geometric rendering
            const particleCount = 8;
            
            ctx.fillStyle = CONFIG.COLORS.SUGAR_WHITE;
            ctx.strokeStyle = CONFIG.COLORS.TEXT_DARK;
            ctx.lineWidth = 1;
            
            // Create expanding particle effect
            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2;
                const distance = progress * 25; // How far particles spread
                const particleX = Math.cos(angle) * distance;
                const particleY = Math.sin(angle) * distance - (progress * 10); // Some particles fall
                
                const particleSize = 4 - (progress * 2); // Shrink over time
                if (particleSize > 0) {
                    ctx.fillRect(particleX - particleSize/2, particleY - particleSize/2, particleSize, particleSize);
                    ctx.strokeRect(particleX - particleSize/2, particleY - particleSize/2, particleSize, particleSize);
                }
            }
            
            // Center impact effect
            const impactSize = 8 * (1 - progress);
            if (impactSize > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${1 - progress})`;
                ctx.fillRect(-impactSize/2, -impactSize/2, impactSize, impactSize);
            }
        }
    }
    
    getBounds() {
        return {
            left: this.x - this.width/2,
            right: this.x + this.width/2,
            top: this.y - this.height/2,
            bottom: this.y + this.height/2
        };
    }
    
    splash() {
        this.isSplashing = true;
        this.splashTime = 0;
    }
    
    bounce() {
        console.log('Sugar bounce method called successfully');
        this.isBouncing = true;
        this.isFalling = false;
        this.bounceTime = 0;
        this.bounceStartY = this.y;
    }
    
    updateBounceAnimation(deltaTime) {
        this.bounceTime += deltaTime;
        const progress = this.bounceTime / this.maxBounceTime;
        
        // Bounce up and then fade out
        const bounceProgress = Math.sin(progress * Math.PI); // Creates arc motion
        this.y = this.bounceStartY - (bounceProgress * this.bounceHeight);
        
        // Fade out and scale down
        this.opacity = Math.max(0, 1 - progress);
        this.scale = Math.max(0.5, 1 - progress * 0.5);
        
        // Spin faster during bounce
        this.rotation += this.rotationSpeed * (deltaTime / 1000) * 2;
        
        if (this.bounceTime >= this.maxBounceTime) {
            this.isActive = false;
        }
    }
    
    isOffScreen(canvasHeight) {
        return this.y - this.height/2 > canvasHeight;
    }
}