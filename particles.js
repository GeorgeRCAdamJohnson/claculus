// Lightweight particle system for visual effects
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 150;
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.canvas.offsetHeight * dpr;
        this.ctx.scale(dpr, dpr);
    }

    emit(x, y, config) {
        const count = config.count || 10;
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            const angle = config.spread ? (Math.random() * config.spread - config.spread / 2) : (Math.random() * Math.PI * 2);
            const speed = config.speed ? (config.speed * (0.5 + Math.random() * 0.5)) : (2 + Math.random() * 3);
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: config.decay || (0.015 + Math.random() * 0.01),
                size: config.size || (3 + Math.random() * 3),
                color: config.colors ? config.colors[Math.floor(Math.random() * config.colors.length)] : '#fff',
                gravity: config.gravity || 0,
                type: config.type || 'circle'
            });
        }
    }

    emitCorrect(x, y) {
        this.emit(x, y, { count: 15, speed: 4, decay: 0.02, colors: ['#00d68f', '#00e5cc', '#fff'], size: 4 });
    }

    emitPerfect(x, y) {
        this.emit(x, y, { count: 30, speed: 6, decay: 0.015, colors: ['#ffd93d', '#ff6b9d', '#fff', '#00e5cc'], size: 5 });
    }

    emitWrong(x, y) {
        this.emit(x, y, { count: 8, speed: 2, decay: 0.03, colors: ['#ff5757', '#ff6b9d'], size: 3 });
    }

    emitCelebration() {
        const w = this.canvas.offsetWidth;
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.emit(Math.random() * w, -10, {
                    count: 3, speed: 2, decay: 0.005, gravity: 0.1,
                    colors: ['#ffd93d', '#ff6b9d', '#00e5cc', '#7c5ce7', '#fff'], size: 5,
                    spread: Math.PI * 0.5
                });
            }, i * 30);
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= p.decay;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
        for (const p of this.particles) {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            if (p.type === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.font = `${p.size * 3}px sans-serif`;
                this.ctx.fillText(p.type, p.x, p.y);
            }
        }
        this.ctx.globalAlpha = 1;
    }

    clear() { this.particles = []; }
}

// Ambient floating math symbols for menu
class AmbientParticles {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.symbols = [];
        this.symbolChars = ['∫', 'dx', 'lim', 'Σ', '∂', 'π', '∞', 'Δ', '∇', 'f\'(x)'];
        this.running = false;
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.canvas.offsetHeight * dpr;
        this.ctx.scale(dpr, dpr);
    }

    start() {
        this.running = true;
        this.symbols = [];
        const w = this.canvas.offsetWidth, h = this.canvas.offsetHeight;
        for (let i = 0; i < 12; i++) {
            this.symbols.push({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3, vy: -0.2 - Math.random() * 0.3,
                char: this.symbolChars[Math.floor(Math.random() * this.symbolChars.length)],
                alpha: 0.1 + Math.random() * 0.15, size: 12 + Math.random() * 8
            });
        }
        this.loop();
    }

    stop() { this.running = false; }

    loop() {
        if (!this.running) return;
        const w = this.canvas.offsetWidth, h = this.canvas.offsetHeight;
        this.ctx.clearRect(0, 0, w, h);
        for (const s of this.symbols) {
            s.x += s.vx; s.y += s.vy;
            if (s.y < -30) { s.y = h + 20; s.x = Math.random() * w; }
            if (s.x < -20 || s.x > w + 20) s.vx *= -1;
            this.ctx.globalAlpha = s.alpha;
            this.ctx.fillStyle = '#7c5ce7';
            this.ctx.font = `${s.size}px 'SF Mono', monospace`;
            this.ctx.fillText(s.char, s.x, s.y);
        }
        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.loop());
    }
}
