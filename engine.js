// Core game engine - timer, scoring, state management
class GameEngine {
    constructor() {
        this.state = 'menu'; // menu, tutorial, countdown, playing, results
        this.currentGame = null;
        this.gameModule = null;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.timer = 30;
        this.timerInterval = null;
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.correct = 0;
        this.total = 0;
        this.animFrame = null;
        this.lastTime = 0;
        this.particles = null;
        this.highScores = this.loadHighScores();
        this.setupCanvas();
        window.addEventListener('resize', () => this.setupCanvas());
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        if (!container) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.width = rect.width;
        this.height = rect.height;
    }

    startGame(gameType, gameModule) {
        this.currentGame = gameType;
        this.gameModule = gameModule;
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.correct = 0;
        this.total = 0;
        this.timer = 30;
        this.updateHUD();
        this.setupCanvas();
        gameModule.init(this.canvas, this.ctx, this);
        this.startCountdown();
    }

    startCountdown() {
        this.state = 'countdown';
        const overlay = document.getElementById('countdown-overlay');
        const numEl = document.getElementById('countdown-number');
        overlay.classList.remove('hidden');
        let count = 3;
        numEl.textContent = count;
        numEl.style.animation = 'none';
        void numEl.offsetWidth;
        numEl.style.animation = '';

        const tick = () => {
            count--;
            if (count > 0) {
                numEl.textContent = count;
                numEl.style.animation = 'none';
                void numEl.offsetWidth;
                numEl.style.animation = '';
            } else {
                numEl.textContent = 'GO!';
                numEl.style.color = 'var(--correct)';
                numEl.style.animation = 'none';
                void numEl.offsetWidth;
                numEl.style.animation = '';
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    numEl.style.color = '';
                    this.startPlaying();
                }, 500);
            }
        };

        this.countdownInterval = setInterval(tick, 800);
        setTimeout(() => clearInterval(this.countdownInterval), 3000);
    }

    startPlaying() {
        this.state = 'playing';
        this.gameModule.generateQuestion();
        this.startTimer();
        this.startGameLoop();
    }

    startTimer() {
        this.timer = 30;
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateTimerDisplay();
            if (this.timer <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        document.getElementById('timer-text').textContent = Math.max(0, this.timer);
        const progress = document.getElementById('timer-progress');
        const offset = (1 - this.timer / 30) * 163.36;
        progress.style.strokeDashoffset = offset;
        progress.classList.remove('warning', 'danger');
        if (this.timer <= 5) progress.classList.add('danger');
        else if (this.timer <= 10) progress.classList.add('warning');
    }

    startGameLoop() {
        this.lastTime = performance.now();
        const loop = (now) => {
            if (this.state !== 'playing') return;
            const dt = (now - this.lastTime) / 1000;
            this.lastTime = now;
            this.ctx.clearRect(0, 0, this.width, this.height);
            if (this.gameModule.update) this.gameModule.update(dt);
            if (this.gameModule.render) this.gameModule.render(this.ctx, this.width, this.height);
            this.animFrame = requestAnimationFrame(loop);
        };
        this.animFrame = requestAnimationFrame(loop);
    }

    submitAnswer(result) {
        // result: { correct, accuracy, concept }
        this.total++;
        let points = 0;
        let tier = 'miss';

        if (result.accuracy >= 0.95) { tier = 'perfect'; points = 100; }
        else if (result.accuracy >= 0.8) { tier = 'great'; points = 75; }
        else if (result.accuracy >= 0.6) { tier = 'good'; points = 50; }
        else if (result.accuracy >= 0.35) { tier = 'close'; points = 25; }

        if (tier !== 'miss') {
            this.streak++;
            this.correct++;
            if (this.streak > this.bestStreak) this.bestStreak = this.streak;
        } else {
            this.streak = 0;
        }

        // Apply streak multiplier
        let multiplier = 1;
        if (this.streak >= 8) multiplier = 4;
        else if (this.streak >= 5) multiplier = 3;
        else if (this.streak >= 3) multiplier = 2;
        points = Math.round(points * multiplier);
        this.score += points;

        this.updateHUD();
        this.showFeedback(tier, points);

        // Screen shake
        if (tier === 'perfect') {
            document.querySelector('.game-area').classList.add('shake-strong');
            setTimeout(() => document.querySelector('.game-area').classList.remove('shake-strong'), 400);
        } else if (tier !== 'miss') {
            document.querySelector('.game-area').classList.add('shake');
            setTimeout(() => document.querySelector('.game-area').classList.remove('shake'), 300);
        }

        // Emit particles
        if (this.particles) {
            const cx = this.width / 2, cy = this.height / 3;
            if (tier === 'perfect') this.particles.emitPerfect(cx, cy);
            else if (tier !== 'miss') this.particles.emitCorrect(cx, cy);
            else this.particles.emitWrong(cx, cy);
        }

        // Record in assessment
        if (window.app && window.app.assessment && result.concept) {
            window.app.assessment.recordAttempt(result.concept, tier !== 'miss', result.accuracy);
        }

        // Next question after brief delay
        setTimeout(() => {
            if (this.state === 'playing') {
                this.gameModule.generateQuestion();
            }
        }, tier === 'perfect' ? 600 : 400);

        return { tier, points, multiplier };
    }

    showFeedback(tier, points) {
        const popup = document.getElementById('feedback-popup');
        const labels = { perfect: '✨ PERFECT!', great: '🎯 Great!', good: '👍 Good', close: '〰️ Close', miss: '✗ Miss' };
        popup.className = `feedback ${tier === 'miss' ? 'wrong' : tier === 'perfect' ? 'perfect' : 'correct'}`;
        popup.innerHTML = `<span class="feedback-text">${labels[tier]}</span>${points > 0 ? `<span class="feedback-points">+${points}</span>` : ''}`;
        // Reset animation
        popup.style.animation = 'none';
        void popup.offsetWidth;
        popup.style.animation = '';
        setTimeout(() => popup.classList.add('hidden'), 1000);
    }

    updateHUD() {
        document.getElementById('score-value').textContent = this.score;
        const streakEl = document.getElementById('streak-display');
        if (this.streak >= 3) {
            streakEl.classList.remove('hidden');
            const mult = this.streak >= 8 ? 4 : this.streak >= 5 ? 3 : 2;
            document.getElementById('streak-value').textContent = `🔥x${mult}`;
        } else {
            streakEl.classList.add('hidden');
        }
    }

    endGame() {
        this.state = 'results';
        clearInterval(this.timerInterval);
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        if (this.gameModule.cleanup) this.gameModule.cleanup();

        // Check high score
        const isNewHigh = this.score > (this.highScores[this.currentGame] || 0);
        if (isNewHigh) {
            this.highScores[this.currentGame] = this.score;
            this.saveHighScores();
        }

        // Record session
        if (window.app && window.app.assessment) {
            window.app.assessment.recordSession(this.currentGame, this.score, this.correct, this.total, this.bestStreak);
        }

        // Show results
        this.showResults(isNewHigh);
    }

    showResults(isNewHigh) {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('stat-correct').textContent = this.correct;
        document.getElementById('stat-streak').textContent = this.bestStreak;
        document.getElementById('stat-accuracy').textContent = this.total > 0 ? Math.round(this.correct / this.total * 100) + '%' : '0%';
        document.getElementById('new-high-score').classList.toggle('hidden', !isNewHigh);

        // Set tip
        const tips = this.getTips();
        document.getElementById('calculus-tip').textContent = tips[Math.floor(Math.random() * tips.length)];

        // Switch screen
        if (window.app) window.app.showScreen('results');

        // Celebration particles
        if (isNewHigh && this.particles) {
            this.particles.emitCelebration();
        }
    }

    getTips() {
        const allTips = [
            "💡 The derivative at a point equals the slope of the tangent line there.",
            "💡 Integrals measure accumulated area — above the x-axis is positive, below is negative.",
            "💡 A limit describes what a function approaches, not necessarily what it equals.",
            "💡 The derivative of sin(x) is cos(x) — the slope of sine is cosine!",
            "💡 ∫x² dx = x³/3 + C. The power goes up by 1, divide by the new power.",
            "💡 lim(x→0) sin(x)/x = 1. This is one of the most important limits in calculus!",
            "💡 The chain rule: derivative of f(g(x)) = f'(g(x)) · g'(x).",
            "💡 A function can have a limit at a point even if it's not defined there.",
            "💡 The Fundamental Theorem: differentiation and integration are inverse operations.",
            "💡 Steeper curve = larger magnitude derivative. Flat curve = derivative near zero.",
            "💡 Riemann sums approximate integrals using rectangles. More rectangles = better approximation.",
            "💡 If a function has a hole at x=a, the limit might still exist!",
            "💡 The derivative of eˣ is eˣ — it's its own derivative!",
            "💡 Area under a constant function f(x)=c from a to b is simply c·(b-a).",
            "💡 When the derivative is positive, the function is increasing.",
        ];
        return allTips;
    }

    loadHighScores() {
        try {
            const raw = localStorage.getItem('calcRush_highScores');
            return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
    }

    saveHighScores() {
        try { localStorage.setItem('calcRush_highScores', JSON.stringify(this.highScores)); } catch (e) {}
    }
}
