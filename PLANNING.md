# PLANNING.md - Coffee Shop Sugar Drop Game

## Project Vision

### Goal
Create an engaging, minimalist coffee shop simulation game that provides quick, satisfying gameplay sessions while demonstrating modern web development skills and generating passive income through ad revenue.

### Success Criteria
- **User Experience**: 5-10 minute engaging gameplay sessions with high replay value
- **Technical**: Smooth 60 FPS performance on both desktop and mobile
- **Business**: Generate enough ad revenue to cover domain costs ($12/year minimum)
- **Portfolio**: Professional-quality game demonstrating full-stack web development capabilities

### Core Values
1. **Simplicity**: Clean, intuitive gameplay without unnecessary complexity
2. **Performance**: Smooth, responsive experience on all devices
3. **Accessibility**: Playable by anyone, anywhere, without signup
4. **Polish**: Professional presentation despite being an indie project

## Architecture Overview

### System Design
```
┌─────────────────────────────────────────────┐
│                Browser (Client)              │
├─────────────────────────────────────────────┤
│                 index.html                   │
│                     │                        │
│        ┌────────────┴────────────┐          │
│        │                         │          │
│    Game Engine              UI Layer        │
│        │                         │          │
│   ┌────┴────┐            ┌──────┴──────┐   │
│   │ Canvas  │            │   DOM UI    │   │
│   │Renderer │            │ Components  │   │
│   └────┬────┘            └──────┬──────┘   │
│        │                         │          │
│   Game Logic              Ad Integration    │
│   Asset Mgmt              Analytics         │
│   Audio System                              │
└─────────────────────────────────────────────┘
                         │
                         ▼
                  GitHub Pages
                  (Static Host)
```

### Component Architecture

```
Game System
├── Core Engine
│   ├── Game Loop (requestAnimationFrame)
│   ├── State Manager (menu, playing, paused)
│   ├── Level Manager (progression, difficulty)
│   └── Score System (time-based scoring)
│
├── Game Objects
│   ├── Hand Controller (player input)
│   ├── Sugar Cube (physics, collision)
│   ├── Coffee Cup (requirements, validation)
│   └── Conveyor Belt (movement, spawning)
│
├── Rendering System
│   ├── Canvas Context (2D)
│   ├── Sprite Renderer
│   ├── Animation System
│   └── UI Overlay
│
├── Input System
│   ├── Keyboard Handler (Space key)
│   ├── Touch Handler (mobile tap)
│   └── Mouse Handler (future features)
│
├── Audio System
│   ├── Sound Effects Manager
│   ├── Background Music Player
│   └── Volume Controller
│
└── Utility Systems
    ├── Asset Loader (images, sounds)
    ├── Collision Detection
    ├── Performance Monitor
    └── Responsive Scaler
```

## Technology Stack

### Core Technologies
- **HTML5**: Semantic structure, Canvas element
- **CSS3**: Responsive design, animations, Flexbox/Grid
- **JavaScript ES6+**: Classes, modules, async/await
- **Canvas API**: 2D rendering context
- **Web Audio API**: Sound management

### Development Tools
- **Version Control**: Git + GitHub
- **Code Editor**: Claude Code (primary development)
- **Asset Creation**: AI image generators (Ideogram)
- **Audio Tools**: Browser-based audio editors
- **Testing**: Browser DevTools, mobile device testing

### Deployment Stack
- **Hosting**: GitHub Pages (free, reliable)
- **Domain**: Custom domain via DNS provider
- **CDN**: GitHub Pages built-in CDN
- **SSL**: Automatic via GitHub Pages
- **Analytics**: Google Analytics (optional)
- **Monetization**: Google AdSense

### Browser APIs Used
- **Canvas 2D Context**: Game rendering
- **requestAnimationFrame**: Smooth animations
- **Web Audio API**: Sound playback
- **Touch Events API**: Mobile controls
- **Page Visibility API**: Pause when hidden
- **Performance API**: FPS monitoring

## Development Approach

### Phase 1: Foundation (Week 1)
- Set up project structure
- Implement game loop and state management
- Create basic rendering system
- Add simple input handling
- Build Level 1-3 with basic mechanics

### Phase 2: Complete Game (Week 2)
- Implement all 15 levels
- Add all visual assets and animations
- Integrate audio system
- Polish UI and responsiveness
- Implement score system

### Phase 3: Production (Week 3)
- GitHub Pages deployment
- Domain setup and configuration
- Google AdSense integration
- Performance optimization
- Cross-browser testing

### Coding Standards
- **Modular Design**: Each system in separate file
- **ES6 Classes**: For all game objects
- **Pure Functions**: For utilities and helpers
- **No External Dependencies**: Vanilla JavaScript only
- **Mobile-First**: Design for mobile, enhance for desktop

## Required Tools & Resources

### Development Environment
- [ ] **Claude Code**: Primary IDE for development
- [ ] **Git**: Version control (via Claude Code terminal)
- [ ] **Modern Browser**: Chrome/Firefox with DevTools
- [ ] **Local Server**: For testing (Python http.server or similar)

### Asset Creation
- [ ] **Ideogram**: AI image generation (subscription)
- [ ] **Image Editor**: For asset cleanup (browser-based)
- [ ] **Audio Files**: Sound effects and background music
- [ ] **Compression Tools**: PNG optimization

### Deployment & Monetization
- [ ] **GitHub Account**: For repository and hosting
- [ ] **Domain Registrar**: For custom domain
- [ ] **Google AdSense Account**: For ad integration
- [ ] **Google Analytics**: For tracking (optional)

### Testing Devices
- [ ] **Desktop**: Multiple browsers (Chrome, Firefox, Safari)
- [ ] **Mobile**: iOS Safari and Android Chrome
- [ ] **Tablet**: Optional but recommended
- [ ] **Different Screen Sizes**: Via browser DevTools

## Technical Specifications

### Performance Targets
- **Frame Rate**: Consistent 60 FPS
- **Load Time**: < 3 seconds on 3G
- **Memory Usage**: < 50MB active
- **Asset Size**: < 5MB total

### Responsive Breakpoints
```css
/* Mobile First Approach */
/* Base: 320px - 767px */
/* Tablet: 768px - 1023px */
/* Desktop: 1024px+ */
```

### Canvas Resolutions
- **Desktop**: 1280x720 (16:9)
- **Mobile**: 360x640 (9:16)
- **Scaling**: Maintain aspect ratio

### Asset Specifications
- **Images**: PNG-24 with alpha
- **Audio**: MP3, 128kbps
- **Fonts**: Web-safe system fonts
- **Icons**: SVG when possible

## Risk Management

### Technical Risks
1. **Performance on low-end devices**
   - Mitigation: Aggressive optimization, quality settings

2. **Browser compatibility issues**
   - Mitigation: Feature detection, polyfills if needed

3. **Mobile touch responsiveness**
   - Mitigation: Large tap targets, input prediction

### Business Risks
1. **Low ad revenue**
   - Mitigation: Optimize placement, add optional features

2. **High bounce rate**
   - Mitigation: Instant gameplay, clear instructions

### Development Risks
1. **Scope creep**
   - Mitigation: Strict MVP focus, post-launch roadmap

2. **Asset quality**
   - Mitigation: Multiple AI generation attempts, simple style

## Monitoring & Analytics

### Key Metrics
- **Engagement**: Average session duration
- **Progression**: Level completion rates
- **Performance**: FPS, load times
- **Revenue**: Ad impressions, CTR

### Error Tracking
- Console logging for development
- Try-catch blocks for critical paths
- Graceful degradation for missing assets

## Post-Launch Roadmap

### Version 1.1
- Local storage for progress
- Sound effect variations
- Performance optimizations

### Version 2.0
- New mechanics (milk, chocolate)
- Endless mode
- Social sharing

### Future Considerations
- Mobile app wrapper
- Multiplayer modes
- User accounts

---

**Document Status**: Complete
**Last Updated**: January 2025
**Next Steps**: Create TASKS.md based on this plan