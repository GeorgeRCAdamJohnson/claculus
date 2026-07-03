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
                { icon: '📈', text: 'You\'ll see a curve with a highlighted point. Your job is to find the slope (steepness) at that point.' },
                { icon: '📐', text: 'Drag the slider to rotate the tangent line. The tangent line shows the slope at that exact point.' },
                { icon: '🎯', text: 'When you think the line matches the curve\'s steepness, tap Submit!' },
                { icon: '⚡', text: 'You have 30 seconds. The closer your guess, the more points! Streaks multiply your score.' }
            ],
            'area-catcher': [
                { icon: '📊', text: 'You\'ll see a curve with a shaded region. The shaded area represents the integral between two bounds.' },
                { icon: '↔️', text: 'Use the slider to estimate how much area is shaded. Think of it as counting grid squares!' },
                { icon: '🎯', text: 'Submit your estimate. Closer guesses earn more points!' },
                { icon: '⚡', text: '30 seconds, as many questions as you can. Rectangles shown are hints for the true area.' }
            ],
            'limit-lander': [
                { icon: '🕳️', text: 'You\'ll see a function with a gap or hole. The function isn\'t defined there, but it approaches a value.' },
                { icon: '🔍', text: 'Watch the arrows — they show values getting closer from both sides. What value do they approach?' },
                { icon: '🔢', text: 'Type your estimate of the limit. Use +/- buttons for fine adjustment.' },
                { icon: '⚡', text: '30 seconds to answer as many as you can. Build streaks for bonus points!' }
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
