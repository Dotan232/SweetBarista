import { Hand } from './Hand.js?v=77';
import { Sugar } from './Sugar.js?v=77';
import { Cup } from './Cup.js?v=77';
import { Level } from './Level.js?v=77';
import { InputHandler } from '../utils/InputHandler.js?v=77';
import { CollisionDetection } from '../utils/CollisionDetection.js?v=77';
import { AudioManager } from '../utils/AudioManager.js?v=77';
import { AssetLoader } from '../utils/AssetLoader.js?v=77';
import { HeaderUI } from '../utils/HeaderUI.js?v=77';
import { CONFIG } from '../config.js?v=77';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.state = 'loading';
        this.lastFrameTime = 0;
        this.running = false;
        
        // Performance monitoring
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.deltaTimeHistory = [];
        this.maxDeltaHistory = 60;
        this.showDebug = new URLSearchParams(window.location.search).has('debug');
        
        // Game objects
        this.hand = null;
        this.inputHandler = null;
        this.audioManager = null;
        this.assetLoader = null;
        this.headerUI = null;
        this.sugarCubes = [];
        this.coffeeCups = [];
        this.conveyorOffset = 0;
        
        // Level system
        this.currentLevel = null;
        this.levelNumber = 1;
        this.totalSugarDelivered = 0;
        this.lastDebugTime = 0;
        this.timeWarningPlayed = false;
        
        // Visual feedback for audio events
        this.audioFeedback = [];
        
        // Menu system
        this.menuState = 'main'; // 'main' or 'options'
        this.menuButtons = [];
        this.hoveredButton = null;
        this.selectedButton = null;
        
        // Pause system
        this.pauseButtonBounds = null;
        this.previousState = null;
        
        // Visual effects
        this.particles = [];
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
        this.fadeTransition = { opacity: 0, fadeIn: false, fadeOut: false, duration: 0, callback: null };
        
        this.initCanvas();
        // Asset loading and game object initialization moved to start() method
        
        // Platform detection
        this.isMobile = this.detectMobile();
        
        // Expose game instance for debugging
        if (this.showDebug) {
            window.game = this;
        }
    }
    
    initCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    async initGameObjects() {
        try {
            // Initialize asset loader with progress callbacks
            this.updateLoadingScreen(5, 'Initializing asset loader...');
            this.assetLoader = new AssetLoader();
            this.setupAssetLoadingCallbacks();
            
            // Load assets
            this.updateLoadingScreen(10, 'Starting asset loading...');
            if (this.showDebug) console.log('🎮 Starting asset loading...');
            await this.loadAssets();
            
            // Initialize input handler
            this.updateLoadingScreen(85, 'Initializing input handler...');
            this.inputHandler = new InputHandler(this.canvas);
            
            // Initialize audio manager
            this.updateLoadingScreen(90, 'Initializing audio system...');
            this.initAudioManager();
            
            // Initialize header UI
            this.updateLoadingScreen(92, 'Setting up UI components...');
            this.headerUI = new HeaderUI();
            this.setupHeaderCallbacks();
            
            // Initialize hand at top center with assets - positioned at very top of canvas
            this.updateLoadingScreen(95, 'Creating game objects...');
            const handX = this.canvas.width / 2;
            const handY = 10; // Very close to top edge for natural appearance
            if (this.showDebug) console.log(`🖐️ Creating Hand with assetLoader: ${!!this.assetLoader}, images loaded: ${this.assetLoader ? Object.keys(this.assetLoader.images).length : 0}`);
            this.hand = new Hand(handX, handY, this.canvas, this.assetLoader);
            
            // Connect input callbacks
            this.updateLoadingScreen(97, 'Setting up controls...');
            this.setupInputCallbacks();
            
            // Go to menu (assets loaded)
            this.state = 'menu';
            
            // Initialize level system
            this.updateLoadingScreen(98, 'Initializing game levels...');
            this.initLevel();
            
            // Initialize menu system
            this.updateLoadingScreen(99, 'Finalizing setup...');
            this.initMenuSystem();
            
            // Hide loading screen after everything is initialized
            this.updateLoadingScreen(100, 'Ready to play!');
            if (this.showDebug) console.log('✅ Game initialization complete, hiding loading screen');
            
            // Brief delay to show "Ready to play!" message, then hide loading screen
            setTimeout(() => {
                this.hideLoadingScreen();
                if (this.showDebug) console.log('🎉 Loading screen hidden - game should be visible now!');
            }, 500);
            
        } catch (error) {
            console.error('❌ CRITICAL: Game initialization failed:', error);
            console.error('❌ Error stack:', error.stack);
            this.updateLoadingScreen(0, `Error: ${error.message}`);
            
            // ALWAYS hide loading screen even if initialization fails
            setTimeout(() => {
                console.log('🚨 Force hiding loading screen due to initialization error');
                this.hideLoadingScreen();
                // Force display menu state even if initialization failed
                this.state = 'menu';
            }, 3000);
        }
    }
    
    setupAssetLoadingCallbacks() {
        // Set up progress callback to update loading screen
        this.assetLoader.onProgress = (loaded, total) => {
            const percentage = (loaded / total) * 100;
            if (this.showDebug) console.log(`📦 Asset loading progress: ${loaded}/${total} (${percentage.toFixed(1)}%`);
            this.updateLoadingScreen(percentage, `Loading assets... ${loaded}/${total}`);
        };
        
        // Set up completion callback
        this.assetLoader.onComplete = () => {
            if (this.showDebug) console.log('🎉 All assets loaded successfully!');
            this.updateLoadingScreen(100, 'Assets loaded!');
        };
    }
    
    updateLoadingScreen(percentage, text) {
        // Ensure DOM is ready before trying to update elements
        if (document.readyState === 'loading') {
            // If DOM is still loading, wait a bit and retry
            setTimeout(() => this.updateLoadingScreen(percentage, text), 100);
            return;
        }
        
        const loadingProgress = document.getElementById('loadingProgress');
        const loadingText = document.getElementById('loadingText');
        
        if (loadingProgress) {
            loadingProgress.style.width = `${percentage}%`;
            if (this.showDebug) console.log(`📊 Loading progress updated: ${percentage}%`);
        } else {
            console.warn('⚠️ Loading progress element not found');
        }
        
        if (loadingText) {
            loadingText.textContent = text;
            if (this.showDebug) console.log(`📝 Loading text updated: ${text}`);
        } else {
            console.warn('⚠️ Loading text element not found');
        }
    }

    async loadAssets() {
        if (this.showDebug) console.log('🚀 Loading game assets in background...');
        try {
            // Add a timeout to prevent infinite loading
            const loadingPromise = this.assetLoader.loadAllAssets();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Asset loading timeout after 30 seconds')), 30000)
            );
            
            await Promise.race([loadingPromise, timeoutPromise]);
            if (this.showDebug) console.log('✅ Assets loaded successfully! Game now has image graphics.');
        } catch (error) {
            console.warn('⚠️ Asset loading failed, using placeholder graphics:', error);
            // Even if asset loading fails, we should still proceed with the game
            this.updateLoadingScreen(100, 'Loading complete (fallback mode)');
        }
    }
    
    initAudioManager() {
        this.audioManager = new AudioManager();
        
        // Load sound effects
        const sounds = [
            { name: 'sugarDrop', id: 'audioSugarDrop' },
            { name: 'successHit', id: 'audioSuccessHit' },
            { name: 'miss', id: 'audioMiss' },
            { name: 'sugarSplash', id: 'audioSugarSplash' },
            { name: 'levelComplete', id: 'audioLevelComplete' },
            { name: 'levelFail', id: 'audioLevelFail' },
            { name: 'timeWarning', id: 'audioTimeWarning' },
            { name: 'overfill', id: 'audioOverfill' }
        ];
        
        sounds.forEach(sound => {
            const audioElement = document.getElementById(sound.id);
            if (audioElement) {
                this.audioManager.addSound(sound.name, audioElement);
                if (this.showDebug) console.log(`Loaded sound: ${sound.name}`);
            } else {
                console.warn(`Audio element not found: ${sound.id}`);
            }
        });
        
        // Load background music
        const bgmElement = document.getElementById('audioGameBgm');
        if (bgmElement) {
            this.audioManager.setMusic(bgmElement);
            if (this.showDebug) console.log('Background music loaded');
        } else {
            console.warn('Background music element not found');
        }
        
        // Enable user interaction for audio (required by browsers)
        this.setupAudioInteraction();
        
        // Initialize audio control buttons
        this.initAudioButtons();
    }
    
    setupAudioInteraction() {
        // Smart music startup system - detects first user interaction
        const startAudioAfterInteraction = () => {
            console.log('🎵 First user interaction detected!');
            if (this.audioManager) {
                this.audioManager.startMusicAfterInteraction();
            }
            
            // Remove the event listeners after first interaction
            document.removeEventListener('click', startAudioAfterInteraction);
            document.removeEventListener('keydown', startAudioAfterInteraction);
            document.removeEventListener('touchstart', startAudioAfterInteraction);
            
            // Update UI to reflect music status change
            this.updateAudioButtonStates();
        };
        
        document.addEventListener('click', startAudioAfterInteraction);
        document.addEventListener('keydown', startAudioAfterInteraction);
        document.addEventListener('touchstart', startAudioAfterInteraction);
    }
    
    initAudioButtons() {
        // Audio buttons are now handled through HeaderUI
        // Initial button state update
        this.updateAudioButtonStates();
    }
    
    setupHeaderCallbacks() {
        if (!this.headerUI) return;
        
        // Pause button callback
        this.headerUI.setPauseButtonCallback(() => {
            if (this.state === 'playing') {
                this.pauseGame();
            } else if (this.state === 'paused') {
                this.resumeGame();
            }
        });
        
        // Sound button callback
        this.headerUI.setSoundButtonCallback(() => {
            if (this.audioManager) {
                const newState = !this.audioManager.isSoundEnabled();
                this.audioManager.setSoundEnabled(newState);
                this.updateAudioButtonStates();
                if (this.showDebug) console.log(`Sound ${newState ? 'enabled' : 'disabled'}`);
            }
        });
        
        // Music button callback
        this.headerUI.setMusicButtonCallback(() => {
            if (this.audioManager) {
                const newState = !this.audioManager.isMusicEnabled();
                this.audioManager.setMusicEnabled(newState);
                this.updateAudioButtonStates();
                if (this.showDebug) console.log(`Music ${newState ? 'enabled' : 'disabled'}`);
            }
        });
    }
    
    triggerHapticFeedback() {
        // Add haptic feedback for mobile devices
        if (navigator.vibrate && this.isMobile) {
            try {
                navigator.vibrate(50); // 50ms vibration
            } catch (error) {
                console.log('Haptic feedback not supported');
            }
        }
    }
    
    updateAudioButtonStates() {
        if (this.headerUI && this.audioManager) {
            const soundEnabled = this.audioManager.isSoundEnabled();
            const musicEnabled = this.audioManager.isMusicEnabled();
            const musicPending = this.audioManager.hasPendingMusic();
            
            this.headerUI.updateAudioButtonStates(soundEnabled, musicEnabled, musicPending);
        }
    }
    
    addAudioFeedback(soundName, x, y, color = '#FFD700') {
        // Add visual indicator when sound is played
        this.audioFeedback.push({
            text: soundName,
            x: x || this.canvas.width / 2,
            y: y || 100,
            color: color,
            opacity: 1,
            scale: 1,
            time: 0,
            maxTime: 1000 // 1 second
        });
    }
    
    updateAudioFeedback(deltaTime) {
        for (let i = this.audioFeedback.length - 1; i >= 0; i--) {
            const feedback = this.audioFeedback[i];
            feedback.time += deltaTime;
            
            const progress = feedback.time / feedback.maxTime;
            feedback.opacity = Math.max(0, 1 - progress);
            feedback.scale = 1 + progress * 0.5;
            feedback.y -= deltaTime * 0.02; // Float upward
            
            if (feedback.time >= feedback.maxTime) {
                this.audioFeedback.splice(i, 1);
            }
        }
    }
    
    renderAudioFeedback() {
        for (const feedback of this.audioFeedback) {
            this.ctx.save();
            this.ctx.globalAlpha = feedback.opacity;
            this.ctx.fillStyle = feedback.color;
            this.ctx.font = `${12 * feedback.scale}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 1;
            
            // Text with outline
            this.ctx.strokeText(feedback.text, feedback.x, feedback.y);
            this.ctx.fillText(feedback.text, feedback.x, feedback.y);
            
            this.ctx.restore();
        }
    }
    
    initLevel() {
        this.currentLevel = new Level(this.levelNumber);
        this.totalSugarDelivered = 0;
        this.timeWarningPlayed = false; // Reset warning sound flag
        
        // Track cups completed across wrapping cycles
        this.cupsCompletedThisLevel = 0;
        this.targetCupsForLevel = this.currentLevel.config.cups; // Store original target (3-17)
        
        this.createCupsForLevel();
    }
    
    createCupsForLevel() {
        // Clear existing cups
        this.coffeeCups = [];
        
        if (!this.currentLevel) return;
        
        const cupY = this.canvas.height - 200;
        const conveyorY = this.canvas.height - 180; // Conveyor belt Y position
        const canvasWidth = this.canvas.width;
        
        // SIMPLE SYSTEM: Use exact cup count from CONFIG.js
        const levelConfig = CONFIG.LEVELS.find(level => level.level === this.levelNumber);
        if (!levelConfig) {
            console.error(`No config found for level ${this.levelNumber}`);
            return;
        }
        
        const cupCount = levelConfig.cups; // Use exact count from config
        
        // SLOT-BASED POSITIONING SYSTEM: Calculate proper spacing based on canvas and cup count
        this.setupSlotBasedPositioning(cupCount, cupY, conveyorY);
        
        // Calculate exact total sugar needed based on actual cup requirements
        this.exactSugarNeeded = this.coffeeCups.reduce((total, cup) => total + cup.requiredSugar, 0);
        
        // Update level's sugar target to match exact requirements
        if (this.currentLevel) {
            this.currentLevel.totalSugarNeeded = this.exactSugarNeeded;
        }
        
        if (this.showDebug) {
            console.log(`Level ${this.levelNumber}: Created ${cupCount} cups (from config), exact sugar needed: ${this.exactSugarNeeded}`);
        }
    }
    
    setupSlotBasedPositioning(cupCount, cupY, conveyorY) {
        // ARCHITECTURAL FIX: Slot-based system eliminates overlapping
        
        // Calculate optimal spacing to prevent overlapping on all screen sizes
        const isMobile = window.innerWidth <= 768;
        const mobileScale = isMobile ? 0.75 : 1.0;
        const maxCupWidth = Math.floor(110 * mobileScale); // Large cup width, scaled for mobile
        const safetyMargin = Math.floor(50 * mobileScale); // Minimum gap between cups, scaled for mobile
        const slotSpacing = maxCupWidth + safetyMargin; // Mobile-responsive spacing
        
        // Calculate total conveyor width needed and starting position
        const totalConveyorWidth = cupCount * slotSpacing;
        const offScreenStart = -totalConveyorWidth - 200; // Start well off-screen
        
        const sizes = ['small', 'medium', 'large'];
        
        // Create cups with mathematically calculated slot positions
        for (let i = 0; i < cupCount; i++) {
            const size = sizes[i % sizes.length];
            
            // SLOT SYSTEM: Each cup gets a calculated slot position
            const slotPosition = offScreenStart + (i * slotSpacing);
            
            const cup = new Cup(slotPosition, cupY, size, conveyorY, this.assetLoader);
            
            // CRITICAL: Store slot information for proper wrap-around positioning
            cup.slotIndex = i;
            cup.slotSpacing = slotSpacing;
            cup.offScreenStart = offScreenStart;
            cup.totalSlots = cupCount;
            
            this.coffeeCups.push(cup);
        }
        
        console.log(`Slot system: ${cupCount} cups, ${slotSpacing}px spacing, start at ${offScreenStart}px`);
    }
    
    setupInputCallbacks() {
        // Spacebar callback
        this.inputHandler.setSpacebarCallback(() => {
            this.handleDropInput();
        });
        
        // Click callback - only for dropping, no movement
        this.inputHandler.setClickCallback((x, y) => {
            this.handleDropInput();
        });
        
        // Touch callback - only for dropping, no movement
        this.inputHandler.setTouchCallback((x, y) => {
            this.handleDropInput();
        });
        
        // Audio toggle callbacks
        this.inputHandler.setSoundToggleCallback(() => {
            if (this.audioManager) {
                const newState = !this.audioManager.isSoundEnabled();
                this.audioManager.setSoundEnabled(newState);
                this.updateAudioButtonStates();
                if (this.showDebug) console.log(`Sound ${newState ? 'enabled' : 'disabled'}`);
            }
        });
        
        this.inputHandler.setMusicToggleCallback(() => {
            if (this.audioManager) {
                const newState = !this.audioManager.isMusicEnabled();
                this.audioManager.setMusicEnabled(newState);
                this.updateAudioButtonStates();
                if (this.showDebug) console.log(`Music ${newState ? 'enabled' : 'disabled'}`);
            }
        });
    }
    
    initMenuSystem() {
        this.createMainMenuButtons();
        this.setupMenuInputHandlers();
    }
    
    createMainMenuButtons() {
        // Simplified menu - no buttons, tap anywhere to start
        this.menuButtons = [];
    }
    
    createOptionsMenuButtons() {
        // Options menu removed in simplified UI
        this.menuButtons = [];
    }
    
    setupMenuInputHandlers() {
        // Add mouse/touch handling for menu buttons
        this.canvas.addEventListener('click', (e) => this.handleMenuClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMenuHover(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleMenuTouch(e));
    }
    
    handleMenuClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        if (this.state === 'menu') {
            // Simplified menu - tap anywhere to start
            if (this.menuState === 'main') {
                this.startLevel();
            }
        } else if (this.state === 'paused') {
            // Check for resume button click or anywhere to resume
            if (this.resumeButtonBounds && this.isPointInBounds(x, y, this.resumeButtonBounds)) {
                this.resumeGame();
            } else {
                // Tap anywhere to resume
                this.resumeGame();
            }
        }
    }
    
    handleMenuHover(e) {
        if (this.state !== 'menu') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        this.hoveredButton = this.getButtonAt(x, y);
        this.canvas.style.cursor = this.hoveredButton ? 'pointer' : 'default';
    }
    
    handleMenuTouch(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        
        if (this.state === 'menu') {
            // Simplified menu - tap anywhere to start
            if (this.menuState === 'main') {
                this.startLevel();
            }
        } else if (this.state === 'paused') {
            // Check for resume button tap or anywhere to resume
            if (this.resumeButtonBounds && this.isPointInBounds(x, y, this.resumeButtonBounds)) {
                this.resumeGame();
            } else {
                // Tap anywhere to resume
                this.resumeGame();
            }
        }
    }
    
    getButtonAt(x, y) {
        return this.menuButtons.find(button => 
            x >= button.x && x <= button.x + button.width &&
            y >= button.y && y <= button.y + button.height
        );
    }
    
    isPointInBounds(x, y, bounds) {
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }
    
    
    // Removed redundant menu methods - simplified UI doesn't need these
    
    handleDropInput() {
        // Always try to start music on any input (if pending)
        if (this.audioManager && this.audioManager.hasPendingMusic()) {
            this.audioManager.startMusicAfterInteraction();
            this.updateAudioButtonStates();
        }
        
        if (this.state === 'menu') {
            // Only start game if we're on main menu and no specific button is being used
            if (this.menuState === 'main') {
                this.startLevel();
            }
        } else if (this.state === 'playing' && this.hand.canDrop()) {
            const dropped = this.hand.drop();
            if (dropped) {
                // Create sugar cube at drop position
                const dropPos = this.hand.getSugarDropPosition();
                const sugarCube = new Sugar(dropPos.x, dropPos.y, this.assetLoader);
                this.sugarCubes.push(sugarCube);
                
                // Play sugar drop sound
                if (this.audioManager) {
                    this.audioManager.playSound('sugarDrop');
                    this.addAudioFeedback('🍯 Drop', this.hand.x, this.hand.y + 60, '#FFD700');
                }
                
                if (this.showDebug) {
                    console.log(`Sugar cube created at: ${dropPos.x}, ${dropPos.y}`);
                }
            }
        } else if (this.state === 'levelComplete') {
            // Go to next level
            this.nextLevel();
        } else if (this.state === 'levelFailed') {
            // User actively chose to retry - restart music and level
            if (this.showDebug) {
                console.log('User chose to retry level');
            }
            this.retryLevel();
        }
    }
    
    startLevel() {
        this.state = 'playing';
        
        // Show header UI and update it
        if (this.headerUI) {
            this.headerUI.show();
            this.headerUI.updateLevel(this.levelNumber, this.currentLevel ? this.currentLevel.getDifficulty() : 'Tutorial');
            this.headerUI.updateProgress(this.cupsCompletedThisLevel, this.targetCupsForLevel);
        }
        
        if (this.currentLevel) {
            this.currentLevel.start();
            if (this.showDebug) {
                console.log(`Level ${this.levelNumber} started!`);
            }
        }
        
        // Try to start background music when level starts (respects autoplay policies)
        if (this.audioManager && this.audioManager.isMusicEnabled()) {
            console.log('🎵 Attempting to start music with level...');
            this.audioManager.playMusic();
        }
    }
    
    nextLevel() {
        if (this.levelNumber < 15) {
            // Fade out, then transition to next level
            this.startFadeTransition(true, 300, () => {
                this.levelNumber++;
                this.initLevel();
                this.startLevel();
                this.startFadeTransition(false, 300); // Fade back in
            });
        } else {
            // Game completed!
            this.state = 'gameComplete';
            
            // Stop background music for final celebration
            if (this.audioManager) {
                this.audioManager.pauseMusic();
            }
            
            this.createLevelCompleteParticles();
            this.startScreenShake(20, 1000);
            if (this.showDebug) {
                console.log('Congratulations! All levels completed!');
            }
        }
    }
    
    retryLevel() {
        this.initLevel();
        this.startLevel();
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Check if mobile
        const isMobile = window.innerWidth <= 768;
        const aspectRatio = isMobile ? 9 / 16 : 16 / 9; // Portrait for mobile, landscape for desktop
        
        if (isMobile) {
            // Mobile: use full width and calculate height
            this.canvas.width = containerWidth;
            this.canvas.height = Math.min(containerHeight, containerWidth / aspectRatio);
        } else {
            // Desktop: maintain 16:9 aspect ratio
            if (containerWidth / containerHeight > aspectRatio) {
                this.canvas.height = containerHeight;
                this.canvas.width = containerHeight * aspectRatio;
            } else {
                this.canvas.width = containerWidth;
                this.canvas.height = containerWidth / aspectRatio;
            }
        }
        
        if (this.showDebug) {
            console.log(`Canvas resized: ${this.canvas.width}x${this.canvas.height} (${isMobile ? 'mobile' : 'desktop'})`);
        }
        
        // Update menu buttons positions after resize
        if (this.state === 'menu') {
            this.updateMenuButtonPositions();
        }
    }
    
    updateMenuButtonPositions() {
        // Simplified menu - only main menu
        this.createMainMenuButtons();
    }
    
    detectMobile() {
        // Check for mobile devices using multiple indicators
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'tablet', 'blackberry', 'windows phone'];
        const hasMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
        const hasSmallScreen = window.innerWidth <= 768;
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return hasMobileUserAgent || (hasSmallScreen && hasTouchScreen);
    }
    
    async start() {
        // Complete async initialization (assets loading)
        await this.initGameObjects();
        
        this.running = true;
        this.gameLoop();
    }
    
    stop() {
        this.running = false;
    }
    
    gameLoop(currentTime = 0) {
        if (!this.running) return;
        
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Update performance monitoring
        this.updatePerformanceStats(deltaTime, currentTime);
        
        this.update(deltaTime);
        this.render();
        
        // Render debug info if enabled
        if (this.showDebug) {
            this.renderDebugInfo();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update input handler
        if (this.inputHandler) {
            this.inputHandler.update(deltaTime);
        }
        
        // Update visual effects
        this.updateParticles(deltaTime);
        this.updateScreenShake(deltaTime);
        this.updateFadeTransition(deltaTime);
        
        // Update game objects based on current state
        switch(this.state) {
            case 'loading':
                break;
            case 'menu':
                this.updateMenu(deltaTime);
                break;
            case 'playing':
                this.updateGame(deltaTime);
                break;
            case 'levelComplete':
            case 'levelFailed':
            case 'gameComplete':
                // Keep updating hand animation
                if (this.hand) {
                    this.hand.update(deltaTime);
                }
                break;
        }
        
        // Always update audio feedback
        this.updateAudioFeedback(deltaTime);
    }
    
    updateMenu(deltaTime) {
        // Update hand animation in menu
        if (this.hand) {
            this.hand.update(deltaTime);
        }
    }
    
    updateGame(deltaTime) {
        // Update level timer and check completion using persistent counters
        if (this.currentLevel) {
            // Use persistent counters instead of current cup states
            this.currentLevel.update(deltaTime, this.cupsCompletedThisLevel, this.targetCupsForLevel, this.totalSugarDelivered);
            
            // Update header UI with current game state
            if (this.headerUI) {
                const percentage = this.currentLevel.getTimerPercentage();
                const timeLeft = this.currentLevel.getDisplayTime();
                const colorState = this.currentLevel.getTimerColorState();
                
                this.headerUI.updateTimer(percentage, timeLeft, colorState);
                this.headerUI.updateProgress(this.cupsCompletedThisLevel, this.targetCupsForLevel);
            }
            
            // Simplified debug logging
            if (this.showDebug && Math.floor(Date.now() / 1000) !== this.lastDebugTime) {
                this.lastDebugTime = Math.floor(Date.now() / 1000);
                console.log(`LEVEL STATUS - Persistent: ${this.cupsCompletedThisLevel}/${this.targetCupsForLevel}`);
            }
            
            // Play time warning sound (once per level when < 10 seconds left)
            if (this.currentLevel.isTimeWarning() && !this.timeWarningPlayed && this.audioManager) {
                this.audioManager.playSound('timeWarning');
                this.addAudioFeedback('⚠️ 10 Seconds!', this.canvas.width - 150, 50, '#FFC107');
                this.timeWarningPlayed = true;
                if (this.showDebug) {
                    console.log('Time warning sound played!');
                }
            }
            
            // Check level completion
            if (this.currentLevel.isComplete) {
                this.state = 'levelComplete';
                
                // Create celebration effects
                this.createLevelCompleteParticles();
                this.startScreenShake(15, 500);
                
                // Stop background music and play level complete sound
                if (this.audioManager) {
                    this.audioManager.pauseMusic(); // Stop background music
                    this.audioManager.playSound('levelComplete');
                    this.addAudioFeedback(`🎉 Level ${this.levelNumber} Complete!`, this.canvas.width / 2, this.canvas.height / 2, '#FFD700');
                }
                
                if (this.showDebug) {
                    console.log(`Level ${this.levelNumber} completed with ${this.totalSugarDelivered} sugar delivered!`);
                }
                return;
            } else if (this.currentLevel.isFailed) {
                this.state = 'levelFailed';
                
                // Stop background music and play level failed sound
                if (this.audioManager) {
                    console.log('🎵 STOPPING music on level fail');
                    this.audioManager.pauseMusic(); // Stop background music
                    this.audioManager.playSound('levelFail');
                    this.addAudioFeedback('⏰ Time Up!', this.canvas.width / 2, this.canvas.height / 2, '#F44336');
                }
                
                if (this.showDebug) {
                    console.log(`Level ${this.levelNumber} failed - only ${this.totalSugarDelivered}/${this.currentLevel.totalSugarNeeded} sugar delivered`);
                }
                return;
            }
        }
        
        // Update hand
        if (this.hand) {
            this.hand.update(deltaTime);
        }
        
        // Update sugar cubes and check collisions
        for (let i = this.sugarCubes.length - 1; i >= 0; i--) {
            const sugar = this.sugarCubes[i];
            const wasActive = sugar.isActive;
            const wasFalling = sugar.isFalling;
            
            sugar.update(deltaTime, this.canvas.height);
            
            // Check collision with cups
            if (sugar.isFalling) {
                this.checkSugarCupCollisions(sugar);
            }
            
            // Check if sugar just hit the ground (missed cups)
            if (wasFalling && !sugar.isFalling && sugar.isSplashing && wasActive) {
                // Sugar just started splashing - play splash sound only
                if (this.audioManager) {
                    this.audioManager.playSound('sugarSplash');
                    this.addAudioFeedback('💥 Miss', sugar.x, sugar.y - 20, '#FF6B6B');
                }
                if (this.showDebug) {
                    console.log('Sugar cube missed all cups and hit the conveyor!');
                }
            }
            
            // Remove inactive sugar cubes
            if (!sugar.isActive) {
                this.sugarCubes.splice(i, 1);
            }
        }
        
        // Update conveyor belt animation with level speed (belt surface moves LEFT to RIGHT)
        const conveyorSpeed = this.currentLevel ? this.currentLevel.getConveyorSpeed() : 1;
        
        // Dynamic offset based on image dimensions for seamless tiling
        let resetDistance = 50; // Default for geometric fallback
        if (this.assetLoader) {
            const beltImage = this.assetLoader.getImage('conveyor_belt');
            if (beltImage && beltImage.width > 0) {
                resetDistance = beltImage.width; // Use actual image width for seamless tiling
            }
        }
        
        // Belt texture moves left-to-right to match cup movement direction
        this.conveyorOffset += conveyorSpeed * (deltaTime / 1000) * 60; // Same direction as cups
        if (this.conveyorOffset >= resetDistance) {
            this.conveyorOffset -= resetDistance; // Seamless wrapping for left-to-right direction
        }
        
        // Update coffee cups with level speed and positioning data
        const dropZoneX = this.hand ? this.hand.x : this.canvas.width / 2;
        for (const cup of this.coffeeCups) {
            const result = cup.update(deltaTime, conveyorSpeed, this.canvas.width);
            
            // Update preview system for each cup
            cup.calculatePreviewStatus(dropZoneX, conveyorSpeed, this.isMobile);
            
            // Cup wrapped around - state handled by Cup.js
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply screen shake effect
        this.applyScreenShake();
        
        // Render based on current state
        switch(this.state) {
            case 'loading':
                this.renderLoading();
                break;
            case 'menu':
                this.renderMenu();
                break;
            case 'playing':
                this.renderGame();
                break;
            case 'paused':
                this.renderPausedGame();
                break;
            case 'levelComplete':
                this.renderLevelComplete();
                break;
            case 'levelFailed':
                this.renderLevelFailed();
                break;
            case 'gameComplete':
                this.renderGameComplete();
                break;
        }
        
        // Render particles on top of everything
        this.renderParticles();
        
        // Remove screen shake effect
        this.removeScreenShake();
        
        // Render fade transition on top of everything
        this.renderFadeTransition();
    }
    
    renderLoading() {
        this.ctx.fillStyle = '#A5D8F0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const isMobileSize = this.canvas.width <= 768;
        this.ctx.fillStyle = '#3E2723';
        this.ctx.font = `bold ${isMobileSize ? '20px' : '24px'} "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    renderMenu() {
        // Hide header UI during menu
        if (this.headerUI) {
            this.headerUI.hide();
        }
        
        // Background
        this.ctx.fillStyle = '#A5D8F0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Simplified menu - only main menu
        this.renderMainMenu();
    }
    
    renderMainMenu() {
        const isMobileSize = this.canvas.width <= 768;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // v0 Card-based menu design
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Calculate card dimensions
        const cardWidth = isMobileSize ? Math.min(380, this.canvas.width - 40) : 480;
        const cardHeight = isMobileSize ? 400 : 480;
        const cardX = centerX - cardWidth / 2;
        const cardY = centerY - cardHeight / 2;
        
        // Draw main card background with v0 styling
        this.ctx.fillStyle = '#FFFFFF';
        this.drawRoundedRect(cardX, cardY, cardWidth, cardHeight, 12);
        this.ctx.fill();
        
        // Card shadow effect
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetY = 4;
        this.drawRoundedRect(cardX, cardY, cardWidth, cardHeight, 12);
        this.ctx.fill();
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Title - "Sweet Barista"
        this.ctx.fillStyle = '#6F4E37';
        this.ctx.font = `bold ${isMobileSize ? '28px' : '32px'} "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.fillText('Sweet Barista', centerX, centerY - 140);
        
        // Subtitle - orange text
        this.ctx.fillStyle = '#F97316';
        this.ctx.font = `500 ${isMobileSize ? '16px' : '18px'} "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.fillText('Perfect your sugar cube precision!', centerX, centerY - 105);
        
        // Coffee cup emoji - centered visual element
        this.ctx.font = `${isMobileSize ? '48px' : '64px'} Arial`;
        this.ctx.fillText('☕', centerX, centerY - 50);
        
        // Description text
        this.ctx.fillStyle = '#6B7280';
        this.ctx.font = `400 ${isMobileSize ? '14px' : '16px'} "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        
        const description = 'Drop sugar cubes into moving coffee cups to fulfill each customer\'s exact sweetness preferences. Time your drops perfectly!';
        this.wrapText(description, centerX, centerY + 10, cardWidth - 60, isMobileSize ? 20 : 24);
        
        // Start Game button - v0 orange style
        const buttonText = 'Start Game';
        const buttonWidth = isMobileSize ? cardWidth - 80 : 200;
        const buttonHeight = 48;
        const buttonX = centerX - buttonWidth / 2;
        const buttonY = centerY + 100;
        
        // Button background
        this.ctx.fillStyle = '#F97316';
        this.drawRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
        this.ctx.fill();
        
        // Button text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `600 ${isMobileSize ? '15px' : '16px'} "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(buttonText, centerX, buttonY + buttonHeight / 2 + 2);
        
        // Store button bounds for click detection (using same as before)
        const textMetrics = this.ctx.measureText('Start');
        this.menuButtonBounds = { 
            x: buttonX, 
            y: buttonY, 
            width: buttonWidth, 
            height: buttonHeight 
        };
    }
    
    // Helper method for text wrapping
    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                this.ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, x, currentY);
    }
    
    renderGameLogo(centerX, logoY, isMobileSize) {
        // Try to render logo image first
        if (this.assetLoader) {
            const logoImage = this.assetLoader.getImage('logo');
            if (logoImage) {
                // Calculate responsive logo dimensions - increased by 30%
                const logoScale = isMobileSize ? 0.78 : 1.04; // 0.6 * 1.3 = 0.78, 0.8 * 1.3 = 1.04
                const maxLogoWidth = isMobileSize ? 364 : 520; // 280 * 1.3 = 364, 400 * 1.3 = 520
                const maxLogoHeight = isMobileSize ? 104 : 156; // 80 * 1.3 = 104, 120 * 1.3 = 156
                
                // Calculate scaling to fit within max dimensions while maintaining aspect ratio
                const imageAspectRatio = logoImage.width / logoImage.height;
                let logoWidth = Math.min(logoImage.width * logoScale, maxLogoWidth);
                let logoHeight = logoWidth / imageAspectRatio;
                
                // If height exceeds maximum, scale down based on height
                if (logoHeight > maxLogoHeight) {
                    logoHeight = maxLogoHeight;
                    logoWidth = logoHeight * imageAspectRatio;
                }
                
                // Center the logo
                const logoX = centerX - logoWidth / 2;
                const finalLogoY = logoY - logoHeight / 2;
                
                // Draw the logo with smooth scaling
                this.ctx.save();
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.imageSmoothingQuality = 'high';
                this.ctx.drawImage(logoImage, logoX, finalLogoY, logoWidth, logoHeight);
                this.ctx.restore();
                
                if (this.showDebug) {
                    console.log(`Logo rendered: ${logoWidth.toFixed(1)}x${logoHeight.toFixed(1)} at (${logoX.toFixed(1)}, ${finalLogoY.toFixed(1)})`);
                }
                
                return; // Successfully rendered logo, exit function
            }
        }
        
        // Fallback: render text title if logo is not available
        if (this.showDebug) {
            console.log('Logo not available, falling back to text title');
        }
        
        this.ctx.fillStyle = '#3E2723';
        this.ctx.font = `bold ${isMobileSize ? '36px' : '48px'} "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.fillText('Sweet Barista', centerX, logoY);
    }
    
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    renderGame() {
        // Background
        this.ctx.fillStyle = '#A5D8F0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render conveyor belt
        this.renderConveyorBelt();
        
        // Render drop zone indicator
        this.renderDropZone();
        
        // Preview zone disabled for cleaner visual
        // this.renderPreviewZone();
        
        // Render hand
        if (this.hand) {
            this.hand.render(this.ctx);
        }
        
        // Render coffee cups with mobile detection for enhanced preview display
        for (const cup of this.coffeeCups) {
            cup.render(this.ctx, this.isMobile);
        }
        
        // Render sugar cubes
        for (const sugar of this.sugarCubes) {
            sugar.render(this.ctx);
        }
        
        // Render input visual feedback
        if (this.inputHandler) {
            this.inputHandler.renderFeedback(this.ctx);
        }
        
        // Render audio visual feedback
        this.renderAudioFeedback();
        
        // v0 Game Instructions at bottom (matching mockup)
        this.renderV0Instructions();
    }
    
    renderPausedGame() {
        // Render the game state underneath
        this.renderGame();
        
        // Semi-transparent overlay matching v0
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // v0 Pause modal design
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const isMobileSize = this.canvas.width <= 768;
        
        // Calculate modal dimensions
        const modalWidth = isMobileSize ? 300 : 360;
        const modalHeight = isMobileSize ? 160 : 180;
        const modalX = centerX - modalWidth / 2;
        const modalY = centerY - modalHeight / 2;
        
        // Draw modal card with v0 styling
        this.ctx.fillStyle = '#FFFFFF';
        this.drawRoundedRect(modalX, modalY, modalWidth, modalHeight, 12);
        this.ctx.fill();
        
        // Modal shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetY = 8;
        this.drawRoundedRect(modalX, modalY, modalWidth, modalHeight, 12);
        this.ctx.fill();
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Pause title - v0 style
        this.ctx.fillStyle = '#3E2723';
        this.ctx.font = `600 ${isMobileSize ? '18px' : '20px'} "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Game Paused', centerX, centerY - 30);
        
        // Resume button - v0 orange style
        this.renderV0ResumeButton(centerX, centerY + 20, isMobileSize);
    }
    
    renderV0ResumeButton(centerX, centerY, isMobileSize) {
        const buttonText = 'Resume';
        const buttonWidth = isMobileSize ? 120 : 140;
        const buttonHeight = 44;
        const buttonX = centerX - buttonWidth / 2;
        const buttonY = centerY - buttonHeight / 2;
        
        // v0 Button background - orange
        this.ctx.fillStyle = '#F97316';
        this.drawRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
        this.ctx.fill();
        
        // Button text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `600 ${isMobileSize ? '14px' : '16px'} "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(buttonText, centerX, centerY + 1);
        
        // Store button bounds for click detection
        this.resumeButtonBounds = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight };
    }
    
    // Legacy method - keeping for backward compatibility
    renderResumeButton() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const isMobileSize = this.canvas.width <= 768;
        this.renderV0ResumeButton(centerX, centerY + 40, isMobileSize);
    }
    
    renderV0Instructions() {
        // v0 Instruction styling matching mockup design
        const isMobileSize = this.canvas.width <= 768;
        const bottomPadding = 24;
        const instructionsY = this.canvas.height - bottomPadding;
        
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.font = `400 ${isMobileSize ? '12px' : '14px'} "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.fillStyle = '#6B7280'; // v0 muted text color
        
        // Different instructions for desktop vs mobile
        if (isMobileSize) {
            this.ctx.fillText('Mobile: Tap the Drop Sugar button', this.canvas.width / 2, instructionsY - 8);
        } else {
            this.ctx.fillText('Desktop: Press SPACEBAR to drop sugar', this.canvas.width / 2, instructionsY - 8);
        }
        
        this.ctx.restore();
    }
    
    pauseGame() {
        if (this.state === 'playing') {
            this.previousState = 'playing';
            this.state = 'paused';
            
            // Pause the level timer
            if (this.currentLevel) {
                this.currentLevel.pause();
            }
            
            // Pause background music
            if (this.audioManager) {
                this.audioManager.pauseMusic();
            }
            
            // Update pause button state
            if (this.headerUI) {
                this.headerUI.updatePauseButtonState(true);
            }
        }
    }
    
    resumeGame() {
        if (this.state === 'paused') {
            this.state = this.previousState || 'playing';
            this.previousState = null;
            
            // Resume the level timer
            if (this.currentLevel) {
                this.currentLevel.resume();
            }
            
            // Resume background music if enabled
            if (this.audioManager && this.audioManager.isMusicEnabled()) {
                this.audioManager.playMusic();
            }
            
            // Update pause button state
            if (this.headerUI) {
                this.headerUI.updatePauseButtonState(false);
            }
        }
    }
    
    // Visual Effects Methods
    createSuccessParticles(x, y) {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 100 + Math.random() * 50;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                maxLife: 1.0,
                color: '#4CAF50',
                size: 3 + Math.random() * 3
            });
        }
    }
    
    createLevelCompleteParticles() {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 10,
                vx: (Math.random() - 0.5) * 100,
                vy: -150 - Math.random() * 100,
                life: 1.0,
                maxLife: 1.0,
                color: ['#FFD700', '#FFC107', '#4CAF50'][Math.floor(Math.random() * 3)],
                size: 4 + Math.random() * 4
            });
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx * deltaTime / 1000;
            particle.y += particle.vy * deltaTime / 1000;
            
            // Update life
            particle.life -= deltaTime / 1000;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    renderParticles() {
        for (const particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    startScreenShake(intensity = 10, duration = 300) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }
    
    updateScreenShake(deltaTime) {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= deltaTime;
            const intensity = (this.screenShake.duration / 300) * this.screenShake.intensity;
            this.screenShake.x = (Math.random() - 0.5) * intensity;
            this.screenShake.y = (Math.random() - 0.5) * intensity;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
            this.screenShake.intensity = 0;
        }
    }
    
    applyScreenShake() {
        if (this.screenShake.intensity > 0) {
            this.ctx.save();
            this.ctx.translate(this.screenShake.x, this.screenShake.y);
        }
    }
    
    removeScreenShake() {
        if (this.screenShake.intensity > 0) {
            this.ctx.restore();
        }
    }
    
    startFadeTransition(fadeOut = false, duration = 500, callback = null) {
        this.fadeTransition.fadeOut = fadeOut;
        this.fadeTransition.fadeIn = !fadeOut;
        this.fadeTransition.duration = duration;
        this.fadeTransition.opacity = fadeOut ? 0 : 1;
        this.fadeTransition.callback = callback;
    }
    
    updateFadeTransition(deltaTime) {
        if (this.fadeTransition.fadeIn || this.fadeTransition.fadeOut) {
            const progress = deltaTime / this.fadeTransition.duration;
            
            if (this.fadeTransition.fadeOut) {
                this.fadeTransition.opacity = Math.min(1, this.fadeTransition.opacity + progress);
                if (this.fadeTransition.opacity >= 1) {
                    this.fadeTransition.fadeOut = false;
                    if (this.fadeTransition.callback) {
                        this.fadeTransition.callback();
                    }
                }
            } else if (this.fadeTransition.fadeIn) {
                this.fadeTransition.opacity = Math.max(0, this.fadeTransition.opacity - progress);
                if (this.fadeTransition.opacity <= 0) {
                    this.fadeTransition.fadeIn = false;
                }
            }
        }
    }
    
    renderFadeTransition() {
        if (this.fadeTransition.opacity > 0) {
            this.ctx.save();
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeTransition.opacity})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }
    }
    
    checkSugarCupCollisions(sugar) {
        for (const cup of this.coffeeCups) {
            if (CollisionDetection.checkSugarCupCollision(sugar, cup)) {
                if (cup.canAcceptSugar()) {
                    // Check if cup was incomplete before adding sugar
                    const wasIncomplete = !cup.isComplete;
                    
                    // Sugar landed in cup!
                    cup.addSugar();
                    sugar.isActive = false; // Remove the sugar cube
                    this.totalSugarDelivered++;
                    
                    // Create success particles
                    this.createSuccessParticles(cup.x + cup.width/2, cup.y + cup.height/2);
                    
                    // Check if cup just became complete and increment counter immediately
                    if (wasIncomplete && cup.isComplete) {
                        this.cupsCompletedThisLevel++;
                        // Add extra particles and shake for cup completion
                        this.createSuccessParticles(cup.x + cup.width/2, cup.y + cup.height/2);
                        this.startScreenShake(5, 200);
                        
                        // Animate progress completion in header
                        if (this.headerUI) {
                            this.headerUI.animateProgressComplete();
                        }
                        
                        console.log(`Cup completed immediately! Progress: ${this.cupsCompletedThisLevel}/${this.targetCupsForLevel}`);
                    }
                    
                    // Play success sound
                    if (this.audioManager) {
                        this.audioManager.playSound('successHit');
                        this.addAudioFeedback('✅ Hit!', cup.x, cup.y - 40, '#4CAF50');
                    }
                    
                    console.log(`Sugar successfully added to ${cup.size} cup! Total delivered: ${this.totalSugarDelivered}`);
                    return; // Only one collision per sugar cube
                } else {
                    // Cup is full - attempt overfill
                    const wasOverfilled = cup.tryOverfill();
                    if (wasOverfilled) {
                        // Decrement completion counter as penalty for overfilling
                        this.cupsCompletedThisLevel = Math.max(0, this.cupsCompletedThisLevel - 1);
                        console.log(`Cup overfilled penalty! Progress decreased: ${this.cupsCompletedThisLevel}/${this.targetCupsForLevel}`);
                        
                        // Make sugar cube bounce off instead of disappearing
                        if (typeof sugar.bounce === 'function') {
                            sugar.bounce();
                        } else {
                            console.error('sugar.bounce is not a function - falling back to removal');
                            sugar.isActive = false;
                        }
                        
                        // Play overfill sound and show visual feedback
                        if (this.audioManager) {
                            this.audioManager.playSound('overfill'); // New sound for overfill
                            this.addAudioFeedback('⚠️ Overfilled!', cup.x, cup.y - 40, '#F44336');
                        }
                        
                        console.log(`Sugar overfilled ${cup.size} cup! Cup reset to 0.`);
                        return; // Only one collision per sugar cube
                    }
                }
            }
        }
    }
    
    renderConveyorBelt() {
        const beltY = this.canvas.height - 180;
        const beltHeight = 40;
        
        // Try to use conveyor belt image first
        if (this.assetLoader) {
            const beltImage = this.assetLoader.getImage('conveyor_belt');
            if (beltImage) {
                // Draw tiled conveyor belt image with seamless movement animation
                const imageWidth = beltImage.width;
                const tileCount = Math.ceil(this.canvas.width / imageWidth) + 2; // Extra tile for seamless wrapping
                
                // Fixed belt position - animate texture pattern left-to-right
                // Move belt texture left->right by shifting tiles positively
                const startX = (this.conveyorOffset % imageWidth) - imageWidth;
                
                for (let i = 0; i < tileCount; i++) {
                    const x = startX + (i * imageWidth);
                    // Render tiles that are visible or just outside the viewport
                    if (x > -imageWidth && x < this.canvas.width) {
                        this.ctx.drawImage(beltImage, x, beltY, imageWidth, beltHeight);
                    }
                }
                return; // Skip geometric fallback
            }
        }
        
        // Geometric fallback if image not available
        // Belt base
        this.ctx.fillStyle = '#5A5A5A';
        this.ctx.fillRect(0, beltY, this.canvas.width, beltHeight);
        
        // Moving belt pattern with seamless animation
        this.ctx.fillStyle = '#4A4A4A';
        const stripeWidth = 50;
        const stripeCount = Math.ceil(this.canvas.width / stripeWidth) + 2;
        
        // Fixed belt position - animate stripe pattern left-to-right
        // Move geometric stripes left->right
        const startX = (this.conveyorOffset % stripeWidth) - stripeWidth;
        for (let i = 0; i < stripeCount; i++) {
            const x = startX + (i * stripeWidth);
            if (x > -stripeWidth && x < this.canvas.width) {
                this.ctx.fillRect(x, beltY + 5, stripeWidth * 0.4, beltHeight - 10);
            }
        }
        
        // Belt edges
        this.ctx.fillStyle = '#3A3A3A';
        this.ctx.fillRect(0, beltY, this.canvas.width, 5);
        this.ctx.fillRect(0, beltY + beltHeight - 5, this.canvas.width, 5);
        
        // Direction arrows (showing left to right belt surface movement) with seamless animation
        this.ctx.fillStyle = '#FFFF00';
        const arrowSpacing = this.canvas.width / 6;
        const arrowCount = 7; // Extra arrows for seamless wrapping
        
        for (let i = 0; i < arrowCount; i++) {
            const arrowX = (this.conveyorOffset % arrowSpacing) + (arrowSpacing * i) - arrowSpacing;
            if (arrowX > -50 && arrowX < this.canvas.width + 50) {
                this.renderArrow(arrowX, beltY + beltHeight/2, false); // false = point right (left-to-right)
            }
        }
    }
    
    renderArrow(x, y, pointLeft = false) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.beginPath();
        
        if (pointLeft) {
            // Arrow pointing left (for belt surface movement)
            this.ctx.moveTo(10, -5);
            this.ctx.lineTo(-5, -5);
            this.ctx.lineTo(-5, -8);
            this.ctx.lineTo(-10, 0);
            this.ctx.lineTo(-5, 8);
            this.ctx.lineTo(-5, 5);
            this.ctx.lineTo(10, 5);
        } else {
            // Arrow pointing right (original direction)
            this.ctx.moveTo(-10, -5);
            this.ctx.lineTo(5, -5);
            this.ctx.lineTo(5, -8);
            this.ctx.lineTo(10, 0);
            this.ctx.lineTo(5, 8);
            this.ctx.lineTo(5, 5);
            this.ctx.lineTo(-10, 5);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }
    
    renderDropZone() {
        if (!this.hand) return;
        
        const dropX = this.hand.x;
        const beltY = this.canvas.height - 180;
        
        // COFFEE SHOP THEMED DROP ZONE
        // Subtle guided line - coffee brown color
        this.ctx.setLineDash([8, 8]);
        this.ctx.strokeStyle = 'rgba(111, 78, 55, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(dropX, this.hand.y + 50);
        this.ctx.lineTo(dropX, beltY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Coffee-themed drop zone target - warm colors
        const targetSize = 36;
        const targetX = dropX - targetSize/2;
        const targetY = beltY + 2;
        
        // Background circle with coffee shop colors
        this.ctx.fillStyle = 'rgba(255, 248, 231, 0.3)'; // Cream color
        this.ctx.beginPath();
        this.ctx.arc(dropX, beltY + targetSize/2, targetSize/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Border with coffee brown
        this.ctx.strokeStyle = 'rgba(111, 78, 55, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Small sugar cube icon in center
        const iconSize = 8;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillRect(dropX - iconSize/2, beltY + targetSize/2 - iconSize/2, iconSize, iconSize);
        this.ctx.strokeStyle = 'rgba(111, 78, 55, 0.6)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(dropX - iconSize/2, beltY + targetSize/2 - iconSize/2, iconSize, iconSize);
    }
    
    renderPreviewZone() {
        if (!this.hand || !this.currentLevel) return;
        
        const dropX = this.hand.x;
        const conveyorSpeed = this.currentLevel.getConveyorSpeed();
        const beltY = this.canvas.height - 180;
        
        // Calculate preview zone dimensions
        const baseDistance = CONFIG.PREVIEW_SYSTEM.BASE_PREVIEW_DISTANCE;
        const speedBonus = conveyorSpeed * CONFIG.PREVIEW_SYSTEM.SPEED_MULTIPLIER;
        const mobileBonus = this.isMobile ? CONFIG.PREVIEW_SYSTEM.MOBILE_DISTANCE_BONUS : 0;
        const previewDistance = baseDistance + speedBonus + mobileBonus;
        
        // Time-based minimum distance calculation
        const pixelsPerSecond = conveyorSpeed * 60;
        const minReactionDistance = pixelsPerSecond * CONFIG.PREVIEW_SYSTEM.MIN_REACTION_TIME;
        const finalPreviewDistance = Math.max(previewDistance, minReactionDistance);
        
        // Preview zone start position (left of drop zone)
        const previewStartX = dropX - finalPreviewDistance;
        
        // Only render if preview zone is visible on screen
        if (previewStartX < this.canvas.width && previewStartX > -100) {
            this.ctx.save();
            
            // SUBTLE COFFEE SHOP THEMED PREVIEW ZONE
            // Warm, subtle background gradient that matches coffee shop aesthetic
            const gradient = this.ctx.createLinearGradient(previewStartX, 0, dropX, 0);
            gradient.addColorStop(0, 'rgba(111, 78, 55, 0.08)'); // Coffee brown tint
            gradient.addColorStop(0.5, 'rgba(255, 193, 7, 0.12)'); // Warm yellow
            gradient.addColorStop(1, 'rgba(255, 193, 7, 0.18)'); // Stronger near drop zone
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(previewStartX, beltY - 15, finalPreviewDistance, 70);
            
            // Minimal border - coffee shop style
            this.ctx.strokeStyle = 'rgba(111, 78, 55, 0.4)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([6, 6]);
            this.ctx.strokeRect(previewStartX, beltY - 15, finalPreviewDistance, 70);
            this.ctx.setLineDash([]);
            
            // Coffee cup icons to indicate timing area (only on wider screens)
            if (finalPreviewDistance > 250 && !this.isMobile) {
                this.ctx.fillStyle = 'rgba(111, 78, 55, 0.3)';
                this.ctx.font = '18px Arial';
                this.ctx.textAlign = 'center';
                
                // Coffee cup emoji or text indicators
                const iconSpacing = finalPreviewDistance / 4;
                for (let i = 1; i < 4; i++) {
                    const iconX = previewStartX + (iconSpacing * i);
                    const iconY = beltY + 45;
                    this.ctx.fillText('☕', iconX, iconY);
                }
                
                // Removed "Get Ready!" text as requested - cleaner preview zone
            }
            
            this.ctx.restore();
        }
    }
    
    // Old UI rendering methods removed - now handled by HeaderUI
    
    
    
    
    renderLevelComplete() {
        // Background
        this.ctx.fillStyle = '#A5D8F0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render game elements
        this.renderConveyorBelt();
        this.renderDropZone();
        
        if (this.hand) {
            this.hand.render(this.ctx);
        }
        
        for (const cup of this.coffeeCups) {
            cup.render(this.ctx, this.isMobile);
        }
        
        // v0 Modal Overlay (consistent with Time's Up)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // v0 Card Modal (same dimensions as Time's Up)
        const isMobileSize = this.canvas.width <= 768;
        const cardWidth = isMobileSize ? Math.min(380, this.canvas.width - 40) : 480;
        const cardHeight = 320;
        const cardX = (this.canvas.width - cardWidth) / 2;
        const cardY = (this.canvas.height - cardHeight) / 2;
        
        // Draw card background
        this.ctx.fillStyle = '#FFFFFF';
        this.drawRoundedRect(cardX, cardY, cardWidth, cardHeight, 12);
        this.ctx.fill();
        
        // Add card shadow (approximated with border)
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        this.drawRoundedRect(cardX, cardY, cardWidth, cardHeight, 12);
        this.ctx.stroke();
        
        // Success icon (accomplishment emoji)
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = `${isMobileSize ? '48px' : '64px'} Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🎉', this.canvas.width / 2, cardY + 80);
        
        // Title
        this.ctx.fillStyle = '#6F4E37';
        this.ctx.font = `bold ${isMobileSize ? '24px' : '32px'} 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
        this.ctx.fillText(`Level ${this.levelNumber} Complete!`, this.canvas.width / 2, cardY + 140);
        
        // Description with score
        this.ctx.fillStyle = '#6B7280';
        this.ctx.font = `${isMobileSize ? '14px' : '16px'} 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
        if (this.currentLevel) {
            this.ctx.fillText(`Score: ${this.currentLevel.score}`, this.canvas.width / 2, cardY + 170);
        }
        
        const nextLevelText = this.levelNumber < 15 ? 'Ready for the next level!' : 'All levels completed!';
        this.ctx.fillText(nextLevelText, this.canvas.width / 2, cardY + 195);
        
        // v0 Continue Button (same style as Try Again button)
        const buttonWidth = 200;
        const buttonHeight = 44;
        const buttonX = (this.canvas.width - buttonWidth) / 2;
        const buttonY = cardY + 240;
        
        this.ctx.fillStyle = '#4CAF50';
        this.drawRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `600 ${isMobileSize ? '14px' : '16px'} 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
        const continueText = this.isMobile ? 'Tap to Continue' : 'Continue';
        this.ctx.fillText(continueText, this.canvas.width / 2, buttonY + buttonHeight/2);
    }
    
    renderLevelFailed() {
        // Background
        this.ctx.fillStyle = '#A5D8F0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render game elements
        this.renderConveyorBelt();
        this.renderDropZone();
        
        if (this.hand) {
            this.hand.render(this.ctx);
        }
        
        for (const cup of this.coffeeCups) {
            cup.render(this.ctx, this.isMobile);
        }
        
        // v0 Modal Overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // v0 Card Modal
        const isMobileSize = this.canvas.width <= 768;
        const cardWidth = isMobileSize ? Math.min(380, this.canvas.width - 40) : 480;
        const cardHeight = 320;
        const cardX = (this.canvas.width - cardWidth) / 2;
        const cardY = (this.canvas.height - cardHeight) / 2;
        
        // Draw card background
        this.ctx.fillStyle = '#FFFFFF';
        this.drawRoundedRect(cardX, cardY, cardWidth, cardHeight, 12);
        this.ctx.fill();
        
        // Add card shadow (approximated with border)
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        this.drawRoundedRect(cardX, cardY, cardWidth, cardHeight, 12);
        this.ctx.stroke();
        
        // Clock icon
        this.ctx.fillStyle = '#F44336';
        this.ctx.font = `${isMobileSize ? '48px' : '64px'} Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⏰', this.canvas.width / 2, cardY + 80);
        
        // Title
        this.ctx.fillStyle = '#6F4E37';
        this.ctx.font = `bold ${isMobileSize ? '24px' : '32px'} 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
        this.ctx.fillText("Time's Up!", this.canvas.width / 2, cardY + 140);
        
        // Description
        this.ctx.fillStyle = '#6B7280';
        this.ctx.font = `${isMobileSize ? '14px' : '16px'} 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
        this.ctx.fillText(`You completed ${this.cupsCompletedThisLevel} of ${this.targetCupsForLevel} cups.`, this.canvas.width / 2, cardY + 170);
        this.ctx.fillText('Try again to improve your timing!', this.canvas.width / 2, cardY + 195);
        
        // v0 Try Again Button
        const buttonWidth = 200;
        const buttonHeight = 44;
        const buttonX = (this.canvas.width - buttonWidth) / 2;
        const buttonY = cardY + 240;
        
        this.ctx.fillStyle = '#F97316';
        this.drawRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `600 ${isMobileSize ? '14px' : '16px'} 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;
        const retryText = this.isMobile ? 'Tap to Try Again' : 'Try Again';
        this.ctx.fillText(retryText, this.canvas.width / 2, buttonY + buttonHeight/2);
    }
    
    renderGameComplete() {
        // Background
        this.ctx.fillStyle = '#A5D8F0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Victory overlay
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.9)'; // Gold
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Victory text
        const isMobileSize = this.canvas.width <= 768;
        this.ctx.fillStyle = '#3E2723';
        this.ctx.font = `bold ${isMobileSize ? '36px' : '56px'} "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Sweet Victory!', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        this.ctx.font = `${isMobileSize ? '22px' : '32px'} "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.fillText('All 15 levels completed!', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = `${isMobileSize ? '16px' : '20px'} "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.fillText('You are a true Sweet Barista!', this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        this.ctx.font = `${isMobileSize ? '14px' : '16px'} "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
        this.ctx.fillText('Refresh to play again', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }
    
    updatePerformanceStats(deltaTime, currentTime) {
        // Update delta time history for performance analysis
        this.deltaTimeHistory.push(deltaTime);
        if (this.deltaTimeHistory.length > this.maxDeltaHistory) {
            this.deltaTimeHistory.shift();
        }
        
        // Update FPS counter every second
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            
            // Log performance warnings in debug mode
            if (this.showDebug && this.fps < 55) {
                console.warn(`Low FPS detected: ${this.fps}`);
            }
        }
    }
    
    renderDebugInfo() {
        const ctx = this.ctx;
        const x = 10;
        const y = 30;
        const lineHeight = 20;
        
        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(5, 5, 200, 140);
        
        ctx.fillStyle = '#00FF00';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        
        // Basic performance stats
        ctx.fillText(`FPS: ${this.fps}`, x, y);
        ctx.fillText(`State: ${this.state}`, x, y + lineHeight);
        ctx.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, x, y + lineHeight * 2);
        
        // Delta time stats
        if (this.deltaTimeHistory.length > 0) {
            const avgDelta = this.deltaTimeHistory.reduce((a, b) => a + b, 0) / this.deltaTimeHistory.length;
            const maxDelta = Math.max(...this.deltaTimeHistory);
            const minDelta = Math.min(...this.deltaTimeHistory);
            
            ctx.fillText(`Avg ΔT: ${avgDelta.toFixed(2)}ms`, x, y + lineHeight * 3);
            ctx.fillText(`Max ΔT: ${maxDelta.toFixed(2)}ms`, x, y + lineHeight * 4);
            ctx.fillText(`Min ΔT: ${minDelta.toFixed(2)}ms`, x, y + lineHeight * 5);
        }
        
        // Memory usage (if available)
        if (performance.memory) {
            const memory = performance.memory;
            const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(1);
            ctx.fillText(`Memory: ${usedMB}MB`, x, y + lineHeight * 6);
        }
    }
    
    // Public API for debugging
    getFPS() {
        return this.fps;
    }
    
    getPerformanceStats() {
        return {
            fps: this.fps,
            avgDeltaTime: this.deltaTimeHistory.length > 0 
                ? this.deltaTimeHistory.reduce((a, b) => a + b, 0) / this.deltaTimeHistory.length 
                : 0,
            maxDeltaTime: this.deltaTimeHistory.length > 0 ? Math.max(...this.deltaTimeHistory) : 0,
            minDeltaTime: this.deltaTimeHistory.length > 0 ? Math.min(...this.deltaTimeHistory) : 0
        };
    }
    
    toggleDebug() {
        this.showDebug = !this.showDebug;
        if (this.showDebug) {
            console.log('Debug mode enabled');
            window.game = this;
        } else {
            console.log('Debug mode disabled');
            delete window.game;
        }
    }
    
    hideLoadingScreen() {
        console.log('🎯 Attempting to hide loading screen...');
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            console.log('✅ Loading screen found, hiding it now');
            loadingScreen.style.display = 'none';
            
            // Additional check to ensure it's actually hidden
            setTimeout(() => {
                if (loadingScreen.style.display === 'none') {
                    console.log('🎉 Loading screen successfully hidden - game should be visible now!');
                } else {
                    console.warn('⚠️ Loading screen may not be fully hidden');
                }
            }, 100);
        } else {
            console.error('❌ Loading screen element not found - cannot hide it');
        }
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }
}
