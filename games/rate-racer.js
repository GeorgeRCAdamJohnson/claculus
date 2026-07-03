// Game 4: Rate Racer
// See a speed graph, pick the total distance traveled
// Teaches: "Integral of speed = distance" (Fundamental Theorem)
const RateRacer = {
    name: 'rate-racer',
    engine: null, canvas: null, ctx: null,
    currentQuestion: null, difficulty: 'easy', questionCount: 0,
    showingAnswer: false, carPos: 0, animTime: 0,
    choices: [], correctIndex: 0,

    questions: {
        easy: [
            { speeds: [2, 2, 2], duration: 3, distance: 6, label: 'Constant 2 m/s for 3s', teach: "Constant speed: distance = speed × time = 2×3 = 6m. That's a rectangle!" },
            { speeds: [4, 4, 4], duration: 3, distance: 12, label: 'Constant 4 m/s for 3s', teach: "4 m/s for 3 seconds = 12 meters. Area of the rectangle under the line!" },
            { speeds: [0, 2, 4], duration: 3, distance: 6, label: 'Accelerating 0→4 m/s over 3s', teach: "Triangle area: ½ × base × height = ½ × 3 × 4 = 6m. Acceleration!" },
            { speeds: [3, 3, 0], duration: 3, distance: 6, label: '3 m/s then braking to stop', teach: "Trapezoid: average speed (3+0)/2 = 1.5 × time... Area under the curve!" },
        ],
        medium: [
            { speeds: [0, 3, 4, 3, 0], duration: 4, distance: 10, label: 'Speed up then slow down', teach: "The area under a speed-time curve IS the distance. Like counting grid squares!" },
            { speeds: [1, 2, 4, 4, 2], duration: 5, distance: 13, label: 'Varying speed over 5s', teach: "Add up: each second, speed×1s = distance that second. Total = sum of all!" },
            { speeds: [5, 5, 0, 0, 3], duration: 5, distance: 13, label: 'Drive, stop, drive again', teach: "When speed=0, no distance added. The integral only grows when speed > 0." },
        ],
        hard: [
            { speeds: [0, 1, 4, 9, 4, 1], duration: 5, distance: 19, label: 'Burst of acceleration', teach: "∫v(t)dt = distance. Even without a formula, area under curve = distance!" },
            { speeds: [3, 6, 6, 3, 0, 0], duration: 5, distance: 18, label: 'Highway then exit', teach: "Higher speed = more area per second = more distance. Integral captures all of it." },
        ]
    },

    init(canvas, ctx, engine) {
        this.canvas = canvas; this.ctx = ctx; this.engine = engine;
        this.questionCount = 0; this.setupControls();
    },

    setupControls() {
        document.getElementById('game-controls').innerHTML = `
            <div class="inline-instruction">🚗 Watch the speed graph. How far did the car travel?</div>
            <div class="choices-row" id="rate-choices"></div>
            <div class="answer-reveal hidden" id="rate-answer"></div>`;
    },

    generateQuestion() {
        this.questionCount++; this.showingAnswer = false; this.animTime = 0;
        const el = document.getElementById('rate-answer'); if (el) el.classList.add('hidden');
        if (window.app && window.app.assessment) {
            const elapsed = 30 - this.engine.timer;
            const acc = this.engine.total > 0 ? this.engine.correct / this.engine.total : 0.5;
            this.difficulty = window.app.assessment.selectDifficulty(acc, elapsed);
        } else {
            this.difficulty = this.questionCount <= 2 ? 'easy' : this.questionCount <= 4 ? 'medium' : 'hard';
        }
        const pool = this.questions[this.difficulty];
        this.currentQuestion = pool[Math.floor(Math.random() * pool.length)];
        const actual = this.currentQuestion.distance;

        let choices = [actual];
        const offsets = [2, -2, 4, -3, 6, -4, 1, -1];
        for (const off of offsets) {
            if (choices.length >= 4) break;
            const d = actual + off;
            if (d > 0 && !choices.includes(d)) choices.push(d);
        }
        this.choices = choices.slice(0, 4).sort(() => Math.random() - 0.5);
        this.correctIndex = this.choices.indexOf(actual);

        const row = document.getElementById('rate-choices');
        row.innerHTML = this.choices.map((c, i) =>
            `<button class="choice-btn" data-idx="${i}">${c}m</button>`
        ).join('');
        row.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectChoice(parseInt(btn.dataset.idx)));
        });
        document.getElementById('game-instruction').textContent = 'Total distance = ?';
    },

    selectChoice(idx) {
        if (this.showingAnswer || this.engine.state !== 'playing') return;
        this.showingAnswer = true;
        const isCorrect = idx === this.correctIndex;

        document.querySelectorAll('#rate-choices .choice-btn').forEach((btn, i) => {
            btn.style.pointerEvents = 'none';
            if (i === this.correctIndex) btn.classList.add('choice-correct');
            else if (i === idx && !isCorrect) btn.classList.add('choice-wrong');
        });

        const answerEl = document.getElementById('rate-answer');
        answerEl.innerHTML = `<span>${isCorrect ? '\u2713' : '\u2717'} Distance = ${this.currentQuestion.distance}m</span><br><small>${this.currentQuestion.teach}</small>`;
        answerEl.className = `answer-reveal ${isCorrect ? 'answer-correct' : 'answer-wrong'}`;
        this.engine.submitAnswer({ correct: isCorrect, accuracy: isCorrect ? 1 : 0, concept: 'integral_area' });
    },

    update(dt) { this.animTime += dt; },

    render(ctx, w, h) {
        if (!this.currentQuestion) return;
        const q = this.currentQuestion, pad = 40, graphH = h - 160;
        const speeds = q.speeds, n = speeds.length;
        const segW = (w - 2 * pad) / n;
        const maxSpeed = Math.max(...speeds, 1);
        const toY = s => pad + graphH - (s / (maxSpeed * 1.2)) * graphH;
        const y0 = pad + graphH;

        // Road at top
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(pad, pad - 10, w - 2 * pad, 25);
        // Car animation
        const progress = Math.min(this.animTime / 2, 1);
        const carX = pad + progress * (w - 2 * pad - 30);
        ctx.fillStyle = '#ffd93d'; ctx.font = '20px sans-serif';
        ctx.fillText('\ud83d\ude97', carX, pad + 10);

        // Speed graph - filled area
        ctx.save();
        const grad = ctx.createLinearGradient(0, toY(maxSpeed), 0, y0);
        grad.addColorStop(0, 'rgba(0, 229, 204, 0.35)');
        grad.addColorStop(1, 'rgba(0, 229, 204, 0.05)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.moveTo(pad, y0);
        for (let i = 0; i < n; i++) {
            ctx.lineTo(pad + i * segW, toY(speeds[i]));
            ctx.lineTo(pad + (i + 1) * segW, toY(speeds[i]));
        }
        ctx.lineTo(pad + n * segW, y0); ctx.closePath(); ctx.fill();
        ctx.restore();

        // Speed line
        ctx.strokeStyle = '#00e5cc'; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(pad, toY(speeds[0]));
        for (let i = 0; i < n; i++) {
            ctx.lineTo(pad + i * segW, toY(speeds[i]));
            ctx.lineTo(pad + (i + 1) * segW, toY(speeds[i]));
        }
        ctx.stroke();

        // Speed labels on segments
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '11px "SF Mono", monospace'; ctx.textAlign = 'center';
        for (let i = 0; i < n; i++) {
            if (speeds[i] > 0) ctx.fillText(speeds[i] + ' m/s', pad + (i + 0.5) * segW, toY(speeds[i]) - 8);
        }
        ctx.textAlign = 'left';

        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(pad, y0); ctx.lineTo(w - pad, y0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pad, pad + 30); ctx.lineTo(pad, y0); ctx.stroke();

        // Labels
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px sans-serif';
        ctx.fillText('Speed', pad + 2, pad + 40);
        ctx.fillText('Time (seconds)', w / 2 - 30, y0 + 16);

        // Title
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('\ud83d\ude97 ' + q.label, w / 2, pad + 28);
        ctx.fillStyle = 'rgba(0,229,204,0.7)'; ctx.font = '11px sans-serif';
        ctx.fillText('Area under speed curve = total distance!', w / 2, y0 + 30);
        ctx.textAlign = 'left';
    },

    cleanup() { document.getElementById('game-controls').innerHTML = ''; }
};
