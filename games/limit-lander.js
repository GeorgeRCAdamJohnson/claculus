// Limit Lander - Limits Game
const LimitLander = {
    name: 'limit-lander',
    engine: null,
    canvas: null,
    ctx: null,
    currentQuestion: null,
    inputValue: 0,
    difficulty: 'easy',
    questionCount: 0,
    approachAnim: 0,

    functions: {
        easy: [
            { fn: x => (x * x - 4) / (x - 2), limitAt: 2, limitValue: 4, label: 'lim (x²-4)/(x-2)', sublabel: 'x→2', concept: 'limit_removable' },
            { fn: x => (x * x - 1) / (x - 1), limitAt: 1, limitValue: 2, label: 'lim (x²-1)/(x-1)', sublabel: 'x→1', concept: 'limit_removable' },
            { fn: x => (x * x - 9) / (x - 3), limitAt: 3, limitValue: 6, label: 'lim (x²-9)/(x-3)', sublabel: 'x→3', concept: 'limit_removable' },
            { fn: x => (x - 2) * (x + 3) / (x - 2), limitAt: 2, limitValue: 5, label: 'lim (x-2)(x+3)/(x-2)', sublabel: 'x→2', concept: 'limit_removable' },
            { fn: x => (x * x - 2 * x) / (x - 2), limitAt: 2, limitValue: 2, label: 'lim (x²-2x)/(x-2)', sublabel: 'x→2', concept: 'limit_removable' },
        ],
        medium: [
            { fn: x => x === 0 ? 1 : Math.sin(x) / x, limitAt: 0, limitValue: 1, label: 'lim sin(x)/x', sublabel: 'x→0', concept: 'limit_indeterminate' },
            { fn: x => (Math.exp(x) - 1) / (x === 0 ? 1 : x), limitAt: 0, limitValue: 1, label: 'lim (eˣ-1)/x', sublabel: 'x→0', concept: 'limit_indeterminate' },
            { fn: x => (x * x * x - 8) / (x - 2), limitAt: 2, limitValue: 12, label: 'lim (x³-8)/(x-2)', sublabel: 'x→2', concept: 'limit_removable' },
            { fn: x => (x * x + x - 6) / (x - 2), limitAt: 2, limitValue: 5, label: 'lim (x²+x-6)/(x-2)', sublabel: 'x→2', concept: 'limit_removable' },
            { fn: x => (1 - Math.cos(x)) / (x === 0 ? 1 : x), limitAt: 0, limitValue: 0, label: 'lim (1-cos(x))/x', sublabel: 'x→0', concept: 'limit_indeterminate' },
        ],
        hard: [
            { fn: x => (1 - Math.cos(x)) / (x * x === 0 ? 1 : x * x), limitAt: 0, limitValue: 0.5, label: 'lim (1-cos(x))/x²', sublabel: 'x→0', concept: 'limit_indeterminate' },
            { fn: x => x * Math.sin(1 / (x === 0 ? 0.001 : x)), limitAt: 0, limitValue: 0, label: 'lim x·sin(1/x)', sublabel: 'x→0', concept: 'limit_indeterminate' },
            { fn: x => (Math.sqrt(x + 4) - 2) / (x === 0 ? 0.001 : x), limitAt: 0, limitValue: 0.25, label: 'lim (√(x+4)-2)/x', sublabel: 'x→0', concept: 'limit_indeterminate' },
            { fn: x => (x * x - 4) / (x * x - 5 * x + 6), limitAt: 2, limitValue: -4, label: 'lim (x²-4)/(x²-5x+6)', sublabel: 'x→2', concept: 'limit_removable' },
            { fn: x => Math.tan(x) / (x === 0 ? 1 : x), limitAt: 0, limitValue: 1, label: 'lim tan(x)/x', sublabel: 'x→0', concept: 'limit_indeterminate' },
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
            <div class="limit-input-row">
                <button class="limit-adjust-btn" id="limit-minus">−</button>
                <input type="number" class="limit-input" id="limit-input" value="0" step="0.5">
                <button class="limit-adjust-btn" id="limit-plus">+</button>
                <button class="submit-btn" id="limit-submit">Submit ▶</button>
            </div>
        `;
        const input = document.getElementById('limit-input');
        input.addEventListener('input', () => { this.inputValue = parseFloat(input.value) || 0; });
        document.getElementById('limit-minus').addEventListener('click', () => {
            this.inputValue = Math.round((this.inputValue - 0.5) * 10) / 10;
            input.value = this.inputValue;
        });
        document.getElementById('limit-plus').addEventListener('click', () => {
            this.inputValue = Math.round((this.inputValue + 0.5) * 10) / 10;
            input.value = this.inputValue;
        });
        document.getElementById('limit-submit').addEventListener('click', () => this.submit());
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
        this.approachAnim = 0;
        this.inputValue = 0;
        const input = document.getElementById('limit-input');
        if (input) input.value = '0';
        document.getElementById('game-instruction').textContent = `Find: ${this.currentQuestion.label}`;
    },

    submit() {
        if (!this.currentQuestion || this.engine.state !== 'playing') return;
        const actual = this.currentQuestion.limitValue;
        const estimated = this.inputValue;
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
        this.approachAnim += dt * 0.8;
    },

    render(ctx, w, h) {
        if (!this.currentQuestion) return;
        const q = this.currentQuestion;
        const padding = 50;
        const graphH = h - padding * 2 - 80;
        const graphW = w - padding * 2;

        // View bounds around limit point
        const lx = q.limitAt;
        const xMin = lx - 4, xMax = lx + 4;
        let yMin = -2, yMax = 6;
        // Auto scale y
        const testPoints = [-3, -2, -1, -0.5, 0.5, 1, 2, 3].map(d => lx + d);
        for (const x of testPoints) {
            const y = q.fn(x);
            if (isFinite(y)) {
                if (y < yMin) yMin = y - 1;
                if (y > yMax) yMax = y + 1;
            }
        }
        yMin = Math.max(yMin, -10); yMax = Math.min(yMax, 10);

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
        ctx.beginPath(); ctx.moveTo(padding, toScreenY(0)); ctx.lineTo(padding + graphW, toScreenY(0)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toScreenX(0), padding); ctx.lineTo(toScreenX(0), padding + graphH); ctx.stroke();

        // Draw curve (skip near limit point to show hole)
        ctx.save();
        ctx.shadowColor = 'rgba(0, 229, 204, 0.4)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00e5cc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        let first = true;
        for (let px = 0; px <= graphW; px += 2) {
            const x = xMin + (px / graphW) * (xMax - xMin);
            if (Math.abs(x - lx) < 0.08) { first = true; continue; } // gap at limit
            const y = q.fn(x);
            if (!isFinite(y) || y < yMin - 2 || y > yMax + 2) { first = true; continue; }
            const sx = toScreenX(x), sy = toScreenY(y);
            if (first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.restore();

        // Draw hole (open circle)
        const holeX = toScreenX(lx);
        const holeY = toScreenY(q.limitValue);
        ctx.strokeStyle = '#ff6b9d';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(holeX, holeY, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Approach arrows animation
        const t = Math.min(this.approachAnim, 3) / 3; // 0 to 1
        const approach = 0.5 * (1 - t) + 0.02; // starts at 0.5, approaches 0.02
        const leftX = lx - approach;
        const rightX = lx + approach;
        const leftY = q.fn(leftX);
        const rightY = q.fn(rightX);

        if (isFinite(leftY) && isFinite(rightY)) {
            // Left arrow
            ctx.save();
            ctx.fillStyle = 'rgba(124, 92, 231, 0.8)';
            const lsx = toScreenX(leftX), lsy = toScreenY(leftY);
            ctx.beginPath();
            ctx.arc(lsx, lsy, 5, 0, Math.PI * 2);
            ctx.fill();
            // Arrow pointing right
            ctx.strokeStyle = 'rgba(124, 92, 231, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(lsx + 8, lsy); ctx.lineTo(lsx + 16, lsy);
            ctx.lineTo(lsx + 13, lsy - 4); ctx.moveTo(lsx + 16, lsy); ctx.lineTo(lsx + 13, lsy + 4);
            ctx.stroke();

            // Right arrow
            ctx.fillStyle = 'rgba(255, 217, 61, 0.8)';
            const rsx = toScreenX(rightX), rsy = toScreenY(rightY);
            ctx.beginPath();
            ctx.arc(rsx, rsy, 5, 0, Math.PI * 2);
            ctx.fill();
            // Arrow pointing left
            ctx.strokeStyle = 'rgba(255, 217, 61, 0.6)';
            ctx.beginPath(); ctx.moveTo(rsx - 8, rsy); ctx.lineTo(rsx - 16, rsy);
            ctx.lineTo(rsx - 13, rsy - 4); ctx.moveTo(rsx - 16, rsy); ctx.lineTo(rsx - 13, rsy + 4);
            ctx.stroke();
            ctx.restore();

            // Show approach values
            ctx.fillStyle = 'rgba(124, 92, 231, 0.9)';
            ctx.font = '10px "SF Mono", monospace';
            ctx.fillText(`f(${leftX.toFixed(2)}) = ${leftY.toFixed(2)}`, lsx - 50, lsy - 15);
            ctx.fillStyle = 'rgba(255, 217, 61, 0.9)';
            ctx.fillText(`f(${rightX.toFixed(2)}) = ${rightY.toFixed(2)}`, rsx - 10, rsy - 15);
        }

        // Limit point marker (vertical dashed line)
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255, 107, 157, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(holeX, padding); ctx.lineTo(holeX, padding + graphH); ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '13px "SF Mono", monospace';
        ctx.fillText(q.label, padding + 5, padding + 18);
        ctx.fillStyle = 'rgba(255,107,157,0.7)';
        ctx.font = '11px "SF Mono", monospace';
        ctx.fillText(q.sublabel, padding + 5, padding + 34);

        // ? marker at the hole
        ctx.fillStyle = '#ff6b9d';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('?', holeX - 4, holeY - 14);
    },

    cleanup() {
        document.removeEventListener('keydown', this._keyHandler);
        document.getElementById('game-controls').innerHTML = '';
    }
};
