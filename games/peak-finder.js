// Game 5: Peak Finder
// Tap where the maxima and minima are on a curve
// Teaches: "f'(x) = 0 at peaks and valleys"
const PeakFinder = {
    name: 'peak-finder',
    engine: null, canvas: null, ctx: null,
    currentQuestion: null, difficulty: 'easy', questionCount: 0,
    showingAnswer: false, tappedPoints: [], requiredTaps: 0,

    functions: {
        easy: [
            { fn: x => -(x-2)*(x-2) + 4, extrema: [{x: 2, type: 'max'}], label: 'f(x) = -(x-2)\u00b2+4', teach: "One peak at x=2 where the parabola turns. f'(x)=0 here!", concept: 'derivative_power', xRange: [-1, 5] },
            { fn: x => (x-1)*(x-1) - 1, extrema: [{x: 1, type: 'min'}], label: 'f(x) = (x-1)\u00b2-1', teach: "One valley at x=1. The slope changes from negative to positive.", concept: 'derivative_power', xRange: [-2, 4] },
            { fn: x => Math.sin(x), extrema: [{x: Math.PI/2, type: 'max'}, {x: -Math.PI/2, type: 'min'}], label: 'f(x) = sin(x)', teach: "Sin peaks at \u03c0/2 and valleys at -\u03c0/2. Derivative (cos) = 0 there!", concept: 'derivative_trig', xRange: [-4, 4] },
            { fn: x => -(x+1)*(x+1) + 3, extrema: [{x: -1, type: 'max'}], label: 'f(x) = -(x+1)\u00b2+3', teach: "Peak at x=-1. The negative sign flips the parabola upside down.", concept: 'derivative_power', xRange: [-4, 2] },
            { fn: x => (x+2)*(x+2), extrema: [{x: -2, type: 'min'}], label: 'f(x) = (x+2)\u00b2', teach: "Valley at x=-2. Every parabola opening up has a minimum!", concept: 'derivative_power', xRange: [-5, 1] },
            { fn: x => -x*x + 2*x + 3, extrema: [{x: 1, type: 'max'}], label: 'f(x) = -x\u00b2+2x+3', teach: "Complete the square: -(x-1)\u00b2+4. Peak at x=1!", concept: 'derivative_power', xRange: [-2, 4] },
            { fn: x => x*x - 4*x, extrema: [{x: 2, type: 'min'}], label: 'f(x) = x\u00b2-4x', teach: "f'(x)=2x-4=0 at x=2. That's the minimum!", concept: 'derivative_power', xRange: [-1, 5] },
            { fn: x => Math.cos(x), extrema: [{x: 0, type: 'max'}, {x: Math.PI, type: 'min'}], label: 'f(x) = cos(x)', teach: "Cos peaks at x=0 and valleys at x=\u03c0.", concept: 'derivative_trig', xRange: [-2, 5] },
        ],
        medium: [
            { fn: x => x*x*x - 3*x, extrema: [{x: -1, type: 'max'}, {x: 1, type: 'min'}], label: 'f(x) = x\u00b3-3x', teach: "Cubic with two turning points. f'(x)=3x\u00b2-3=0 at x=\u00b11.", concept: 'derivative_power', xRange: [-3, 3] },
            { fn: x => Math.sin(x) * 2, extrema: [{x: Math.PI/2, type: 'max'}, {x: -Math.PI/2, type: 'min'}], label: 'f(x) = 2sin(x)', teach: "Scaling doesn't move the peaks! Still at \u03c0/2 and -\u03c0/2.", concept: 'derivative_trig', xRange: [-4, 4] },
            { fn: x => -x*x*x*x/4 + x*x, extrema: [{x: -Math.sqrt(2), type: 'max'}, {x: 0, type: 'min'}, {x: Math.sqrt(2), type: 'max'}], label: 'f(x) = -x\u2074/4+x\u00b2', teach: "Three extrema! f'=0 at each one. Two peaks and a valley between.", concept: 'derivative_power', xRange: [-3, 3] },
            { fn: x => x*x*x/3 - x*x - 3*x, extrema: [{x: -1, type: 'max'}, {x: 3, type: 'min'}], label: 'f(x) = x\u00b3/3-x\u00b2-3x', teach: "f'(x)=x\u00b2-2x-3=(x-3)(x+1). Two turning points!", concept: 'derivative_power', xRange: [-3, 5] },
            { fn: x => Math.sin(x) + Math.cos(x), extrema: [{x: Math.PI/4, type: 'max'}, {x: -3*Math.PI/4, type: 'min'}], label: 'f(x) = sin(x)+cos(x)', teach: "Combined trig: peaks where sin and cos are both positive!", concept: 'derivative_trig', xRange: [-4, 4] },
            { fn: x => x*x*x*x/4 - 2*x*x, extrema: [{x: -2, type: 'min'}, {x: 0, type: 'max'}, {x: 2, type: 'min'}], label: 'f(x) = x\u2074/4-2x\u00b2', teach: "W-shape! Two valleys and a peak in the middle.", concept: 'derivative_power', xRange: [-3.5, 3.5] },
        ],
        hard: [
            { fn: x => Math.sin(2*x), extrema: [{x: Math.PI/4, type: 'max'}, {x: -Math.PI/4, type: 'min'}, {x: 3*Math.PI/4, type: 'min'}], label: 'f(x) = sin(2x)', teach: "Twice the frequency = twice as many peaks! Chain rule speeds things up.", concept: 'derivative_chain', xRange: [-3.5, 3.5] },
            { fn: x => x*x*x - 6*x*x + 9*x, extrema: [{x: 1, type: 'max'}, {x: 3, type: 'min'}], label: 'f(x) = x\u00b3-6x\u00b2+9x', teach: "f'(x)=3x\u00b2-12x+9=3(x-1)(x-3). Zeros at x=1 and x=3!", concept: 'derivative_power', xRange: [-1, 5] },
            { fn: x => Math.cos(2*x) + x*0.3, extrema: [{x: 0, type: 'max'}, {x: Math.PI/2, type: 'min'}], label: 'f(x) = cos(2x)+0.3x', teach: "The linear term tilts the wave but peaks/valleys still exist!", concept: 'derivative_chain', xRange: [-2, 4] },
            { fn: x => x*Math.exp(-x*x/4), extrema: [{x: -Math.sqrt(2), type: 'min'}, {x: Math.sqrt(2), type: 'max'}], label: 'f(x) = x\u00b7e^(-x\u00b2/4)', teach: "Gaussian-modulated — peaks where the exponential and linear balance.", concept: 'derivative_chain', xRange: [-4, 4] },
            { fn: x => 2*Math.sin(x) - Math.sin(2*x), extrema: [{x: Math.PI/3, type: 'max'}, {x: Math.PI, type: 'min'}], label: 'f(x) = 2sin(x)-sin(2x)', teach: "Combining sines creates interesting shapes. Peaks where derivatives cancel.", concept: 'derivative_trig', xRange: [-1, 4.5] },
        ]
    },

    init(canvas, ctx, engine) {
        this.canvas = canvas; this.ctx = ctx; this.engine = engine;
        this.questionCount = 0; this.setupControls(); this.bindTap();
    },

    bindTap() {
        const c = this.canvas;
        const handler = (e) => {
            if (this.showingAnswer || this.engine.state !== 'playing' || !this.currentQuestion) return;
            e.preventDefault();
            const rect = c.getBoundingClientRect();
            const touch = e.touches ? e.touches[0] : e;
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.handleTap(x, y);
        };
        c.addEventListener('click', handler);
        c.addEventListener('touchstart', handler, { passive: false });
    },

    handleTap(tapX, tapY) {
        if (!this.currentQuestion || this.showingAnswer) return;
        const q = this.currentQuestion;
        const w = this.engine.width, h = this.engine.height;
        const pad = 40, graphH = h - 120;
        const [xMin, xMax] = q.xRange;
        let yMin = Infinity, yMax = -Infinity;
        for (let x = xMin; x <= xMax; x += 0.1) { const y = q.fn(x); if (y < yMin) yMin = y; if (y > yMax) yMax = y; }
        const yPad = (yMax - yMin) * 0.15; yMin -= yPad; yMax += yPad;

        const tapMathX = xMin + (tapX - pad) / (w - 2 * pad) * (xMax - xMin);

        // Check if tap is near any extremum
        let hitExtremum = null;
        for (const ext of q.extrema) {
            if (Math.abs(tapMathX - ext.x) < 0.5) { hitExtremum = ext; break; }
        }

        this.tappedPoints.push({ x: tapX, y: tapY, hit: !!hitExtremum });

        if (hitExtremum) {
            // Remove this extremum from remaining
            const remaining = q.extrema.filter(e => !this.tappedPoints.some(tp => {
                const tpMathX = xMin + (tp.x - pad) / (w - 2 * pad) * (xMax - xMin);
                return Math.abs(tpMathX - e.x) < 0.5 && tp.hit;
            }));
            if (remaining.length === 0) this.complete(true);
        } else {
            // Wrong tap
            this.complete(false);
        }
    },

    complete(allFound) {
        this.showingAnswer = true;
        const q = this.currentQuestion;
        const hitCount = this.tappedPoints.filter(p => p.hit).length;
        const accuracy = hitCount / q.extrema.length;

        const answerEl = document.getElementById('peak-answer');
        answerEl.innerHTML = `<span>${allFound ? '\u2713 Found all!' : '\u2717 Missed!'} ${q.extrema.length} turning point${q.extrema.length > 1 ? 's' : ''}</span><br><small>${q.teach}</small>`;
        answerEl.className = `answer-reveal ${allFound ? 'answer-correct' : 'answer-wrong'}`;
        this.engine.submitAnswer({ correct: allFound, accuracy, concept: q.concept });
    },

    setupControls() {
        document.getElementById('game-controls').innerHTML = `
            <div class="inline-instruction">\ud83d\udccd TAP the peaks and valleys! (where slope = 0)</div>
            <div class="answer-reveal hidden" id="peak-answer"></div>`;
    },

    generateQuestion() {
        this.questionCount++; this.showingAnswer = false; this.tappedPoints = [];
        const el = document.getElementById('peak-answer'); if (el) el.classList.add('hidden');
        if (window.app && window.app.assessment) {
            const elapsed = 30 - this.engine.timer;
            const acc = this.engine.total > 0 ? this.engine.correct / this.engine.total : 0.5;
            this.difficulty = window.app.assessment.selectDifficulty(acc, elapsed);
        } else {
            this.difficulty = this.questionCount <= 3 ? 'easy' : this.questionCount <= 6 ? 'medium' : 'hard';
        }
        const pool = this.functions[this.difficulty];
        // Avoid repeating the same question consecutively
        let q;
        let attempts = 0;
        do {
            q = pool[Math.floor(Math.random() * pool.length)];
            attempts++;
        } while (q === this.currentQuestion && pool.length > 1 && attempts < 5);
        this.currentQuestion = q;
        this.requiredTaps = this.currentQuestion.extrema.length;
        document.getElementById('game-instruction').textContent = `Tap ${this.requiredTaps} turning point${this.requiredTaps > 1 ? 's' : ''}!`;
    },

    update(dt) {},

    render(ctx, w, h) {
        if (!this.currentQuestion) return;
        const q = this.currentQuestion, pad = 40, graphH = h - 120;
        const [xMin, xMax] = q.xRange;
        let yMin = Infinity, yMax = -Infinity;
        for (let x = xMin; x <= xMax; x += 0.1) { const y = q.fn(x); if (y < yMin) yMin = y; if (y > yMax) yMax = y; }
        const yPad = (yMax - yMin) * 0.15; yMin -= yPad; yMax += yPad;
        const sx = x => pad + (x - xMin) / (xMax - xMin) * (w - 2 * pad);
        const sy = y => pad + graphH - ((y - yMin) / (yMax - yMin)) * graphH;

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
        for (let x = Math.ceil(xMin); x <= xMax; x++) { ctx.beginPath(); ctx.moveTo(sx(x), pad); ctx.lineTo(sx(x), pad + graphH); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(pad, sy(0)); ctx.lineTo(w - pad, sy(0)); ctx.stroke();

        // Curve
        ctx.save(); ctx.shadowColor = 'rgba(0,229,204,0.4)'; ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00e5cc'; ctx.lineWidth = 3; ctx.beginPath();
        let f = true;
        for (let x = xMin; x <= xMax; x += 0.03) {
            const screenX = sx(x), screenY = sy(q.fn(x));
            if (screenY < pad - 5 || screenY > pad + graphH + 5) { f = true; continue; }
            if (f) { ctx.moveTo(screenX, screenY); f = false; } else ctx.lineTo(screenX, screenY);
        }
        ctx.stroke(); ctx.restore();

        // Show actual extrema if revealing
        if (this.showingAnswer) {
            for (const ext of q.extrema) {
                const ex = sx(ext.x), ey = sy(q.fn(ext.x));
                ctx.fillStyle = ext.type === 'max' ? 'rgba(255,217,61,0.9)' : 'rgba(0,229,204,0.9)';
                ctx.beginPath(); ctx.arc(ex, ey, 12, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#000'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText(ext.type === 'max' ? 'MAX' : 'MIN', ex, ey + 4);
                ctx.textAlign = 'left';
            }
        }

        // Player taps
        for (const tp of this.tappedPoints) {
            ctx.strokeStyle = tp.hit ? '#00d68f' : '#ff5757'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(tp.x, tp.y, 15, 0, Math.PI * 2); ctx.stroke();
            if (tp.hit) {
                ctx.fillStyle = 'rgba(0,214,143,0.3)'; ctx.beginPath(); ctx.arc(tp.x, tp.y, 15, 0, Math.PI * 2); ctx.fill();
            }
        }

        // Title & instruction
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(q.label + ' \u2014 Tap the peaks/valleys!', w / 2, pad - 8);
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '11px sans-serif';
        ctx.fillText(`Find ${this.requiredTaps} turning point${this.requiredTaps > 1 ? 's' : ''} (where slope = 0)`, w / 2, pad + 10);
        ctx.textAlign = 'left';
    },

    cleanup() { document.getElementById('game-controls').innerHTML = ''; }
};
