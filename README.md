# Sweet Barista - Coffee Shop Game

[![GitHub Pages](https://img.shields.io/badge/Play%20Live-GitHub%20Pages-blue)](https://dotan232.github.io/SweetBarista/)
[![Development Status](https://img.shields.io/badge/Status-91%25%20Complete-brightgreen)]()
[![License](https://img.shields.io/badge/License-Open%20Source-green)]()

A browser-based casual arcade game where you play as a barista dropping sugar cubes into coffee cups moving on a conveyor belt. Complete 15 progressively challenging levels with increasing speeds and complexity.

## 🌟 **[➤ PLAY NOW - Live Demo](https://dotan232.github.io/SweetBarista/)**

## 🎮 Game Overview

- **Genre**: Casual arcade game
- **Platform**: Web browser (desktop & mobile)
- **Target**: Quick 5-10 minute gameplay sessions
- **Technology**: Pure HTML5, CSS3, JavaScript (no external libraries)

## 🚀 Quick Start

### Option 1: Local Development
1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Start playing immediately - no build process required!

### Option 2: Local Server (Recommended for development)
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 🎯 How to Play

### Controls
- **Desktop**: Press `SPACEBAR` to drop sugar cubes
- **Mobile**: Tap the "DROP SUGAR" button or anywhere on screen

### Objective
1. Watch coffee cups move from right to left on the conveyor belt
2. Each cup shows how many sugar cubes it needs (1-3) on a sticky note
3. Time your drops to land sugar cubes into the correct cups
4. Complete all cup orders before time runs out
5. Progress through 15 increasingly difficult levels

### Level Progression
- **Levels 1-3**: Tutorial/Easy (60s, slow speed)
- **Levels 4-6**: Medium difficulty (55-60s, moderate speed)
- **Levels 7-9**: Hard (50-55s, fast speed)
- **Levels 10-11**: Very Hard (45s, very fast speed)
- **Levels 12-14**: Expert (35-40s, extremely fast)
- **Level 15**: Master level (35s, maximum speed)

## 🛠️ Development

### Project Structure
```
sweet-barista/
├── index.html          # Main HTML file
├── styles.css          # Responsive CSS with mobile support
├── src/
│   ├── main.js         # Entry point
│   ├── config.js       # Game constants and level definitions
│   ├── game/           # Core game classes
│   │   ├── Game.js     # Main game loop and state management
│   │   ├── Level.js    # Level progression system
│   │   ├── Hand.js     # Player hand controller
│   │   ├── Cup.js      # Coffee cup objects
│   │   ├── Sugar.js    # Sugar cube physics
│   │   └── Conveyor.js # Conveyor belt system
│   ├── ui/             # User interface components
│   │   ├── Timer.js    # Countdown timer
│   │   ├── Score.js    # Scoring system
│   │   └── Menu.js     # Menus and navigation
│   └── utils/          # Utility classes
│       ├── AssetLoader.js      # Asset loading system
│       ├── AudioManager.js     # Sound management
│       ├── CollisionDetection.js # Physics collision
│       └── InputHandler.js     # Input handling
├── images/             # Game sprites (PNG format)
└── audio/              # Sound effects (MP3 format)
```

### Technical Requirements
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile (Android 8+)
- **Performance**: Target 60 FPS, <5MB total assets
- **No Build Process**: Pure vanilla JavaScript, no bundling required

### Asset Requirements
The game expects these assets (will use placeholders if missing):

**Images** (`images/` folder):
- `hand_idle.png`, `hand_dropping.png` (256x256)
- `sugar_cube.png` (64x64), `sugar_splash.png` (96x96)
- `cup_large.png` (128x128), `cup_medium.png` (96x96), `cup_small.png` (80x80)
- `order_note.png` (80x80), `sugar_check.png` (32x32)
- `conveyor_belt.png` (256x128), `coffee_shop_bg.png` (1920x1080)

**Audio** (`audio/` folder):
- `sugar_drop.mp3`, `success_hit.mp3`, `miss.mp3`
- `sugar_splash.mp3`, `level_complete.mp3`, `level_fail.mp3`
- `time_warning.mp3`, `game_bgm.mp3`

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--coffee-brown: #6F4E37;
--cream-white: #FFF8E7;
--sugar-white: #FFFFFF;
--conveyor-gray: #5A5A5A;

/* Accent Colors */
--success-green: #4CAF50;
--warning-yellow: #FFC107;
--danger-red: #F44336;
--bg-blue: #87CEEB;
```

### Visual Style
- Flat design aesthetic with bold 2-4px outlines
- Geometric shapes, no gradients or shadows
- Clean, minimalist interface
- Responsive design for all screen sizes

## 📱 Mobile Support

- Touch-optimized controls with 44px minimum tap targets
- Responsive canvas scaling maintaining aspect ratio
- Landscape and portrait mode support
- No zooming or scrolling during gameplay
- Device-specific optimizations

## 🚢 Deployment

### GitHub Pages (Current Deployment)
This game is currently deployed at: **https://dotan232.github.io/SweetBarista/**

To set up your own deployment:
1. Push code to GitHub repository
2. Go to repository Settings → Pages
3. Set source to "Deploy from a branch: master"
4. Game will be available at `https://yourusername.github.io/repository-name`

### Any Static Host
The game is a simple static website - upload all files to any web server:
- Netlify, Vercel, Surge.sh
- Traditional web hosting
- CDN services

## 🐛 Debugging

### Enable Debug Mode
Add `?debug=true` to URL for additional logging and debug info.

### Console Commands (Development)
```javascript
// Access game instance
window.game

// Performance monitoring
console.log(game.getFPS());

// Skip to specific level
game.setLevel(5);
```

### Common Issues
1. **Assets not loading**: Check browser console, ensure correct file paths
2. **Poor performance**: Try lowering quality settings, check for memory leaks
3. **Touch not working**: Ensure viewport meta tags are correct
4. **Audio issues**: Browser autoplay policies may require user interaction

## 📄 License

This project is open source. Feel free to modify and distribute.

## 🎵 Audio Credits

Audio files should be royalty-free or properly licensed for web use.

---

**Made with ❤️ using vanilla web technologies**

For support or questions, check the browser console for error messages and refer to the troubleshooting section above.