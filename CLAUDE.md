# CLAUDE.md - Coffee Shop Sugar Drop Game

**📋 Archive Notice:** Complete development history and detailed specifications have been moved to `CLAUDE_ARCHIVE.md` (January 22-28, 2025 & August 6, 2025 development sessions). This file contains current working context and recent changes only.

## Project Overview

Browser-based casual game where players control a barista's hand dropping sugar cubes into coffee cups moving on a conveyor belt. Features 15 progressively challenging levels with increasing conveyor speeds and complexity.

### Core Concept
- **Genre**: Casual arcade game
- **Platform**: Web browser (desktop and mobile)
- **Target**: Quick 5-10 minute gameplay sessions
- **Monetization**: Google AdSense banner ads

### Session Management
- **Always read PLANNING.md** at the start of every new conversation
- **Check TASKS.md** before starting any work
- **Mark completed tasks** in TASKS.md immediately upon completion
- **Add newly discovered tasks** to TASKS.md when found during development

## SESSION START CHECKLIST
When this file is read, immediately:
1. Confirm you will use agents for ALL tasks in this session
2. List which agent handles which task type based on the workflow below
3. State: "Agent workflow active for this session"

## PRIORITY 1: MANDATORY PROCEDURES - ACTIVE SESSION PROTOCOL

⚠️ **YOU MUST FOLLOW THIS WORKFLOW FOR EVERY TASK IN THIS SESSION:**

### Agent Workflow Guidelines
For any change or addition to the game, always start by consulting **web-game-tech-architect agent** to assess technical feasibility and architectural impact, then engage the relevant specialist based on the nature of the change:
- Use **web-game-tech-architect** agent for core game mechanics, physics, canvas rendering, animations, input handling, performance optimization, bug fixing, or code architecture
- Use **game-polish-specialist** agent for visual effects, animations, audio integration, UI/UX improvements, mobile responsiveness, performance tuning, or final testing and deployment

**Golden rule:** No code reaches production without passing through both **web-game-tech-architect agent** for code quality and comprehensive validation.

**VIOLATION CHECK:** If you're about to write code without consulting agents, STOP.

### Visual Validation Protocol
⚠️ **MANDATORY FOR ALL FRONT-END CHANGES:**

After implementing ANY front-end change (CSS, HTML, UI components), you MUST:

1. **Identify Changes Made**:
   - Document exactly what visual elements were modified
   - List affected files (styles.css, HTML structure, JS rendering)
   - Note expected visual impact

2. **Visual Validation Using Playwright MCP**:
   ```
   - Navigate to http://127.0.0.1:8002 using mcp__playwright__browser_navigate
   - Take screenshot using mcp__playwright__browser_take_screenshot
   - Navigate through affected game states/screens
   - Capture additional screenshots of changed areas
   ```

3. **Design Compliance Review**:
   - Compare screenshots against `context/design_principles.md` standards
   - Verify color palette compliance (coffee shop theme)
   - Check typography hierarchy and readability
   - Validate touch target sizes (48px minimum mobile)
   - Confirm accessibility contrast ratios
   - Review responsive design across breakpoints

4. **Feature Validation**:
   - Test functionality of changed UI elements
   - Verify user interaction patterns work correctly
   - Check mobile touch responsiveness
   - Validate cross-platform compatibility

5. **Report Findings**:
   - Document any design principle violations found
   - Note successful implementations
   - Recommend fixes for any issues discovered

**CRITICAL RULE:** No front-end changes are considered complete without visual validation.

## PRIORITY 2: RESPONSE STYLE

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Game Engine**: Canvas API
- **Hosting**: GitHub Pages
- **No Backend**: All game logic client-side
- **No External Libraries**: Pure vanilla JavaScript

## Design Standards Reference

**All front-end development must comply with:**
- **Design Principles**: `context/design_principles.md` - Industry-standard visual guidelines
- **Color Palette**: Coffee shop theme with semantic color system
- **Accessibility**: WCAG 2.1 AA compliance (4.5:1 contrast minimum)
- **Mobile Standards**: 48px touch targets, responsive breakpoints at 768px/1024px
- **Performance**: 60fps target, <3s loading time
- **Typography**: Segoe UI font stack with defined hierarchy

**Quick Reference:**
```css
/* Core Colors */
--coffee-brown: #6F4E37;  --success-green: #4CAF50;
--cream-white: #FFF8E7;   --warning-yellow: #FFC107;
--sugar-white: #FFFFFF;   --danger-red: #F44336;
--conveyor-gray: #5A5A5A; --bg-blue: #87CEEB;
```

## Current Game State (August 9, 2025)

### 🔧 **Development Status: 85% Complete**

**Fully Functional Systems:**
- ✅ **Complete 15-level progression** with perfect difficulty scaling (Tutorial → Master)
- ✅ **Mobile-optimized experience** with resolved cup overlapping and touch controls
- ✅ **Professional audio system** - 9 audio files with balanced mixing and state management
- ✅ **Hybrid graphics system** - 4 image assets integrated with geometric fallbacks
- ✅ **Cross-platform compatibility** (desktop keyboard/mouse, mobile touch with haptic)
- ✅ **60 FPS performance** with comprehensive optimization and monitoring
- ✅ **Anti-spam strategic mechanics** preventing button mashing exploitation
- ✅ **Production build system** with automated optimization (40.4% compression)
- ✅ **Comprehensive testing suite** - Browser compatibility, memory monitoring, offline testing

### 🎮 **Current Game Flow**
1. **Menu**: Press SPACE/click to start Level 1
2. **Level Gameplay**: Timer countdown, drop sugar cubes into moving cups, fill exact requirements
3. **Level Complete**: Shows score, press SPACE/click for next level
4. **Level Failed**: Shows progress, press SPACE/click to retry
5. **Game Complete**: Victory screen after completing Level 15

### 🔧 **Technical Architecture**

**File Structure:**
```
C:\Users\dotan\sugar_cube_game\
├── index.html (v=32)
├── styles.css
├── src/
│   ├── main.js (entry point)
│   ├── config.js (game settings)
│   ├── game/ (Game.js, Hand.js, Cup.js, Sugar.js, Level.js)
│   └── utils/ (AssetLoader.js, AudioManager.js, InputHandler.js, etc.)
├── audio/ (9 MP3 files - fully integrated)
├── images/ (4 PNG assets integrated: hand_idle, hand_dropping, sugar_cube, sugar_splash)
└── deploy/ (production build system)
```

**Testing URLs:**
- **Main Game**: `http://127.0.0.1:8002`
- **Debug Mode**: `http://127.0.0.1:8002/?debug=true`
- **Test Suite**: `http://127.0.0.1:8002/?test=true`
- **Browser Compatibility**: `http://127.0.0.1:8002/?compatibility=true`
- **Memory Monitor**: `http://127.0.0.1:8002/?memory=true`

## Recent Changes & Current Issues

### 🎯 **Current Session (August 11, 2025 - Session 15)**

**Major Visual & Gameplay Fixes Completed:**
- ✅ **Logo size optimization** - Increased logo size by 30% and repositioned for better visibility
- ✅ **Start button simplification** - Changed button text from verbose instructions to simple "Start"
- ✅ **Conveyor belt direction FIXED** - After 5 attempts, successfully implemented left-to-right movement matching cups
- ✅ **Customer name tags implementation** - Used order_note_blank.png asset for professional order notes above cups
- ✅ **Preview zone removal** - Eliminated transparent rectangle overlay for cleaner visual presentation
- ✅ **Cup state persistence SOLVED** - Fixed critical bug where cups lost customer names and progress during wrap-around

**Critical Conveyor Belt Fix:**
- **Problem**: Belt moved right-to-left while cups moved left-to-right, or belt object physically translated causing gaps
- **Solution**: Reversed offset direction (`conveyorOffset -= speed`) with positive positioning (`startX = (offset % width)`) 
- **Result**: Belt texture animates left-to-right while staying in fixed position

**Cup Consistency System:**
- **Problem**: David, Mia, Alex would change names/requirements after wrap-around cycles
- **Root Cause**: `resetCup()` method was generating new orders after timer expiration
- **Solution**: Completely disabled cup resets during level gameplay - cups are now persistent for entire level
- **Result**: Fixed customer names and sugar requirements throughout all rotations

**Current Game Status:**
- Game is 90% complete with core mechanics fully functional
- All visual polish and gameplay consistency issues resolved
- Conveyor belt moves correctly left-to-right with proper texture animation
- Customer names and cup states persist correctly through wrap-around cycles
- Professional order note system integrated using assets

### 🎯 **Previous Session (August 9, 2025 - Session 14)**

**Critical Bug Fixes & Asset Integration Completed:**
- ✅ **Fixed game startup crashes** - Resolved missing method errors (isMusicReadyToStart, renderMenuButton, debugStateTransition)
- ✅ **Logo integration completed** - Successfully replaced "Sweet Barista" title with logo.png from images folder
- ✅ **Fixed logo positioning** - Corrected overlapping text by adjusting logo position from centerY-120 to centerY-160
- ✅ **Version synchronization** - Fixed game functionality by updating all imports to consistent v=37
- ✅ **Cup rendering system restored** - Added missing color utility methods (darkenColor, lightenColor) to Cup.js
- ✅ **Cup image asset integration** - Fixed Cup.js to use actual cup images instead of geometric fallback
- ✅ **Complete functionality restoration** - Game now fully playable with proper cup rendering and logo display

### 🎯 **Previous Session (August 9, 2025 - Session 13)**

**Major Code Cleanup & Optimization Completed:**
- ✅ **Comprehensive code cleanup** - Reduced codebase by 200+ lines while maintaining all functionality
- ✅ **Debug logging optimization** - Optimized 75+ console.log statements with proper debug gating
- ✅ **File structure compliance** - Achieved 100% compliance with CLAUDE.md specifications
- ✅ **Production optimization** - All debug code properly gated behind ?debug=true parameter
- ✅ **Performance improvements** - Maintained 60 FPS target with cleaner, more efficient architecture
- ✅ **Test file cleanup** - Removed 15+ test/debug files from root directory for clean deployment

### 🎯 **Previous Session (August 6, 2025 - Session 12)**

**Major Asset Integration & Visual Polish Completed:**
- ✅ **Complete asset integration** - Successfully integrated 5 new image assets (3 cup sizes + conveyor belt + order note)
- ✅ **Fixed loading screen issue** - Resolved JavaScript runtime errors preventing game from starting
- ✅ **Conveyor belt animation fix** - Eliminated visual gaps with seamless image-based tiling mathematics
- ✅ **Progress indicators enhancement** - Removed redundant yellow circles, made progress dots 6-7x larger (24-28px)
- ✅ **Cup background removal** - Automatic programmatic removal of beige backgrounds for transparent cups
- ✅ **Mandatory agent workflow** - Updated CLAUDE.md with enforced agent usage for all technical tasks

### 🎯 **Previous Session (August 3, 2025 - Session 11)**

**Major UI/UX Improvements Completed:**
- ✅ **Complete UI redesign** - Implemented clean header system with separated controls
- ✅ **Menu simplification** - Removed audio buttons from menu, added prominent "tap to start" button
- ✅ **Audio pause fix** - Music now properly pauses/resumes with game state
- ✅ **Cup overlapping permanently solved** - Redesigned visual elements to be contained within cup boundaries
- ✅ **Enhanced visibility** - Increased hand size (80→110px) and sugar cube size (12→18px)
- ✅ **Improved responsiveness** - Faster falling speed (gravity 100→180) for better gameplay
- ✅ **Header layout optimization** - Audio controls (left), pause button (right), proper responsive design

### 🎯 **Previous Session (August 1, 2025 - Session 10)**

**Major Completions:**
- ✅ **Complete cup mechanics rewrite** - Eliminated complex mathematical positioning system
- ✅ **Fixed cup movement direction** - Now properly moves LEFT→RIGHT as intended
- ✅ **Resolved cup overlapping issues** - Simple linear spacing prevents collisions on all devices
- ✅ **Fixed cup spawning problems** - All cups now start off-screen left with staggered positioning
- ✅ **Cup memory persistence fixed** - Cups maintain sugar progress through wrap-around cycles
- ✅ **Level progression working** - Uses exact CONFIG.js values (3-17 cups per level)

**Previous Session (January 28, 2025 - Session 9):**
- ✅ **Complete image asset integration system** - All 4 provided assets fully integrated
- ✅ **Critical pause button bug fixed** - Touch event conflict resolved with spatial bounds checking
- ✅ **Debug system implemented** - Comprehensive logging for asset troubleshooting
- ✅ **Hybrid rendering perfected** - Images when available, geometric fallbacks guaranteed

**Current Asset Status:**
- ✅ **All 9 image assets integrated**: hand_idle, hand_dropping, sugar_cube, sugar_splash, cup_small, cup_medium, cup_large, conveyor_belt, order_note_blank
- ✅ **Automatic background removal**: Transparent cup images processed programmatically
- ✅ **Seamless conveyor animation**: Image-based tiling with proper wrapping mathematics

### 🚀 **Next Session Priority**

**Remaining Development Tasks:**
1. **Customer name system** - Implement order note system with randomized customer names using order_note_blank.png
2. **Production deployment** - Final testing, build optimization, GitHub Pages setup
3. **AdSense integration** - Add monetization containers for ad placement

**Current Status:**
- **Server running**: `http://127.0.0.1:8002` 
- **Debug mode**: `http://127.0.0.1:8002/?debug=true`
- **All major technical issues and code cleanup completed**
- **Codebase optimized and production-ready**
- **Game fully playable with professional polish**

**🎮 Game Flow:**
All 15 levels should now be fully playable with proper difficulty scaling and cup mechanics.

## Key Game Mechanics

### Level Progression Table
| Level | Time | Speed | Cups | Total Sugar | Difficulty |
|-------|------|-------|------|-------------|------------|
| 1     | 60s  | 1.0x  | 3    | 5-6         | Tutorial   |
| 5     | 60s  | 1.4x  | 7    | 13-14       | Medium     |
| 10    | 45s  | 1.9x  | 12   | 24-26       | Very Hard  |
| 15    | 35s  | 2.5x  | 17   | 39-42       | Master     |

### Core Gameplay
- **Fixed-position hand** at top center for timing-based gameplay
- **Circular conveyor system** with continuous cup cycling
- **Strategic cup filling** - Must fill ALL cups to exact requirements (1-3 sugar each)
- **Anti-spam mechanics** - Overfilling completed cups resets them to 0 sugar
- **Cup memory system** - Cups remember progress when wrapping around conveyor

### Mobile Optimizations
- **Mathematical positioning** - Fixed positions prevent cup overlapping: `[-200, -380, -560]`
- **Touch controls** - Drop button with haptic feedback, audio toggle buttons
- **Responsive UI** - Compact layout, proper touch targets (48px), zoom prevention
- **Platform detection** - Shows "Tap" vs "Press SPACE" instructions appropriately

## Color Palette & Visual Design

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

**Design Philosophy:**
- Flat design aesthetic with geometric shapes
- Bold outlines (2-4px), no gradients or shadows
- Clean, minimalist interface
- Hybrid rendering: Images when available, geometric fallbacks

## Audio System

**Integrated Audio Files:**
```
/audio/
├── game_bgm.mp3 (background music - 40% volume)
├── level_complete.mp3 (success sound)
├── level_fail.mp3 (failure sound)
├── success_hit.mp3 (cube lands in cup)
├── sugar_drop.mp3 (cube release)
├── sugar_splash.mp3 (cube hits conveyor)
├── time_warning.mp3 (last 5 seconds)
└── overfill.mp3 (anti-spam punishment)
```

**Audio Features:**
- **State-based music management** - Stops on level fail, restarts on retry
- **Local storage preferences** - Settings persist between sessions
- **Volume controls** - Toggle buttons (🔊🎵) and keyboard shortcuts (S/M keys)
- **Cross-platform** - Works on desktop and mobile

## Responses

1. **Objective Feedback**: Always provide feedback that is based on verifiable facts and data. Avoid subjective opinions unless explicitly requested.

2. **Certainty in Agreement**: Only confirm that I am correct if you are 100% certain of the accuracy of the information. If you have any doubts, clearly express those doubts instead of agreeing to avoid misleading me.

3. **Clarification Requests**: If a statement is ambiguous or unclear, ask for clarification before providing feedback. This ensures that your response is based on accurate understanding.

4. **Examples for Clarity**: When providing feedback, include examples to illustrate your points. This helps in understanding the context and reasoning behind your feedback.

5. **Edge Cases**: If you encounter a situation where the information is incomplete or contradictory, outline the potential implications and suggest alternative perspectives or solutions. This will help in navigating complex scenarios effectively.

## Development Guidelines

### Best Practices Applied
- ES6 classes for game objects with proper separation of concerns
- RequestAnimationFrame game loop targeting 60 FPS
- Background asset loading with graceful degradation
- Comprehensive error handling and fallback systems
- Mobile-first responsive design approach

### Testing Infrastructure
- **Basic validation** - Config and level progression verification
- **Browser compatibility** - Feature detection across target browsers
- **Memory monitoring** - Real-time leak detection and performance tracking
- **Offline functionality** - Internet-free capability validation
- **Production builds** - Automated minification and optimization

## Deployment Readiness

### Production Build System
- **JavaScript minification** - 40.4% compression ratio
- **Debug code removal** - All console.log and test modes stripped
- **Asset optimization** - Optimized for GitHub Pages deployment
- **SEO enhancement** - Meta tags and marketing materials ready

### Next Phase Requirements
1. **Complete game stabilization** - Fix remaining rendering and functionality issues
2. **Customer name system implementation** - Final feature using order_note_blank.png asset  
3. **Comprehensive testing** - Full game functionality validation
4. **GitHub repository creation** - Upload optimized codebase for GitHub Pages
5. **Domain setup and hosting** - Configure custom domain and verify deployment
6. **AdSense integration** - Add monetization containers

## Important Notes

- **No user accounts** - Game resets on page refresh (by design)
- **No backend** - Everything runs client-side for simplicity
- **Mobile-first** - Touch controls are primary, keyboard secondary
- **Performance optimized** - Target 60 FPS on low-end devices
- **Graceful degradation** - Works even if assets fail to load

---

**Current Status:** Game 90% complete with core mechanics fully functional. All major visual polish and gameplay consistency issues resolved. Conveyor belt direction and cup state persistence completely fixed.

**Next Session Priority:** Final production preparation - comprehensive testing, build optimization, GitHub Pages deployment, and AdSense integration.

*Last Updated: August 11, 2025*