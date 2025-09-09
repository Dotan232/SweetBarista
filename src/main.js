import { Game } from './game/Game.js?v=77';
import { CONFIG } from './config.js?v=77';

let game;

async function init() {
    try {
        console.log('🚀 Initializing game...');
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        if (!ctx) {
            throw new Error('Canvas 2D context not available');
        }
        
        console.log('✅ Canvas and context available:', canvas.width, 'x', canvas.height);
        
        // Check for test mode, compatibility mode, memory monitoring, debug mode, and offline testing
        const urlParams = new URLSearchParams(window.location.search);
        const testMode = urlParams.get('test') === 'true';
        const compatibilityMode = urlParams.get('compatibility') === 'true';
        const memoryMode = urlParams.get('memory') === 'true';
        const debugMode = urlParams.get('debug') === 'true';
        const offlineMode = urlParams.get('offline') === 'true';
        
        // Set global debug flag
        window.DEBUG_MODE = debugMode;
        
        if (debugMode) {
            console.log('🐛 Debug mode enabled - verbose logging active');
        }
        
        if (testMode) {
            console.log('🧪 Test mode enabled');
            await runBasicTests();
        }
        
        if (compatibilityMode) {
            console.log('🔍 Compatibility mode enabled');
            const { BrowserCompatibility } = await import('./utils/BrowserCompatibility.js');
            const checker = new BrowserCompatibility();
            checker.runAllTests();
        }
        
        if (memoryMode) {
            console.log('📊 Memory monitoring enabled');
            const { MemoryMonitor } = await import('./utils/MemoryMonitor.js');
            const monitor = new MemoryMonitor();
            monitor.startMonitoring();
            window.memoryMonitor = monitor;
        }
        
        if (offlineMode) {
            console.log('🔌 Offline testing enabled');
            const { OfflineTester } = await import('./utils/OfflineTester.js');
            const tester = new OfflineTester();
            await tester.runOfflineTests();
        }
        
        console.log('🎮 Creating Game instance...');
        game = new Game(canvas, ctx);
        console.log('🎮 Starting game...');
        await game.start();
        console.log('✅ Game initialization complete!');
        
    } catch (error) {
        console.error('❌ CRITICAL ERROR in init():', error);
        console.error('❌ Error stack:', error.stack);
        
        // Force hide loading screen and show error
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // Show error on canvas if possible
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#FF0000';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Game failed to load', canvas.width / 2, canvas.height / 2 - 20);
                ctx.fillText('Check console for details', canvas.width / 2, canvas.height / 2 + 20);
            }
        }
    }
}

// Basic testing function
async function runBasicTests() {
    console.log('🧪 Running basic game tests...');
    
    // Test 1: Config validation
    const configValid = validateConfig();
    console.log(`✅ Config validation: ${configValid ? 'PASS' : 'FAIL'}`);
    
    // Test 2: Level progression test
    const levelValid = validateLevels();
    console.log(`✅ Level validation: ${levelValid ? 'PASS' : 'FAIL'}`);
    
    // Test 3: Sugar distribution test
    const sugarValid = validateSugarDistribution();
    console.log(`✅ Sugar distribution: ${sugarValid ? 'PASS' : 'FAIL'}`);
    
    const allTestsPassed = configValid && levelValid && sugarValid;
    console.log(`🎯 All tests: ${allTestsPassed ? 'PASS' : 'FAIL'}`);
    
    return allTestsPassed;
}

function validateConfig() {
    try {
        if (typeof CONFIG === 'undefined') return false;
        if (!CONFIG.LEVELS || CONFIG.LEVELS.length !== 15) return false;
        if (!CONFIG.COLORS || !CONFIG.PHYSICS) return false;
        return true;
    } catch (error) {
        console.error('Config validation error:', error);
        return false;
    }
}

function validateLevels() {
    try {
        for (let i = 0; i < 15; i++) {
            const level = CONFIG.LEVELS[i];
            if (!level || level.level !== i + 1) {
                console.error(`Level ${i + 1} configuration invalid`);
                return false;
            }
            if (!level.cups || !level.time || !level.speed) {
                console.error(`Level ${i + 1} missing required properties`);
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error('Level validation error:', error);
        return false;
    }
}

function validateSugarDistribution() {
    try {
        const dist = CONFIG.SUGAR_DISTRIBUTION;
        const total = dist.ONE_SUGAR + dist.TWO_SUGAR + dist.THREE_SUGAR;
        return Math.abs(total - 1.0) < 0.01;
    } catch (error) {
        console.error('Sugar distribution validation error:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', init);