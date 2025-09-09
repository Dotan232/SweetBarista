export class AudioGenerator {
    constructor() {
        this.audioContext = null;
        this.initAudioContext();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }
    
    // Generate a simple beep sound
    generateBeep(frequency = 440, duration = 0.2, type = 'sine') {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        return {
            play: () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }
        };
    }
    
    // Generate different sound effects
    static getSoundConfig() {
        return {
            sugarDrop: { frequency: 200, duration: 0.1, type: 'square' },
            successHit: { frequency: 600, duration: 0.2, type: 'sine' },
            miss: { frequency: 150, duration: 0.3, type: 'sawtooth' },
            sugarSplash: { frequency: 100, duration: 0.4, type: 'noise' },
            levelComplete: { frequency: 800, duration: 0.5, type: 'sine' },
            levelFail: { frequency: 120, duration: 0.8, type: 'square' },
            timeWarning: { frequency: 880, duration: 0.1, type: 'square' }
        };
    }
}