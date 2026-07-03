// Tutorial system - progressive disclosure with hands-on learning
class Tutorial {
    constructor() {
        this.currentGame = null;
        this.currentStep = 0;
        this.steps = [];
        this.onComplete = null;
        this.loadState();
    }

    getSteps(gameType) {
        const tutorials = {
            'slope-surfer': [
                { icon: '📈', text: 'You see a function curve at the top. Your job: DRAW its derivative (slope) in the bottom half!' },
                { icon: '✏️', text: 'Trace with your finger. Where the curve is steep → draw high. Where it\'s flat → draw near zero.' },
                { icon: '🎯', text: 'After you lift your finger, the correct derivative appears in green so you can compare!' },
                { icon: '💡', text: 'The derivative tells you HOW FAST the function is changing at each point. Steep = big derivative!' }
            ],
            'area-catcher': [
                { icon: '📊', text: 'You see a curve with a shaded region underneath. The shaded area IS the integral!' },
                { icon: '🔢', text: 'Look at the shape and estimate the area. Pick the closest answer from 4 choices.' },
                { icon: '💡', text: 'Hint: rectangles are shown to help! Count grid squares or use area formulas (triangles, trapezoids).' },
                { icon: '⚡', text: 'The integral = area under the curve. This is the core idea of calculus!' }
            ],
            'limit-lander': [
                { icon: '🕳️', text: 'A function has a hole — it\'s undefined at one point. But what value does it APPROACH?' },
                { icon: '🔍', text: 'Watch the colored dots approach from both sides. They get closer to the answer!' },
                { icon: '🎯', text: 'Tap the correct limit value from 4 choices. Fast and satisfying!' },
                { icon: '💡', text: 'Limits are about where functions GO, not where they ARE. Even undefined points have limits!' }
            ],
            'rate-racer': [
                { icon: '🚗', text: 'A car drives with varying speed. You see its speed-vs-time graph.' },
                { icon: '📊', text: 'The AREA under the speed graph = total distance traveled! This is the Fundamental Theorem.' },
                { icon: '🔢', text: 'Estimate the area and pick the correct distance from 4 choices.' },
                { icon: '💡', text: 'Speed × time = distance. The integral of velocity IS position change!' }
            ],
            'peak-finder': [
                { icon: '⛰️', text: 'A curve appears. TAP where the peaks (maxima) and valleys (minima) are!' },
                { icon: '📐', text: 'At peaks and valleys, the slope is ZERO. The function stops going up and starts going down (or vice versa).' },
                { icon: '🎯', text: 'Tap directly on the turning points. Get them all to score!' },
                { icon: '💡', text: 'Finding where f\'(x) = 0 is how we find max/min. This is optimization — one of calculus\'s most powerful tools!' }
            ]
        };
        return tutorials[gameType] || [];
    }

    isComplete(gameType) {
        return this.completed[gameType] === true;
    }

    markComplete(gameType) {
        this.completed[gameType] = true;
        this.saveState();
    }

    start(gameType, onComplete) {
        this.currentGame = gameType;
        this.currentStep = 0;
        this.steps = this.getSteps(gameType);
        this.onComplete = onComplete;
        this.render();
    }

    next() {
        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
            this.markComplete(this.currentGame);
            if (this.onComplete) this.onComplete();
            return;
        }
        this.render();
    }

    skip() {
        this.markComplete(this.currentGame);
        if (this.onComplete) this.onComplete();
    }

    render() {
        const step = this.steps[this.currentStep];
        if (!step) return;
        document.getElementById('tutorial-title').textContent = this.getTitle(this.currentGame);
        document.getElementById('tutorial-illustration').textContent = step.icon;
        document.getElementById('tutorial-text').textContent = step.text;
        // Render dots
        const dotsEl = document.getElementById('tutorial-dots');
        dotsEl.innerHTML = this.steps.map((_, i) =>
            `<div class="tutorial-dot ${i === this.currentStep ? 'active' : ''}"></div>`
        ).join('');
        // Update button text
        const nextBtn = document.getElementById('tutorial-next');
        nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Start Playing!' : 'Next';
    }

    getTitle(gameType) {
        const titles = { 'slope-surfer': 'Slope Surfer', 'area-catcher': 'Area Catcher', 'limit-lander': 'Limit Lander' };
        return `How to Play: ${titles[gameType] || ''}`;
    }

    loadState() {
        try {
            const raw = localStorage.getItem('calcRush_tutorial');
            this.completed = raw ? JSON.parse(raw) : {};
        } catch (e) { this.completed = {}; }
    }

    saveState() {
        try { localStorage.setItem('calcRush_tutorial', JSON.stringify(this.completed)); } catch (e) {}
    }
}
