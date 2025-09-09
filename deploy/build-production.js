// Production Build Script for Sweet Barista Game
// Run with: node deploy/build-production.js

import fs from 'fs';
import path from 'path';

const projectRoot = path.dirname(path.dirname(import.meta.url.replace('file:///', '')));
const deployDir = path.join(projectRoot, 'deploy', 'dist');

console.log('🚀 Building production version of Sweet Barista Game...');

// Create deploy directory
if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
}

// Production optimizations
const productionOptimizations = {
    removeDebugCode: true,
    removeTestCode: true,
    minifyComments: true,
    optimizeAssetPaths: true
};

// Files to copy to production
const filesToCopy = [
    'index.html',
    'styles.css',
    'src/',
    'images/',
    'audio/'
];

console.log('📁 Copying files to production directory...');

// Copy function
function copyFile(source, destination) {
    const sourceStats = fs.statSync(source);
    
    if (sourceStats.isDirectory()) {
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }
        
        const files = fs.readdirSync(source);
        files.forEach(file => {
            copyFile(path.join(source, file), path.join(destination, file));
        });
    } else {
        // Check if it's a JavaScript file that needs optimization
        if (path.extname(source) === '.js') {
            optimizeJavaScript(source, destination);
        } else if (path.extname(source) === '.html') {
            optimizeHTML(source, destination);
        } else {
            fs.copyFileSync(source, destination);
        }
    }
}

// Optimize JavaScript files
function optimizeJavaScript(source, destination) {
    let content = fs.readFileSync(source, 'utf8');
    
    if (productionOptimizations.removeDebugCode) {
        // Remove console.log statements (keep console.error and console.warn)
        content = content.replace(/console\.log\([^)]*\);?\n?/g, '');
        
        // Remove debug mode checks
        content = content.replace(/if\s*\(\s*.*debug.*\)\s*{[^}]*}/g, '');
    }
    
    if (productionOptimizations.removeTestCode) {
        // Remove test mode functionality
        content = content.replace(/\/\/ Test mode[\s\S]*?(?=\/\/|\n\n|$)/g, '');
        content = content.replace(/testMode.*[\s\S]*?(?=\n\s*[^/])/g, '');
    }
    
    if (productionOptimizations.minifyComments) {
        // Remove multi-line comments but keep license headers
        content = content.replace(/\/\*(?![\s\S]*?@license)[\s\S]*?\*\//g, '');
        // Remove single-line comments
        content = content.replace(/\/\/.*$/gm, '');
    }
    
    fs.writeFileSync(destination, content);
}

// Optimize HTML file
function optimizeHTML(source, destination) {
    let content = fs.readFileSync(source, 'utf8');
    
    // Update cache busting version for production
    const timestamp = Date.now();
    content = content.replace(/main\.js\?v=\d+/, `main.js?v=${timestamp}`);
    
    // Add production meta tags
    const productionMeta = `
    <!-- Production Build -->
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#87CEEB">
    <link rel="canonical" href="https://[YOUR-DOMAIN]/sugar-cube-game/">`;
    
    content = content.replace('</head>', `${productionMeta}\n</head>`);
    
    fs.writeFileSync(destination, content);
}

// Start build process
try {
    filesToCopy.forEach(file => {
        const source = path.join(projectRoot, file);
        const destination = path.join(deployDir, file);
        
        if (fs.existsSync(source)) {
            console.log(`📄 Processing: ${file}`);
            copyFile(source, destination);
        }
    });
    
    // Create additional production files
    console.log('📝 Creating production files...');
    
    // .gitignore for the deployed version
    fs.writeFileSync(path.join(deployDir, '.gitignore'), `
# Development files
test-config.js
deploy/
*.log
.DS_Store
Thumbs.db
`);
    
    // Simple README for the deployed version
    fs.writeFileSync(path.join(deployDir, 'README.md'), `
# Sweet Barista - Coffee Shop Game

A browser-based casual game where you drop sugar cubes into coffee cups.

## Play Online
Visit the live game at: [Your GitHub Pages URL]

## Features
- 15 progressively challenging levels
- Mobile and desktop support
- Professional placeholder graphics
- 60 FPS smooth gameplay

## Controls
- **Desktop**: Press SPACE to drop sugar
- **Mobile**: Tap "DROP SUGAR" button
- **Audio**: Toggle with on-screen buttons

Built with vanilla JavaScript, HTML5 Canvas, and CSS3.
`);
    
    console.log('✅ Production build complete!');
    console.log(`📦 Build location: ${deployDir}`);
    console.log('🚀 Ready for deployment to GitHub Pages');
    
} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
}