// Memory Usage Monitor for Sweet Barista Game
// Add ?memory=true to URL to enable memory monitoring

export class MemoryMonitor {
    constructor() {
        this.measurements = [];
        this.isMonitoring = false;
        this.intervalId = null;
        this.startTime = Date.now();
        this.baselineMemory = null;
    }
    
    startMonitoring(intervalMs = 5000) {
        if (this.isMonitoring) {
            console.warn('Memory monitoring already active');
            return;
        }
        
        console.log('🔍 Starting memory monitoring...');
        this.isMonitoring = true;
        this.startTime = Date.now();
        
        // Take baseline measurement
        this.takeMeasurement('baseline');
        
        // Set up periodic measurements
        this.intervalId = setInterval(() => {
            this.takeMeasurement('periodic');
        }, intervalMs);
        
        // Monitor game events
        this.setupGameEventListeners();
        
        // Display initial status
        this.displayMonitoringStatus();
    }
    
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        console.log('🛑 Stopping memory monitoring...');
        this.isMonitoring = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // Final measurement
        this.takeMeasurement('final');
        
        // Generate report
        this.generateReport();
    }
    
    takeMeasurement(context = 'manual') {
        const timestamp = Date.now();
        const relativeTime = timestamp - this.startTime;
        
        let memoryInfo = null;
        
        // Try different memory APIs
        if (performance.memory) {
            // Chrome-specific memory API
            memoryInfo = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                source: 'performance.memory'
            };
        } else if (navigator.deviceMemory) {
            // Rough estimate based on device memory
            memoryInfo = {
                deviceMemory: navigator.deviceMemory,
                estimatedUsage: 'N/A',
                source: 'navigator.deviceMemory'
            };
        } else {
            // Fallback - count game objects
            memoryInfo = this.estimateGameObjectMemory();
        }
        
        const measurement = {
            timestamp,
            relativeTime,
            context,
            memory: memoryInfo,
            gameState: this.getCurrentGameState()
        };
        
        this.measurements.push(measurement);
        
        // Set baseline on first measurement
        if (!this.baselineMemory && memoryInfo) {
            this.baselineMemory = memoryInfo;
        }
        
        if (context === 'periodic') {
            this.logMeasurement(measurement);
        }
        
        return measurement;
    }
    
    estimateGameObjectMemory() {
        // Count various game objects to estimate memory usage
        const canvases = document.querySelectorAll('canvas').length;
        const audioElements = document.querySelectorAll('audio').length;
        const images = document.querySelectorAll('img').length;
        
        // Rough estimation based on typical object sizes
        const estimatedKB = (canvases * 1000) + (audioElements * 50) + (images * 100);
        
        return {
            canvases,
            audioElements,
            images,
            estimatedKB,
            source: 'object_count_estimation'
        };
    }
    
    getCurrentGameState() {
        // Try to access game state if available
        try {
            if (window.game) {
                return {
                    state: window.game.state || 'unknown',
                    currentLevel: window.game.currentLevel || 0,
                    cupsActive: window.game.cups?.length || 0,
                    sugarsActive: window.game.sugars?.length || 0
                };
            }
        } catch (error) {
            console.warn('Could not access game state:', error);
        }
        
        return { state: 'unavailable' };
    }
    
    setupGameEventListeners() {
        // Listen for level changes and other significant events
        document.addEventListener('levelStart', () => {
            this.takeMeasurement('level_start');
        });
        
        document.addEventListener('levelComplete', () => {
            this.takeMeasurement('level_complete');
        });
        
        // Monitor for potential memory-intensive operations
        let clickCount = 0;
        document.addEventListener('click', () => {
            clickCount++;
            if (clickCount % 100 === 0) {
                this.takeMeasurement(`after_${clickCount}_clicks`);
            }
        });
    }
    
    logMeasurement(measurement) {
        const { relativeTime, memory, gameState } = measurement;
        const minutes = Math.floor(relativeTime / 60000);
        const seconds = Math.floor((relativeTime % 60000) / 1000);
        
        let memoryStr = 'N/A';
        if (memory.usedJSHeapSize) {
            const usedMB = (memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
            const totalMB = (memory.totalJSHeapSize / (1024 * 1024)).toFixed(1);
            memoryStr = `${usedMB}MB / ${totalMB}MB`;
        } else if (memory.estimatedKB) {
            memoryStr = `~${memory.estimatedKB}KB (estimated)`;
        }
        
        console.log(`📊 Memory [${minutes}:${seconds.toString().padStart(2, '0')}]: ${memoryStr} | Game: ${gameState.state}`);
    }
    
    generateReport() {
        console.log('\n📋 Memory Usage Report');
        console.log('=====================');
        
        if (this.measurements.length < 2) {
            console.log('❌ Insufficient data for report');
            return;
        }
        
        const first = this.measurements[0];
        const last = this.measurements[this.measurements.length - 1];
        const totalTime = last.relativeTime;
        
        console.log(`⏱️ Monitoring Duration: ${(totalTime / 1000).toFixed(1)} seconds`);
        console.log(`📈 Total Measurements: ${this.measurements.length}`);
        
        // Memory analysis
        this.analyzeMemoryTrend();
        
        // Game state analysis
        this.analyzeGameStates();
        
        // Recommendations
        this.provideRecommendations();
    }
    
    analyzeMemoryTrend() {
        const memoryMeasurements = this.measurements.filter(m => 
            m.memory && m.memory.usedJSHeapSize
        );
        
        if (memoryMeasurements.length < 2) {
            console.log('📊 Memory Trend: Insufficient memory data available');
            return;
        }
        
        const first = memoryMeasurements[0];
        const last = memoryMeasurements[memoryMeasurements.length - 1];
        
        const startMB = first.memory.usedJSHeapSize / (1024 * 1024);
        const endMB = last.memory.usedJSHeapSize / (1024 * 1024);
        const deltaMemory = endMB - startMB;
        
        console.log(`📊 Memory Trend:`);
        console.log(`   Start: ${startMB.toFixed(1)}MB`);
        console.log(`   End: ${endMB.toFixed(1)}MB`);
        console.log(`   Change: ${deltaMemory > 0 ? '+' : ''}${deltaMemory.toFixed(1)}MB`);
        
        // Analyze trend
        if (deltaMemory > 10) {
            console.log('⚠️  Significant memory increase detected - potential memory leak');
        } else if (deltaMemory > 5) {
            console.log('🔍 Moderate memory increase - monitor for leaks');
        } else if (deltaMemory < -5) {
            console.log('♻️  Memory decreased - good garbage collection');
        } else {
            console.log('✅ Memory usage stable');
        }
    }
    
    analyzeGameStates() {
        const states = this.measurements.map(m => m.gameState.state).filter(s => s !== 'unavailable');
        const uniqueStates = [...new Set(states)];
        
        console.log(`🎮 Game States Observed: ${uniqueStates.join(', ')}`);
        
        // Look for state-specific memory patterns
        uniqueStates.forEach(state => {
            const stateMeasurements = this.measurements.filter(m => m.gameState.state === state);
            if (stateMeasurements.length > 1) {
                console.log(`   ${state}: ${stateMeasurements.length} measurements`);
            }
        });
    }
    
    provideRecommendations() {
        console.log('\n💡 Recommendations:');
        
        const totalMeasurements = this.measurements.length;
        const duration = this.measurements[this.measurements.length - 1]?.relativeTime || 0;
        
        if (duration > 300000) { // 5 minutes
            console.log('✅ Extended play session completed - good stability');
        } else {
            console.log('🔍 Consider running longer test sessions for better analysis');
        }
        
        if (totalMeasurements > 10) {
            console.log('✅ Good measurement frequency for analysis');
        }
        
        console.log('📱 For mobile testing: Check performance on low-end devices');
        console.log('🔄 For production: Consider implementing performance.memory monitoring');
    }
    
    displayMonitoringStatus() {
        console.log('📊 Memory monitoring active');
        console.log('   • Measurements every 5 seconds');
        console.log('   • Game event tracking enabled');
        console.log('   • Use stopMonitoring() to generate final report');
        
        // Make stop function globally accessible for manual testing
        window.stopMemoryMonitoring = () => this.stopMonitoring();
    }
}

// Auto-start memory monitoring if parameter is present
if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('memory') === 'true') {
        document.addEventListener('DOMContentLoaded', () => {
            const monitor = new MemoryMonitor();
            monitor.startMonitoring();
            
            // Make monitor globally accessible
            window.memoryMonitor = monitor;
            
            // Auto-stop after 5 minutes for testing
            setTimeout(() => {
                monitor.stopMonitoring();
            }, 300000);
        });
    }
}