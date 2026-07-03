// Knowledge assessment & adaptive difficulty system
class Assessment {
    constructor() {
        this.concepts = {
            derivative_power: { name: 'Power Rule', category: 'Derivatives', attempts: 0, correct: 0, mastery: 0 },
            derivative_trig: { name: 'Trig Derivatives', category: 'Derivatives', attempts: 0, correct: 0, mastery: 0 },
            derivative_product: { name: 'Product Rule', category: 'Derivatives', attempts: 0, correct: 0, mastery: 0 },
            derivative_chain: { name: 'Chain Rule', category: 'Derivatives', attempts: 0, correct: 0, mastery: 0 },
            integral_basic: { name: 'Basic Integrals', category: 'Integrals', attempts: 0, correct: 0, mastery: 0 },
            integral_area: { name: 'Area Under Curve', category: 'Integrals', attempts: 0, correct: 0, mastery: 0 },
            integral_definite: { name: 'Definite Integrals', category: 'Integrals', attempts: 0, correct: 0, mastery: 0 },
            integral_negative: { name: 'Negative Regions', category: 'Integrals', attempts: 0, correct: 0, mastery: 0 },
            limit_removable: { name: 'Removable Disc.', category: 'Limits', attempts: 0, correct: 0, mastery: 0 },
            limit_onesided: { name: 'One-Sided Limits', category: 'Limits', attempts: 0, correct: 0, mastery: 0 },
            limit_infinity: { name: 'Limits at Infinity', category: 'Limits', attempts: 0, correct: 0, mastery: 0 },
            limit_indeterminate: { name: 'Indeterminate', category: 'Limits', attempts: 0, correct: 0, mastery: 0 },
        };
        this.sessions = [];
        this.load();
    }

    recordAttempt(conceptKey, wasCorrect, accuracy) {
        const c = this.concepts[conceptKey];
        if (!c) return;
        c.attempts++;
        if (wasCorrect) c.correct++;
        // Exponential moving average for mastery
        const alpha = 0.3;
        const score = accuracy > 0.7 ? 1 : accuracy > 0.4 ? 0.5 : 0;
        c.mastery = alpha * score + (1 - alpha) * c.mastery;
    }

    getMastery(conceptKey) {
        return this.concepts[conceptKey]?.mastery || 0;
    }

    getOverallMastery() {
        const vals = Object.values(this.concepts);
        if (vals.length === 0) return 0;
        return vals.reduce((sum, c) => sum + c.mastery, 0) / vals.length;
    }

    getWeakestConcepts(category, n = 3) {
        return Object.entries(this.concepts)
            .filter(([_, c]) => !category || c.category === category)
            .sort((a, b) => a[1].mastery - b[1].mastery)
            .slice(0, n)
            .map(([key, c]) => ({ key, ...c }));
    }

    getRecommendedGame() {
        const categories = ['Derivatives', 'Integrals', 'Limits'];
        let weakest = null, weakestMastery = 1;
        for (const cat of categories) {
            const concepts = Object.values(this.concepts).filter(c => c.category === cat);
            const avg = concepts.reduce((s, c) => s + c.mastery, 0) / concepts.length;
            if (avg < weakestMastery) { weakestMastery = avg; weakest = cat; }
        }
        return weakest === 'Derivatives' ? 'slope-surfer' : weakest === 'Integrals' ? 'area-catcher' : 'limit-lander';
    }

    selectDifficulty(recentAccuracy, timeElapsed) {
        const mastery = this.getOverallMastery();
        const timeFactor = timeElapsed / 30;
        const perfFactor = recentAccuracy > 0.8 ? 0.15 : (recentAccuracy < 0.4 ? -0.15 : 0);
        const d = Math.max(0, Math.min(1, mastery * 0.4 + timeFactor * 0.35 + perfFactor));
        if (d < 0.33) return 'easy';
        if (d < 0.66) return 'medium';
        return 'hard';
    }

    recordSession(game, score, correct, total, bestStreak) {
        this.sessions.push({
            date: Date.now(), game, score,
            accuracy: total > 0 ? correct / total : 0,
            correct, total, bestStreak
        });
        if (this.sessions.length > 50) this.sessions.shift();
        this.save();
    }

    getConceptsByCategory() {
        const result = {};
        for (const [key, c] of Object.entries(this.concepts)) {
            if (!result[c.category]) result[c.category] = [];
            result[c.category].push({ key, ...c });
        }
        return result;
    }

    save() {
        const data = { concepts: this.concepts, sessions: this.sessions, version: 1 };
        try { localStorage.setItem('calcRush_assessment', JSON.stringify(data)); } catch (e) {}
    }

    load() {
        try {
            const raw = localStorage.getItem('calcRush_assessment');
            if (raw) {
                const data = JSON.parse(raw);
                if (data.concepts) {
                    for (const [key, val] of Object.entries(data.concepts)) {
                        if (this.concepts[key]) Object.assign(this.concepts[key], val);
                    }
                }
                if (data.sessions) this.sessions = data.sessions;
            }
        } catch (e) {}
    }
}
