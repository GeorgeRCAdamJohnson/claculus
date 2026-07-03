// Game 2: Area Fill
// Tap to stack rectangles under a curve. Build the Riemann sum!
// Teaches: "Integrals = area under curve = sum of rectangles"
const AreaCatcher = {
    name: 'area-catcher',
    engine: null, canvas: null, ctx: null,
    currentQuestion: null, difficulty: 'easy', questionCount: 0,
    showingAnswer: false, placedRects: [], targetRects: 0,
    phase: 'fill', // 'fill' or 'reveal'
    choices: [], selectedChoice: -1,

    functions: {
        easy: [
            { fn: x => 2, bounds: [0, 3], area: 6, label: 'f(x) = 2, from 0 to 3', teach: "Rectangle! Height 2 × width 3 = area 6. The simplest integral.", concept: 'integral_basic' },
            { fn: x => x, bounds: [0, 4], area: 8, label: 'f(x) = x, from 0 to 4', teach: "A triangle! Base 4, height 4, area = ½×4×4 = 8.", concept: 'integral_basic' },
            { fn: x => 3, bounds: [0, 2], area: 6, label: 'f(x) = 3, from 0 to 2', teach: "Constant function: area is just height × width = 3×2 = 6.", concept: 'integral_basic' },
            { fn: x => x + 1, bounds: [0, 2], area: 4, label: 'f(x) = x+1, from 0 to 2', teach: "Trapezoid shape. Average height = 2, width = 2, area = 4.", concept: 'integral_basic' },
        ],
        medium: [
            { fn: x => x * x, bounds: [0, 2], area: 2.67, label: 'f(x) = x², from 0 to 2', teach: "Under a parabola: ∫x²dx = x³/3. From 0 to 2: 8/3 ≈ 2.67.", concept: 'integral_definite' },
            { fn: x => 4 - x * x, bounds: [0, 2], area: 5.33, label: 'f(x) = 4-x², from 0 to 2', teach: "Upside-down parabola. More area near x=0 where it's tall!", concept: 'integral_area' },
            { fn: x => Math.sqrt(x), bounds: [0, 4], area: 5.33, label: 'f(x) = √x, from 0 to 4', teach: "Square root grows fast then slows. ∫√x dx = (2/3)x^(3/2).", concept: 'integral_definite' },
        ],
        hard: [
            { fn: x => Math.sin(x), bounds: [0, 3.14], area: 2, label: 'f(x) = sin(x), from 0 to π', teach: "One arch of sine has area exactly 2! ∫sin(x)dx = -cos(x).", concept: 'integral_definite' },
            { fn: x => x * x - 2 * x + 2, bounds: [0, 3], area: 6, label: 'f(x) = x²-2x+2, from 0 to 3', teach: "A shifted parabola. Power rule: ∫(x²-2x+2)dx = x³/3 - x² + 2x.", concept: 'integral_definite' },
        ]
    },

    init(canvas, ctx, engine) {
        this.canvas = canvas; this.ctx = ctx; this.engine = engine;
        this.questionCount = 0; this.setupControls();
    },

    setupControls() {
        document.getElementById('game-controls').innerHTML = `
            <div class="inline-instruction">📊 Look at the shaded area. Pick the best estimate!</div>
            <div class="choices-row" id="area-choices"></div>
            <div class="answer-reveal hidden" id="area-answer"></div>`;
    },

    generateQuestion() {
        this.questionCount++; this.showingAnswer = false; this.selectedChoice = -1;
        const el = document.getElementById('area-answer'); if (el) el.classList.add('hidden');
        if (window.app && window.app.assessment) {
            const elapsed = 30 - this.engine.timer;
            const acc = this.engine.total > 0 ? this.engine.correct / this.engine.total : 0.5;
            this.difficulty = window.app.assessment.selectDifficulty(acc, elapsed);
        } else {
            this.difficulty = this.questionCount <= 2 ? 'easy' : this.questionCount <= 4 ? 'medium' : 'hard';
        }
        const pool = this.functions[this.difficulty];
        this.currentQuestion = pool[Math.floor(Math.random() * pool.length)];

        // Generate 4 choices (one correct, three distractors)
        const actual = this.currentQuestion.area;
        const correct = Math.round(actual * 100) / 100;
        let choices = [correct];
        while (choices.length < 4) {
            const offset = (Math.random() - 0.3) * actual * 1.2 + (Math.random() > 0.5 ? 1.5 : -1);
            const distractor = Math.round((actual + offset) * 100) / 100;
            if (distractor > 0 && !choices.some(c => Math.abs(c - distractor) < 0.3)) choices.push(distractor);
        }
        // Shuffle
        this.choices = choices.sort(() => Math.random() - 0.5);
        this.correctIndex = this.choices.indexOf(correct);

        // Render choice buttons
        const row = document.getElementById('area-choices');
        row.innerHTML = this.choices.map((c, i) =>
            `<button class="choice-btn" data-idx="${i}">${c.toFixed(1)}</button>`
        ).join('');
        row.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectChoice(parseInt(btn.dataset.idx)));
        });

        document.getElementById('game-instruction').textContent = 'What is the shaded area?';
    },

    selectChoice(idx) {
        if (this.showingAnswer || this.engine.state !== 'playing') return;
        this.selectedChoice = idx;
        this.showingAnswer = true;
        const isCorrect = idx === this.correctIndex;
        const accuracy = isCorrect ? 1 : 0.1;

        // Highlight buttons
        document.querySelectorAll('.choice-btn').forEach((btn, i) => {
            btn.style.pointerEvents = 'none';
            if (i === this.correctIndex) btn.classList.add('choice-correct');
            else if (i === idx && !isCorrect) btn.classList.add('choice-wrong');
        });

        const answerEl = document.getElementById('area-answer');
        answerEl.innerHTML = `<span>${isCorrect ? '✓' : '✗'} Area = ${this.currentQuestion.area.toFixed(2)}</span><br><small>${this.currentQuestion.teach}</small>`;
        answerEl.className = `answer-reveal ${isCorrect ? 'answer-correct' : 'answer-wrong'}`;

        this.engine.submitAnswer({ correct: isCorrect, accuracy, concept: this.currentQuestion.concept });
    },

    update(dt) {},

    render(ctx, w, h) {
        if (!this.currentQuestion) return;
        const q = this.currentQuestion;
        const pad = 40, graphH = h - 160;
        const [a, b] = q.bounds;
        const xPad = (b - a) * 0.4;
        const xMin = a - xPad, xMax = b + xPad;
        let yMin = -0.5, yMax = 5;
        for (let x = xMin; x <= xMax; x += 0.1) { const y = q.fn(x); if (y > yMax) yMax = y + 0.5; }
        const toSX = x => pad + (x - xMin) / (xMax - xMin) * (w - 2 * pad);
        const toSY = y => pad + graphH - ((y - yMin) / (yMax - yMin)) * graphH;
        const y0 = toSY(0);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
        for (let x = Math.ceil(xMin); x <= xMax; x++) { ctx.beginPath(); ctx.moveTo(toSX(x), pad); ctx.lineTo(toSX(x), pad + graphH); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(pad, y0); ctx.lineTo(w - pad, y0); ctx.stroke();

        // Shaded area (vibrant)
        ctx.save();
        const grad = ctx.createLinearGradient(0, toSY(yMax), 0, y0);
        grad.addColorStop(0, 'rgba(0, 229, 204, 0.4)');
        grad.addColorStop(1, 'rgba(0, 229, 204, 0.1)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.moveTo(toSX(a), y0);
        for (let px = 0; px <= 80; px++) { const x = a + (px / 80) * (b - a); ctx.lineTo(toSX(x), toSY(q.fn(x))); }
        ctx.lineTo(toSX(b), y0); ctx.closePath(); ctx.fill();
        ctx.restore();

        // Riemann rectangles (visual aid)
        const n = 6; const dx = (b - a) / n;
        ctx.strokeStyle = 'rgba(124, 92, 231, 0.6)'; ctx.fillStyle = 'rgba(124, 92, 231, 0.2)'; ctx.lineWidth = 1;
        for (let i = 0; i < n; i++) {
            const x = a + i * dx; const fv = q.fn(x + dx / 2);
            const sx = toSX(x), sw = toSX(x + dx) - sx, sy = toSY(fv), sh = y0 - sy;
            if (sh > 0) { ctx.fillRect(sx, sy, sw, sh); ctx.strokeRect(sx, sy, sw, sh); }
        }

        // Bounds
        ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(255, 107, 157, 0.7)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(toSX(a), pad); ctx.lineTo(toSX(a), pad + graphH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toSX(b), pad); ctx.lineTo(toSX(b), pad + graphH); ctx.stroke();
        ctx.setLineDash([]);

        // Curve
        ctx.save(); ctx.shadowColor = 'rgba(0, 229, 204, 0.5)'; ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00e5cc'; ctx.lineWidth = 3; ctx.beginPath();
        let first = true;
        for (let x = xMin; x <= xMax; x += 0.05) {
            const sx = toSX(x), sy = toSY(q.fn(x));
            if (sy < pad - 5 || sy > pad + graphH + 5) { first = true; continue; }
            if (first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
        }
        ctx.stroke(); ctx.restore();

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(q.label, w / 2, pad - 5);
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '11px sans-serif';
        ctx.fillText('Shaded area = ?', w / 2, pad + 12);
        ctx.textAlign = 'left';

        // Bounds labels
        ctx.fillStyle = 'rgba(255,107,157,0.9)'; ctx.font = 'bold 12px "SF Mono", monospace';
        ctx.fillText(a.toFixed(0), toSX(a) - 3, y0 + 16);
        ctx.fillText(b.toFixed(1), toSX(b) - 5, y0 + 16);
    },

    cleanup() { document.getElementById('game-controls').innerHTML = ''; }
};
