// Game 3: Limit Picker (multiple choice, mobile-friendly)
// See a function with a hole, pick the limit value from 4 options
// Teaches: "Limits describe what value a function approaches"
const LimitLander = {
    name: 'limit-lander',
    engine: null, canvas: null, ctx: null,
    currentQuestion: null, difficulty: 'easy', questionCount: 0,
    showingAnswer: false, approachAnim: 0,
    choices: [], correctIndex: 0,

    functions: {
        easy: [
            { fn: x => (x*x-4)/(x-2), limitAt: 2, limitValue: 4, label: '(x\u00b2-4)/(x-2)', sublabel: 'x\u21922', teach: "Factor: (x+2)(x-2)/(x-2) = x+2. At x=2: 2+2=4!", concept: 'limit_removable' },
            { fn: x => (x*x-1)/(x-1), limitAt: 1, limitValue: 2, label: '(x\u00b2-1)/(x-1)', sublabel: 'x\u21921', teach: "Factor: (x+1)(x-1)/(x-1) = x+1. At x=1: 1+1=2!", concept: 'limit_removable' },
            { fn: x => (x*x-9)/(x-3), limitAt: 3, limitValue: 6, label: '(x\u00b2-9)/(x-3)', sublabel: 'x\u21923', teach: "Factor: (x+3)(x-3)/(x-3) = x+3. At x=3: 3+3=6!", concept: 'limit_removable' },
            { fn: x => (x*x-2*x)/(x-2), limitAt: 2, limitValue: 2, label: 'x(x-2)/(x-2)', sublabel: 'x\u21922', teach: "Cancel (x-2): just x. At x=2: limit = 2!", concept: 'limit_removable' },
        ],
        medium: [
            { fn: x => x===0?1:Math.sin(x)/x, limitAt: 0, limitValue: 1, label: 'sin(x)/x', sublabel: 'x\u21920', teach: "Famous limit! sin(x)/x \u2192 1 as x\u21920. Key to all of calculus.", concept: 'limit_indeterminate' },
            { fn: x => (x*x*x-8)/(x-2), limitAt: 2, limitValue: 12, label: '(x\u00b3-8)/(x-2)', sublabel: 'x\u21922', teach: "Factor: x\u00b3-8 = (x-2)(x\u00b2+2x+4). Cancel, get 4+4+4=12.", concept: 'limit_removable' },
            { fn: x => (x*x+x-6)/(x-2), limitAt: 2, limitValue: 5, label: '(x\u00b2+x-6)/(x-2)', sublabel: 'x\u21922', teach: "Factor top: (x+3)(x-2)/(x-2) = x+3. At x=2: 5!", concept: 'limit_removable' },
        ],
        hard: [
            { fn: x => (1-Math.cos(x))/(x*x===0?0.001:x*x), limitAt: 0, limitValue: 0.5, label: '(1-cos x)/x\u00b2', sublabel: 'x\u21920', teach: "L'H\u00f4pital twice or Taylor series: cos(x)\u22481-x\u00b2/2, so limit = 1/2.", concept: 'limit_indeterminate' },
            { fn: x => (Math.sqrt(x+4)-2)/(x===0?0.001:x), limitAt: 0, limitValue: 0.25, label: '(\u221a(x+4)-2)/x', sublabel: 'x\u21920', teach: "Multiply by conjugate: 1/(\u221a(x+4)+2). At x=0: 1/4=0.25.", concept: 'limit_indeterminate' },
            { fn: x => Math.tan(x)/(x===0?0.001:x), limitAt: 0, limitValue: 1, label: 'tan(x)/x', sublabel: 'x\u21920', teach: "tan(x)=sin(x)/cos(x), so tan(x)/x = (sin(x)/x)·(1/cos(x)) \u2192 1·1 = 1.", concept: 'limit_indeterminate' },
        ]
    },

    init(canvas, ctx, engine) {
        this.canvas = canvas; this.ctx = ctx; this.engine = engine;
        this.questionCount = 0; this.setupControls();
    },

    setupControls() {
        document.getElementById('game-controls').innerHTML = `
            <div class="inline-instruction">\ud83c\udfaf Watch the values approach... then tap the limit!</div>
            <div class="choices-row" id="limit-choices"></div>
            <div class="answer-reveal hidden" id="limit-answer"></div>`;
    },

    generateQuestion() {
        this.questionCount++; this.showingAnswer = false; this.approachAnim = 0;
        const el = document.getElementById('limit-answer'); if (el) el.classList.add('hidden');
        if (window.app && window.app.assessment) {
            const elapsed = 30 - this.engine.timer;
            const acc = this.engine.total > 0 ? this.engine.correct / this.engine.total : 0.5;
            this.difficulty = window.app.assessment.selectDifficulty(acc, elapsed);
        } else {
            this.difficulty = this.questionCount <= 2 ? 'easy' : this.questionCount <= 4 ? 'medium' : 'hard';
        }
        const pool = this.functions[this.difficulty];
        this.currentQuestion = pool[Math.floor(Math.random() * pool.length)];
        const actual = this.currentQuestion.limitValue;

        // Generate choices
        let choices = [actual];
        const offsets = [1, -1, 2, -2, 0.5, -0.5, 3, 1.5];
        for (const off of offsets) {
            if (choices.length >= 4) break;
            const d = Math.round((actual + off) * 100) / 100;
            if (!choices.includes(d)) choices.push(d);
        }
        this.choices = choices.slice(0, 4).sort(() => Math.random() - 0.5);
        this.correctIndex = this.choices.indexOf(actual);

        const row = document.getElementById('limit-choices');
        row.innerHTML = this.choices.map((c, i) =>
            `<button class="choice-btn" data-idx="${i}">${c}</button>`
        ).join('');
        row.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectChoice(parseInt(btn.dataset.idx)));
        });
        document.getElementById('game-instruction').textContent = 'lim ' + this.currentQuestion.label + ' as ' + this.currentQuestion.sublabel;
    },

    selectChoice(idx) {
        if (this.showingAnswer || this.engine.state !== 'playing') return;
        this.showingAnswer = true;
        const isCorrect = idx === this.correctIndex;

        document.querySelectorAll('#limit-choices .choice-btn').forEach((btn, i) => {
            btn.style.pointerEvents = 'none';
            if (i === this.correctIndex) btn.classList.add('choice-correct');
            else if (i === idx && !isCorrect) btn.classList.add('choice-wrong');
        });

        const answerEl = document.getElementById('limit-answer');
        answerEl.innerHTML = `<span>${isCorrect ? '\u2713' : '\u2717'} Limit = ${this.currentQuestion.limitValue}</span><br><small>${this.currentQuestion.teach}</small>`;
        answerEl.className = `answer-reveal ${isCorrect ? 'answer-correct' : 'answer-wrong'}`;
        this.engine.submitAnswer({ correct: isCorrect, accuracy: isCorrect ? 1 : 0, concept: this.currentQuestion.concept });
    },

    update(dt) { this.approachAnim += dt * 0.8; },

    render(ctx, w, h) {
        if (!this.currentQuestion) return;
        const q = this.currentQuestion, pad = 40, graphH = h - 150;
        const lx = q.limitAt, xMin = lx - 4, xMax = lx + 4;
        let yMin = -2, yMax = 6;
        [-3,-2,-1,-0.5,0.5,1,2,3].forEach(d => { const y = q.fn(lx+d); if(isFinite(y)){if(y<yMin)yMin=y-1;if(y>yMax)yMax=y+1;} });
        yMin = Math.max(yMin, -8); yMax = Math.min(yMax, 10);
        const sx = x => pad + (x - xMin) / (xMax - xMin) * (w - 2 * pad);
        const sy = y => pad + graphH - ((y - yMin) / (yMax - yMin)) * graphH;

        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(pad, sy(0)); ctx.lineTo(w - pad, sy(0)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx(0), pad); ctx.lineTo(sx(0), pad + graphH); ctx.stroke();

        // Curve with gap
        ctx.save(); ctx.shadowColor = 'rgba(0,229,204,0.4)'; ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00e5cc'; ctx.lineWidth = 3; ctx.beginPath();
        let f = true;
        for (let px = 0; px <= w - 2 * pad; px += 2) {
            const x = xMin + (px / (w - 2 * pad)) * (xMax - xMin);
            if (Math.abs(x - lx) < 0.08) { f = true; continue; }
            const y = q.fn(x);
            if (!isFinite(y) || y < yMin - 2 || y > yMax + 2) { f = true; continue; }
            if (f) { ctx.moveTo(sx(x), sy(y)); f = false; } else ctx.lineTo(sx(x), sy(y));
        }
        ctx.stroke(); ctx.restore();

        // Hole
        const hX = sx(lx), hY = sy(q.limitValue);
        ctx.strokeStyle = '#ff6b9d'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(hX, hY, 10, 0, Math.PI * 2); ctx.stroke();
        const pulse = 1 + Math.sin(Date.now() / 400) * 0.3;
        ctx.strokeStyle = 'rgba(255,107,157,0.3)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(hX, hY, 10 * pulse + 5, 0, Math.PI * 2); ctx.stroke();

        // Approach values
        const t = Math.min(this.approachAnim, 3) / 3, ap = 0.5 * (1 - t) + 0.02;
        const lX = lx - ap, rX = lx + ap, lY = q.fn(lX), rY = q.fn(rX);
        if (isFinite(lY) && isFinite(rY)) {
            ctx.save();
            ctx.fillStyle = 'rgba(124,92,231,0.9)'; ctx.beginPath(); ctx.arc(sx(lX), sy(lY), 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,217,61,0.9)'; ctx.beginPath(); ctx.arc(sx(rX), sy(rY), 5, 0, Math.PI * 2); ctx.fill();
            ctx.font = 'bold 11px "SF Mono", monospace';
            ctx.fillStyle = 'rgba(124,92,231,1)'; ctx.fillText(lY.toFixed(2), sx(lX) - 30, sy(lY) - 10);
            ctx.fillStyle = 'rgba(255,217,61,1)'; ctx.fillText(rY.toFixed(2), sx(rX) + 8, sy(rY) - 10);
            ctx.restore();
        }

        // Title
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('lim ' + q.label + '  as ' + q.sublabel + ' = ?', w / 2, pad - 8);
        ctx.fillStyle = '#ff6b9d'; ctx.font = 'bold 18px sans-serif';
        ctx.fillText('?', hX, hY - 16); ctx.textAlign = 'left';
    },

    cleanup() { document.getElementById('game-controls').innerHTML = ''; }
};
