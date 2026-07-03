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
    showingAnswer: false,
    actualSlope: 0,

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
        this.showingAnswer = false;
        this.setupControls();
    },

    setupControls() {
        const controls = document.getElementById('game-controls');
        controls.innerHTML = `
            <div class="inline-instruction">👆 Drag slider to match the tangent slope at the pink dot</div>
            <div class="control-row">
                <span class="control-label">Slope:</span>
                <input type="range" id="slope-slider" min="-5" max="5" step="0.1" value="0">
                <span class="control-value" id="slope-display">0.0</span>
            </div>
            <button class="submit-btn" id="slope-submit">Submit ▶</button>
            <div class="answer-reveal hidden" id="slope-answer"></div>
        `;
        const slider = document.getElementById('slope-slider');
        const display = document.getElementById('slope-display');
        slider.addEventListener('input', () => {
            this.sliderValue = parseFloat(slider.value);
            display.textContent = this.sliderValue.toFixed(1);
        });
        document.getElementById('slope-submit').addEventListener('click', () => this.submit());
        document.addEventListener('keydown', this._keyHandler = (e) => {
            if (e.key === 'Enter' && this.engine.state === 'playing') this.submit();
        });
    },

    generateQuestion() {
        this.questionCount++;
        this.showingAnswer = false;
        document.getElementById('slope-answer').classList.add('hidden');
        
        if (window.app && window.app.assessment) {
            const elapsed = 30 - this.engine.timer;
            const acc = this.engine.total > 0 ? this.engine.correct / this.engine.total : 0.5;
            this.difficulty = window.app.assessment.selectDifficulty(acc, elapsed);
        } else {
            this.difficulty = this.questionCount <= 2 ? 'easy' : this.questionCount <= 5 ? 'medium' : 'hard';
        }
        const pool = this.functions[this.difficulty];
        const q = pool[Math.floor(Math.random() * pool.length)];
        const xRange = this.difficulty === 'hard' ? [-2.5, 2.5] : [-2, 2];
        const xPoint = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
        this.currentQuestion = { ...q, xPoint: Math.round(xPoint * 10) / 10 };
        this.actualSlope = q.deriv(this.currentQuestion.xPoint);
        
        this.sliderValue = 0;
        const slider = document.getElementById('slope-slider');
        if (slider) { slider.value = 0; document.getElementById('slope-display').textContent = '0.0'; }
        document.getElementById('game-instruction').textContent = `What's the slope at x = ${this.currentQuestion.xPoint.toFixed(1)}?`;
    },

    submit() {
        if (!this.currentQuestion || this.engine.state !== 'playing' || this.showingAnswer) return;
        const actual = this.actualSlope;
        const estimated = this.sliderValue;
        const error = Math.abs(estimated - actual);
        const maxError = 5;
        const accuracy = Math.max(0, 1 - error / maxError);
        
        // Show the correct answer briefly
        this.showingAnswer = true;
        const answerEl = document.getElementById('slope-answer');
        const wasCorrect = accuracy >= 0.35;
        answerEl.innerHTML = wasCorrect 
            ? `✓ Actual slope: <strong>${actual.toFixed(1)}</strong> (you said ${estimated.toFixed(1)})`
            : `✗ Actual slope: <strong>${actual.toFixed(1)}</strong> (you said ${estimated.toFixed(1)})`;
        answerEl.className = `answer-reveal ${wasCorrect ? 'answer-correct' : 'answer-wrong'}`;
        
        this.engine.submitAnswer({
            correct: wasCorrect,
            accuracy,
            concept: this.currentQuestion.concept
        });
    },

    update(dt) {},

    render(ctx, w, h) {
        if (!this.currentQuestion) return;
        const q = this.currentQuestion;
        const padding = 50;
        const graphW = w - padding * 2;
        const graphH = h - padding * 2 - 80;

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
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(toScreenX(xMin), toScreenY(0)); ctx.lineTo(toScreenX(xMax), toScreenY(0)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toScreenX(0), toScreenY(yMin)); ctx.lineTo(toScreenX(0), toScreenY(yMax)); ctx.stroke();
        // Axis labels
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '10px sans-serif';
        ctx.fillText('x', toScreenX(xMax) - 10, toScreenY(0) - 5);
        ctx.fillText('y', toScreenX(0) + 5, padding + 10);

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

        // Draw tangent line (player's guess) — GOLD, prominent
        const px = toScreenX(q.xPoint);
        const py = toScreenY(q.fn(q.xPoint));
        const tangentLen = 90;
        const scaleX = graphW / (xMax - xMin);
        const scaleY = graphH / (yMax - yMin);
        const aspectAngle = Math.atan2(this.sliderValue * scaleY, scaleX);
        const tdx = Math.cos(aspectAngle) * tangentLen;
        const tdy = -Math.sin(aspectAngle) * tangentLen;

        ctx.save();
        ctx.shadowColor = 'rgba(255, 217, 61, 0.6)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#ffd93d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(px - tdx, py - tdy);
        ctx.lineTo(px + tdx, py + tdy);
        ctx.stroke();
        ctx.restore();

        // If showing answer, also draw the CORRECT tangent in green
        if (this.showingAnswer) {
            const correctAngle = Math.atan2(this.actualSlope * scaleY, scaleX);
            const cdx = Math.cos(correctAngle) * tangentLen;
            const cdy = -Math.sin(correctAngle) * tangentLen;
            ctx.save();
            ctx.shadowColor = 'rgba(0, 214, 143, 0.6)';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#00d68f';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(px - cdx, py - cdy);
            ctx.lineTo(px + cdx, py + cdy);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        // Draw point (pulsing) — larger and more visible
        const pulse = 1 + Math.sin(Date.now() / 300) * 0.25;
        ctx.save();
        ctx.shadowColor = 'rgba(255, 107, 157, 0.7)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ff6b9d';
        ctx.beginPath();
        ctx.arc(px, py, 9 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Big on-canvas instruction (top)
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Match the gold line to the curve's slope at the pink dot`, w / 2, padding - 10);
        ctx.textAlign = 'left';

        // Function label (bottom-left, clearer)
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '14px "SF Mono", monospace';
        ctx.fillText(q.label, padding + 5, padding + graphH + 35);

        // Show "Your slope" indicator on canvas
        ctx.fillStyle = 'rgba(255, 217, 61, 0.9)';
        ctx.font = 'bold 12px "SF Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`m = ${this.sliderValue.toFixed(1)}`, w - padding, padding + 18);
        ctx.textAlign = 'left';

        // Arrow pointing at the dot with label
        ctx.fillStyle = 'rgba(255, 107, 157, 0.9)';
        ctx.font = '11px sans-serif';
        ctx.fillText(`x = ${q.xPoint.toFixed(1)}`, px + 14, py - 14);
    },

    cleanup() {
        document.removeEventListener('keydown', this._keyHandler);
        document.getElementById('game-controls').innerHTML = '';
    }
};
