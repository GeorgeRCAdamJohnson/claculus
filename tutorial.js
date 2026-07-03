// Tutorial system - progressive disclosure with hands-on learning
class Tutorial {
    constructor() {
        this.currentGame = null;
        this.currentStep = 0;
        this.steps = [];
        this.onComplete = null;
        this.loadState();
    }

    getSteps(gameType) {
        const tutorials = {
            'slope-surfer': [
                { icon: '📈', text: 'You see a function curve at the top. Your job: DRAW its derivative (slope) in the bottom half!' },
                { icon: '✏️', text: 'Trace with your finger. Where the curve is steep → draw high. Where it\'s flat → draw near zero.' },
                { icon: 'example1', text: 'Example: f(x) = x² → derivative is a straight line going up (2x). Steeper = higher!', isExample: true, fn: x => x*x, deriv: x => 2*x, labels: ['f(x) = x²', "f'(x) = 2x"] },
                { icon: 'example2', text: 'Example: f(x) = sin(x) → derivative is cos(x). Flat at peaks → derivative crosses zero!', isExample: true, fn: x => Math.sin(x), deriv: x => Math.cos(x), labels: ['f(x) = sin(x)', "f'(x) = cos(x)"] },
                { icon: 'example3', text: 'Example: f(x) = 3x (straight line) → derivative is just a flat line at 3. Constant slope!', isExample: true, fn: x => 3*x*0.3, deriv: x => 0.9, labels: ['f(x) = 3x', "f'(x) = 3 (flat!)"] },
                { icon: '🎯', text: 'After you draw, the correct answer appears in green. See how close you got! Ready?' },
            ],
            'area-catcher': [
                { icon: '📊', text: 'You see a curve with a shaded region underneath. The shaded area IS the integral!' },
                { icon: '🔢', text: 'Look at the shape and estimate the area. Pick the closest answer from 4 choices.' },
                { icon: '💡', text: 'Hint: rectangles are shown to help! Count grid squares or use area formulas (triangles, trapezoids).' },
                { icon: '⚡', text: 'The integral = area under the curve. This is the core idea of calculus!' }
            ],
            'limit-lander': [
                { icon: '🕳️', text: 'A function has a hole — it\'s undefined at one point. But what value does it APPROACH?' },
                { icon: '🔍', text: 'Watch the colored dots approach from both sides. They get closer to the answer!' },
                { icon: '🎯', text: 'Tap the correct limit value from 4 choices. Fast and satisfying!' },
                { icon: '💡', text: 'Limits are about where functions GO, not where they ARE. Even undefined points have limits!' }
            ],
            'rate-racer': [
                { icon: '🚗', text: 'A car drives with varying speed. You see its speed-vs-time graph.' },
                { icon: '📊', text: 'The AREA under the speed graph = total distance traveled! This is the Fundamental Theorem.' },
                { icon: '🔢', text: 'Estimate the area and pick the correct distance from 4 choices.' },
                { icon: '💡', text: 'Speed × time = distance. The integral of velocity IS position change!' }
            ],
            'peak-finder': [
                { icon: '⛰️', text: 'A curve appears. TAP where the peaks (maxima) and valleys (minima) are!' },
                { icon: '📐', text: 'At peaks and valleys, the slope is ZERO. The function stops going up and starts going down (or vice versa).' },
                { icon: '🎯', text: 'Tap directly on the turning points. Get them all to score!' },
                { icon: '💡', text: 'Finding where f\'(x) = 0 is how we find max/min. This is optimization — one of calculus\'s most powerful tools!' }
            ]
        };
        return tutorials[gameType] || [];
    }

    isComplete(gameType) {
        return this.completed[gameType] === true;
    }

    markComplete(gameType) {
        this.completed[gameType] = true;
        this.saveState();
    }

    start(gameType, onComplete) {
        this.currentGame = gameType;
        this.currentStep = 0;
        this.steps = this.getSteps(gameType);
        this.onComplete = onComplete;
        this.render();
    }

    next() {
        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
            this.markComplete(this.currentGame);
            if (this.onComplete) this.onComplete();
            return;
        }
        this.render();
    }

    skip() {
        this.markComplete(this.currentGame);
        if (this.onComplete) this.onComplete();
    }

    render() {
        const step = this.steps[this.currentStep];
        if (!step) return;
        document.getElementById('tutorial-title').textContent = this.getTitle(this.currentGame);
        document.getElementById('tutorial-text').textContent = step.text;

        // Render illustration: either emoji or a canvas example
        const illustrationEl = document.getElementById('tutorial-illustration');
        if (step.isExample) {
            // Draw a mini function + derivative graph
            illustrationEl.textContent = '';
            illustrationEl.style.padding = '0';
            let canvas = illustrationEl.querySelector('canvas');
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.style.cssText = 'width:100%;height:100%;display:block;border-radius:14px;';
                illustrationEl.appendChild(canvas);
            }
            // Size canvas
            const w = illustrationEl.offsetWidth || 280;
            const h = illustrationEl.offsetHeight || 200;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = w * dpr; canvas.height = h * dpr;
            canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
            const ctx = canvas.getContext('2d');
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.drawExample(ctx, w, h, step.fn, step.deriv, step.labels);
        } else {
            illustrationEl.style.padding = '';
            illustrationEl.textContent = step.icon;
            // Remove canvas if present
            const oldCanvas = illustrationEl.querySelector('canvas');
            if (oldCanvas) oldCanvas.remove();
        }

        // Render dots
        const dotsEl = document.getElementById('tutorial-dots');
        dotsEl.innerHTML = this.steps.map((_, i) =>
            `<div class="tutorial-dot ${i === this.currentStep ? 'active' : ''}"></div>`
        ).join('');
        // Update button text
        const nextBtn = document.getElementById('tutorial-next');
        nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Start Playing!' : 'Next';
    }

    drawExample(ctx, w, h, fn, deriv, labels) {
        const topH = h * 0.45, botH = h * 0.45, gap = h * 0.1;
        const pad = 20, xMin = -3, xMax = 3;
        const plotW = w - pad * 2;

        // Background
        ctx.fillStyle = '#0d0d24'; ctx.fillRect(0, 0, w, h);

        // --- TOP: Original function ---
        let fMin = Infinity, fMax = -Infinity;
        for (let x = xMin; x <= xMax; x += 0.1) { const y = fn(x); if (y < fMin) fMin = y; if (y > fMax) fMax = y; }
        const fRange = Math.max(fMax - fMin, 0.5);
        const toFX = x => pad + (x - xMin) / (xMax - xMin) * plotW;
        const toFY = y => 8 + topH - ((y - fMin) / fRange) * (topH - 16);

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = 'bold 10px sans-serif';
        ctx.fillText(labels[0], pad, 12);

        // Zero line
        const fZero = toFY(0);
        if (fZero > 8 && fZero < topH) {
            ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pad, fZero); ctx.lineTo(pad + plotW, fZero); ctx.stroke();
        }

        // Curve
        ctx.strokeStyle = '#00e5cc'; ctx.lineWidth = 2.5; ctx.beginPath();
        let first = true;
        for (let x = xMin; x <= xMax; x += 0.08) {
            const sx = toFX(x), sy = toFY(fn(x));
            if (first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // --- DIVIDER ---
        const divY = topH + gap / 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad, divY); ctx.lineTo(pad + plotW, divY); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('↓ derivative ↓', w / 2, divY + 3); ctx.textAlign = 'left';

        // --- BOTTOM: Derivative ---
        const botStart = topH + gap;
        let dMin = Infinity, dMax = -Infinity;
        for (let x = xMin; x <= xMax; x += 0.1) { const d = deriv(x); if (d < dMin) dMin = d; if (d > dMax) dMax = d; }
        const dRange = Math.max(dMax - dMin, 0.5);
        const toDY = y => botStart + 8 + (botH - 16) - ((y - dMin) / dRange) * (botH - 16);

        // Label
        ctx.fillStyle = 'rgba(0,214,143,0.8)'; ctx.font = 'bold 10px sans-serif';
        ctx.fillText(labels[1], pad, botStart + 12);

        // Zero line
        const dZero = toDY(0);
        if (dZero > botStart + 8 && dZero < botStart + botH) {
            ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pad, dZero); ctx.lineTo(pad + plotW, dZero); ctx.stroke();
        }

        // Derivative curve
        ctx.strokeStyle = '#00d68f'; ctx.lineWidth = 2.5; ctx.beginPath();
        first = true;
        for (let x = xMin; x <= xMax; x += 0.08) {
            const sx = toFX(x), sy = toDY(deriv(x));
            if (first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Annotation arrows connecting steep parts
        ctx.fillStyle = 'rgba(255,217,61,0.6)'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('steep → high', w * 0.75, divY - 5);
        ctx.fillText('flat → zero', w * 0.3, divY - 5);
        ctx.textAlign = 'left';
    }

    getTitle(gameType) {
        const titles = { 'slope-surfer': 'Slope Surfer', 'area-catcher': 'Area Catcher', 'limit-lander': 'Limit Lander' };
        return `How to Play: ${titles[gameType] || ''}`;
    }

    loadState() {
        try {
            const raw = localStorage.getItem('calcRush_tutorial');
            this.completed = raw ? JSON.parse(raw) : {};
        } catch (e) { this.completed = {}; }
    }

    saveState() {
        try { localStorage.setItem('calcRush_tutorial', JSON.stringify(this.completed)); } catch (e) {}
    }
}
