import { CONFIG } from '../config.js';

export class Level {
    constructor(levelNumber) {
        this.levelNumber = levelNumber;
        this.config = CONFIG.LEVELS[levelNumber - 1];
        if (!this.config) {
            console.error(`Level ${levelNumber} not found in config!`);
            this.config = CONFIG.LEVELS[0]; // Fallback to level 1
        }
        
        // Timer and completion tracking
        this.maxTime = this.config.time;
        this.timeRemaining = this.config.time;
        this.isComplete = false;
        this.isFailed = false;
        this.isStarted = false;
        
        // Cup completion tracking
        this.totalCupsNeeded = this.config.cups;
        this.cupsCompleted = 0;
        this.totalSugarNeeded = this.generateTotalSugarTarget();
        this.sugarDelivered = 0;
        
        // Level state
        this.startTime = 0;
        this.endTime = 0;
        this.score = 0;
        
        // Pause functionality
        this.isPaused = false;
        this.pauseStartTime = 0;
        this.totalPausedTime = 0;
        
        console.log(`Level ${this.levelNumber} created: ${this.config.difficulty} - ${this.config.time}s, ${this.totalCupsNeeded} cups, ${this.totalSugarNeeded} total sugar`);
    }
    
    generateTotalSugarTarget() {
        const [min, max] = this.config.totalSugar;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    start() {
        this.isStarted = true;
        this.startTime = Date.now();
        console.log(`Level ${this.levelNumber} started!`);
    }
    
    update(deltaTime, completedCups = 0, totalCups = 0, totalSugarDelivered = 0) {
        if (!this.isStarted || this.isComplete || this.isFailed || this.isPaused) {
            return;
        }
        
        // Update timer
        this.timeRemaining -= deltaTime / 1000;
        
        // Update progress tracking
        this.cupsCompleted = completedCups;
        this.totalCupsNeeded = totalCups;
        this.sugarDelivered = totalSugarDelivered;
        
        // NEW LOGIC: Must complete ALL cups exactly as required
        // Level completes only when every cup is filled to its exact requirement
        if (completedCups > 0 && completedCups === totalCups) {
            console.log(`Level completing: ALL ${completedCups}/${totalCups} cups completed with exact sugar requirements!`);
            this.complete();
            return;
        }
        
        // Check fail condition (time up)
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.fail();
        }
    }
    
    complete() {
        if (!this.isComplete) {
            this.isComplete = true;
            this.endTime = Date.now();
            this.calculateScore();
            console.log(`Level ${this.levelNumber} completed! Score: ${this.score}`);
        }
    }
    
    fail() {
        if (!this.isFailed) {
            this.isFailed = true;
            this.endTime = Date.now();
            console.log(`Level ${this.levelNumber} failed - time's up!`);
        }
    }
    
    calculateScore() {
        const timeBonus = Math.max(0, Math.floor(this.timeRemaining * 10)); // 10 points per second left
        const efficiencyBonus = Math.floor((this.sugarDelivered / this.totalSugarNeeded) * 100);
        this.score = timeBonus + efficiencyBonus;
    }
    
    pause() {
        if (!this.isPaused && this.isStarted && !this.isComplete && !this.isFailed) {
            this.isPaused = true;
            this.pauseStartTime = Date.now();
            console.log(`Level ${this.levelNumber} paused`);
        }
    }
    
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.totalPausedTime += Date.now() - this.pauseStartTime;
            this.pauseStartTime = 0;
            console.log(`Level ${this.levelNumber} resumed`);
        }
    }
    
    getTimeRemaining() {
        return Math.max(0, this.timeRemaining);
    }
    
    getTimeRemainingSeconds() {
        return Math.ceil(this.getTimeRemaining());
    }
    
    getConveyorSpeed() {
        return this.config.speed;
    }
    
    getCupCount() {
        return this.config.cups;
    }
    
    getTotalSugarRange() {
        return this.config.totalSugar;
    }
    
    getDifficulty() {
        return this.config.difficulty;
    }
    
    checkComplete(completedCups) {
        if (completedCups >= this.config.cups) {
            this.isComplete = true;
        }
        return this.isComplete;
    }
    
    // Progress tracking methods
    getProgressPercentage() {
        return Math.min(100, (this.sugarDelivered / this.totalSugarNeeded) * 100);
    }
    
    getTimerPercentage() {
        return (this.timeRemaining / this.maxTime) * 100;
    }
    
    getTimerColorState() {
        const percentage = this.getTimerPercentage();
        if (percentage > 50) return 'normal';
        if (percentage > 20) return 'warning';
        return 'danger';
    }
    
    // UI helper methods
    getDisplayTime() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = Math.floor(this.timeRemaining % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    isTimeWarning() {
        return this.timeRemaining <= 10 && this.timeRemaining > 0;
    }
}