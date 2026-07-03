// Slope Surfer - Derivatives Game
const SlopeSurfer = {
    name: 'slope-surfer',
    engine: null,
    canvas: null,
    ctx: null,
    currentQuestion: null,
    sliderValue: 0,
    difficulty: 'easy',
    questionCount: 0,

    functions: {
        easy: [
            { fn: x => 2 * x + 1, deriv: x => 2, label: 'f(x) = 2x + 1', concept: 'derivative_power' },
            { fn: x => x * x, deriv: x => 2 * x, label: 'f(x) = x²', concept: 'derivative_power' },
            { fn: x => 3 * x, deriv: x => 3, label: 'f(x) = 3x', concept: 'derivative_power' },
            { fn: x => -x + 4, deriv: x => -1, label: 'f(x) = -x + 4', concept: 'derivative_power' },
            { fn: x => 0.5 * x * x, deriv: x => x, label: 'f(x) = ½x²', concept: 'derivative_power' },
            { fn: x => x * x - 2 * x, deriv: x => 2 * x - 2, label: 'f(x) = x² - 2x', concept: 'derivative_power' },
        ],
        medium: [
            { fn: x => x * x * x / 3, deriv: x => x * x, label: 'f(x) = x³/3', concept: 'derivative_power' },
            { fn: x => Math.sin(x), deriv: x => Math.cos(x), label: 'f(x) = sin(x)', concept: 'derivative_trig' },
            { fn: x => Math.cos(x), deriv: x => -Math.sin(x), label: 'f(x) = cos(x)', concept: 'derivative_trig' },
            { fn: x => x * x - 3 * x + 2, deriv: x => 2 * x - 3, label: 'f(x) = x² - 3x + 2', concept: 'derivative_power' },
            { fn: x => 2 * Math.sin(x), deriv: x => 2 * Math.cos(x), label: 'f(x) = 2sin(x)', concept: 'derivative_trig' },
        ],
        hard: [
            { fn: x => x * x * x - 3 * x, deriv: x => 3 * x * x - 3, label: 'f(x) = x³ - 3x', concept: 'derivative_chain' },
            { fn: x => Math.sin(x) * x, deriv: x => Math.sin(x) + x * Math.cos(x), label: 'f(x) = x·sin(x)', concept: 'derivative_product' },
            { fn: x => Math.sin(2 * x), deriv: x => 2 * Math.cos(2 * x), label: 'f(x) = sin(2x)', concept: 'derivative_chain' },
            { fn: x => x * x * x * x / 4, deriv: x => x * x * x, label: 'f(x) = x⁴/4', concept: 'derivative_power' },
            { fn: x => Math.cos(x) + x, deriv: x => -Math.sin(x) + 1, label: 'f(x) = cos(x) + x', concept: 'derivative_trig' },
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
                <span class="control-label">Slope:</span>
                <input type="range" id="slope-slider" min="-5" max="5" step="0.1" value="0">
                <span class="control-value" id="slope-display">0.0</span>
            </div>
            <button class="submit-btn" id="slope-submit">Submit ▶</button>
        `;
        const slider = document.getElementById('slope-slider');
        const display = document.getElementById('slope-display');
        slider.addEventListener('input', () => {
            this.sliderValue = parseFloat(slider.value);
            display.textContent = this.sliderValue.toFixed(1);
        });
        document.getElementById('slope-submit').addEventListener('click', () => this.submit());
        // Keyboard
        document.addEventListener('keydown', this._keyHandler = (e) => {
            if (e.key === 'Enter' && this.engine.state === 'playing') this.submit();
        });
    },

    generateQuestion() {
        this.questionCount++;
        // Select difficulty based on assessment
        if (window.app && window.app.assessment) {
            const elapsed = 30 - this.engine.timer;
            const acc = this.engine.total > 0 ? this.engine.correct / this.engine.total : 0.5;
            this.difficulty = window.app.assessment.selectDifficulty(acc, elapsed);
        } else {
            this.difficulty = this.questionCount <= 2 ? 'easy' : this.questionCount <= 5 ? 'medium' : 'hard';
        }
        const pool = this.functions[this.difficulty];
        const q = pool[Math.floor(Math.random() * pool.length)];
        // Random x point
        const xRange = this.difficulty === 'hard' ? [-2.5, 2.5] : [-2, 2];
        const xPoint = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
        this.currentQuestion = { ...q, xPoint: Math.round(xPoint * 10) / 10 };
        // Reset slider
        this.sliderValue = 0;
        const slider = document.getElementById('slope-slider');
        if (slider) { slider.value = 0; document.getElementById('slope-display').textContent = '0.0'; }
        // Update instruction
        document.getElementById('game-instruction').textContent = `Find the slope at x = ${this.currentQuestion.xPoint.toFixed(1)}`;
    },

    submit() {
        if (!this.currentQuestion || this.engine.state !== 'playing') return;
        const actual = this.currentQuestion.deriv(this.currentQuestion.xPoint);
        const estimated = this.sliderValue;
        const error = Math.abs(estimated - actual);
        const maxError = 5;
        const accuracy = Math.max(0, 1 - error / maxError);
        this.engine.submitAnswer({
            correct: accuracy >= 0.35,
            accuracy,
            concept: this.currentQuestion.concept
        });
    },

    update(dt) { /* Static rendering, no animation needed per frame */ },

    render(ctx, w, h) {
        if (!this.currentQuestion) return;
        const q = this.currentQuestion;
        const padding = 60;
        const graphW = w - padding * 2;
        const graphH = h - padding * 2 - 60; // extra space for controls

        // Determine view bounds
        const xMin = -4, xMax = 4, yMin = -4, yMax = 4;
        const toScreenX = (x) => padding + (x - xMin) / (xMax - xMin) * graphW;
        const toScreenY = (y) => padding + (1 - (y - yMin) / (yMax - yMin)) * graphH;

        // Draw grid
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
        ctx.beginPath(); ctx.moveTo(toScreenX(xMin), toScreenY(0)); ctx.lineTo(toScreenX(xMax), toScreenY(0)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toScreenX(0), toScreenY(yMin)); ctx.lineTo(toScreenX(0), toScreenY(yMax)); ctx.stroke();

        // Draw curve with glow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 229, 204, 0.4)';
        ctx.shadowBlur = 12;
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

        // Draw tangent line (player's guess)
        const px = toScreenX(q.xPoint);
        const py = toScreenY(q.fn(q.xPoint));
        const tangentLen = 80;
        const angle = Math.atan(this.sliderValue);
        const dx = Math.cos(angle) * tangentLen;
        const dy = -Math.sin(angle) * tangentLen; // screen Y is inverted
        // Scale for aspect ratio
        const scaleX = graphW / (xMax - xMin);
        const scaleY = graphH / (yMax - yMin);
        const aspectAngle = Math.atan2(this.sliderValue * scaleY, scaleX);
        const tdx = Math.cos(aspectAngle) * tangentLen;
        const tdy = -Math.sin(aspectAngle) * tangentLen;

        ctx.save();
        ctx.shadowColor = 'rgba(255, 217, 61, 0.5)';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#ffd93d';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(px - tdx, py - tdy);
        ctx.lineTo(px + tdx, py + tdy);
        ctx.stroke();
        ctx.restore();

        // Draw point (pulsing)
        const pulse = 1 + Math.sin(Date.now() / 300) * 0.2;
        ctx.save();
        ctx.shadowColor = 'rgba(255, 107, 157, 0.6)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff6b9d';
        ctx.beginPath();
        ctx.arc(px, py, 7 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Function label
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '13px "SF Mono", monospace';
        ctx.fillText(q.label, padding + 5, padding + 18);

        // x point label
        ctx.fillStyle = 'rgba(255,107,157,0.8)';
        ctx.font = '11px "SF Mono", monospace';
        ctx.fillText(`x = ${q.xPoint.toFixed(1)}`, px + 12, py - 12);
    },

    cleanup() {
        document.removeEventListener('keydown', this._keyHandler);
        document.getElementById('game-controls').innerHTML = '';
    }
};
