// Haptic, vibration & sound feedback system
// Uses Web Audio API (no external files) + Vibration API
class FeedbackSystem {
    constructor() {
        this.audioCtx = null;
        this.enabled = { sound: true, haptic: true };
        this.volume = 0.3;
        this.loadPreferences();
    }

    // Lazy-init AudioContext (must be after user gesture)
    initAudio() {
        if (this.audioCtx) return;
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { /* no audio support */ }
    }

    // --- HAPTIC / VIBRATION ---
    vibrate(pattern) {
        if (!this.enabled.haptic) return;
        if (navigator.vibrate) navigator.vibrate(pattern);
    }

    hapticLight() { this.vibrate(10); }
    hapticMedium() { this.vibrate(25); }
    hapticHeavy() { this.vibrate([30, 10, 30]); }
    hapticSuccess() { this.vibrate([15, 50, 15]); }
    hapticError() { this.vibrate([50, 30, 80]); }
    hapticPerfect() { this.vibrate([20, 30, 20, 30, 40]); }

    // --- SOUND EFFECTS (synthesized, no files needed) ---
    playTone(freq, duration, type = 'sine', gainVal = null) {
        if (!this.enabled.sound || !this.audioCtx) return;
        const ctx = this.audioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.value = freq;
        const vol = gainVal !== null ? gainVal : this.volume;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }

    playChord(freqs, duration, type = 'sine') {
        for (const f of freqs) this.playTone(f, duration, type, this.volume * 0.6);
    }

    // --- GAME EVENT SOUNDS ---
    soundCorrect() {
        this.initAudio();
        // Bright ascending two-note
        this.playTone(523, 0.12, 'sine'); // C5
        setTimeout(() => this.playTone(659, 0.15, 'sine'), 80); // E5
    }

    soundPerfect() {
        this.initAudio();
        // Triumphant arpeggio
        this.playTone(523, 0.1, 'sine'); // C5
        setTimeout(() => this.playTone(659, 0.1, 'sine'), 60); // E5
        setTimeout(() => this.playTone(784, 0.2, 'sine'), 120); // G5
        setTimeout(() => this.playTone(1047, 0.3, 'sine'), 180); // C6
    }

    soundWrong() {
        this.initAudio();
        // Low descending buzz
        this.playTone(220, 0.15, 'sawtooth', this.volume * 0.3);
        setTimeout(() => this.playTone(180, 0.2, 'sawtooth', this.volume * 0.25), 100);
    }

    soundTick() {
        this.initAudio();
        // Soft click
        this.playTone(800, 0.03, 'square', this.volume * 0.15);
    }

    soundCountdown() {
        this.initAudio();
        // Beep for countdown
        this.playTone(440, 0.1, 'sine', this.volume * 0.4);
    }

    soundGo() {
        this.initAudio();
        // Higher energetic beep
        this.playTone(880, 0.15, 'sine', this.volume * 0.5);
        setTimeout(() => this.playTone(1100, 0.2, 'sine', this.volume * 0.4), 80);
    }

    soundTimerWarning() {
        this.initAudio();
        // Urgent tick
        this.playTone(600, 0.05, 'square', this.volume * 0.2);
    }

    soundGameOver() {
        this.initAudio();
        // Descending three-note
        this.playTone(523, 0.2, 'sine', this.volume * 0.4);
        setTimeout(() => this.playTone(440, 0.2, 'sine', this.volume * 0.35), 200);
        setTimeout(() => this.playTone(349, 0.4, 'sine', this.volume * 0.3), 400);
    }

    soundNewHighScore() {
        this.initAudio();
        // Celebratory fanfare
        this.playTone(523, 0.1, 'sine');
        setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);
        setTimeout(() => this.playTone(784, 0.1, 'sine'), 200);
        setTimeout(() => this.playChord([1047, 1319, 1568], 0.5, 'sine'), 300);
    }

    soundStreak() {
        this.initAudio();
        // Quick ascending chirp
        this.playTone(700, 0.06, 'sine', this.volume * 0.3);
        setTimeout(() => this.playTone(900, 0.08, 'sine', this.volume * 0.3), 50);
    }

    soundButtonTap() {
        this.initAudio();
        this.playTone(600, 0.025, 'sine', this.volume * 0.1);
    }

    // --- COMBINED FEEDBACK PER TIER ---
    onCorrect() { this.soundCorrect(); this.hapticMedium(); }
    onPerfect() { this.soundPerfect(); this.hapticPerfect(); }
    onWrong() { this.soundWrong(); this.hapticError(); }
    onClose() { this.soundCorrect(); this.hapticLight(); }
    onStreak() { this.soundStreak(); this.hapticSuccess(); }
    onCountdown() { this.soundCountdown(); this.hapticLight(); }
    onGo() { this.soundGo(); this.hapticHeavy(); }
    onGameOver() { this.soundGameOver(); this.hapticHeavy(); }
    onHighScore() { this.soundNewHighScore(); this.hapticPerfect(); }
    onTap() { this.soundButtonTap(); this.hapticLight(); }
    onTimerWarning() { this.soundTimerWarning(); this.hapticLight(); }

    // --- PREFERENCES ---
    loadPreferences() {
        try {
            const raw = localStorage.getItem('calcRush_feedback');
            if (raw) Object.assign(this.enabled, JSON.parse(raw));
        } catch (e) {}
    }

    savePreferences() {
        try { localStorage.setItem('calcRush_feedback', JSON.stringify(this.enabled)); } catch (e) {}
    }

    toggleSound() { this.enabled.sound = !this.enabled.sound; this.savePreferences(); }
    toggleHaptic() { this.enabled.haptic = !this.enabled.haptic; this.savePreferences(); }
}
