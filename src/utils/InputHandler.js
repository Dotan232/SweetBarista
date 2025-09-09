export class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouse = { x: 0, y: 0, isPressed: false };
        this.touch = { x: 0, y: 0, isActive: false };
        this.inputQueue = [];
        this.lastInputTime = 0;
        this.inputCooldown = 100;
        
        // Visual feedback system
        this.feedbackEffects = [];
        this.spacebarPressed = false;
        this.spacebarPressTime = 0;
        this.touchFeedback = [];
        
        this.onSpacebar = null;
        this.onClick = null;
        this.onTouch = null;
        this.onSoundToggle = null;
        this.onMusicToggle = null;
        
        this.initEventListeners();
        this.initVisualFeedback();
    }
    
    initEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
        
        if (e.code === 'Space') {
            e.preventDefault();
            this.spacebarPressed = true;
            this.spacebarPressTime = Date.now();
            this.addSpacebarFeedback();
            this.handleSpaceInput();
        } else if (e.code === 'KeyS') {
            e.preventDefault();
            if (this.onSoundToggle) {
                this.onSoundToggle();
            }
        } else if (e.code === 'KeyM') {
            e.preventDefault();
            if (this.onMusicToggle) {
                this.onMusicToggle();
            }
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
        
        if (e.code === 'Space') {
            this.spacebarPressed = false;
        }
    }
    
    handleMouseDown(e) {
        this.updateMousePosition(e);
        this.mouse.isPressed = true;
        this.addClickFeedback(this.mouse.x, this.mouse.y);
        
        if (this.onClick) {
            this.onClick(this.mouse.x, this.mouse.y);
        }
    }
    
    handleMouseMove(e) {
        this.updateMousePosition(e);
    }
    
    handleMouseUp(e) {
        this.mouse.isPressed = false;
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.updateTouchPosition(touch);
        this.touch.isActive = true;
        this.addTouchFeedback(this.touch.x, this.touch.y);
        
        if (this.onTouch) {
            this.onTouch(this.touch.x, this.touch.y);
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.updateTouchPosition(touch);
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.touch.isActive = false;
    }
    
    handleSpaceInput() {
        const now = Date.now();
        if (now - this.lastInputTime >= this.inputCooldown) {
            this.lastInputTime = now;
            if (this.onSpacebar) {
                this.onSpacebar();
            }
        }
    }
    
    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        this.mouse.x = (e.clientX - rect.left) * scaleX;
        this.mouse.y = (e.clientY - rect.top) * scaleY;
    }
    
    updateTouchPosition(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        this.touch.x = (touch.clientX - rect.left) * scaleX;
        this.touch.y = (touch.clientY - rect.top) * scaleY;
    }
    
    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }
    
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    getTouchPosition() {
        return { x: this.touch.x, y: this.touch.y };
    }
    
    isMousePressed() {
        return this.mouse.isPressed;
    }
    
    isTouchActive() {
        return this.touch.isActive;
    }
    
    setSpacebarCallback(callback) {
        this.onSpacebar = callback;
    }
    
    setClickCallback(callback) {
        this.onClick = callback;
    }
    
    setTouchCallback(callback) {
        this.onTouch = callback;
    }
    
    setSoundToggleCallback(callback) {
        this.onSoundToggle = callback;
    }
    
    setMusicToggleCallback(callback) {
        this.onMusicToggle = callback;
    }
    
    initVisualFeedback() {
        // Initialize visual feedback system
        this.dropButton = document.getElementById('dropButton');
    }
    
    update(deltaTime) {
        // Update visual feedback effects
        this.updateFeedbackEffects(deltaTime);
        this.updateButtonStates();
    }
    
    updateFeedbackEffects(deltaTime) {
        // Update ripple effects
        for (let i = this.feedbackEffects.length - 1; i >= 0; i--) {
            const effect = this.feedbackEffects[i];
            effect.time += deltaTime;
            effect.radius += effect.speed * (deltaTime / 1000);
            effect.opacity = Math.max(0, 1 - (effect.time / effect.maxTime));
            
            if (effect.time >= effect.maxTime) {
                this.feedbackEffects.splice(i, 1);
            }
        }
        
        // Update touch feedback
        for (let i = this.touchFeedback.length - 1; i >= 0; i--) {
            const feedback = this.touchFeedback[i];
            feedback.time += deltaTime;
            feedback.scale = 1 + (feedback.time / feedback.maxTime) * 0.5;
            feedback.opacity = Math.max(0, 1 - (feedback.time / feedback.maxTime));
            
            if (feedback.time >= feedback.maxTime) {
                this.touchFeedback.splice(i, 1);
            }
        }
    }
    
    updateButtonStates() {
        // Update drop button visual state
        if (this.dropButton) {
            if (this.spacebarPressed || this.touch.isActive) {
                this.dropButton.classList.add('active');
            } else {
                this.dropButton.classList.remove('active');
            }
        }
    }
    
    addSpacebarFeedback() {
        // Visual feedback for spacebar press
        const centerX = this.canvas.width / 2;
        const bottomY = this.canvas.height - 50;
        
        this.feedbackEffects.push({
            x: centerX,
            y: bottomY,
            radius: 5,
            speed: 100,
            opacity: 1,
            time: 0,
            maxTime: 300,
            color: '#4CAF50',
            type: 'spacebar'
        });
    }
    
    addClickFeedback(x, y) {
        // Visual feedback for mouse clicks
        this.feedbackEffects.push({
            x: x,
            y: y,
            radius: 3,
            speed: 80,
            opacity: 1,
            time: 0,
            maxTime: 400,
            color: '#2196F3',
            type: 'click'
        });
    }
    
    addTouchFeedback(x, y) {
        // Visual feedback for touch
        this.touchFeedback.push({
            x: x,
            y: y,
            scale: 1,
            opacity: 1,
            time: 0,
            maxTime: 200,
            color: '#FF9800',
            type: 'touch'
        });
    }
    
    renderFeedback(ctx) {
        // Render ripple effects
        for (const effect of this.feedbackEffects) {
            ctx.save();
            ctx.globalAlpha = effect.opacity;
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        // Render touch feedback
        for (const feedback of this.touchFeedback) {
            ctx.save();
            ctx.globalAlpha = feedback.opacity;
            ctx.fillStyle = feedback.color;
            ctx.translate(feedback.x, feedback.y);
            ctx.scale(feedback.scale, feedback.scale);
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Render spacebar indicator
        if (this.spacebarPressed) {
            const timeSincePress = Date.now() - this.spacebarPressTime;
            if (timeSincePress < 200) {
                const alpha = 1 - (timeSincePress / 200);
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(this.canvas.width / 2 - 50, this.canvas.height - 30, 100, 20);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('SPACE', this.canvas.width / 2, this.canvas.height - 18);
                ctx.restore();
            }
        }
    }
    
    getActiveFeedbackCount() {
        return this.feedbackEffects.length + this.touchFeedback.length;
    }
    
    clearAllFeedback() {
        this.feedbackEffects = [];
        this.touchFeedback = [];
        this.spacebarPressed = false;
    }
}