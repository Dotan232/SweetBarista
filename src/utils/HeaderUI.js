import { CONFIG } from '../config.js';

export class HeaderUI {
    constructor() {
        // Header container
        this.headerElement = document.getElementById('gameHeader');
        
        // Level information elements
        this.levelNumberElement = document.getElementById('levelNumber');
        this.levelDifficultyElement = document.getElementById('levelDifficulty');
        
        // Progress elements
        this.progressCurrentElement = document.getElementById('progressCurrent');
        this.progressTotalElement = document.getElementById('progressTotal');
        
        // Timer elements
        this.timerBarElement = document.getElementById('timerBar');
        this.timerFillElement = document.getElementById('timerFill');
        this.timerDisplayElement = document.getElementById('timerDisplay');
        
        // Button elements
        this.pauseButton = document.getElementById('pauseBtn');
        this.soundButton = document.getElementById('soundBtn');
        this.musicButton = document.getElementById('musicBtn');
        
        // State tracking
        this.isVisible = false;
        this.lastTimerState = null;
        
        this.initializeButtons();
    }
    
    initializeButtons() {
        // Set initial button states
        this.updateAudioButtonStates(true, true, false); // Default to enabled, not pending
    }
    
    show() {
        if (!this.isVisible) {
            this.headerElement.style.display = 'flex';
            this.isVisible = true;
        }
    }
    
    hide() {
        if (this.isVisible) {
            this.headerElement.style.display = 'none';
            this.isVisible = false;
        }
    }
    
    updateLevel(levelNumber, difficulty) {
        // Handle nested structure: Level Number contains Difficulty as nested span
        if (this.levelNumberElement && this.levelDifficultyElement) {
            // Update the h2 text content while preserving the nested span
            this.levelNumberElement.innerHTML = `Level ${levelNumber} <span id="levelDifficulty" class="text-sm font-normal text-amber-600">${difficulty}</span>`;
            // Update the reference to the new span element
            this.levelDifficultyElement = document.getElementById('levelDifficulty');
            
            // Ensure v0 amber colors are applied (fallback to inline styles)
            this.levelNumberElement.style.color = '#92400E';
            if (this.levelDifficultyElement) {
                this.levelDifficultyElement.style.color = '#D97706';
            }
        }
    }
    
    updateProgress(current, total) {
        if (this.progressCurrentElement) {
            this.progressCurrentElement.textContent = current;
        }
        
        if (this.progressTotalElement) {
            this.progressTotalElement.textContent = total;
        }
        
        // Add visual feedback for progress changes
        if (this.progressCurrentElement) {
            this.progressCurrentElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.progressCurrentElement.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    updateTimer(percentage, timeLeft, colorState) {
        // Update timer bar
        if (this.timerFillElement) {
            this.timerFillElement.style.width = `${percentage}%`;
            
            // Remove previous state classes
            this.timerFillElement.classList.remove('warning', 'danger');
            
            // Add appropriate state class
            if (colorState === 'warning') {
                this.timerFillElement.classList.add('warning');
            } else if (colorState === 'danger') {
                this.timerFillElement.classList.add('danger');
            }
        }
        
        // Update timer display
        if (this.timerDisplayElement) {
            this.timerDisplayElement.textContent = timeLeft;
            
            // Add visual feedback for state changes
            if (colorState !== this.lastTimerState) {
                this.timerDisplayElement.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.timerDisplayElement.style.transform = 'scale(1)';
                }, 150);
                
                this.lastTimerState = colorState;
            }
        }
    }
    
    updateAudioButtonStates(soundEnabled, musicEnabled, musicPending = false) {
        if (this.soundButton) {
            this.soundButton.textContent = soundEnabled ? '🔊' : '🔇';
            // v0 Design: Use highlighted class when enabled, disabled class when off
            this.soundButton.classList.toggle('disabled', !soundEnabled);
            this.soundButton.classList.toggle('highlighted', soundEnabled);
            this.soundButton.title = soundEnabled ? 'Disable Sound Effects' : 'Enable Sound Effects';
        }
        
        if (this.musicButton) {
            // Show different states based on music status
            if (musicPending && musicEnabled) {
                // Music is enabled but waiting for user interaction
                this.musicButton.textContent = '🔅'; // Waiting/loading symbol
                this.musicButton.classList.remove('disabled');
                this.musicButton.classList.add('pending', 'highlighted');
                this.musicButton.title = 'Music enabled - tap anywhere to start';
            } else if (musicEnabled) {
                // Music is enabled and playing - v0 style highlighted
                this.musicButton.textContent = '🎵';
                this.musicButton.classList.remove('disabled', 'pending');
                this.musicButton.classList.add('highlighted');
                this.musicButton.title = 'Disable Background Music';
            } else {
                // Music is disabled - v0 style disabled
                this.musicButton.textContent = '🎶';
                this.musicButton.classList.add('disabled');
                this.musicButton.classList.remove('pending', 'highlighted');
                this.musicButton.title = 'Enable Background Music';
            }
        }
    }
    
    updatePauseButtonState(isPaused) {
        if (this.pauseButton) {
            // v0 Design: Show Play icon when paused, Pause icon when playing (clean Unicode symbols)
            this.pauseButton.textContent = isPaused ? '▶' : '⏸';
            this.pauseButton.title = isPaused ? 'Resume Game' : 'Pause Game';
            
            // v0 Style: Highlight the button when paused (call to action)
            this.pauseButton.classList.toggle('paused', isPaused);
            this.pauseButton.classList.toggle('highlighted', isPaused);
        }
    }
    
    setPauseButtonCallback(callback) {
        if (this.pauseButton) {
            this.pauseButton.addEventListener('click', callback);
        }
    }
    
    setSoundButtonCallback(callback) {
        if (this.soundButton) {
            this.soundButton.addEventListener('click', callback);
        }
    }
    
    setMusicButtonCallback(callback) {
        if (this.musicButton) {
            this.musicButton.addEventListener('click', callback);
        }
    }
    
    // Animate progress completion
    animateProgressComplete() {
        if (this.progressCurrentElement) {
            this.progressCurrentElement.style.animation = 'none';
            setTimeout(() => {
                this.progressCurrentElement.style.animation = 'progressPulse 0.6s ease-in-out';
            }, 10);
        }
    }
    
    // Add CSS animation for progress pulse and music pending state
    static addProgressPulseAnimation() {
        if (!document.getElementById('headerUIStyles')) {
            const style = document.createElement('style');
            style.id = 'headerUIStyles';
            style.textContent = `
                @keyframes progressPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); color: #FFD700; }
                    100% { transform: scale(1); }
                }
                
                @keyframes musicPending {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .progress-current {
                    transition: transform 0.2s ease, color 0.2s ease;
                }
                
                .timer-display {
                    transition: transform 0.15s ease;
                }
                
                .audio-btn.pending {
                    animation: musicPending 1.5s ease-in-out infinite;
                    color: #FFC107 !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Reset all elements to default state
    reset() {
        this.updateLevel(1, 'Tutorial');
        this.updateProgress(0, 3);
        this.updateTimer(100, '60s', 'normal');
        this.lastTimerState = null;
        
        // Reset audio button states
        this.updateAudioButtonStates(true, true, false);
    }
}

// Add CSS animations when module loads
HeaderUI.addProgressPulseAnimation();