// Browser Compatibility Checker for Sweet Barista Game
// Add ?compatibility=true to URL to run compatibility tests

export class BrowserCompatibility {
    constructor() {
        this.results = [];
        this.browserInfo = this.getBrowserInfo();
    }
    
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let version = 'Unknown';
        
        if (ua.includes('Chrome') && !ua.includes('Edge')) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Firefox')) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            browser = 'Safari';
            version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Edge')) {
            browser = 'Edge';
            version = ua.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Trident')) {
            browser = 'Internet Explorer';
            version = ua.match(/rv:([0-9.]+)/)?.[1] || 'Unknown';
        }
        
        return { browser, version, userAgent: ua };
    }
    
    runAllTests() {
        console.log('🔍 Running Browser Compatibility Tests...');
        console.log(`📱 Browser: ${this.browserInfo.browser} ${this.browserInfo.version}`);
        console.log(`📱 User Agent: ${this.browserInfo.userAgent}`);
        
        // Core Web APIs
        this.testWebAPI('Canvas 2D Context', () => {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('2d');
        });
        
        this.testWebAPI('RequestAnimationFrame', () => {
            return typeof requestAnimationFrame === 'function';
        });
        
        this.testWebAPI('Local Storage', () => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        });
        
        this.testWebAPI('Audio API', () => {
            return typeof Audio === 'function';
        });
        
        // Touch/Mobile APIs
        this.testWebAPI('Touch Events', () => {
            return 'ontouchstart' in window;
        });
        
        this.testWebAPI('Navigator.vibrate', () => {
            return typeof navigator.vibrate === 'function';
        });
        
        this.testWebAPI('Navigator.maxTouchPoints', () => {
            return typeof navigator.maxTouchPoints === 'number';
        });
        
        // ES6 Features
        this.testWebAPI('ES6 Classes', () => {
            try {
                eval('class Test {}');
                return true;
            } catch (e) {
                return false;
            }
        });
        
        this.testWebAPI('ES6 Modules', () => {
            return typeof Symbol !== 'undefined';
        });
        
        this.testWebAPI('Arrow Functions', () => {
            try {
                eval('(() => {})');
                return true;
            } catch (e) {
                return false;
            }
        });
        
        // Performance APIs
        this.testWebAPI('Performance.now', () => {
            return typeof performance !== 'undefined' && typeof performance.now === 'function';
        });
        
        // Game-specific features
        this.testGameFeatures();
        
        // Display results
        this.displayResults();
        
        return this.results;
    }
    
    testWebAPI(name, testFunction) {
        try {
            const supported = testFunction();
            const result = {
                feature: name,
                supported,
                status: supported ? '✅ PASS' : '❌ FAIL'
            };
            this.results.push(result);
            console.log(`${result.status} ${name}`);
        } catch (error) {
            const result = {
                feature: name,
                supported: false,
                status: '❌ ERROR',
                error: error.message
            };
            this.results.push(result);
            console.log(`❌ ERROR ${name}: ${error.message}`);
        }
    }
    
    testGameFeatures() {
        console.log('\n🎮 Testing Game-Specific Features...');
        
        // Test canvas performance
        this.testWebAPI('Canvas Performance', () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1280;
            canvas.height = 720;
            const ctx = canvas.getContext('2d');
            
            // Simple performance test
            const start = performance.now();
            for (let i = 0; i < 1000; i++) {
                ctx.fillRect(Math.random() * 1280, Math.random() * 720, 10, 10);
            }
            const duration = performance.now() - start;
            
            console.log(`   Canvas render time for 1000 rects: ${duration.toFixed(2)}ms`);
            return duration < 100; // Should complete in under 100ms
        });
        
        // Test audio context
        this.testWebAPI('Web Audio Context', () => {
            return typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined';
        });
        
        // Test viewport meta tag support
        this.testWebAPI('Viewport Meta Support', () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            return !!viewport;
        });
    }
    
    displayResults() {
        console.log('\n📊 Compatibility Summary:');
        
        const passed = this.results.filter(r => r.supported).length;
        const total = this.results.length;
        const percentage = Math.round((passed / total) * 100);
        
        console.log(`✅ Passed: ${passed}/${total} (${percentage}%)`);
        
        const failed = this.results.filter(r => !r.supported);
        if (failed.length > 0) {
            console.log('\n❌ Failed Features:');
            failed.forEach(f => {
                console.log(`   - ${f.feature}${f.error ? ': ' + f.error : ''}`);
            });
        }
        
        // Browser-specific recommendations
        this.provideBrowserRecommendations();
    }
    
    provideBrowserRecommendations() {
        console.log('\n💡 Browser Compatibility Notes:');
        
        const { browser, version } = this.browserInfo;
        
        if (browser === 'Internet Explorer') {
            console.log('⚠️  Internet Explorer is not supported. Game requires modern browser features.');
        } else if (browser === 'Safari' && parseFloat(version) < 14) {
            console.log('⚠️  Safari versions below 14 may have limited support.');
        } else if (browser === 'Chrome' && parseFloat(version) < 90) {
            console.log('⚠️  Chrome versions below 90 may have performance issues.');
        } else if (browser === 'Firefox' && parseFloat(version) < 88) {
            console.log('⚠️  Firefox versions below 88 may have compatibility issues.');
        } else {
            console.log('✅ Browser appears to be fully compatible!');
        }
        
        // Mobile-specific recommendations
        if (navigator.userAgent.includes('Mobile')) {
            console.log('📱 Mobile browser detected - touch controls should work properly.');
        }
    }
    
    // Quick test for essential features only
    runQuickTest() {
        const essential = [
            'Canvas 2D Context',
            'RequestAnimationFrame', 
            'Local Storage',
            'Audio API'
        ];
        
        console.log('⚡ Running Quick Compatibility Test...');
        
        let allPassed = true;
        essential.forEach(feature => {
            const test = this.getTestForFeature(feature);
            if (test) {
                try {
                    const supported = test();
                    console.log(`${supported ? '✅' : '❌'} ${feature}`);
                    if (!supported) allPassed = false;
                } catch (error) {
                    console.log(`❌ ${feature}: ERROR`);
                    allPassed = false;
                }
            }
        });
        
        return allPassed;
    }
    
    getTestForFeature(feature) {
        const tests = {
            'Canvas 2D Context': () => !!document.createElement('canvas').getContext('2d'),
            'RequestAnimationFrame': () => typeof requestAnimationFrame === 'function',
            'Local Storage': () => {
                try {
                    localStorage.setItem('test', 'test');
                    localStorage.removeItem('test');
                    return true;
                } catch (e) {
                    return false;
                }
            },
            'Audio API': () => typeof Audio === 'function'
        };
        
        return tests[feature];
    }
}

// Auto-run if compatibility parameter is present
if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('compatibility') === 'true') {
        document.addEventListener('DOMContentLoaded', () => {
            const checker = new BrowserCompatibility();
            checker.runAllTests();
        });
    }
}