export class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.masterVolume = 1.0;
        this.soundVolume = 0.7;
        this.musicVolume = 0.4; // Reduced to 40% (80% of 50%)
        
        // Simplified music startup system
        this.userInteractionDetected = false;
        this.pendingMusicStart = false;
        
        // Load audio preferences from localStorage
        this.loadAudioPreferences();
    }
    
    loadAudioPreferences() {
        try {
            const savedPrefs = localStorage.getItem('sugarCubeGameAudioPrefs');
            if (savedPrefs) {
                const prefs = JSON.parse(savedPrefs);
                this.soundEnabled = prefs.soundEnabled !== false; // Default to true
                this.musicEnabled = prefs.musicEnabled !== false; // Default to true
                this.soundVolume = prefs.soundVolume || 0.7;
                this.musicVolume = prefs.musicVolume || 0.4; // Default to 40%
            } else {
                // Default settings for first time users
                this.soundEnabled = true;
                this.musicEnabled = true;
            }
        } catch (error) {
            console.warn('Failed to load audio preferences, using defaults:', error);
            this.soundEnabled = true;
            this.musicEnabled = true;
        }
    }
    
    saveAudioPreferences() {
        try {
            const prefs = {
                soundEnabled: this.soundEnabled,
                musicEnabled: this.musicEnabled,
                soundVolume: this.soundVolume,
                musicVolume: this.musicVolume
            };
            localStorage.setItem('sugarCubeGameAudioPrefs', JSON.stringify(prefs));
        } catch (error) {
            console.warn('Failed to save audio preferences:', error);
        }
    }
    
    addSound(name, audioElement) {
        if (audioElement) {
            audioElement.volume = this.soundVolume;
            this.sounds[name] = audioElement;
        } else {
            // Create a silent placeholder for missing audio files
            this.sounds[name] = {
                play: () => Promise.resolve(),
                pause: () => {},
                currentTime: 0,
                volume: this.soundVolume
            };
            if (window.DEBUG_MODE) {
                console.warn(`Audio file missing for ${name}, using silent placeholder`);
            }
        }
    }
    
    setMusic(audioElement) {
        if (audioElement) {
            this.music = audioElement;
            this.music.loop = true;
            this.music.volume = this.musicVolume;
        } else {
            // Create a silent placeholder for missing music
            this.music = {
                play: () => Promise.resolve(),
                pause: () => {},
                currentTime: 0,
                volume: this.musicVolume,
                loop: true
            };
            if (window.DEBUG_MODE) {
                console.warn('Background music file missing, using silent placeholder');
            }
        }
    }
    
    playSound(name) {
        if (!this.soundEnabled) return;
        
        const sound = this.sounds[name];
        if (sound) {
            if (sound.currentTime !== undefined) {
                sound.currentTime = 0;
            }
            sound.play().catch(e => console.warn('Could not play sound:', e));
        }
    }
    
    playMusic() {
        if (!this.musicEnabled || !this.music) return;
        
        // Check if this is an autoplay attempt without user interaction
        if (!this.userInteractionDetected) {
            if (window.DEBUG_MODE) console.log('🎵 Music autoplay blocked - waiting for user interaction');
            this.pendingMusicStart = true;
            return;
        }
        
        if (window.DEBUG_MODE) console.log('🎵 Starting music with user interaction');
        this.music.play().catch(e => {
            console.warn('Could not play music:', e);
            // If music fails even with user interaction, mark as pending
            if (!this.userInteractionDetected) {
                this.pendingMusicStart = true;
            }
        });
    }
    
    pauseMusic() {
        if (this.music) {
            this.music.pause();
        }
    }
    
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }
    
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        this.saveAudioPreferences();
    }
    
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        this.saveAudioPreferences();
        if (!enabled) {
            this.pauseMusic();
            this.pendingMusicStart = false;
        } else {
            // When music is enabled, check if we need to wait for interaction
            if (this.userInteractionDetected) {
                this.playMusic();
            } else {
                // User enabled music but we still need interaction
                if (window.DEBUG_MODE) console.log('🎵 Music enabled - will start after first interaction');
                this.pendingMusicStart = true;
            }
        }
    }
    
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        for (let name in this.sounds) {
            this.sounds[name].volume = this.soundVolume * this.masterVolume;
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicVolume * this.masterVolume;
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.setSoundVolume(this.soundVolume);
        this.setMusicVolume(this.musicVolume);
    }
    
    isSoundEnabled() {
        return this.soundEnabled;
    }
    
    isMusicEnabled() {
        return this.musicEnabled;
    }
    
    // Simplified music startup system
    startMusicAfterInteraction() {
        if (!this.userInteractionDetected) {
            this.userInteractionDetected = true;
            if (window.DEBUG_MODE) console.log('🎵 User interaction detected!');
            
            // Start music if it's pending and enabled
            if (this.pendingMusicStart && this.musicEnabled) {
                if (window.DEBUG_MODE) console.log('🎵 Starting pending music...');
                this.music.play().catch(e => {
                    if (window.DEBUG_MODE) console.warn('Music start failed:', e);
                });
                this.pendingMusicStart = false;
            }
        }
    }
    
    hasPendingMusic() {
        return this.pendingMusicStart;
    }
    
    hasUserInteracted() {
        return this.userInteractionDetected;
    }
    
    // Method expected by Game.js - checks if music is ready to start
    isMusicReadyToStart() {
        return this.hasPendingMusic();
    }
}