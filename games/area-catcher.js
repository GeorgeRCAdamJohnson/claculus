// Area Catcher - Integrals Game
const AreaCatcher = {
    name: 'area-catcher',
    engine: null,
    canvas: null,
    ctx: null,
    currentQuestion: null,
    sliderValue: 0,
    difficulty: 'easy',
    questionCount: 0,
    riemannCount: 4,
    riemannAnim: 0,

    functions: {
        easy: [
            { fn: x => x, bounds: [0, 3], area: 4.5, label: '∫₀³ x dx', concept: 'integral_basic' },
            { fn: x => 2, bounds: [0, 3], area: 6, label: '∫₀³ 2 dx', concept: 'integral_basic' },
            { fn: x => x + 1, bounds: [0, 2], area: 4, label: '∫₀² (x+1) dx', concept: 'integral_basic' },
            { fn: x => 3 - x, bounds: [0, 3], area: 4.5, label: '∫₀³ (3-x) dx', concept: 'integral_basic' },
            { fn: x => 0.5 * x + 1, bounds: [0, 4], area: 8, label: '∫₀⁴ (½x+1) dx', concept: 'integral_basic' },
        ],
        medium: [
            { fn: x => x * x, bounds: [0, 2], area: 8 / 3, label: '∫₀² x² dx', concept: 'integral_definite' },
            { fn: x => x * x, bounds: [0, 3], area: 9, label: '∫₀³ x² dx', concept: 'integral_definite' },
            { fn: x => 4 - x * x, bounds: [0, 2], area: 16 / 3, label: '∫₀² (4-x²) dx', concept: 'integral_area' },
            { fn: x => Math.sqrt(x), bounds: [0, 4], area: 16 / 3, label: '∫₀⁴ √x dx', concept: 'integral_definite' },
            { fn: x => 3 * x - x * x, bounds: [0, 3], area: 4.5, label: '∫₀³ (3x-x²) dx', concept: 'integral_area' },
        ],
        hard: [
            { fn: x => Math.sin(x), bounds: [0, Math.PI], area: 2, label: '∫₀π sin(x) dx', concept: 'integral_definite' },
            { fn: x => x * x - 2 * x, bounds: [0, 3], area: 0, label: '∫₀³ (x²-2x) dx', concept: 'integral_negative' },
            { fn: x => Math.cos(x), bounds: [0, Math.PI / 2], area: 1, label: '∫₀^(π/2) cos(x) dx', concept: 'integral_definite' },
            { fn: x => x * x * x, bounds: [-1, 1], area: 0, label: '∫₋₁¹ x³ dx', concept: 'integral_negative' },
            { fn: x => 4 - x * x, bounds: [-2, 2], area: 32 / 3, label: '∫₋₂² (4-x²) dx', concept: 'integral_area' },
        ]
    },

    init(canvas, ctx, engine) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.engine = engine;
        this.questionCount = 0;
        this.setupControls();
    },

    setupControls() {
        const controls = document.getElementById('game-controls');
        controls.innerHTML = `
            <div class="control-row">
                <span class="control-label">Area:</span>
                <input type="range" id="area-slider" min="-5" max="15" step="0.1" value="3">
                <span class="control-value" id="area-display">3.0</span>
            </div>
            <button class="submit-btn" id="area-submit">Submit ▶</button>
        `;
        const slider = document.getElementById('area-slider');
        const display = document.getElementById('area-display');
        slider.addEventListener('input', () => {
            this.sliderValue = parseFloat(slider.value);
            display.textContent = this.sliderValue.toFixed(1);
        });
        document.getElementById('area-submit').addEventListener('click', () => this.submit());
        document.addEventListener('keydown', this._keyHandler = (e) => {
            if (e.key === 'Enter' && this.engine.state === 'playing') this.submit();
        });
    },

    generateQuestion() {
        this.questionCount++;
        if (window.app && window.app.assessment) {
            const elapsed = 30 - this.engine.timer;
            const acc = this.engine.total > 0 ? this.engine.correct / this.engine.total : 0.5;
            this.difficulty = window.app.assessment.selectDifficulty(acc, elapsed);
        } else {
            this.difficulty = this.questionCount <= 2 ? 'easy' : this.questionCount <= 4 ? 'medium' : 'hard';
        }
        const pool = this.functions[this.difficulty];
        this.currentQuestion = pool[Math.floor(Math.random() * pool.length)];
        this.riemannCount = 4;
        this.riemannAnim = 0;

        // Set slider range based on answer
        const area = this.currentQuestion.area;
        const slider = document.getElementById('area-slider');
        const range = Math.max(Math.abs(area) * 2, 6);
        slider.min = Math.min(-2, area - range / 2);
        slider.max = Math.max(2, area + range / 2);
        slider.value = 0;
        this.sliderValue = 0;
        document.getElementById('area-display').textContent = '0.0';
        document.getElementById('game-instruction').textContent = 'Estimate the shaded area';
    },

    submit() {
        if (!this.currentQuestion || this.engine.state !== 'playing') return;
        const actual = this.currentQuestion.area;
        const estimated = this.sliderValue;
        const error = Math.abs(estimated - actual);
        const maxError = Math.max(Math.abs(actual) * 0.5, 2);
        const accuracy = Math.max(0, 1 - error / maxError);
        this.engine.submitAnswer({
            correct: accuracy >= 0.35,
            accuracy,
            concept: this.currentQuestion.concept
        });
    },

    update(dt) {
        this.riemannAnim += dt;
        if (this.riemannAnim > 2 && this.riemannCount < 16) {
            this.riemannCount = Math.min(16, this.riemannCount * 2);
            this.riemannAnim = 0;
        }
    },

    render(ctx, w, h) {
        if (!this.currentQuestion) return;
        const q = this.currentQuestion;
        const padding = 50;
        const graphH = h - padding * 2 - 80;
        const graphW = w - padding * 2;

        const [a, b] = q.bounds;
        const xPad = (b - a) * 0.5;
        const xMin = a - xPad, xMax = b + xPad;
        // Determine y range
        let yMin = -1, yMax = 5;
        for (let x = xMin; x <= xMax; x += 0.1) {
            const y = q.fn(x);
            if (y < yMin) yMin = y - 1;
            if (y > yMax) yMax = y + 1;
        }

        const toScreenX = (x) => padding + (x - xMin) / (xMax - xMin) * graphW;
        const toScreenY = (y) => padding + (1 - (y - yMin) / (yMax - yMin)) * graphH;

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let x = Math.ceil(xMin); x <= xMax; x++) {
            ctx.beginPath(); ctx.moveTo(toScreenX(x), padding); ctx.lineTo(toScreenX(x), padding + graphH); ctx.stroke();
        }
        for (let y = Math.ceil(yMin); y <= yMax; y++) {
            ctx.beginPath(); ctx.moveTo(padding, toScreenY(y)); ctx.lineTo(padding + graphW, toScreenY(y)); ctx.stroke();
        }
        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1.5;
        const y0 = toScreenY(0);
        ctx.beginPath(); ctx.moveTo(padding, y0); ctx.lineTo(padding + graphW, y0); ctx.stroke();

        // Shaded area (fill)
        ctx.save();
        const gradient = ctx.createLinearGradient(0, toScreenY(yMax), 0, y0);
        gradient.addColorStop(0, 'rgba(0, 229, 204, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 229, 204, 0.05)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(toScreenX(a), y0);
        for (let px = 0; px <= 100; px++) {
            const x = a + (px / 100) * (b - a);
            ctx.lineTo(toScreenX(x), toScreenY(q.fn(x)));
        }
        ctx.lineTo(toScreenX(b), y0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Riemann rectangles
        const n = this.riemannCount;
        const dx = (b - a) / n;
        ctx.strokeStyle = 'rgba(124, 92, 231, 0.5)';
        ctx.fillStyle = 'rgba(124, 92, 231, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < n; i++) {
            const x = a + i * dx;
            const fVal = q.fn(x + dx / 2); // midpoint
            const sx = toScreenX(x);
            const sw = toScreenX(x + dx) - sx;
            const sy = toScreenY(Math.max(0, fVal));
            const sh = y0 - sy;
            ctx.fillRect(sx, sy, sw, sh);
            ctx.strokeRect(sx, sy, sw, sh);
        }

        // Bounds markers
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(255, 107, 157, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(toScreenX(a), padding); ctx.lineTo(toScreenX(a), padding + graphH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toScreenX(b), padding); ctx.lineTo(toScreenX(b), padding + graphH); ctx.stroke();
        ctx.setLineDash([]);

        // Labels for bounds
        ctx.fillStyle = 'rgba(255,107,157,0.8)';
        ctx.font = '12px "SF Mono", monospace';
        ctx.fillText(`a=${a.toFixed(1)}`, toScreenX(a) - 15, padding + graphH + 18);
        ctx.fillText(`b=${b.toFixed(1)}`, toScreenX(b) - 15, padding + graphH + 18);

        // Draw curve
        ctx.save();
        ctx.shadowColor = 'rgba(0, 229, 204, 0.4)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00e5cc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        let first = true;
        for (let px = 0; px <= graphW; px += 2) {
            const x = xMin + (px / graphW) * (xMax - xMin);
            const y = q.fn(x);
            if (y < yMin - 2 || y > yMax + 2) { first = true; continue; }
            const sx = toScreenX(x), sy = toScreenY(y);
            if (first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.restore();

        // Function label
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '13px "SF Mono", monospace';
        ctx.fillText(q.label, padding + 5, padding + 18);

        // Actual area hint text
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '11px sans-serif';
        ctx.fillText(`${this.riemannCount} rectangles`, padding + 5, padding + 35);
    },

    cleanup() {
        document.removeEventListener('keydown', this._keyHandler);
        document.getElementById('game-controls').innerHTML = '';
    }
};
