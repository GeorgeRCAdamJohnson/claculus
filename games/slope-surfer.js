// Game 1: Derivative Draw
// Player draws the derivative of a displayed function by tracing with finger/mouse
// Teaches: "The derivative shows how steep the original function is at each point"
const SlopeSurfer = {
    name: 'slope-surfer',
    engine: null, canvas: null, ctx: null,
    currentQuestion: null, difficulty: 'easy', questionCount: 0,
    showingAnswer: false, playerPath: [], isDrawing: false,
    targetDerivative: [], phase: 'draw', // 'draw' or 'reveal'

    functions: {
        easy: [
            { fn: x => x * x, deriv: x => 2 * x, label: 'f(x) = x²', derivLabel: "f'(x) = 2x", teach: "The slope of x² gets steeper as x grows. At x=0 it's flat (slope=0), then rises!", concept: 'derivative_power' },
            { fn: x => 3 * x, deriv: x => 3, label: 'f(x) = 3x', derivLabel: "f'(x) = 3", teach: "A straight line has constant slope everywhere. The derivative is just a flat line!", concept: 'derivative_power' },
            { fn: x => -x * x + 4, deriv: x => -2 * x, label: 'f(x) = -x²+4', derivLabel: "f'(x) = -2x", teach: "An upside-down parabola has positive slope on the left, negative on the right.", concept: 'derivative_power' },
            { fn: x => x * x * x / 3, deriv: x => x * x, label: 'f(x) = x³/3', derivLabel: "f'(x) = x²", teach: "The derivative of x³ is x² — always positive! The cubic always increases.", concept: 'derivative_power' },
        ],
        medium: [
            { fn: x => Math.sin(x), deriv: x => Math.cos(x), label: 'f(x) = sin(x)', derivLabel: "f'(x) = cos(x)", teach: "Sin is steepest at 0 (slope=1) and flat at peaks/valleys (slope=0).", concept: 'derivative_trig' },
            { fn: x => Math.cos(x), deriv: x => -Math.sin(x), label: 'f(x) = cos(x)', derivLabel: "f'(x) = -sin(x)", teach: "Cos starts flat (slope=0) then drops. Its derivative is negative sin!", concept: 'derivative_trig' },
            { fn: x => x * x - 2 * x, deriv: x => 2 * x - 2, label: 'f(x) = x²-2x', derivLabel: "f'(x) = 2x-2", teach: "The minimum is where the derivative crosses zero — at x=1!", concept: 'derivative_power' },
        ],
        hard: [
            { fn: x => Math.sin(2 * x), deriv: x => 2 * Math.cos(2 * x), label: 'f(x) = sin(2x)', derivLabel: "f'(x) = 2cos(2x)", teach: "Chain rule! The 2 inside speeds things up, so the derivative is 2× bigger.", concept: 'derivative_chain' },
            { fn: x => x * x * x - 3 * x, deriv: x => 3 * x * x - 3, label: 'f(x) = x³-3x', derivLabel: "f'(x) = 3x²-3", teach: "Two turning points where f'(x)=0. The derivative crosses zero at each peak/valley.", concept: 'derivative_power' },
            { fn: x => Math.sin(x) + x * 0.5, deriv: x => Math.cos(x) + 0.5, label: 'f(x) = sin(x)+x/2', derivLabel: "f'(x) = cos(x)+½", teach: "Adding x/2 shifts the derivative up. The function always goes up overall!", concept: 'derivative_trig' },
        ]
    },

    init(canvas, ctx, engine) {
        this.canvas = canvas; this.ctx = ctx; this.engine = engine;
        this.questionCount = 0; this.setupControls();
        this.bindTouch();
    },

    bindTouch() {
        const c = this.canvas;
        const getPos = (e) => {
            const rect = c.getBoundingClientRect();
            const touch = e.touches ? e.touches[0] : e;
            return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        };
        c.addEventListener('mousedown', (e) => { if (this.phase === 'draw') { this.isDrawing = true; this.playerPath = [getPos(e)]; } });
        c.addEventListener('mousemove', (e) => { if (this.isDrawing) this.playerPath.push(getPos(e)); });
        c.addEventListener('mouseup', () => { if (this.isDrawing) { this.isDrawing = false; this.submitDrawing(); } });
        c.addEventListener('touchstart', (e) => { if (this.phase === 'draw') { e.preventDefault(); this.isDrawing = true; this.playerPath = [getPos(e)]; } }, { passive: false });
        c.addEventListener('touchmove', (e) => { if (this.isDrawing) { e.preventDefault(); this.playerPath.push(getPos(e)); } }, { passive: false });
        c.addEventListener('touchend', (e) => { if (this.isDrawing) { e.preventDefault(); this.isDrawing = false; this.submitDrawing(); } }, { passive: false });
    },

    setupControls() {
        document.getElementById('game-controls').innerHTML = `
            <div class="inline-instruction">✏️ DRAW the derivative — trace what you think the slope looks like!</div>
            <div class="answer-reveal hidden" id="slope-answer"></div>`;
    },

    generateQuestion() {
        this.questionCount++; this.showingAnswer = false; this.playerPath = []; this.phase = 'draw';
        const el = document.getElementById('slope-answer'); if (el) el.classList.add('hidden');
        if (window.app && window.app.assessment) {
            const elapsed = 30 - this.engine.timer;
            const acc = this.engine.total > 0 ? this.engine.correct / this.engine.total : 0.5;
            this.difficulty = window.app.assessment.selectDifficulty(acc, elapsed);
        } else {
            this.difficulty = this.questionCount <= 2 ? 'easy' : this.questionCount <= 4 ? 'medium' : 'hard';
        }
        const pool = this.functions[this.difficulty];
        this.currentQuestion = pool[Math.floor(Math.random() * pool.length)];
        document.getElementById('game-instruction').textContent = 'Draw the derivative below!';
    },

    submitDrawing() {
        if (!this.currentQuestion || this.phase !== 'draw' || this.playerPath.length < 10) return;
        this.phase = 'reveal';
        // Score: compare player's y-path to actual derivative
        const w = this.engine.width, h = this.engine.height;
        const pad = 40, graphH = (h - 80) / 2, botTop = graphH + 60;
        const xMin = -3.5, xMax = 3.5;
        const q = this.currentQuestion;
        // Normalize derivative range
        let dMin = Infinity, dMax = -Infinity;
        for (let x = xMin; x <= xMax; x += 0.1) { const d = q.deriv(x); if (d < dMin) dMin = d; if (d > dMax) dMax = d; }
        const dRange = Math.max(dMax - dMin, 1);

        let totalError = 0, samples = 0;
        for (const pt of this.playerPath) {
            if (pt.x < pad || pt.x > w - pad) continue;
            const xNorm = xMin + (pt.x - pad) / (w - 2 * pad) * (xMax - xMin);
            const actualD = q.deriv(xNorm);
            const actualScreenY = botTop + graphH - ((actualD - dMin) / dRange) * graphH;
            const err = Math.abs(pt.y - actualScreenY) / graphH;
            totalError += err; samples++;
        }
        const avgError = samples > 0 ? totalError / samples : 1;
        const accuracy = Math.max(0, 1 - avgError * 2);

        const answerEl = document.getElementById('slope-answer');
        answerEl.innerHTML = `<span>${accuracy >= 0.4 ? '✓' : '✗'} ${q.derivLabel}</span><br><small>${q.teach}</small>`;
        answerEl.className = `answer-reveal ${accuracy >= 0.4 ? 'answer-correct' : 'answer-wrong'}`;

        this.engine.submitAnswer({ correct: accuracy >= 0.35, accuracy, concept: q.concept });
    },

    update(dt) {},

    render(ctx, w, h) {
        if (!this.currentQuestion) return;
        const q = this.currentQuestion;
        const pad = 40, graphH = (h - 100) / 2;
        const topStart = 20, botTop = topStart + graphH + 40;
        const xMin = -3.5, xMax = 3.5;
        const toSX = x => pad + (x - xMin) / (xMax - xMin) * (w - 2 * pad);

        // ---- TOP HALF: Original function ----
        // y range for f
        let fMin = Infinity, fMax = -Infinity;
        for (let x = xMin; x <= xMax; x += 0.1) { const y = q.fn(x); if (y < fMin) fMin = y; if (y > fMax) fMax = y; }
        const fRange = Math.max(fMax - fMin, 1);
        const toFY = y => topStart + graphH - ((y - fMin) / fRange) * graphH;

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = 'bold 13px sans-serif';
        ctx.fillText('Original Function: ' + q.label, pad, topStart + 14);
        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
        const fZeroY = toFY(0);
        if (fZeroY > topStart && fZeroY < topStart + graphH) {
            ctx.beginPath(); ctx.moveTo(pad, fZeroY); ctx.lineTo(w - pad, fZeroY); ctx.stroke();
        }
        // Curve
        ctx.save(); ctx.shadowColor = 'rgba(0,229,204,0.4)'; ctx.shadowBlur = 8;
        ctx.strokeStyle = '#00e5cc'; ctx.lineWidth = 3; ctx.beginPath();
        let first = true;
        for (let x = xMin; x <= xMax; x += 0.05) {
            const sx = toSX(x), sy = toFY(q.fn(x));
            if (sy < topStart - 10 || sy > topStart + graphH + 10) { first = true; continue; }
            if (first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
        }
        ctx.stroke(); ctx.restore();

        // ---- DIVIDER ----
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('↓ Draw the DERIVATIVE below ↓', w / 2, botTop - 12);
        ctx.textAlign = 'left';
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(pad, botTop - 20); ctx.lineTo(w - pad, botTop - 20); ctx.stroke(); ctx.setLineDash([]);

        // ---- BOTTOM HALF: Drawing area / Derivative ----
        let dMin = Infinity, dMax = -Infinity;
        for (let x = xMin; x <= xMax; x += 0.1) { const d = q.deriv(x); if (d < dMin) dMin = d; if (d > dMax) dMax = d; }
        const dRange = Math.max(dMax - dMin, 1);
        const toDY = y => botTop + graphH - ((y - dMin) / dRange) * graphH;

        // Zero line for derivative
        const dZeroY = toDY(0);
        if (dZeroY > botTop && dZeroY < botTop + graphH) {
            ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pad, dZeroY); ctx.lineTo(w - pad, dZeroY); ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.font = '10px sans-serif';
            ctx.fillText('0', pad - 12, dZeroY + 4);
        }

        // Draw player's trace
        if (this.playerPath.length > 1) {
            ctx.strokeStyle = '#ffd93d'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(this.playerPath[0].x, this.playerPath[0].y);
            for (let i = 1; i < this.playerPath.length; i++) ctx.lineTo(this.playerPath[i].x, this.playerPath[i].y);
            ctx.stroke();
        }

        // If revealing, show actual derivative
        if (this.phase === 'reveal') {
            ctx.save(); ctx.shadowColor = 'rgba(0,214,143,0.5)'; ctx.shadowBlur = 8;
            ctx.strokeStyle = '#00d68f'; ctx.lineWidth = 3; ctx.setLineDash([6, 3]); ctx.beginPath();
            first = true;
            for (let x = xMin; x <= xMax; x += 0.05) {
                const sx = toSX(x), sy = toDY(q.deriv(x));
                if (sy < botTop - 5 || sy > botTop + graphH + 5) { first = true; continue; }
                if (first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
            }
            ctx.stroke(); ctx.setLineDash([]); ctx.restore();
            // Legend
            ctx.fillStyle = '#00d68f'; ctx.font = 'bold 11px sans-serif';
            ctx.fillText('— Actual: ' + q.derivLabel, pad + 5, botTop + graphH + 16);
            ctx.fillStyle = '#ffd93d';
            ctx.fillText('— Your drawing', pad + 160, botTop + graphH + 16);
        } else {
            // Prompt
            ctx.fillStyle = 'rgba(255,217,61,0.4)'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('Trace with your finger here!', w / 2, botTop + graphH / 2);
            ctx.textAlign = 'left';
        }
    },

    cleanup() {
        document.getElementById('game-controls').innerHTML = '';
    }
};
