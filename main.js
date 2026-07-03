// Main app controller
class App {
    constructor() {
        this.engine = new GameEngine();
        this.assessment = new Assessment();
        this.tutorial = new Tutorial();
        this.particles = {
            menu: new AmbientParticles(document.getElementById('menu-particles')),
            results: new ParticleSystem(document.getElementById('results-particles'))
        };
        this.currentGameType = null;
        this.games = {
            'slope-surfer': SlopeSurfer,
            'area-catcher': AreaCatcher,
            'limit-lander': LimitLander,
            'rate-racer': RateRacer,
            'peak-finder': PeakFinder
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateHighScores();
        this.showScreen('menu');
        // Start ambient particles on menu
        setTimeout(() => {
            this.particles.menu.resize();
            this.particles.menu.start();
        }, 100);
        window.addEventListener('resize', () => {
            this.particles.menu.resize();
            this.particles.results.resize();
        });
    }

    bindEvents() {
        // Game mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const gameType = btn.dataset.game;
                this.startGame(gameType);
            });
        });

        // Results buttons
        document.getElementById('btn-retry').addEventListener('click', () => {
            if (this.currentGameType) this.startGame(this.currentGameType);
        });
        document.getElementById('btn-menu').addEventListener('click', () => this.showScreen('menu'));

        // Tutorial
        document.getElementById('tutorial-next').addEventListener('click', () => this.tutorial.next());
        document.getElementById('tutorial-skip').addEventListener('click', () => this.tutorial.skip());

        // Knowledge map
        document.getElementById('btn-knowledge-map').addEventListener('click', () => this.showKnowledgeMap());
        document.getElementById('btn-knowledge-back').addEventListener('click', () => this.showScreen('menu'));

        // How to play (shows tutorial for generic)
        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            this.showTutorial('slope-surfer');
        });
    }

    startGame(gameType) {
        this.currentGameType = gameType;
        // Check if tutorial needed
        if (!this.tutorial.isComplete(gameType)) {
            this.showTutorial(gameType);
            return;
        }
        this.launchGame(gameType);
    }

    showTutorial(gameType) {
        this.showScreen('tutorial');
        this.tutorial.start(gameType, () => {
            this.launchGame(gameType);
        });
    }

    launchGame(gameType) {
        this.showScreen('game');
        this.particles.menu.stop();

        // Set HUD title
        const titles = { 'slope-surfer': 'Derivative Draw', 'area-catcher': 'Area Pick', 'limit-lander': 'Limit Picker', 'rate-racer': 'Rate Racer', 'peak-finder': 'Peak Finder' };
        document.getElementById('game-title-hud').textContent = titles[gameType] || '';

        // Setup game canvas particles
        const gameArea = document.querySelector('.game-area');
        // Create inline particle canvas if not exists
        let pCanvas = document.getElementById('game-particles-canvas');
        if (!pCanvas) {
            pCanvas = document.createElement('canvas');
            pCanvas.id = 'game-particles-canvas';
            pCanvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:50;width:100%;height:100%;';
            gameArea.appendChild(pCanvas);
        }
        const gameParticles = new ParticleSystem(pCanvas);
        gameParticles.resize();
        this.engine.particles = gameParticles;

        // Start particle render loop
        const particleLoop = () => {
            if (this.engine.state !== 'playing' && this.engine.state !== 'countdown') return;
            gameParticles.update(1 / 60);
            gameParticles.render();
            requestAnimationFrame(particleLoop);
        };
        requestAnimationFrame(particleLoop);

        // Launch engine
        const gameModule = this.games[gameType];
        this.engine.startGame(gameType, gameModule);
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(`${screenId}-screen`);
        if (screen) screen.classList.add('active');

        if (screenId === 'menu') {
            this.updateHighScores();
            this.particles.menu.resize();
            this.particles.menu.start();
        } else {
            if (screenId !== 'tutorial') this.particles.menu.stop();
        }

        if (screenId === 'results') {
            this.particles.results.resize();
        }
    }

    updateHighScores() {
        document.querySelectorAll('.high-score').forEach(el => {
            const mode = el.dataset.mode;
            el.textContent = this.engine.highScores[mode] || 0;
        });
    }

    showKnowledgeMap() {
        this.showScreen('knowledge');
        const grid = document.getElementById('knowledge-grid');
        const categories = this.assessment.getConceptsByCategory();

        let html = '';
        for (const [category, concepts] of Object.entries(categories)) {
            html += `<div class="knowledge-section"><h3>${category}</h3><div class="knowledge-cards">`;
            for (const c of concepts) {
                const pct = Math.round(c.mastery * 100);
                const color = pct >= 70 ? 'var(--correct)' : pct >= 40 ? 'var(--gold)' : 'var(--wrong)';
                html += `
                    <div class="knowledge-card">
                        <span class="knowledge-card-name">${c.name}</span>
                        <div class="knowledge-card-bar"><div class="knowledge-card-fill" style="width:${pct}%;background:${color}"></div></div>
                        <span class="knowledge-card-pct" style="color:${color}">${pct}%</span>
                    </div>
                `;
            }
            html += '</div></div>';
        }
        grid.innerHTML = html;

        // Summary
        const overall = Math.round(this.assessment.getOverallMastery() * 100);
        const sessions = this.assessment.sessions.length;
        document.getElementById('knowledge-summary').innerHTML = `<p>Overall Mastery: <strong>${overall}%</strong> • Sessions: <strong>${sessions}</strong></p>`;
    }
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
