// Production Build System for Sweet Barista Game
// Handles JavaScript minification, HTML optimization, and debug removal
// Run with: node deploy/production-minifier.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);
const distDir = path.join(__dirname, 'dist');

console.log('🏗️ Starting Production Build...');
console.log(`📂 Project root: ${projectRoot}`);
console.log(`📦 Distribution directory: ${distDir}`);

class ProductionMinifier {
    constructor() {
        this.stats = {
            originalSize: 0,
            minifiedSize: 0,
            filesProcessed: 0,
            errors: 0
        };
    }
    
    async build() {
        try {
            // Create dist directory
            await this.ensureDistDirectory();
            
            // Process all files
            await this.processFiles();
            
            // Generate build report
            this.generateBuildReport();
            
            console.log('✅ Production build completed successfully!');
            return true;
            
        } catch (error) {
            console.error('❌ Production build failed:', error);
            return false;
        }
    }
    
    async ensureDistDirectory() {
        if (fs.existsSync(distDir)) {
            // Clean existing dist directory
            fs.rmSync(distDir, { recursive: true, force: true });
        }
        fs.mkdirSync(distDir, { recursive: true });
        console.log('📁 Created clean distribution directory');
    }
    
    async processFiles() {
        // Define files to process
        const filesToProcess = [
            { src: 'index.html', dest: 'index.html', type: 'html' },
            { src: 'styles.css', dest: 'styles.css', type: 'css' },
            { src: 'src', dest: 'src', type: 'directory' }
        ];
        
        for (const file of filesToProcess) {
            await this.processFile(file);
        }
        
        // Copy asset directories (preserve structure for placeholders)
        await this.copyDirectory('images', 'images');
        await this.copyDirectory('audio', 'audio');
    }
    
    async processFile(file) {
        const srcPath = path.join(projectRoot, file.src);
        const destPath = path.join(distDir, file.dest);
        
        try {
            if (file.type === 'directory') {
                await this.processDirectory(srcPath, destPath);
            } else if (fs.existsSync(srcPath)) {
                const originalContent = fs.readFileSync(srcPath, 'utf8');
                this.stats.originalSize += originalContent.length;
                
                let processedContent;
                
                switch (file.type) {
                    case 'html':
                        processedContent = this.minifyHTML(originalContent);
                        break;
                    case 'css':
                        processedContent = this.minifyCSS(originalContent);
                        break;
                    case 'js':
                        processedContent = this.minifyJavaScript(originalContent);
                        break;
                    default:
                        processedContent = originalContent;
                }
                
                // Ensure destination directory exists
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                }
                
                fs.writeFileSync(destPath, processedContent);
                this.stats.minifiedSize += processedContent.length;
                this.stats.filesProcessed++;
                
                console.log(`✅ Processed: ${file.src}`);
            }
        } catch (error) {
            console.error(`❌ Error processing ${file.src}:`, error.message);
            this.stats.errors++;
        }
    }
    
    async processDirectory(srcDir, destDir) {
        if (!fs.existsSync(srcDir)) return;
        
        const items = fs.readdirSync(srcDir);
        
        for (const item of items) {
            const srcPath = path.join(srcDir, item);
            const destPath = path.join(destDir, item);
            const stat = fs.statSync(srcPath);
            
            if (stat.isDirectory()) {
                fs.mkdirSync(destPath, { recursive: true });
                await this.processDirectory(srcPath, destPath);
            } else if (item.endsWith('.js')) {
                await this.processFile({
                    src: path.relative(projectRoot, srcPath),
                    dest: path.relative(distDir, destPath),
                    type: 'js'
                });
            } else {
                // Copy non-JS files as-is
                fs.copyFileSync(srcPath, destPath);
                this.stats.filesProcessed++;
            }
        }
    }
    
    async copyDirectory(srcName, destName) {
        const srcPath = path.join(projectRoot, srcName);
        const destPath = path.join(distDir, destName);
        
        if (fs.existsSync(srcPath)) {
            fs.mkdirSync(destPath, { recursive: true });
            const items = fs.readdirSync(srcPath);
            
            for (const item of items) {
                const itemSrc = path.join(srcPath, item);
                const itemDest = path.join(destPath, item);
                
                if (fs.statSync(itemSrc).isDirectory()) {
                    await this.copyDirectory(path.join(srcName, item), path.join(destName, item));
                } else {
                    fs.copyFileSync(itemSrc, itemDest);
                }
            }
            
            console.log(`📁 Copied directory: ${srcName}`);
        }
    }
    
    minifyHTML(html) {
        return html
            // Remove comments (preserve IE conditionals)
            .replace(/<!--(?!\[if|<!\[endif)[\s\S]*?-->/g, '')
            // Remove extra whitespace between tags
            .replace(/>\s+</g, '><')
            // Remove leading/trailing whitespace on lines
            .replace(/^\s+|\s+$/gm, '')
            // Compress multiple spaces into single space
            .replace(/\s{2,}/g, ' ')
            // Update cache busting with production timestamp
            .replace(/main\.js\?v=\d+/, `main.js?v=${Date.now()}`)
            // Add production meta tags
            .replace('</head>', `
    <!-- Production Build -->
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#87CEEB">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="mobile-web-app-capable" content="yes">
</head>`);
    }
    
    minifyCSS(css) {
        return css
            // Remove comments
            .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '')
            // Remove extra whitespace
            .replace(/\s{2,}/g, ' ')
            // Remove whitespace around selectors and properties
            .replace(/\s*{\s*/g, '{')
            .replace(/;\s*}/g, '}')
            .replace(/;\s*/g, ';')
            .replace(/:\s*/g, ':')
            // Remove leading/trailing whitespace
            .trim();
    }
    
    minifyJavaScript(js) {
        let minified = js;
        
        // Remove debug code
        minified = this.removeDebugCode(minified);
        
        // Remove test code
        minified = this.removeTestCode(minified);
        
        // Basic minification (without breaking functionality)
        minified = minified
            // Remove single-line comments (but preserve URLs and regex)
            .replace(/\/\/(?![^']*'[^']*$|[^"]*"[^"]*$).*$/gm, '')
            // Remove multi-line comments (preserve license headers)
            .replace(/\/\*(?![\s\S]*?@license)[\s\S]*?\*\//g, '')
            // Remove extra whitespace
            .replace(/^\s+|\s+$/gm, '')
            // Compress multiple spaces
            .replace(/\s{2,}/g, ' ')
            // Remove trailing semicolons in blocks
            .replace(/;\s*}/g, '}');
        
        return minified;
    }
    
    removeDebugCode(js) {
        return js
            // Remove console.log statements (keep console.error and console.warn)
            .replace(/console\.log\([^)]*\);?\s*/g, '')
            // Remove debug mode checks
            .replace(/if\s*\(\s*.*debug.*\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*}/g, '')
            // Remove compatibility, memory, and offline test modes
            .replace(/if\s*\(\s*compatibilityMode\s*\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*}/g, '')
            .replace(/if\s*\(\s*memoryMode\s*\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*}/g, '')
            .replace(/if\s*\(\s*offlineMode\s*\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*}/g, '')
            // Remove debug-related variable declarations
            .replace(/const\s+(compatibilityMode|memoryMode|offlineMode)\s*=.*?;/g, '');
    }
    
    removeTestCode(js) {
        return js
            // Remove test mode functionality
            .replace(/if\s*\(\s*testMode\s*\)\s*{[^{}]*(?:{[^{}]*}[^{}]*)*}/g, '')
            // Remove test functions
            .replace(/async function runBasicTests\(\)[\s\S]*?^}/m, '')
            .replace(/function validate\w+\(\)[\s\S]*?^}/mg, '')
            // Remove test-related imports and variables
            .replace(/const testMode\s*=.*?;/g, '');
    }
    
    generateBuildReport() {
        const compressionRatio = ((this.stats.originalSize - this.stats.minifiedSize) / this.stats.originalSize * 100).toFixed(1);
        const originalMB = (this.stats.originalSize / (1024 * 1024)).toFixed(2);
        const minifiedMB = (this.stats.minifiedSize / (1024 * 1024)).toFixed(2);
        
        console.log('\n📊 Production Build Report');
        console.log('==========================');
        console.log(`📁 Files processed: ${this.stats.filesProcessed}`);
        console.log(`❌ Errors: ${this.stats.errors}`);
        console.log(`📦 Original size: ${originalMB}MB`);
        console.log(`🗜️  Minified size: ${minifiedMB}MB`);
        console.log(`📉 Compression: ${compressionRatio}% reduction`);
        
        // Create build info file
        const buildInfo = {
            buildTime: new Date().toISOString(),
            version: `v${Date.now()}`,
            stats: this.stats,
            compressionRatio: `${compressionRatio}%`,
            files: {
                total: this.stats.filesProcessed,
                errors: this.stats.errors
            }
        };
        
        fs.writeFileSync(
            path.join(distDir, 'build-info.json'),
            JSON.stringify(buildInfo, null, 2)
        );
        
        console.log('💾 Build info saved to build-info.json');
        
        if (this.stats.errors === 0) {
            console.log('\n🎉 Production build completed without errors!');
            console.log(`📂 Production files available in: ${distDir}`);
            console.log('🚀 Ready for deployment!');
        } else {
            console.log(`\n⚠️  Production build completed with ${this.stats.errors} error(s)`);
            console.log('🔍 Review errors above before deployment');
        }
    }
}

// Run the build process
const minifier = new ProductionMinifier();
minifier.build().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ Build process crashed:', error);
    process.exit(1);
});