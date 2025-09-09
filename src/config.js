export const CONFIG = {
    GAME: {
        TARGET_FPS: 60,
        CANVAS_WIDTH: 1280,
        CANVAS_HEIGHT: 720,
        MOBILE_WIDTH: 360,
        MOBILE_HEIGHT: 640
    },
    
    PHYSICS: {
        GRAVITY: 180, // Increased from 100 for faster falling speed
        SUGAR_DROP_TIME: 1000
    },
    
    LEVELS: [
        { level: 1, time: 60, speed: 1.3, cups: 3, totalSugar: [5, 6], difficulty: 'Tutorial' },
        { level: 2, time: 60, speed: 1.4, cups: 4, totalSugar: [7, 8], difficulty: 'Easy' },
        { level: 3, time: 60, speed: 1.5, cups: 5, totalSugar: [9, 10], difficulty: 'Easy' },
        { level: 4, time: 60, speed: 1.6, cups: 6, totalSugar: [11, 12], difficulty: 'Medium' },
        { level: 5, time: 60, speed: 1.7, cups: 7, totalSugar: [13, 14], difficulty: 'Medium' },
        { level: 6, time: 55, speed: 1.8, cups: 8, totalSugar: [15, 16], difficulty: 'Medium' },
        { level: 7, time: 55, speed: 1.9, cups: 9, totalSugar: [17, 18], difficulty: 'Hard' },
        { level: 8, time: 50, speed: 2.0, cups: 10, totalSugar: [19, 20], difficulty: 'Hard' },
        { level: 9, time: 50, speed: 2.1, cups: 11, totalSugar: [21, 23], difficulty: 'Hard' },
        { level: 10, time: 45, speed: 2.2, cups: 12, totalSugar: [24, 26], difficulty: 'Very Hard' },
        { level: 11, time: 45, speed: 2.3, cups: 13, totalSugar: [27, 29], difficulty: 'Very Hard' },
        { level: 12, time: 40, speed: 2.4, cups: 14, totalSugar: [30, 32], difficulty: 'Expert' },
        { level: 13, time: 40, speed: 2.5, cups: 15, totalSugar: [33, 35], difficulty: 'Expert' },
        { level: 14, time: 35, speed: 2.6, cups: 16, totalSugar: [36, 38], difficulty: 'Expert' },
        { level: 15, time: 35, speed: 2.8, cups: 17, totalSugar: [39, 42], difficulty: 'Master' }
    ],
    
    COLORS: {
        COFFEE_BROWN: '#6F4E37',
        CREAM_WHITE: '#FFF8E7',
        SUGAR_WHITE: '#FFFFFF',
        CONVEYOR_GRAY: '#5A5A5A',
        SUCCESS_GREEN: '#4CAF50',
        WARNING_YELLOW: '#FFC107',
        DANGER_RED: '#F44336',
        BG_BLUE: '#87CEEB',
        BUTTON_PRIMARY: '#8B6046',
        BUTTON_HOVER: '#A0725A',
        TEXT_DARK: '#3E2723',
        TEXT_LIGHT: '#FFFFFF'
    },
    
    SUGAR_DISTRIBUTION: {
        ONE_SUGAR: 0.3,
        TWO_SUGAR: 0.5,
        THREE_SUGAR: 0.2
    },
    
    PREVIEW_SYSTEM: {
        // Distance-based preview activation (pixels from drop zone)
        BASE_PREVIEW_DISTANCE: 300,        // Base distance for preview activation
        SPEED_MULTIPLIER: 50,              // Additional distance per speed unit
        MIN_REACTION_TIME: 2.0,            // Minimum reaction time in seconds
        MAX_REACTION_TIME: 3.5,            // Maximum reaction time in seconds
        
        // Visual indicators
        PREVIEW_OPACITY: 0.9,              // Opacity of preview indicators
        HIGHLIGHT_PULSE_SPEED: 0.008,      // Speed of attention-grabbing pulse
        DISTANCE_FADE_START: 0.8,          // Start fading at 80% of preview distance
        
        // Enhanced visibility options
        ORDER_NOTE_SCALE: 1.3,             // Scale up order notes in preview zone
        PROGRESS_BAR_SCALE: 1.2,           // Scale up progress indicators
        URGENT_COLOR: '#FF6B35',           // Orange color for urgent attention
        PREVIEW_COLOR: '#4FC3F7',          // Light blue for preview zone
        
        // Mobile optimizations
        MOBILE_SCALE_BONUS: 1.15,          // Additional scaling on mobile
        MOBILE_DISTANCE_BONUS: 80,         // Extra preview distance on mobile
        TOUCH_HIGHLIGHT_SIZE: 1.4          // Touch target highlighting
    }
};