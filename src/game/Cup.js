import { CONFIG } from '../config.js?v=77';

export class Cup {
    constructor(x, y, size = 'medium', conveyorY = 0, assetLoader = null) {
        // Position and movement
        this.startX = x;
        this.x = x;
        this.y = y;
        this.conveyorY = conveyorY; // Y position of the conveyor belt
        
        // Slot-based positioning system (set by Game.js)
        this.slotIndex = 0;
        
        // Mobile-responsive slot spacing (will be overridden by Game.js)
        const isMobile = window.innerWidth <= 768;
        const mobileScale = isMobile ? 0.75 : 1.0;
        const maxCupWidth = Math.floor(110 * mobileScale);
        const safetyMargin = Math.floor(50 * mobileScale);
        this.slotSpacing = maxCupWidth + safetyMargin; // Mobile-responsive default
        
        this.offScreenStart = -800;
        this.totalSlots = 3;
        
        // Visual properties
        this.size = size;
        this.width = this.getSizeWidth();
        this.height = this.getSizeHeight();
        this.scale = 1;
        this.opacity = 1;
        this.wobble = 0; // For movement animation
        
        // Game mechanics
        this.requiredSugar = this.generateSugarRequirement();
        this.currentSugar = 0;
        this.isComplete = false;
        this.isActive = true;
        
        // Animation and timing
        this.animationTime = 0;
        this.completionTime = 0;
        this.hasBeenServed = false;
        
        // Asset loader for images
        this.assetLoader = assetLoader;
        
        // Overfill mechanics
        this.isOverfilled = false;
        this.overfillFlashTime = 0;
        this.maxOverfillFlash = 300; // 300ms red flash
        
        // Preview system
        this.isInPreviewZone = false;
        this.previewIntensity = 0;
        this.distanceFromDropZone = 0;
        this.previewPulse = 0;
        
        // Customer name system
        this.customerName = this.generateCustomerName();
        this.orderNoteScale = 1;
        this.orderNoteOpacity = 1;
        
        // State integrity protection
        this.isCustomerDataLocked = false; // Prevents unwanted changes during gameplay
        this.stateValidationId = Math.random().toString(36).substr(2, 9); // Unique state identifier
        
        if (window.DEBUG_MODE) {
            console.log(`Cup created: ${this.size} size for ${this.customerName}, needs ${this.requiredSugar} sugar cubes (ID: ${this.stateValidationId})`);
            // Cup rendering will be determined at render time (image assets vs geometric fallback)
        }
    }
    
    getSizeWidth() {
        const isMobile = window.innerWidth <= 768;
        const mobileScale = isMobile ? 0.75 : 1.0; // Reduce size on mobile
        
        let baseWidth;
        switch(this.size) {
            case 'small': baseWidth = 70; break;
            case 'medium': baseWidth = 90; break;
            case 'large': baseWidth = 110; break;
            default: baseWidth = 90;
        }
        return Math.floor(baseWidth * mobileScale);
    }
    
    getSizeHeight() {
        const isMobile = window.innerWidth <= 768;
        const mobileScale = isMobile ? 0.75 : 1.0; // Reduce size on mobile
        
        let baseHeight;
        switch(this.size) {
            case 'small': baseHeight = 60; break;
            case 'medium': baseHeight = 75; break;
            case 'large': baseHeight = 90; break;
            default: baseHeight = 75;
        }
        return Math.floor(baseHeight * mobileScale);
    }
    
    getCupColor() {
        switch(this.size) {
            case 'small': return CONFIG.COLORS.COFFEE_BROWN;
            case 'medium': return '#8B4513'; // Saddle Brown
            case 'large': return '#654321'; // Dark Brown
            default: return CONFIG.COLORS.COFFEE_BROWN;
        }
    }
    
    darkenColor(color, factor) {
        // Convert hex color to RGB values and darken by factor (0.0 to 1.0)
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const darkenedR = Math.max(0, Math.floor(r * (1 - factor)));
        const darkenedG = Math.max(0, Math.floor(g * (1 - factor)));
        const darkenedB = Math.max(0, Math.floor(b * (1 - factor)));
        
        return `rgb(${darkenedR}, ${darkenedG}, ${darkenedB})`;
    }
    
    lightenColor(color, factor) {
        // Convert hex color to RGB values and lighten by factor (0.0 to 1.0)
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const lightenedR = Math.min(255, Math.floor(r + (255 - r) * factor));
        const lightenedG = Math.min(255, Math.floor(g + (255 - g) * factor));
        const lightenedB = Math.min(255, Math.floor(b + (255 - b) * factor));
        
        return `rgb(${lightenedR}, ${lightenedG}, ${lightenedB})`;
    }
    
    generateSugarRequirement() {
        const rand = Math.random();
        if (rand < CONFIG.SUGAR_DISTRIBUTION.ONE_SUGAR) {
            return 1;
        } else if (rand < CONFIG.SUGAR_DISTRIBUTION.ONE_SUGAR + CONFIG.SUGAR_DISTRIBUTION.TWO_SUGAR) {
            return 2;
        } else {
            return 3;
        }
    }
    
    generateCustomerName() {
        const names = [
            'John', 'Caitlyn', 'Paul', 'Sarah', 'Mike', 'Emma', 'Alex', 'Lisa',
            'David', 'Anna', 'Tom', 'Maria', 'Chris', 'Kate', 'Sam', 'Nina',
            'Josh', 'Amy', 'Ben', 'Zoe', 'Max', 'Lily', 'Luke', 'Eva',
            'Ryan', 'Maya', 'Jake', 'Mia', 'Leo', 'Ava', 'Owen', 'Sophie'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }
    
    addSugar() {
        if (this.currentSugar < this.requiredSugar) {
            this.currentSugar++;
            // Lock customer data once gameplay starts
            this.isCustomerDataLocked = true;
            if (window.DEBUG_MODE) {
                console.log(`[${this.size}] Sugar added: ${this.currentSugar}/${this.requiredSugar} (x=${Math.round(this.x)}, ID: ${this.stateValidationId})`);
            }
            
            if (this.currentSugar === this.requiredSugar) {
                this.isComplete = true;
                this.completionTime = Date.now();
                if (window.DEBUG_MODE) {
                    console.log(`[${this.size}] COMPLETED! ${this.requiredSugar} sugars at x=${Math.round(this.x)} (ID: ${this.stateValidationId})`);
                }
            }
            return true;
        }
        if (window.DEBUG_MODE) {
            console.log(`[${this.size}] Sugar rejected - cup already full (${this.currentSugar}/${this.requiredSugar})`);
        }
        return false; // Cup is already full
    }
    
    tryOverfill() {
        // Called when sugar cube hits an already complete cup
        if (this.isComplete) {
            this.isOverfilled = true;
            this.overfillFlashTime = 0;
            
            // Reset cup to 0 (harsh punishment for spam clicking)
            this.currentSugar = 0;
            this.isComplete = false;
            
            if (window.DEBUG_MODE) {
                console.log(`[${this.size}] OVERFILLED! Cup reset to 0/${this.requiredSugar} (x=${Math.round(this.x)})`);
            }
            return true; // Indicates overfill occurred
        }
        return false; // No overfill
    }
    
    canAcceptSugar() {
        return this.currentSugar < this.requiredSugar && this.isActive;
    }
    
    calculatePreviewStatus(dropZoneX, conveyorSpeed, isMobile = false) {
        // Calculate distance from drop zone
        this.distanceFromDropZone = Math.abs(this.x - dropZoneX);
        
        // Calculate preview distance based on speed and mobile status
        const baseDistance = CONFIG.PREVIEW_SYSTEM.BASE_PREVIEW_DISTANCE;
        const speedBonus = conveyorSpeed * CONFIG.PREVIEW_SYSTEM.SPEED_MULTIPLIER;
        const mobileBonus = isMobile ? CONFIG.PREVIEW_SYSTEM.MOBILE_DISTANCE_BONUS : 0;
        const previewDistance = baseDistance + speedBonus + mobileBonus;
        
        // Calculate time-based preview distance for guaranteed reaction time
        const pixelsPerSecond = conveyorSpeed * 60; // 60 pixels per second base speed
        const minReactionDistance = pixelsPerSecond * CONFIG.PREVIEW_SYSTEM.MIN_REACTION_TIME;
        const maxReactionDistance = pixelsPerSecond * CONFIG.PREVIEW_SYSTEM.MAX_REACTION_TIME;
        
        // Use the larger of calculated distance or minimum reaction distance
        const finalPreviewDistance = Math.max(previewDistance, minReactionDistance);
        
        // Determine if cup is in preview zone
        this.isInPreviewZone = this.distanceFromDropZone <= finalPreviewDistance && this.x < dropZoneX;
        
        // Calculate preview intensity (1.0 = closest, 0.0 = far away)
        if (this.isInPreviewZone) {
            const fadeStart = finalPreviewDistance * CONFIG.PREVIEW_SYSTEM.DISTANCE_FADE_START;
            if (this.distanceFromDropZone <= fadeStart) {
                this.previewIntensity = 1.0;
            } else {
                const fadeRange = finalPreviewDistance - fadeStart;
                const fadeProgress = (this.distanceFromDropZone - fadeStart) / fadeRange;
                this.previewIntensity = 1.0 - fadeProgress;
            }
        } else {
            this.previewIntensity = 0;
        }
        
        return {
            isInPreview: this.isInPreviewZone,
            intensity: this.previewIntensity,
            distance: this.distanceFromDropZone,
            previewDistance: finalPreviewDistance
        };
    }
    
    update(deltaTime, conveyorSpeed = 1, canvasWidth = 800) {
        this.animationTime += deltaTime;
        
        // Move on conveyor belt LEFT TO RIGHT (natural conveyor direction)
        this.x += conveyorSpeed * (deltaTime / 1000) * 60; // Move right
        
        // Gentle bobbing animation
        this.wobble = Math.sin(this.animationTime * 0.003) * 2;
        
        // Preview pulse animation for attention-grabbing
        this.previewPulse = Math.sin(this.animationTime * CONFIG.PREVIEW_SYSTEM.HIGHLIGHT_PULSE_SPEED) * 0.5 + 0.5;
        
        // Update overfill flash animation
        if (this.isOverfilled) {
            this.overfillFlashTime += deltaTime;
            if (this.overfillFlashTime >= this.maxOverfillFlash) {
                this.isOverfilled = false;
                this.overfillFlashTime = 0;
            }
        }
        
        // Completion celebration animation
        if (this.isComplete && !this.hasBeenServed) {
            const timeSinceCompletion = Date.now() - this.completionTime;
            if (timeSinceCompletion < 1500) { // 1.5 second celebration
                this.scale = 1 + Math.sin(timeSinceCompletion * 0.01) * 0.05;
            } else {
                this.scale = 1;
            }
        }
        
        // WRAP-AROUND: When cup exits right, reset to proper slot position to maintain spacing
        if (this.x - this.width/2 > canvasWidth) {
            // ENHANCED WRAP-AROUND: Validate state integrity before and after wrapping
            const stateBeforeWrap = {
                sugar: this.currentSugar,
                required: this.requiredSugar,
                complete: this.isComplete,
                customer: this.customerName
            };
            
            this.debugStateTransition('WRAP_START', {
                before: stateBeforeWrap,
                position: Math.round(this.x)
            });
            
            // SLOT-BASED POSITIONING: Reset to mathematically calculated slot position
            // This eliminates hard-coded positioning and prevents overlapping
            this.x = this.calculateSlotPosition();
            
            // Check cup state - ONLY reset cups that are fully completed and ready to be served
            // Incomplete cups MUST preserve their progress through wrap-around cycles
            const completedSugar = this.resetCup();
            
            // CRITICAL VALIDATION: Ensure state integrity after wrap-around
            const stateAfterWrap = {
                sugar: this.currentSugar,
                required: this.requiredSugar,
                complete: this.isComplete,
                customer: this.customerName
            };
            
            // For incomplete cups, state should be IDENTICAL
            if (stateBeforeWrap.sugar < stateBeforeWrap.required) {
                if (stateAfterWrap.sugar !== stateBeforeWrap.sugar || 
                    stateAfterWrap.required !== stateBeforeWrap.required ||
                    stateAfterWrap.customer !== stateBeforeWrap.customer) {
                    
                    console.error(`[${this.size}] CRITICAL: Incomplete cup state changed during wrap-around!`, {
                        before: stateBeforeWrap,
                        after: stateAfterWrap,
                        id: this.stateValidationId
                    });
                    
                    // EMERGENCY RESTORATION
                    this.currentSugar = stateBeforeWrap.sugar;
                    this.requiredSugar = stateBeforeWrap.required;
                    this.isComplete = stateBeforeWrap.complete;
                    this.customerName = stateBeforeWrap.customer;
                    
                    console.log(`[${this.size}] ✓ EMERGENCY: State restored for incomplete cup`);
                }
            }
            
            this.debugStateTransition('WRAP_COMPLETE', {
                after: { sugar: this.currentSugar, required: this.requiredSugar, complete: this.isComplete },
                position: Math.round(this.x),
                completedSugar
            });
            
            return { wrapped: true, completedSugar };
        }
        
        return { wrapped: false, completedSugar: 0 };
    }
    
    calculateSlotPosition() {
        // ARCHITECTURAL FIX: Calculate proper slot position to prevent overlapping
        // This replaces the hard-coded -200 positioning with mathematical calculation
        
        // Use slot-based system for consistent spacing
        const slotPosition = this.offScreenStart + (this.slotIndex * this.slotSpacing);
        
        if (window.DEBUG_MODE) {
            console.log(`[${this.size}] Slot reset: index=${this.slotIndex}, spacing=${this.slotSpacing}, position=${slotPosition}`);
        }
        
        return slotPosition;
    }
    
    // Simplified state validation for critical operations
    validateState() {
        return (this.currentSugar >= 0 && 
                this.currentSugar <= this.requiredSugar &&
                this.requiredSugar >= 1 && 
                this.requiredSugar <= 3 &&
                typeof this.customerName === 'string' &&
                this.customerName.length > 0);
    }
    
    // Simplified state recovery - PRESERVE existing customer data, only fix critical issues
    recoverState() {
        // CRITICAL: Only recover if values are truly invalid, preserve existing data
        
        // Fix sugar count only if invalid
        if (typeof this.currentSugar !== 'number' || this.currentSugar < 0) {
            this.currentSugar = 0;
        }
        
        // Fix required sugar only if invalid - PRESERVE existing requirement
        if (typeof this.requiredSugar !== 'number' || this.requiredSugar < 1 || this.requiredSugar > 3) {
            this.requiredSugar = this.generateSugarRequirement();
        }
        
        // Fix customer name only if missing - PRESERVE existing name
        if (typeof this.customerName !== 'string' || this.customerName.length === 0) {
            this.customerName = this.generateCustomerName();
        }
        
        // Ensure sugar count doesn't exceed requirement
        if (this.currentSugar > this.requiredSugar) {
            this.currentSugar = this.requiredSugar;
        }
        
        // Update completion status
        this.isComplete = (this.currentSugar === this.requiredSugar);
        
        if (window.DEBUG_MODE) {
            console.log(`[${this.size}] STATE RECOVERED - preserved ${this.customerName} with ${this.currentSugar}/${this.requiredSugar} sugar`);
        }
    }
    
    // Debug method for state transition logging
    debugStateTransition(phase, data) {
        if (window.DEBUG_MODE) {
            console.log(`[${this.size}] ${phase}:`, {
                id: this.stateValidationId,
                customer: this.customerName,
                ...data
            });
        }
    }
    
    resetCup() {
        // CUPS ARE PERSISTENT FOR ENTIRE LEVEL - NO RESETS ALLOWED
        // Each level has fixed cups with fixed customers and requirements
        // Cup state (sugar progress) is preserved through all wrap-around cycles
        
        if (window.DEBUG_MODE) {
            console.log(`[${this.size}] ✓ CUP PERSISTENT - ${this.customerName} maintains ${this.currentSugar}/${this.requiredSugar} sugar (complete: ${this.isComplete})`);
        }
        
        // Always return 0 - no cups are ever reset during level gameplay
        // Completed cups stay completed, incomplete cups keep their progress
        return 0;
    }
    
    render(ctx, isMobile = false) {
        ctx.save();
        
        // Apply transformations
        ctx.translate(this.x, this.y + this.wobble);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.opacity;
        
        // Detect if an image asset will be used for the cup
        const cupImageAvailable = !!(this.assetLoader && this.assetLoader.getImage(`cup_${this.size}`));
        
        // Render the cup body (image if available, otherwise geometric)
        this.renderCupBody(ctx);

        // Coffee/steam overlay is disabled for image assets to avoid misplacement;
        // keep it only for the geometric fallback.
        if (!cupImageAvailable) {
            this.renderCoffee(ctx);
            this.renderHandle(ctx);
        }
        
        // Always render progress and the customer note
        this.renderIntegratedProgress(ctx);
        this.renderOrderNote(ctx);
        
        // Red flash overlay for overfill
        if (this.isOverfilled) {
            const flashIntensity = 1 - (this.overfillFlashTime / this.maxOverfillFlash);
            ctx.fillStyle = `rgba(244, 67, 54, ${flashIntensity * 0.8})`;
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        }
        
        ctx.restore();
    }

    beginCupMouthClip(ctx) {
        // Define a safe clipping area representing the cup mouth region.
        // This keeps coffee/foam strictly inside the top opening even if
        // image assets have subtle variations.
        const coffeeWidth = this.width - 20;
        const coffeeY = -this.height/2 + 8;
        const clipHeight = 12;
        ctx.beginPath();
        ctx.rect(-coffeeWidth/2, coffeeY - 2, coffeeWidth, clipHeight);
        ctx.clip();
    }
    
    renderCupBody(ctx) {
        // USE ENHANCED CLEANED CUP ASSETS - Now with improved artifact removal
        if (this.assetLoader) { // Re-enable image rendering with cleaned assets
            const cupImageName = `cup_${this.size}`;
            const cupImage = this.assetLoader.getImage(cupImageName);
            
            if (cupImage) {
                // Use the actual cup image asset (background already removed by AssetLoader)
                ctx.save();
                
                // Draw cup image centered and scaled to match cup dimensions
                const imageWidth = this.width;
                const imageHeight = this.height;
                
                ctx.drawImage(
                    cupImage,
                    -imageWidth/2,
                    -imageHeight/2,
                    imageWidth,
                    imageHeight
                );
                
                if (window.DEBUG_MODE) {
                    console.log(`🖼️ [${this.size}] Using cup image asset: ${cupImageName} (${cupImage.width}x${cupImage.height} -> ${imageWidth}x${imageHeight})`);
                }
                
                ctx.restore();
                return; // Successfully rendered with image
            }
        }
        
        // Geometric fallback - FULL CUP RENDERING with transparent background
        if (window.DEBUG_MODE) {
            console.log(`🎨 [${this.size}] Using geometric fallback - cup image not available`);
        }
        
        const cupColor = this.getCupColor();
        
        // Cup body (trapezoid shape) - filled with gradient for realistic look
        ctx.save();
        
        // Create gradient for cup body
        const gradient = ctx.createLinearGradient(-this.width/2, -this.height/2, this.width/2, this.height/2);
        gradient.addColorStop(0, cupColor);
        gradient.addColorStop(1, this.darkenColor(cupColor, 0.3));
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = this.darkenColor(cupColor, 0.5);
        ctx.lineWidth = 2;
        
        // Draw filled cup body
        ctx.beginPath();
        ctx.moveTo(-this.width/2 + 5, -this.height/2); // Top left
        ctx.lineTo(this.width/2 - 5, -this.height/2);  // Top right
        ctx.lineTo(this.width/2, this.height/2);       // Bottom right
        ctx.lineTo(-this.width/2, this.height/2);      // Bottom left
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Cup rim for detail
        ctx.strokeStyle = this.lightenColor(cupColor, 0.3);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-this.width/2 + 5, -this.height/2);
        ctx.lineTo(this.width/2 - 5, -this.height/2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderCoffee(ctx) {
        // Coffee surface
        const coffeeWidth = this.width - 20;
        const coffeeY = -this.height/2 + 8;
        
        ctx.fillStyle = '#3E2723'; // Dark coffee
        ctx.fillRect(-coffeeWidth/2, coffeeY, coffeeWidth, 6);
        
        // Coffee foam/cream
        ctx.fillStyle = CONFIG.COLORS.CREAM_WHITE;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(-coffeeWidth/2 + 2, coffeeY, coffeeWidth - 4, 3);
        ctx.globalAlpha = 1;
        
        // Steam effect
        if (this.animationTime % 2000 < 1000) { // Show steam half the time
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const steamX = -10 + (i * 10);
                const steamOffset = Math.sin((this.animationTime + i * 500) * 0.005) * 3;
                ctx.beginPath();
                ctx.moveTo(steamX, coffeeY - 5);
                ctx.quadraticCurveTo(steamX + steamOffset, coffeeY - 15, steamX, coffeeY - 25);
                ctx.stroke();
            }
        }
    }
    
    renderHandle(ctx) {
        // INTEGRATED DESIGN: Handle stays strictly within cup visual bounds
        // Repositioned further inward to prevent any pixels extending beyond cup
        
        ctx.strokeStyle = this.getCupColor();
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Handle positioned well within cup bounds (no horizontal extension at all)
        ctx.arc(this.width/2 - 12, 0, 5, -Math.PI/4, Math.PI/4);
        ctx.stroke();
        
        // Handle outline - reduced thickness to stay within bounds
        ctx.strokeStyle = CONFIG.COLORS.TEXT_DARK;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.width/2 - 12, 0, 5, -Math.PI/4, Math.PI/4);
        ctx.stroke();
    }
    
    // CLEAN DESIGN: All preview and indicator systems removed for integrated cup design
    
    renderOrderNote(ctx) {
        // Calculate dynamic positioning to ensure note never touches the cup
        const gapBetweenNoteAndCup = 15; // Minimum gap in pixels
        
        // Get the order note image to calculate its scaled height
        const orderNoteImg = this.assetLoader && this.assetLoader.getImage('order_note_blank');
        
        let noteY;
        if (orderNoteImg) {
            // Calculate the note's scaled height first
            const targetNoteWidth = this.width * 0.8;
            const noteScale = targetNoteWidth / orderNoteImg.width;
            const minScale = 0.050;
            const maxScale = 0.118;
            const finalScale = Math.min(Math.max(noteScale, minScale), maxScale);
            const scaledNoteHeight = orderNoteImg.height * finalScale;
            
            // Position note so its bottom edge is gapBetweenNoteAndCup pixels above cup top
            noteY = -this.height/2 - gapBetweenNoteAndCup - (scaledNoteHeight / 2);
        } else {
            // Fallback positioning if no image
            noteY = -this.height/2 - 30;
        }
        
        // Try to render the order note background image
        if (this.assetLoader && this.assetLoader.getImage('order_note_blank')) {
            const orderNoteImg = this.assetLoader.getImage('order_note_blank');
            
            // Calculate scale based on cup width - note should be roughly same width as cup
            // Cup width is typically around 80-120px, so note should be similar
            const targetNoteWidth = this.width * 0.8; // Note slightly smaller than cup width
            const noteScale = targetNoteWidth / orderNoteImg.width;
            
            // Cap the scale to prevent it from being too large or too small - reduced by 25%, then 10% more
            const minScale = 0.050; // Minimum readable size (0.056 * 0.9)
            const maxScale = 0.118; // Maximum size to not overwhelm the game (0.131 * 0.9)
            const finalScale = Math.min(Math.max(noteScale, minScale), maxScale);
            
            // Draw the order note background - centered above the cup
            ctx.save();
            ctx.translate(0, noteY); // Center horizontally (x=0), positioned above cup
            ctx.scale(finalScale, finalScale);
            ctx.drawImage(orderNoteImg, -orderNoteImg.width/2, -orderNoteImg.height/2);
            ctx.restore();
            
            // Draw customer name on the note - centered with larger, more readable font
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#2D1810'; // Dark coffee color for handwritten look
            ctx.fillText(this.customerName, 0, noteY);
            
        } else {
            // Fallback: render text only if image not available
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Text with thin white outline for contrast
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.strokeText(this.customerName, 0, noteY);
            
            ctx.fillStyle = CONFIG.COLORS.TEXT_DARK;
            ctx.fillText(this.customerName, 0, noteY);
        }
    }
    
    renderIntegratedProgress(ctx) {
        // CLEAN PROGRESS INDICATORS - NO BACKGROUND PANELS
        const indicatorSize = 14; // Slightly larger for better visibility
        const indicatorSpacing = 18; // Clean spacing
        const progressY = this.height/2 + 15; // Below cup
        
        // Calculate layout - ensure it fits within cup width
        const maxAllowedWidth = this.width - 10;
        const totalWidth = Math.min(
            (this.requiredSugar * indicatorSpacing) - (indicatorSpacing - indicatorSize),
            maxAllowedWidth
        );
        const startX = -totalWidth/2;
        
        // NO BACKGROUND PANELS - Direct indicator rendering
        
        // Clean progress indicators without backgrounds
        for (let i = 0; i < this.requiredSugar; i++) {
            const indicatorX = startX + (i * indicatorSpacing);
            
            if (i < this.currentSugar) {
                // COMPLETED: Green checkmark circle - NO BACKGROUND
                
                // Green filled circle
                ctx.fillStyle = CONFIG.COLORS.SUCCESS_GREEN;
                ctx.beginPath();
                ctx.arc(indicatorX, progressY, indicatorSize/2, 0, Math.PI * 2);
                ctx.fill();
                
                // White checkmark
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(indicatorX - 3, progressY);
                ctx.lineTo(indicatorX - 1, progressY + 2);
                ctx.lineTo(indicatorX + 3, progressY - 2);
                ctx.stroke();
                ctx.lineCap = 'butt';
            } else {
                // EMPTY: Circle with white background (as requested by user)
                
                // White background fill
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(indicatorX, progressY, indicatorSize/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Circle outline
                ctx.strokeStyle = 'rgba(111, 78, 55, 0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(indicatorX, progressY, indicatorSize/2, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // Completion glow around indicators only
        if (this.isComplete && !this.hasBeenServed) {
            const timeSinceCompletion = Date.now() - this.completionTime;
            if (timeSinceCompletion < 1500) {
                const pulse = 0.7 + 0.3 * Math.sin(timeSinceCompletion * 0.006);
                
                ctx.shadowColor = CONFIG.COLORS.SUCCESS_GREEN;
                ctx.shadowBlur = 8;
                ctx.globalAlpha = pulse * 0.3;
                
                // Glow around each completed indicator
                for (let i = 0; i < this.currentSugar; i++) {
                    const indicatorX = startX + (i * indicatorSpacing);
                    ctx.fillStyle = CONFIG.COLORS.SUCCESS_GREEN;
                    ctx.beginPath();
                    ctx.arc(indicatorX, progressY, indicatorSize/2 + 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
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
    
    isOffScreen(canvasWidth = 800) {
        // For LEFT-TO-RIGHT movement, check if cup is off the RIGHT side  
        return this.x - this.width/2 > canvasWidth;
    }
}
