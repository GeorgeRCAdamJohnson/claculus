# Requirements: Calculus Rush - 30-Second Learning Game (v2)

## Overview
An intuitive, visually stunning browser game that teaches calculus concepts through fast-paced 30-second micro-games. Unlike existing tools (Brilliant, Khan Academy, Photomath) which focus on passive explanation, Calculus Rush builds *physical intuition* for derivatives, integrals, and limits through repeated action-based gameplay with instant feedback, particle effects, and adaptive difficulty.

**Key differentiator**: Players DO calculus visually (rotating tangent lines, shaping areas, approaching limits) rather than solving equations. Assessment is embedded in gameplay — the game IS the test.

## Target Audience
- College/university students studying Calculus I/II
- AP Calculus high school students
- Self-learners looking to build calculus intuition
- Anyone wanting to practice before exams in quick bursts

---

## User Stories

### US-1: First-Time Tutorial (Progressive Disclosure)
**As a** new player  
**I want to** learn how each game works through guided interaction  
**So that** I understand the mechanics before being timed  

**Acceptance Criteria:**
- [ ] First launch detects new user (localStorage flag)
- [ ] Tutorial mode has NO timer — player goes at their own pace
- [ ] Each game mode has its own tutorial with 3-5 guided steps
- [ ] Steps use contextual tooltips/overlays pointing at interactive elements
- [ ] Tutorial teaches by doing: "Drag the slider to rotate the tangent line"
- [ ] Player must complete one successful interaction before moving to next step
- [ ] Tutorial can be replayed from settings/menu
- [ ] After tutorial, transitions to "Practice Round" (timer shown but generous: 45s)
- [ ] Subsequent sessions skip tutorial and go straight to gameplay

**Tutorial Flow per Game:**
1. **Slope Surfer**: Show curve → highlight point → "This dot shows where we're looking" → "Drag the slider to tilt the tangent line" → "Match the slope at this point!" → practice round
2. **Area Catcher**: Show curve with bounds → "The shaded area represents the integral" → "Use the slider to estimate how much area is shaded" → practice round
3. **Limit Lander**: Show function with hole → "Notice the gap — the function isn't defined here" → "But what value does it approach?" → "Type your estimate" → practice round

### US-2: Knowledge Assessment (Stealth Assessment)
**As a** player  
**I want to** understand my calculus strengths and weaknesses without taking a separate test  
**So that** I can focus my practice on areas that need improvement  

**Acceptance Criteria:**
- [ ] Initial "Placement Game" — a calibration round that samples all difficulty levels
- [ ] Assessment is invisible: it happens DURING normal gameplay, not as a separate mode
- [ ] System tracks per-concept accuracy: derivatives of polynomials, trig derivatives, basic integrals, limit concepts, etc.
- [ ] Knowledge Map screen shows mastery level per concept (0-100% with color coding)
- [ ] After each session, "Session Report" shows: concepts practiced, accuracy per concept, improvement since last session
- [ ] Difficulty adapts based on demonstrated knowledge: struggle with trig derivatives → more trig problems
- [ ] Mastery levels: Novice (0-25%), Developing (26-50%), Proficient (51-75%), Master (76-100%)
- [ ] Weekly progress chart shows improvement over time
- [ ] Export/share assessment results (screenshot-friendly summary card)

**Concepts Tracked:**
- Derivatives: Power rule, Product/Quotient rule, Chain rule, Trig derivatives
- Integrals: Basic antiderivatives, Area interpretation, Definite integrals, Riemann sums
- Limits: Removable discontinuities, One-sided limits, Limits at infinity, Indeterminate forms

### US-3: Game Selection Menu
**As a** player  
**I want to** choose from different calculus mini-games or get a recommended one  
**So that** I can practice specific concepts or follow adaptive recommendations  

**Acceptance Criteria:**
- [ ] Main menu displays 3 game modes with visual previews (animated thumbnails)
- [ ] "Recommended" badge on the mode where player needs most practice
- [ ] Each mode shows: concept taught, current mastery level, high score
- [ ] "Mixed Mode" option that rotates between all three based on assessment
- [ ] Daily Challenge with unique constraints and bonus points
- [ ] High scores displayed per mode with personal best trend
- [ ] Quick-start: last played mode can be restarted with one tap

### US-4: 30-Second Core Timer
**As a** player  
**I want to** feel the urgency of a 30-second countdown  
**So that** I stay fully engaged and build fast-thinking calculus intuition  

**Acceptance Criteria:**
- [ ] Animated 3-2-1-GO countdown before game starts (with visual flair)
- [ ] Circular progress ring animates smoothly (SVG-based, 60fps)
- [ ] Color transitions: Teal (30-20s) → Amber (20-10s) → Red pulse (10-0s)
- [ ] Timer "heartbeat" pulse effect in final 5 seconds
- [ ] Subtle background color/intensity shift as time runs out
- [ ] Particle effects intensify as timer decreases (visual urgency)
- [ ] Game ends with dramatic "Time's Up" animation
- [ ] Optional: Time bonus for very fast correct answers (+2s restored)

### US-5: Slope Surfer (Derivatives)
**As a** player  
**I want to** physically rotate a tangent line to match a curve's slope at a point  
**So that** I build visceral intuition for what derivatives mean geometrically  

**Acceptance Criteria:**
- [ ] Curve rendered beautifully with anti-aliased lines and subtle glow
- [ ] Coordinate grid with subtle styling (not harsh math-textbook look)
- [ ] Target point highlighted with pulsing glow effect
- [ ] Tangent line rotates in real-time as slider moves (smooth, responsive)
- [ ] Tangent line has visual trail/ghost showing previous position
- [ ] Function label displayed (e.g., "f(x) = x² - 2x") for learning
- [ ] Slope value shown numerically as slider moves (e.g., "m = 2.4")
- [ ] On submit: correct tangent line flashes in green/gold, actual value revealed
- [ ] Score based on accuracy: Perfect (±0.1) → Great (±0.3) → Good (±0.7) → Close (±1.5) → Miss
- [ ] After answer: brief insight shown ("The derivative of x² at x=3 is 6")
- [ ] Difficulty progression within round based on time elapsed and accuracy
- [ ] Particle burst on correct answers, screen shake on perfect

### US-6: Area Catcher (Integrals)
**As a** player  
**I want to** estimate the area under a curve by adjusting a value  
**So that** I develop geometric intuition for what integrals represent  

**Acceptance Criteria:**
- [ ] Curve rendered with filled gradient area underneath (visually appealing)
- [ ] Bounds (a, b) clearly marked with vertical dashed lines
- [ ] Dynamic Riemann sum rectangles shown as visual aid (animate count: 4→8→16)
- [ ] Slider adjusts the area estimate with visual feedback (fill level changes)
- [ ] Actual shaded area visually "grows/shrinks" to match player's estimate
- [ ] Sign handling: negative areas shown in different color below x-axis
- [ ] On submit: rectangles animate to fill exactly, true value revealed
- [ ] Score based on percentage error: Perfect (±5%) → Great (±10%) → Good (±20%) → Close (±35%)
- [ ] Brief insight after answer ("∫₀² x² dx = 8/3 ≈ 2.67")
- [ ] Difficulty: linear → quadratic → cubic → trig → mixed positive/negative

### US-7: Limit Lander (Limits)
**As a** player  
**I want to** determine what value a function approaches at a point of interest  
**So that** I develop intuition for limits and continuity  

**Acceptance Criteria:**
- [ ] Function graph with clear visual gap/hole at the limit point
- [ ] Animated "approach arrows" showing values converging from left and right
- [ ] Left/right approach values shown numerically (e.g., f(1.9)=3.8, f(2.1)=4.2...)
- [ ] Approach animation intensifies over time (arrows get closer and closer)
- [ ] Number input with +/- fine-tune buttons for precision
- [ ] On submit: arrows converge to true limit with satisfying animation
- [ ] Score based on accuracy: Perfect (±0.1) → Great (±0.3) → Good (±0.7) → Close (±1.5)
- [ ] Brief insight: "lim(x→2) (x²-4)/(x-2) = 4"
- [ ] Difficulty: obvious removable → less obvious → indeterminate forms (0/0)
- [ ] Visual distinction between limit existing vs. not existing (bonus rounds)

### US-8: Visual Polish & "Game Feel"
**As a** player  
**I want to** experience satisfying visual feedback for every action  
**So that** the game feels responsive, modern, and rewarding  

**Acceptance Criteria:**
- [ ] Particle system: bursts on correct answers (colors match accuracy tier)
- [ ] Particle system: ambient floating particles in background (subtle, mathematical symbols)
- [ ] Glow effects on interactive elements (neon-inspired)
- [ ] Screen shake on events: subtle on submit, stronger on perfect score
- [ ] Smooth easing on all transitions (cubic-bezier, no linear snaps)
- [ ] Color palette: dark base with vibrant neon accents (teal, purple, pink, gold)
- [ ] Curve rendering: thick, anti-aliased, with subtle outer glow
- [ ] Score counter: number "rolls up" animation on points earned
- [ ] Streak indicator: fire/lightning emoji that grows with streak length
- [ ] Background: subtle animated gradient that shifts with game state
- [ ] Celebration: confetti/fireworks particle explosion on game end if new high score
- [ ] Typography: modern, clean, mathematical feel (monospace for numbers)
- [ ] All animations respect prefers-reduced-motion for accessibility

### US-9: Scoring & Engagement
**As a** player  
**I want to** see my improvement over time with meaningful metrics  
**So that** I feel motivated to keep practicing  

**Acceptance Criteria:**
- [ ] Points per question: Perfect (100), Great (75), Good (50), Close (25), Miss (0)
- [ ] Streak multiplier: x1, x2 (3+ streak), x3 (5+ streak), x4 (8+ streak)
- [ ] Combo bonus: rapid consecutive correct answers give time bonus
- [ ] End screen: final score, questions answered, accuracy %, best streak, new high
- [ ] Session improvement: "+15% accuracy vs. last session" shown prominently
- [ ] XP system: accumulate experience that unlocks cosmetic themes/backgrounds
- [ ] Daily streak: playing at least one round per day maintains streak counter
- [ ] "Calculus Insight" shown at end: educational tip related to mistakes made

### US-10: Persistence & Progress
**As a** player  
**I want to** see all my data saved and my progress tracked  
**So that** I can return and continue improving over time  

**Acceptance Criteria:**
- [ ] All data in localStorage (no backend required for MVP)
- [ ] Saved: high scores, assessment data, session history, streak, XP, preferences
- [ ] Knowledge Map persists across sessions
- [ ] "New High Score!" celebration with particle effects when record broken
- [ ] History: last 10 sessions viewable with scores and accuracy
- [ ] Reset progress option (with confirmation dialog)
- [ ] Data structure designed for easy future migration to cloud sync

### US-11: Responsive & Accessible
**As a** player  
**I want to** play comfortably on any device  
**So that** I can practice calculus anywhere, anytime  

**Acceptance Criteria:**
- [ ] Desktop: full experience with keyboard shortcuts (Enter to submit, arrow keys for slider)
- [ ] Mobile: touch-friendly sliders, large tap targets (44px minimum)
- [ ] Tablet: optimal layout that uses available space
- [ ] Canvas auto-scales to container (devicePixelRatio-aware for sharp rendering)
- [ ] Minimum supported width: 320px (iPhone SE)
- [ ] High contrast mode respects system preferences
- [ ] Screen reader announcements for score changes and feedback
- [ ] Keyboard navigation for all interactive elements
- [ ] No auto-playing audio (sound effects optional, off by default)

---

## Non-Functional Requirements

| Requirement | Target | Rationale |
|------------|--------|-----------|
| Frame rate | 60fps consistent | Game feel requires smooth rendering |
| Input latency | <16ms response | Slider must feel directly connected |
| Initial load | <1 second | Zero dependencies, instant engagement |
| Bundle size | <100KB total | Pure JS, no frameworks |
| Browser support | Chrome, Firefox, Safari, Edge (2024+) | Modern ES6+ features ok |
| Offline capable | Full functionality offline | localStorage only, no network needed |
| Accessibility | WCAG 2.1 AA | Keyboard nav, contrast, reduced motion |
| Data persistence | Survive browser updates | localStorage with version migration |
