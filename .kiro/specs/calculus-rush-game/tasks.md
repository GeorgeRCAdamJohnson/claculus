# Implementation Tasks: Calculus Rush (v2)

## Task 1: Project Setup & HTML Structure
- [ ] Create `index.html` with screen containers (menu, game, results, knowledge-map, tutorial)
- [ ] Create `styles.css` with full dark neon theme, responsive layout, all UI components
- [ ] Add animated menu with game mode cards, mastery indicators, streak display
- [ ] Add game HUD (timer ring, score counter, streak indicator)
- [ ] Add results screen with stats, insights, and calculus tip
- [ ] Add knowledge map screen with concept grid
- [ ] Verify HTML renders correctly and is responsive at 320px, 480px, 768px+

## Task 2: Particle System
- [ ] Create `particles.js` with lightweight particle system class
- [ ] Implement particle physics: velocity, gravity, friction, fade
- [ ] Create emitter configs: correctBurst, perfectBurst, wrongPulse, ambient, celebration
- [ ] Implement ambient floating math symbols (∫, dx, lim, Σ) for menu/background
- [ ] Implement confetti explosion for new high scores
- [ ] Performance: cap at 200 particles, cull by alpha, skip if prefers-reduced-motion
- [ ] Test at 60fps with particle bursts active

## Task 3: Core Game Engine
- [ ] Create `engine.js` with GameEngine class
- [ ] Implement game loop with requestAnimationFrame and delta time
- [ ] Implement state machine: MENU → TUTORIAL → COUNTDOWN → PLAYING → RESULTS
- [ ] Implement 30-second timer with SVG circular progress ring
- [ ] Timer color transitions: teal → amber → red with pulse in final 5s
- [ ] Implement scoring: base points × streak multiplier
- [ ] Implement streak tracking with visual multiplier indicator
- [ ] Implement feedback popup system (animated, color-coded by tier)
- [ ] Implement screen shake utility (subtle on submit, strong on perfect)
- [ ] Implement canvas setup: devicePixelRatio scaling, resize observer
- [ ] Implement smooth number counter animation for score changes

## Task 4: Assessment System
- [ ] Create `assessment.js` with Assessment class
- [ ] Define concept taxonomy (12+ concepts across derivatives, integrals, limits)
- [ ] Implement mastery tracking: exponential moving average per concept
- [ ] Implement adaptive difficulty selection based on mastery + time + performance
- [ ] Implement session recording (score, accuracy, concepts practiced)
- [ ] Implement knowledge map data generation (mastery per concept, overall progress)
- [ ] Implement "recommended game" logic (weakest area)
- [ ] Implement session report generation (improvement %, concepts breakdown)
- [ ] localStorage save/load with version migration support
- [ ] Implement weekly progress calculation from session history

## Task 5: Tutorial System
- [ ] Create `tutorial.js` with Tutorial class
- [ ] Implement overlay rendering: dark mask with spotlight cutout
- [ ] Implement tooltip positioning (auto-position to not overflow screen)
- [ ] Implement step progression: validate action → advance → highlight next
- [ ] Implement pulsing animation on target elements
- [ ] Define tutorial steps for Slope Surfer (4 steps)
- [ ] Define tutorial steps for Area Catcher (4 steps)
- [ ] Define tutorial steps for Limit Lander (4 steps)
- [ ] Implement "first time" detection per game mode (localStorage)
- [ ] Implement practice round transition (relaxed timer: 45s, labeled "Practice")
- [ ] Add "Replay Tutorial" option in menu

## Task 6: Slope Surfer (Derivatives Game)
- [ ] Create `games/slope-surfer.js`
- [ ] Define function library with 15+ functions across 3 difficulty levels
- [ ] Tag each function with assessment concepts
- [ ] Implement curve rendering: anti-aliased, 3px stroke, outer glow effect
- [ ] Implement coordinate grid: subtle lines, brighter axes, adaptive spacing
- [ ] Implement target point: pulsing glow, positioned on curve
- [ ] Implement tangent line: rotates smoothly with slider, gold color, extends to edges
- [ ] Implement slope slider (-5 to +5, 0.1 step) with real-time tangent update
- [ ] Implement numerical slope display updating in real-time
- [ ] Implement answer submission: compare estimated vs actual derivative
- [ ] Implement accuracy scoring with thresholds (±0.1, ±0.3, ±0.7, ±1.5)
- [ ] Show correct answer briefly after submission ("Actual slope: 2.0")
- [ ] Show educational insight after each answer
- [ ] Integrate with assessment system (record concept attempt)
- [ ] Particle burst on correct, screen shake on perfect
- [ ] Smooth transition between questions (curve morphs)

## Task 7: Area Catcher (Integrals Game)
- [ ] Create `games/area-catcher.js`
- [ ] Define function library with known integrals (10+ across difficulty levels)
- [ ] Tag each with assessment concepts
- [ ] Implement curve rendering with gradient-filled area below
- [ ] Implement bounds visualization (dashed vertical lines, labeled a and b)
- [ ] Implement Riemann sum rectangles: animate count increase (4→8→16) as hint
- [ ] Implement area estimate slider (range scaled to ±150% of true answer)
- [ ] Implement visual fill feedback: shading opacity changes with slider
- [ ] Handle negative areas: different color below x-axis
- [ ] Implement answer submission: compare estimate vs true integral
- [ ] Scoring based on percentage error (±5%, ±10%, ±20%, ±35%)
- [ ] Show correct answer with brief educational insight
- [ ] Integrate with assessment system
- [ ] Particle effects on correct answers

## Task 8: Limit Lander (Limits Game)
- [ ] Create `games/limit-lander.js`
- [ ] Define function library with limits (10+ across difficulty levels)
- [ ] Include: removable discontinuities, sin(x)/x type, exponential limits
- [ ] Tag each with assessment concepts
- [ ] Implement function graph with visible hole/gap at limit point
- [ ] Implement approach arrows: animated from both sides, decelerating
- [ ] Show numerical approach values: f(a-0.1), f(a-0.01), f(a+0.01), f(a+0.1)
- [ ] Implement number input with +/- fine-tune buttons
- [ ] Implement submit: arrows converge to true limit with animation
- [ ] Scoring with thresholds (±0.1, ±0.3, ±0.7, ±1.5)
- [ ] Educational insight on each answer
- [ ] Integrate with assessment system
- [ ] Special case: limits that don't exist (bonus challenge)

## Task 9: Main App Controller
- [ ] Create `main.js` with app initialization
- [ ] Wire up menu buttons: game mode selection, knowledge map, settings
- [ ] Implement "Recommended" badge logic (weakest concept area)
- [ ] Implement 3-2-1-GO countdown animation with visual flair
- [ ] Wire up results screen: retry (same game), menu (back to menu)
- [ ] Implement knowledge map rendering from assessment data
- [ ] Implement session report display on results screen
- [ ] Load/save all persistent data on init/game-end
- [ ] Implement XP/level system (XP = sum of all scores)
- [ ] Implement daily streak tracking
- [ ] Add calculus tips pool (20+) for results screen
- [ ] Add keyboard shortcuts: Enter (submit), Escape (menu), arrow keys (slider)

## Task 10: Visual Polish & Final Testing
- [ ] Audit all animations for smoothness (no jank at 60fps)
- [ ] Add background gradient animation (subtle color shift over time)
- [ ] Implement prefers-reduced-motion: skip particles, disable shake
- [ ] Test responsive at 320px, 375px, 414px, 768px, 1024px
- [ ] Verify all math is correct: derivatives, integrals, limits
- [ ] Test full game loop: menu → tutorial → play → results → menu
- [ ] Test assessment: mastery levels update, recommendations change
- [ ] Test localStorage persistence: refresh page, data survives
- [ ] Test edge cases: rapid submit, slider extremes, empty input
- [ ] Performance audit: ensure <100KB total, 60fps, <1s load
- [ ] Cross-browser spot-check (Chrome, Firefox, Safari features used)
