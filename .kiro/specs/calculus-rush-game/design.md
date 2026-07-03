# Design: Calculus Rush - 30-Second Learning Game (v2)

## Architecture

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Rendering**: HTML5 Canvas API (2D context) with requestAnimationFrame game loop
- **Particles**: Custom lightweight particle system (Canvas-based)
- **Storage**: localStorage with versioned schema for migration safety
- **Dependencies**: None (zero external libraries — maximum performance & portability)

### File Structure
```
calculus-game/
├── index.html                  # Main HTML shell with all screens
├── styles.css                  # All styling (dark neon theme, responsive)
├── engine.js                   # Core game engine (state, timer, scoring, particles)
├── main.js                     # App initialization, routing, event binding
├── tutorial.js                 # Tutorial/onboarding system
├── assessment.js               # Knowledge tracking & adaptive difficulty
├── particles.js                # Particle system for visual effects
├── games/
│   ├── slope-surfer.js         # Derivatives mini-game
│   ├── area-catcher.js         # Integrals mini-game
│   └── limit-lander.js         # Limits mini-game
└── .kiro/specs/                # This spec
```

---

## Core Systems Design

### 1. Game State Machine

```
MENU ─────→ TUTORIAL (first time only)
  │              │
  │              ▼
  │         PRACTICE (no/relaxed timer)
  │              │
  ▼              ▼
COUNTDOWN ──→ PLAYING ──→ RESULTS ──→ MENU
                 ↑                       │
                 └───────────────────────┘ (retry)
```

### 2. GameEngine Class
Central orchestrator. Responsibilities:
- Game loop (requestAnimationFrame at 60fps)
- State machine transitions with animated screen changes
- Timer management (30s countdown with ring animation)
- Score tracking (points, streak, multiplier, accuracy)
- Canvas setup: devicePixelRatio scaling, resize observer
- Delegates to active game module for rendering/input

### 3. Particle System
Lightweight system supporting multiple emitter types:
```javascript
ParticleSystem {
  emit(x, y, config)     // Spawn burst at position
  update(dt)             // Physics step: velocity, gravity, fade
  render(ctx)            // Draw all active particles
}

// Configs for different effects:
- correctBurst: green/gold radial burst, 20 particles, fast decay
- perfectBurst: gold + white sparkles, 40 particles, screen-wide
- wrongPulse: red ring expansion, single particle
- ambient: slow floating math symbols (∫, dx, lim, Σ), 5-10 active
- celebration: confetti rain, 100+ particles, slow gravity
- timerUrgency: red sparks from timer, intensity increases
```

### 4. Tutorial System (Progressive Disclosure)
```javascript
Tutorial {
  steps: [                    // Per-game tutorial definitions
    { target: '.slider', text: '...', action: 'drag', validate: fn }
  ]
  currentStep: 0
  show(gameType)             // Start tutorial for specific game
  advance()                  // Move to next step after validation
  renderOverlay(ctx)         // Draw spotlight + tooltip
  isComplete(gameType)       // Check localStorage flag
}
```

**Overlay design:**
- Dark semi-transparent overlay covers entire screen
- "Spotlight" cutout around the interactive element
- Tooltip with arrow pointing to element
- Pulsing animation on the element to interact with
- "Tap to continue" or specific action instruction
- Progress dots showing tutorial step count

### 5. Assessment System (Stealth Assessment)
```javascript
Assessment {
  conceptMap: {
    'derivative_power_rule': { attempts: 12, correct: 9, lastSeen: Date, mastery: 0.75 },
    'derivative_trig': { attempts: 5, correct: 2, lastSeen: Date, mastery: 0.40 },
    ...
  }
  
  tagQuestion(question)         // Associate question with concepts
  recordAttempt(concept, correct, accuracy)  // Update after each answer
  getMasteryLevel(concept)      // 0-1 float
  getWeakestConcepts(n)         // Returns n concepts needing practice
  selectDifficulty()            // Adaptive: based on recent performance
  getSessionReport()            // Summary of this session's performance
  getProgressOverTime()         // Historical data for charts
}
```

**Mastery calculation:**
- Exponential moving average (recent attempts weighted more)
- Mastery = α * recentAccuracy + (1-α) * previousMastery (α = 0.3)
- Decays slightly over time if concept not practiced (spaced repetition signal)

**Adaptive difficulty:**
- If mastery > 0.7 → increase difficulty for that concept
- If mastery < 0.3 → decrease difficulty, provide more of these
- "Mixed Mode" uses weakest concepts to generate question distribution

### 6. Game Interface Contract
Each mini-game implements:
```javascript
{
  name: 'slope-surfer',
  concepts: ['derivative_power_rule', 'derivative_trig', ...],
  
  init(canvas, ctx, engine, assessment)   // Setup for new round
  generateQuestion(difficulty)             // Create problem at given level
  update(dt)                               // Animation/physics step
  render(ctx)                              // Draw current state
  handleInput(event)                       // Process user interaction
  submitAnswer()                           // Check answer → { correct, accuracy, points, concept }
  showResult(result)                       // Animate feedback
  cleanup()                                // Teardown when game ends
  getTutorialSteps()                       // Return tutorial configuration
}
```

---

## Visual Design System

### Color Palette
```css
/* Core palette - Neon-on-dark, mathematically inspired */
--bg-void:       #05050f;    /* Deepest background */
--bg-dark:       #0a0a1a;    /* Main background */
--bg-card:       #12122a;    /* Card/panel surfaces */
--bg-elevated:   #1a1a3e;    /* Hover states, elevated surfaces */

/* Accent colors - vibrant neon */
--primary:       #7c5ce7;    /* Purple - buttons, UI chrome */
--primary-glow:  #a78bfa;    /* Purple glow */
--secondary:     #00e5cc;    /* Teal - timer, positive states */
--accent:        #ff6b9d;    /* Pink - highlights, streaks */
--gold:          #ffd93d;    /* Gold - perfect, celebrations */
--correct:       #00d68f;    /* Green - correct answers */
--wrong:         #ff5757;    /* Red - wrong answers */

/* Curve rendering */
--curve-stroke:  #00e5cc;    /* Main curve color */
--curve-glow:    rgba(0, 229, 204, 0.3);  /* Outer glow */
--tangent:       #ffd93d;    /* Tangent line */
--grid:          rgba(255, 255, 255, 0.05); /* Subtle grid */
--grid-axis:     rgba(255, 255, 255, 0.15); /* Axis lines */
```

### Typography
```css
/* Display/headings - modern geometric */
font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;

/* Numbers/math - monospace for alignment */
font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;

/* Hierarchy */
--font-title:    3rem / 900;
--font-heading:  1.5rem / 700;
--font-body:     1rem / 400;
--font-math:     1.1rem / 600 monospace;
--font-small:    0.8rem / 400;
```

### Canvas Rendering Style
```
Curves:
- 3px stroke width (scaled for DPR)
- Outer glow: 8px blur of curve color at 30% opacity
- Anti-aliased (canvas default)
- Smooth bezier interpolation between sample points

Grid:
- Subtle 1px lines at 0.05 opacity
- Axis lines slightly brighter at 0.15 opacity
- Grid spacing adapts to function range
- No harsh tick marks — minimal and clean

Points:
- 10px radius filled circles
- Pulsing glow animation (scale 1.0 → 1.3, opacity cycle)
- Inner highlight for 3D depth effect

Interactive elements:
- Tangent line: 2px gold, extends beyond visible intersection
- Area shading: gradient fill from curve color to transparent
- Limit arrows: animated, with easing deceleration
```

### Animation Principles
1. **Nothing is instant**: Every state change has a 200-400ms transition
2. **Easing everywhere**: cubic-bezier(0.4, 0, 0.2, 1) — fast start, smooth end
3. **Layered motion**: Background, midground (graph), foreground (particles) animate independently
4. **Responsive to input**: Slider movement triggers immediate visual response on canvas
5. **Performance budget**: Max 200 particles active simultaneously, culled by alpha < 0.01
6. **Reduced motion**: Skip particles/shake, keep functional transitions

### Screen Designs

#### Menu Screen
```
┌─────────────────────────────────────────────┐
│                                             │
│  [Ambient floating particles: ∫ dx lim Σ]  │
│                                             │
│         CALCULUS RUSH                       │
│    Master calculus in 30-second bursts      │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 📐 Slope Surfer    [★★★☆☆]  ▶     │    │
│  │     Derivatives     Best: 450       │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ 📊 Area Catcher    [★★☆☆☆]  ▶     │    │  
│  │     Integrals       Best: 320  ⭐   │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ 🎯 Limit Lander    [★☆☆☆☆]  ▶     │    │
│  │     Limits          Best: 180       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [🔀 Mixed Mode]  [📊 Knowledge Map]       │
│                                             │
│  🔥 3-day streak    Level 5 (1240 XP)      │
│                                             │
└─────────────────────────────────────────────┘

⭐ = "Recommended" (weakest area)
★ = Mastery stars (from assessment)
```

#### Game Screen (Slope Surfer)
```
┌─────────────────────────────────────────────┐
│ [⏱ 24] Slope Surfer        Score: 175 🔥x2 │
│         Match the tangent slope              │
├─────────────────────────────────────────────┤
│                                             │
│     ╭─────╮     f(x) = x² - 2x            │
│    ╱       ╲                                │
│   ╱    •────── ← tangent line (gold)       │
│  ╱   [pulsing point]                        │
│ ╱                                           │
│╱                                            │
│─────────────────── x-axis                   │
│                                             │
│  [Floating particles in background]         │
│                                             │
├─────────────────────────────────────────────┤
│   Slope: [-2.4]                             │
│   ◄═══════════●══════════════►              │
│   -5         slider          +5             │
│                                             │
│         [ Submit ▶ ]                        │
└─────────────────────────────────────────────┘
```

#### Tutorial Overlay
```
┌─────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓┌──────────────┐▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓│ [spotlight]  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓│  on element  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓└──────────────┘▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓↑▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓┌────────┴──────────┐▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓│ Drag the slider   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓│ to rotate the     │▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓│ tangent line! 👆  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓│                   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓│ Step 2 of 4  [●●○○]│▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓└───────────────────┘▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────────────────────────────────┘
```

#### Knowledge Map Screen
```
┌─────────────────────────────────────────────┐
│ ← Back          Knowledge Map               │
├─────────────────────────────────────────────┤
│                                             │
│  DERIVATIVES                                │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐  │
│  │Power  │ │Product│ │Chain  │ │ Trig  │  │
│  │Rule   │ │Rule   │ │Rule   │ │       │  │
│  │ 85%🟢│ │ 62%🟡│ │ 34%🟠│ │ 28%🔴│  │
│  └───────┘ └───────┘ └───────┘ └───────┘  │
│                                             │
│  INTEGRALS                                  │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐  │
│  │Basic  │ │Area   │ │Definite│ │Riemann│  │
│  │Anti-  │ │Interp │ │Integral│ │ Sums  │  │
│  │ 71%🟢│ │ 55%🟡│ │ 40%🟠│ │ 45%🟡│  │
│  └───────┘ └───────┘ └───────┘ └───────┘  │
│                                             │
│  LIMITS                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐  │
│  │Remov- │ │One-   │ │At     │ │Indet- │  │
│  │able   │ │Sided  │ │Infinity│ │ermin. │  │
│  │ 50%🟡│ │ 35%🟠│ │ 20%🔴│ │ 15%🔴│  │
│  └───────┘ └───────┘ └───────┘ └───────┘  │
│                                             │
│  Overall: 45% Developing     🔥 3-day      │
│  Sessions: 12  |  Time: 6 min total        │
└─────────────────────────────────────────────┘
```

#### Results Screen
```
┌─────────────────────────────────────────────┐
│                                             │
│  [confetti particles if high score]         │
│                                             │
│            ⏰ Time's Up!                    │
│                                             │
│              425                            │
│          Final Score                        │
│     🎉 NEW HIGH SCORE! 🎉                  │
│                                             │
│    ┌──────┐  ┌──────┐  ┌──────┐            │
│    │  7   │  │  5   │  │ 78%  │            │
│    │Correct│  │Streak│  │Accur.│            │
│    └──────┘  └──────┘  └──────┘            │
│                                             │
│  Session Insights:                          │
│  ┌─────────────────────────────────┐        │
│  │ 💡 Power rule: +12% accuracy   │        │
│  │ ⚠️  Trig derivatives: practice │        │
│  │    more sin/cos problems!       │        │
│  └─────────────────────────────────┘        │
│                                             │
│  📝 The derivative of sin(x) is            │
│     cos(x) — think of it as the            │
│     slope of the sine wave!                 │
│                                             │
│  [ Play Again ]    [ Menu ]                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Mathematical Implementation

### Function Library (Expanded)

**Difficulty Level 1 (Easy) — Linear & Simple Polynomial:**
```javascript
{ fn: x => 2*x + 1, derivative: x => 2, label: "2x + 1", concepts: ['derivative_power_rule'] }
{ fn: x => x*x, derivative: x => 2*x, label: "x²", concepts: ['derivative_power_rule'] }
{ fn: x => 3*x - 2, derivative: x => 3, label: "3x - 2", concepts: ['derivative_power_rule'] }
{ fn: x => x*x*x, derivative: x => 3*x*x, label: "x³", concepts: ['derivative_power_rule'] }
```

**Difficulty Level 2 (Medium) — Quadratic & Basic Trig:**
```javascript
{ fn: x => x*x - 3*x + 2, derivative: x => 2*x - 3, label: "x² - 3x + 2" }
{ fn: x => Math.sin(x), derivative: x => Math.cos(x), label: "sin(x)", concepts: ['derivative_trig'] }
{ fn: x => Math.cos(x), derivative: x => -Math.sin(x), label: "cos(x)", concepts: ['derivative_trig'] }
{ fn: x => x*x*x - 2*x, derivative: x => 3*x*x - 2, label: "x³ - 2x" }
```

**Difficulty Level 3 (Hard) — Composite & Product:**
```javascript
{ fn: x => Math.sin(x)*x, derivative: x => Math.sin(x) + x*Math.cos(x), label: "x·sin(x)" }
{ fn: x => x*x*Math.cos(x), derivative: x => 2*x*Math.cos(x) - x*x*Math.sin(x) }
{ fn: x => 1/(1+x*x), derivative: x => -2*x/((1+x*x)*(1+x*x)), label: "1/(1+x²)" }
```

### Limit Functions
```javascript
// Removable discontinuities (easy)
{ fn: x => (x*x - 4)/(x - 2), limitAt: 2, limitValue: 4, label: "(x²-4)/(x-2)" }
{ fn: x => (x*x - 1)/(x - 1), limitAt: 1, limitValue: 2, label: "(x²-1)/(x-1)" }

// Less obvious (medium)
{ fn: x => Math.sin(x)/x, limitAt: 0, limitValue: 1, label: "sin(x)/x" }
{ fn: x => (Math.exp(x) - 1)/x, limitAt: 0, limitValue: 1, label: "(eˣ-1)/x" }

// Trickier (hard)
{ fn: x => (1 - Math.cos(x))/(x*x), limitAt: 0, limitValue: 0.5, label: "(1-cos(x))/x²" }
```

### Integral Functions
```javascript
// Pre-computed definite integrals
{ fn: x => x, bounds: [0, 3], area: 4.5, label: "∫₀³ x dx" }
{ fn: x => x*x, bounds: [0, 2], area: 8/3, label: "∫₀² x² dx" }
{ fn: x => Math.sin(x), bounds: [0, Math.PI], area: 2, label: "∫₀π sin(x) dx" }
{ fn: x => 4 - x*x, bounds: [-2, 2], area: 32/3, label: "∫₋₂² (4-x²) dx" }
```

### Scoring Algorithm
```javascript
function calculateScore(error, thresholds) {
  if (error <= thresholds.perfect) return { tier: 'perfect', base: 100 };
  if (error <= thresholds.great)   return { tier: 'great', base: 75 };
  if (error <= thresholds.good)    return { tier: 'good', base: 50 };
  if (error <= thresholds.close)   return { tier: 'close', base: 25 };
  return { tier: 'miss', base: 0 };
}

function applyMultiplier(base, streak) {
  if (streak >= 8) return base * 4;
  if (streak >= 5) return base * 3;
  if (streak >= 3) return base * 2;
  return base;
}
```

### Adaptive Difficulty Algorithm
```javascript
function selectDifficulty(assessment, timeElapsed, recentAccuracy) {
  // Base difficulty from assessment mastery
  let baseDifficulty = assessment.getOverallMastery(); // 0-1
  
  // Time pressure: difficulty increases over 30s
  let timeFactor = timeElapsed / 30; // 0-1
  
  // Performance in current round
  let performanceFactor = recentAccuracy > 0.8 ? 0.2 : (recentAccuracy < 0.4 ? -0.2 : 0);
  
  // Combined: 0-1 scale mapped to difficulty levels
  let difficulty = Math.max(0, Math.min(1, baseDifficulty * 0.5 + timeFactor * 0.3 + performanceFactor));
  
  if (difficulty < 0.33) return 'easy';
  if (difficulty < 0.66) return 'medium';
  return 'hard';
}
```

---

## Data Schema (localStorage)

```javascript
{
  version: 2,
  profile: {
    xp: 1240,
    level: 5,
    dailyStreak: 3,
    lastPlayed: '2025-01-15T10:30:00Z',
    tutorialComplete: { slope: true, area: true, limit: false },
    preferences: { sound: false, reducedMotion: false }
  },
  highScores: {
    'slope-surfer': 450,
    'area-catcher': 320,
    'limit-lander': 180,
    'mixed': 275
  },
  assessment: {
    concepts: {
      'derivative_power_rule': { attempts: 24, correct: 20, mastery: 0.85, lastSeen: timestamp },
      'derivative_trig': { attempts: 8, correct: 3, mastery: 0.28, lastSeen: timestamp },
      // ... all concepts
    }
  },
  sessions: [
    { date: timestamp, game: 'slope-surfer', score: 425, accuracy: 0.78, questions: 9, streak: 5 },
    // ... last 50 sessions
  ]
}
```

---

## Responsive Strategy

| Breakpoint | Layout Adaptation |
|-----------|-------------------|
| ≥768px | Full layout, side-by-side elements where appropriate |
| 480-767px | Stacked layout, full-width controls, slightly smaller canvas |
| 320-479px | Compact mode: smaller fonts, tighter spacing, simplified HUD |

Canvas always fills available height minus HUD and controls. Controls dock to bottom with adequate touch spacing.
