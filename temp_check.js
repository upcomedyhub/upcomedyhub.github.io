
/* Global Early Network & Error Interceptor */
(function() {
  if (typeof window !== "undefined") {
    // 1. Intercept window.fetch to absorb transient network disconnections
    const _origFetch = window.fetch;
    if (typeof _origFetch === 'function') {
      window.fetch = function(...args) {
        return _origFetch.apply(this, args).catch(function(err) {
          const msg = (err && (err.message || String(err))) || "";
          if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed") || msg.includes("network")) {
            console.warn("Handled network fetch issue gracefully for:", args[0]);
            return new Response(JSON.stringify({ success: false, offline: true, error: msg }), {
              status: 200,
              headers: { "Content-Type": "application/json" }
            });
          }
          throw err;
        });
      };
    }

    // 2. Window error event listener
    window.addEventListener("error", function(e) {
      const msg = (e && (e.message || String(e))) || "";
      if (msg === "Script error." || !msg || msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed")) {
        console.warn("Caught cross-origin/network error early:", msg);
        if (typeof e.preventDefault === "function") e.preventDefault();
        return true;
      }
    });

    // 3. Unhandled promise rejection listener
    window.addEventListener("unhandledrejection", function(e) {
      const reason = e && (e.reason || e);
      const msg = (reason && (reason.message || String(reason))) || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed") || msg.includes("Script error") || msg.includes("timeout")) {
        console.warn("Handled unhandled rejection early:", msg);
        if (typeof e.preventDefault === "function") e.preventDefault();
        return true;
      }
    });

    // 4. Suppress non-fatal Firestore network offline warnings
    const _origError = console.error;
    console.error = function(...args) {
      const str = args.map(a => (typeof a === 'object' ? (a && a.message ? a.message : JSON.stringify(a)) : String(a))).join(' ');
      if (str.includes("Could not reach Cloud Firestore backend") || 
          str.includes("operate in offline mode") || 
          str.includes("@firebase/firestore") ||
          str.includes("Failed to fetch") ||
          str.includes("NetworkError") ||
          str.includes("Load failed")) {
        console.warn("Network notice (handled):", ...args);
        return;
      }
      _origError.apply(console, args);
    };
  }
})();


{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://upcomedyhub.github.io/#website",
      "url": "https://upcomedyhub.github.io/",
      "name": "Zyro",
      "description": "Desi comedy, funny Shorts aur entertainment ka ek hi adda.",
      "inLanguage": "hi-IN",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://upcomedyhub.github.io/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://upcomedyhub.github.io/#organization",
      "name": "Zyro",
      "url": "https://upcomedyhub.github.io/",
      "logo": "https://upcomedyhub.github.io/zyro-logo.png",
      "sameAs": [
        "https://www.youtube.com/@upcomedyhub"
      ]
    }
  ]
}






/* ==================== FUN ZONE ARCADE ENGINE (INLINE SELF-CONTAINED) ==================== */
/**
 * UPComedyHub - Fun Zone Arcade Game Engine
 * Features:
 *  - 100% Procedural Web Audio API sound effects (no external mp3 dependencies)
 *  - Coin Merge Rush (Desi Suika 2048 Physics Drop)
 *  - Turbo Highway Racer (PlayIt Style Traffic Dodger with Horn & Nitro)
 *  - Flappy Desi Comedy
 *  - Call Break Master (4-Player Desi Taash with Trump & Bidding)
 *  - AI Comedy Roast & Lie Detector (Biometric Scanner + Voice Roast)
 *  - AI Infinite Comedy & Movie Quiz
 *  - Desi Gully Cricket (Timing swing, bat thwack, crowd cheer)
 *  - Haptic feedback, XP Leveling, High Scores, Category filters
 */

(function() {
  'use strict';

  // ==========================================
  // 1. PROCEDURAL SOUND SYNTHESIZER (Web Audio API)
  // ==========================================
  const ArcadeAudio = {
    ctx: null,
    enabled: true,

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const saved = localStorage.getItem('upch_arcade_sound');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    },

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('upch_arcade_sound', String(this.enabled));
      return this.enabled;
    },

    vibrate(ms = 30) {
      try {
        if (navigator.vibrate) navigator.vibrate(ms);
      } catch (e) {}
    },

    playCoinDrop() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } catch (e) {}
    },

    playCoinMerge(tier = 1) {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const baseFreq = 440 + Math.min(tier * 65, 800);
        [baseFreq, baseFreq * 1.25, baseFreq * 1.5].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.03);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + idx * 0.03 + 0.12);
          gain.gain.setValueAtTime(0.25, now + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.03 + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.03);
          osc.stop(now + idx * 0.03 + 0.16);
        });
        this.vibrate(25);
      } catch (e) {}
    },

    playCarHorn() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        // Two-tone Indian car / truck horn
        [440, 554].forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.linearRampToValueAtTime(0.18, now + 0.22);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.29);
        });
        this.vibrate([40, 30, 40]);
      } catch (e) {}
    },

    playCrash() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        // White noise explosion burst + low frequency thud
        const bufferSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.linearRampToValueAtTime(150, now + 0.35);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        whiteNoise.start(now);

        // Low pitch boom
        const osc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);
        bassGain.gain.setValueAtTime(0.4, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);

        this.vibrate(120);
      } catch (e) {}
    },

    playFlap() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
        this.vibrate(15);
      } catch (e) {}
    },

    playScore() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
      } catch (e) {}
    },

    playDie() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.28);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.29);
        this.vibrate(80);
      } catch (e) {}
    },

    playCardSnap() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
        this.vibrate(20);
      } catch (e) {}
    },

    playBuzzer() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.43);
        this.vibrate([100, 50, 100]);
      } catch (e) {}
    },

    playFruitChop() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
        this.vibrate(20);
      } catch (e) {}
    },

    playBladeSwish() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.07);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } catch (e) {}
    },

    playBombExplode() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.45);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.46);
        this.vibrate(70);
      } catch (e) {}
    },

    playWaterPour() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [420, 560, 720].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.03);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + idx * 0.03 + 0.08);
          gain.gain.setValueAtTime(0.16, now + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.03 + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.03);
          osc.stop(now + idx * 0.03 + 0.09);
        });
        this.vibrate(15);
      } catch (e) {}
    },

    playBlockPlace() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
        this.vibrate(16);
      } catch (e) {}
    },

    playLineBlast() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [440, 660, 880, 1100].forEach((f, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.03);
          gain.gain.setValueAtTime(0.18, now + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.03 + 0.1);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.03);
          osc.stop(now + idx * 0.03 + 0.11);
        });
        this.vibrate(35);
      } catch (e) {}
    },

    playNeonWin() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.06);
          gain.gain.setValueAtTime(0.2, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.22);
        });
      } catch (e) {}
    },

    playDiceRoll() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        for (let i = 0; i < 6; i++) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(200 + Math.random() * 400, now + i * 0.035);
          gain.gain.setValueAtTime(0.12, now + i * 0.035);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.035 + 0.03);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.035);
          osc.stop(now + i * 0.035 + 0.035);
        }
        this.vibrate(20);
      } catch (e) {}
    },

    playSnakeBite() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
        this.vibrate(50);
      } catch (e) {}
    },

    playLadderClimb() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [330, 440, 554, 659, 880].forEach((f, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + idx * 0.05);
          gain.gain.setValueAtTime(0.18, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.13);
        });
        this.vibrate(30);
      } catch (e) {}
    },

    playFishGulp() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.06);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
        this.vibrate(15);
      } catch (e) {}
    },

    playBlockSlice() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
        this.vibrate(18);
      } catch (e) {}
    },

    playMusicalChord(step = 0) {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
        const freq = scale[step % scale.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
        this.vibrate(20);
      } catch (e) {}
    },

    playRunnerJump() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } catch (e) {}
    },

    playDingSuccess() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.25, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.29);
        });
        this.vibrate([30, 20, 40]);
      } catch (e) {}
    },

    playBatHit() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.07);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        this.vibrate(30);
      } catch (e) {}
    },

    playCrowdCheer() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, now);
        filter.Q.setValueAtTime(1.5, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
      } catch (e) {}
    },

    playTicking() {
      if (!this.enabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.025);
      } catch (e) {}
    }
  };

  // ==========================================
  // 2. ARCADE STAGE & XP CONTROLLER
  // ==========================================
  let activeGameInstance = null;
  let activeGameId = null;

  function getBestScore(id) {
    return parseInt(localStorage.getItem('upch_best_' + id) || '0', 10);
  }

  function saveBestScore(id, score) {
    const current = getBestScore(id);
    if (score > current) {
      localStorage.setItem('upch_best_' + id, String(score));
      return true;
    }
    return false;
  }

  function addPlayerXP(pts = 10) {
    let xp = parseInt(localStorage.getItem('upch_player_xp') || '0', 10);
    xp += pts;
    localStorage.setItem('upch_player_xp', String(xp));
    updatePlayerCard();
  }

  // Daily Streak Counter for Arcade Fun Zone
  function checkDailyStreak() {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
    let streak = parseInt(localStorage.getItem('upch_daily_streak_count') || '0', 10);
    const lastDate = localStorage.getItem('upch_daily_streak_last_date');

    if (!lastDate) {
      streak = 1;
      localStorage.setItem('upch_daily_streak_count', '1');
      localStorage.setItem('upch_daily_streak_last_date', today);
    } else if (lastDate !== today) {
      const lastTime = new Date(lastDate + 'T00:00:00').getTime();
      const todayTime = new Date(today + 'T00:00:00').getTime();
      const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak += 1;
        localStorage.setItem('upch_daily_streak_count', String(streak));
        localStorage.setItem('upch_daily_streak_last_date', today);
        // Award daily streak bonus XP!
        let xp = parseInt(localStorage.getItem('upch_player_xp') || '0', 10);
        xp += 25;
        localStorage.setItem('upch_player_xp', String(xp));
        if (typeof showToast === 'function') {
          setTimeout(() => showToast(`🔥 Daily Streak! ${streak} Din Lagataar! (+25 XP)`), 800);
        }
      } else if (diffDays > 1) {
        streak = 1; // Missed a day, streak resets
        localStorage.setItem('upch_daily_streak_count', '1');
        localStorage.setItem('upch_daily_streak_last_date', today);
      }
    }

    const streakCountEl = document.getElementById('funStreakCount');
    const streakBadgeEl = document.getElementById('funStreakBadge');
    if (streakCountEl) streakCountEl.textContent = streak;
    if (streakBadgeEl) {
      streakBadgeEl.title = `Daily Activity Streak: ${streak} day${streak > 1 ? 's' : ''} consecutive!`;
    }
    return streak;
  }
  window.checkDailyStreak = checkDailyStreak;

  function updatePlayerCard() {
    const xp = parseInt(localStorage.getItem('upch_player_xp') || '0', 10);
    const level = Math.floor(xp / 100) + 1;
    const levelProgress = xp % 100;

    const meta = document.getElementById('funPlayerMeta');
    const fill = document.getElementById('funXpFill');
    if (meta) meta.textContent = `Level ${level} • ${xp} XP`;
    if (fill) fill.style.width = `${levelProgress}%`;

    // Track & update Daily Streak
    checkDailyStreak();

    // Try to sync with logged in user profile if available
    const avatar = document.getElementById('funPlayerAvatar');
    const nameEl = document.getElementById('funPlayerName');
    if (window.currentUser) {
      if (avatar && window.currentUser.photoURL) avatar.src = window.currentUser.photoURL;
      if (nameEl && window.currentUser.displayName) nameEl.textContent = window.currentUser.displayName + ' 🌟';
    }
  }

  window.toggleArcadeSound = function() {
    ArcadeAudio.init();
    const enabled = ArcadeAudio.toggle();
    const label = enabled ? 'Sound ON' : 'Sound OFF';
    const icon = enabled ? '🔊' : '🔇';

    const globalBtn = document.getElementById('arcadeGlobalSoundBtn');
    if (globalBtn) {
      const lbl = document.getElementById('arcadeSoundLabel');
      const icn = document.getElementById('arcadeSoundIcon');
      if (lbl) lbl.textContent = label;
      if (icn) icn.textContent = icon;
    }
    const stageIcon = document.getElementById('funStageSoundIcon');
    if (stageIcon) stageIcon.textContent = icon;
  };

  window.filterArcadeCategory = function(cat, btn) {
    document.querySelectorAll('.arcade-cat-pill').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const cards = document.querySelectorAll('.arcade-game-card');
    cards.forEach(card => {
      const cardCat = card.getAttribute('data-cat') || '';
      if (cat === 'all' || cardCat.includes(cat)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };

  window.launchArcadeGame = function(gameId) {
    ArcadeAudio.init();
    activeGameId = gameId;

    const stageModal = document.getElementById('funStageModal');
    const stageBody = document.getElementById('funStageBody');
    const titleEl = document.getElementById('funStageTitle');
    const scoreEl = document.getElementById('funStageScore');
    const bestEl = document.getElementById('funStageBest');

    if (!stageModal || !stageBody) return;

    if (scoreEl) scoreEl.textContent = '0';
    if (bestEl) bestEl.textContent = String(getBestScore(gameId));

    stageBody.innerHTML = '';
    stageModal.classList.add('active');

    // Title and Runner selection
    switch (gameId) {
      case 'coin_merge':
        if (titleEl) titleEl.innerHTML = '🪙 Coin Merge Rush';
        activeGameInstance = new CoinMergeGame(stageBody);
        break;
      case 'turbo_racer':
        if (titleEl) titleEl.innerHTML = '🏎️ Turbo Highway Racer';
        activeGameInstance = new HighwayRacerGame(stageBody);
        break;
      case 'flappy_desi':
        if (titleEl) titleEl.innerHTML = '🐦 Flappy Desi Comedy';
        activeGameInstance = new FlappyDesiGame(stageBody);
        break;
      case 'call_break':
        if (titleEl) titleEl.innerHTML = '♠️ Call Break Master';
        activeGameInstance = new CallBreakGame(stageBody);
        break;
      case 'ai_roast':
        if (titleEl) titleEl.innerHTML = '🤖 AI Lie Detector & Roast';
        activeGameInstance = new AILieDetectorGame(stageBody);
        break;
      case 'ai_quiz':
        if (titleEl) titleEl.innerHTML = '🧠 AI Comedy & Movie Quiz';
        activeGameInstance = new AIQuizGame(stageBody);
        break;
      case 'cricket':
        if (titleEl) titleEl.innerHTML = '🏏 Desi Gully Cricket';
        activeGameInstance = new GullyCricketGame(stageBody);
        break;
      case 'cut_fruit':
        if (titleEl) titleEl.innerHTML = '🍉 Cut Fruit Ninja';
        activeGameInstance = new CutFruitGame(stageBody);
        break;
      case 'water_sort':
        if (titleEl) titleEl.innerHTML = '🧪 Water Sort Color Puzzle';
        activeGameInstance = new WaterSortGame(stageBody);
        break;
      case 'color_blocks':
        if (titleEl) titleEl.innerHTML = '🧱 Color Block Blast';
        activeGameInstance = new ColorBlocksGame(stageBody);
        break;
      case 'neon_tictactoe':
        if (titleEl) titleEl.innerHTML = '⭕ Neon Tic Tac Toe';
        activeGameInstance = new NeonTicTacToeGame(stageBody);
        break;
      case 'runner_dash':
        if (titleEl) titleEl.innerHTML = '🏃 Desi Street Runner';
        activeGameInstance = new RunnerDashGame(stageBody);
        break;
      case 'snake_ladder':
        if (titleEl) titleEl.innerHTML = '🎲 Snake & Ladder 3D';
        activeGameInstance = new SnakeLadderGame(stageBody);
        break;
      case 'ludo_master':
        if (titleEl) titleEl.innerHTML = '🔴 Ludo Master Classic';
        activeGameInstance = new LudoMasterGame(stageBody);
        break;
      case 'tiny_fish':
        if (titleEl) titleEl.innerHTML = '🐟 Tiny Fish Feeding Frenzy';
        activeGameInstance = new TinyFishGame(stageBody);
        break;
      case 'stack_all':
        if (titleEl) titleEl.innerHTML = '🥞 Stack All Tower';
        activeGameInstance = new StackAllGame(stageBody);
        break;
      default:
        console.warn('Unknown game id:', gameId);
        exitArcadeGame();
    }
  };

  window.exitArcadeGame = function() {
    if (activeGameInstance && typeof activeGameInstance.destroy === 'function') {
      activeGameInstance.destroy();
    }
    activeGameInstance = null;
    activeGameId = null;

    const stageModal = document.getElementById('funStageModal');
    if (stageModal) stageModal.classList.remove('active');
    updatePlayerCard();
  };

  window.restartCurrentGame = function() {
    if (activeGameId) {
      if (activeGameInstance && typeof activeGameInstance.destroy === 'function') {
        activeGameInstance.destroy();
      }
      window.launchArcadeGame(activeGameId);
    }
  };

  function showGameOverOverlay(container, score, gameId, onReplay) {
    const isNewBest = saveBestScore(gameId, score);
    addPlayerXP(Math.max(10, Math.floor(score / 5)));
    const best = getBestScore(gameId);

    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.innerHTML = `
      <div class="game-over-title">GAME OVER! 💥</div>
      <div class="game-over-subtitle">${isNewBest ? '🔥 NAYA RECORD BANAYA HAI! 🔥' : 'Bohot badiya khele bhai!'}</div>
      <div class="game-over-stats">
        <div style="font-size:12px;color:#aaa">FINAL SCORE</div>
        <div class="game-over-score">${score}</div>
        <div class="game-over-best">🏆 BEST: ${best}</div>
      </div>
      <div class="game-over-actions">
        <button type="button" class="game-btn-replay" id="replayBtn">🔄 Play Again</button>
        <button type="button" class="game-btn-exit" onclick="exitArcadeGame()">Exit</button>
      </div>
    `;
    container.appendChild(overlay);
    overlay.querySelector('#replayBtn').onclick = () => {
      overlay.remove();
      onReplay();
    };
  }

  // ==========================================
  // GAME 1: 🪙 COIN MERGE RUSH (Realistic 3D Embossed Gold Coins & Physics)
  // ==========================================
  class CoinMergeGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.gameOver = false;
      this.coins = [];
      this.particles = [];
      this.floatingTexts = [];
      this.nextTier = 0;
      this.dropperX = 180;
      this.dangerTimer = 0;
      this.canDrop = true;
      this.highestTierReached = 0;

      // Realistic Minted Currency Tiers (Image 6 Inspired: 3D Gold, Bronze & Silver Coins)
      this.TIERS = [
        { label: '₹1', r: 18, type: 'silver', rim: '#94a3b8', core1: '#f8fafc', core2: '#64748b', textCol: '#1e293b', val: 1 },
        { label: '₹2', r: 23, type: 'bronze', rim: '#ea580c', core1: '#fed7aa', core2: '#9a3412', textCol: '#431407', val: 2 },
        { label: '₹5', r: 28, type: 'brass', rim: '#d97706', core1: '#fef08a', core2: '#b45309', textCol: '#451a03', val: 5 },
        { label: '₹10', r: 34, type: 'bimetal', rim: '#f59e0b', core1: '#f1f5f9', core2: '#94a3b8', textCol: '#0f172a', val: 10 },
        { label: '₹20', r: 40, type: 'emerald', rim: '#eab308', core1: '#6ee7b7', core2: '#047857', textCol: '#022c22', val: 20 },
        { label: '₹50', r: 46, type: 'ocean', rim: '#f59e0b', core1: '#67e8f9', core2: '#0e7490', textCol: '#083344', val: 50 },
        { label: '₹100', r: 52, type: 'royal', rim: '#fbbf24', core1: '#d8b4fe', core2: '#7e22ce', textCol: '#3b0764', val: 100 },
        { label: '₹200', r: 58, type: 'ruby', rim: '#fbbf24', core1: '#fda4af', core2: '#be123c', textCol: '#4c0519', val: 200 },
        { label: '₹500', r: 65, type: 'gold24k', rim: '#f59e0b', core1: '#fef08a', core2: '#b45309', textCol: '#78350f', val: 500 },
        { label: '₹1000', r: 72, type: 'sovereign', rim: '#f59e0b', core1: '#fffbeb', core2: '#d97706', textCol: '#451a03', val: 1000 },
        { label: '₹2000', r: 80, type: 'magenta_ingot', rim: '#fbbf24', core1: '#fbcfe8', core2: '#db2777', textCol: '#831843', val: 2000 },
        { label: '💎', r: 88, type: 'diamond', rim: '#7dd3fc', core1: '#e0f2fe', core2: '#0284c7', textCol: '#0369a1', val: 10000 }
      ];

      this.initUI();
      this.startLoop();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'game-canvas-wrap';

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'game-canvas';
      this.canvas.width = 360;
      this.canvas.height = 540;
      this.ctx = this.canvas.getContext('2d');
      this.wrap.appendChild(this.canvas);
      this.container.appendChild(this.wrap);

      this.pickNextTier();

      // Controls
      const handleMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = (clientX - rect.left) * (this.canvas.width / rect.width);
        this.dropperX = Math.max(34, Math.min(326, x));
      };

      const handleRelease = (e) => {
        if (!this.canDrop || this.gameOver) return;
        this.dropCoin();
      };

      this.canvas.addEventListener('mousemove', handleMove);
      this.canvas.addEventListener('touchmove', handleMove, { passive: false });
      this.canvas.addEventListener('click', handleRelease);
      this.canvas.addEventListener('touchend', handleRelease);
    }

    pickNextTier() {
      // Dynamic Spawn: Players get ₹1, ₹2, ₹5, ₹10, and ₹20 as they score!
      const roll = Math.random();
      if (this.highestTierReached >= 4 && roll > 0.88) {
        this.nextTier = 4; // ₹20
      } else if (this.highestTierReached >= 3 && roll > 0.72) {
        this.nextTier = 3; // ₹10
      } else if (roll > 0.45) {
        this.nextTier = 2; // ₹5
      } else if (roll > 0.20) {
        this.nextTier = 1; // ₹2
      } else {
        this.nextTier = 0; // ₹1
      }
    }

    dropCoin() {
      this.canDrop = false;
      const tierObj = this.TIERS[this.nextTier];
      this.coins.push({
        x: this.dropperX,
        y: 65,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 2.2,
        r: tierObj.r,
        tier: this.nextTier,
        rotation: (Math.random() - 0.5) * 0.2
      });
      ArcadeAudio.playCoinDrop();
      this.pickNextTier();

      setTimeout(() => {
        this.canDrop = true;
      }, 480);
    }

    addSparkles(x, y, color = '#f59e0b', count = 12) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 25 + Math.random() * 15,
          maxLife: 40,
          size: 2 + Math.random() * 3.5,
          color
        });
      }
    }

    addFloatingText(x, y, text, color = '#fef08a') {
      this.floatingTexts.push({
        x,
        y,
        text,
        color,
        life: 40,
        maxLife: 40
      });
    }

    startLoop() {
      const GRAVITY = 0.42;
      const RESTITUTION = 0.26;
      const FRICTION = 0.985;
      const DANGER_Y = 100;

      const loop = () => {
        if (this.destroyed) return;

        // Physics Update
        for (let i = 0; i < this.coins.length; i++) {
          const c = this.coins[i];
          c.vy += GRAVITY;
          c.vx *= FRICTION;
          c.vy *= FRICTION;
          c.x += c.vx;
          c.y += c.vy;

          // Wall bounds
          if (c.x - c.r < 14) {
            c.x = 14 + c.r;
            c.vx = -c.vx * RESTITUTION;
          }
          if (c.x + c.r > this.canvas.width - 14) {
            c.x = this.canvas.width - 14 - c.r;
            c.vx = -c.vx * RESTITUTION;
          }
          // Floor bound
          if (c.y + c.r > this.canvas.height - 10) {
            c.y = this.canvas.height - 10 - c.r;
            c.vy = -c.vy * RESTITUTION;
            if (Math.abs(c.vy) < 0.2) c.vy = 0;
          }
        }

        // Coin to Coin Collision & Merging
        let mergedThisFrame = false;
        for (let i = 0; i < this.coins.length; i++) {
          for (let j = i + 1; j < this.coins.length; j++) {
            const a = this.coins[i];
            const b = this.coins[j];
            if (!a || !b) continue;

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy);
            const minDist = a.r + b.r;

            if (dist < minDist) {
              // Same tier merge!
              if (a.tier === b.tier && a.tier < this.TIERS.length - 1 && !mergedThisFrame) {
                mergedThisFrame = true;
                const newTier = a.tier + 1;
                const midX = (a.x + b.x) / 2;
                const midY = (a.y + b.y) / 2;

                const earnedVal = this.TIERS[newTier].val;
                this.score += earnedVal;
                if (newTier > this.highestTierReached) {
                  this.highestTierReached = newTier;
                }

                const scoreEl = document.getElementById('funStageScore');
                if (scoreEl) scoreEl.textContent = String(this.score);

                this.addSparkles(midX, midY, this.TIERS[newTier].rim, 16);
                this.addFloatingText(midX, midY - 10, '+' + this.TIERS[newTier].label + ' MERGE!');

                this.coins.splice(j, 1);
                this.coins.splice(i, 1);

                this.coins.push({
                  x: midX,
                  y: midY,
                  vx: (a.vx + b.vx) * 0.4,
                  vy: -1.8,
                  r: this.TIERS[newTier].r,
                  tier: newTier,
                  rotation: 0
                });

                ArcadeAudio.playCoinMerge(newTier);
                break;
              }

              // Elastic impulse separation
              const overlap = minDist - dist;
              const nx = dist === 0 ? 0 : dx / dist;
              const ny = dist === 0 ? 1 : dy / dist;

              a.x -= nx * overlap * 0.5;
              a.y -= ny * overlap * 0.5;
              b.x += nx * overlap * 0.5;
              b.y += ny * overlap * 0.5;

              const kx = a.vx - b.vx;
              const ky = a.vy - b.vy;
              const p = 2 * (nx * kx + ny * ky) / 2;

              a.vx -= p * 0.5 * nx * RESTITUTION;
              a.vy -= p * 0.5 * ny * RESTITUTION;
              b.vx += p * 0.5 * nx * RESTITUTION;
              b.vy += p * 0.5 * ny * RESTITUTION;
            }
          }
        }

        // Update Particles
        for (let p = this.particles.length - 1; p >= 0; p--) {
          const pt = this.particles[p];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life--;
          if (pt.life <= 0) this.particles.splice(p, 1);
        }

        // Update Floating Texts
        for (let t = this.floatingTexts.length - 1; t >= 0; t--) {
          const ft = this.floatingTexts[t];
          ft.y -= 0.8;
          ft.life--;
          if (ft.life <= 0) this.floatingTexts.splice(t, 1);
        }

        // Danger line check
        let isOverDanger = false;
        for (const c of this.coins) {
          if (c.y - c.r < DANGER_Y && Math.abs(c.vy) < 0.4) {
            isOverDanger = true;
            break;
          }
        }
        if (isOverDanger) {
          this.dangerTimer++;
          if (this.dangerTimer > 190 && !this.gameOver) {
            this.triggerGameOver();
          }
        } else {
          this.dangerTimer = Math.max(0, this.dangerTimer - 1);
        }

        this.render();

        if (!this.gameOver) {
          this.raf = requestAnimationFrame(loop);
        }
      };
      this.raf = requestAnimationFrame(loop);
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // 1. Luxury Casino / Vault Backdrop (Deep Navy & Indigo Gradient with Arch Glow)
      const bgGrad = ctx.createRadialGradient(180, 260, 20, 180, 270, 320);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.6, '#090d16');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Gold Metallic Frame Pillars
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 0, 12, this.canvas.height);
      ctx.fillRect(this.canvas.width - 12, 0, 12, this.canvas.height);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(10, 0, 2, this.canvas.height);
      ctx.fillRect(this.canvas.width - 12, 0, 2, this.canvas.height);

      // Vault Bottom Floor Plate
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(12, this.canvas.height - 12, this.canvas.width - 24, 12);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(12, this.canvas.height - 12, this.canvas.width - 24, 2);

      // Danger Line
      ctx.strokeStyle = this.dangerTimer > 60 ? '#ef4444' : 'rgba(239,68,68,0.35)';
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(14, 100);
      ctx.lineTo(346, 100);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top guide dropper line
      if (this.canDrop && !this.gameOver) {
        ctx.strokeStyle = 'rgba(56,189,248,0.3)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(this.dropperX, 20);
        ctx.lineTo(this.dropperX, 530);
        ctx.stroke();
        ctx.setLineDash([]);

        // Preview Coin at Dropper
        this.drawRealisticCoin(ctx, this.dropperX, 42, this.nextTier, 0.78);
      }

      // 2. Render All Coins with 3D Embossed Metallic Styling
      for (const c of this.coins) {
        this.drawRealisticCoin(ctx, c.x, c.y, c.tier, 1);
      }

      // 3. Render Particles
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Render Floating Text Popups
      for (const ft of this.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = ft.life / ft.maxLife;
        ctx.fillStyle = ft.color;
        ctx.font = '900 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }
    }

    drawRealisticCoin(ctx, x, y, tierIdx, scale = 1) {
      const t = this.TIERS[tierIdx];
      const r = t.r * scale;

      ctx.save();
      ctx.translate(x, y);

      // Deep Shadow beneath the coin
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 8 * scale;
      ctx.shadowOffsetY = 4 * scale;

      // 1. Outer Serrated Rim (Milled Coin Gear Edge Pattern)
      ctx.fillStyle = t.rim;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Milled Teeth Marks around the outer rim
      ctx.shadowColor = 'transparent';
      const teethCount = Math.max(16, Math.floor(r * 1.4));
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1.2 * scale;
      for (let i = 0; i < teethCount; i++) {
        const angle = (i / teethCount) * Math.PI * 2;
        const x1 = Math.cos(angle) * (r - 2.5 * scale);
        const y1 = Math.sin(angle) * (r - 2.5 * scale);
        const x2 = Math.cos(angle) * r;
        const y2 = Math.sin(angle) * r;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 2. Beveled Outer Golden Ring
      const rimGrad = ctx.createLinearGradient(-r, -r, r, r);
      rimGrad.addColorStop(0, '#ffffff');
      rimGrad.addColorStop(0.3, t.rim);
      rimGrad.addColorStop(0.7, '#78350f');
      rimGrad.addColorStop(1, '#451a03');

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r - 3 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 3. Concentric Groove Ring (True Minted Coin Inset)
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(0, 0, r - 5.5 * scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.arc(0, 0, r - 7 * scale, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Center Face Core (Radial 3D Metallic Gradient)
      const coreGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r - 8 * scale);
      coreGrad.addColorStop(0, t.core1);
      coreGrad.addColorStop(0.7, t.core2);
      coreGrad.addColorStop(1, '#1e1b18');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r - 8 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 5. Decorative Mint Stars ⭐
      if (r > 20 * scale && t.label !== '💎') {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = `bold ${Math.floor(r * 0.26)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', -r * 0.55, 0);
        ctx.fillText('★', r * 0.55, 0);
      }

      // 6. 3D Embossed Denomination Text
      const fontSize = Math.max(9, Math.floor(r * (t.label.length > 3 ? 0.44 : 0.56)));
      ctx.font = `900 ${fontSize}px "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Drop shadow (bottom bevel)
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillText(t.label, 1.2 * scale, 1.8 * scale);

      // Highlight (top bevel)
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(t.label, -0.8 * scale, -0.8 * scale);

      // Main face text
      ctx.fillStyle = t.textCol;
      ctx.fillText(t.label, 0, 0.4 * scale);

      // 7. Specular Gloss Sheen Arc across top-right
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.2, -r * 0.35, r * 0.55, r * 0.22, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    triggerGameOver() {
      this.gameOver = true;
      ArcadeAudio.playDie();
      showGameOverOverlay(this.wrap, this.score, 'coin_merge', () => {
        window.launchArcadeGame('coin_merge');
      });
    }

    destroy() {
      this.destroyed = true;
      if (this.raf) cancelAnimationFrame(this.raf);
    }
  }

  // ==========================================
  // GAME 2: 🏎️ TURBO HIGHWAY RACER (PlayIt Style Dodger)
  // ==========================================
  class HighwayRacerGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.gameOver = false;
      this.playerLane = 1; // 0: Left, 1: Center, 2: Right
      this.playerX = 180;
      this.lanes = [90, 180, 270];
      this.speed = 7;
      this.nitroActive = false;
      this.roadOffset = 0;
      this.traffic = [];
      this.coins = [];
      this.spawnTimer = 0;

      this.initUI();
      this.startLoop();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'game-canvas-wrap';

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'game-canvas';
      this.canvas.width = 360;
      this.canvas.height = 540;
      this.ctx = this.canvas.getContext('2d');
      this.wrap.appendChild(this.canvas);

      // On-screen touch controller bar
      const bar = document.createElement('div');
      bar.className = 'game-touch-bar';
      bar.innerHTML = `
        <button type="button" class="game-touch-btn" id="btnLeft">⬅️</button>
        <button type="button" class="game-touch-btn" id="btnHorn">📢 HORN</button>
        <button type="button" class="game-touch-btn" id="btnNitro" style="color:#f59e0b">⚡ NITRO</button>
        <button type="button" class="game-touch-btn" id="btnRight">➡️</button>
      `;
      this.wrap.appendChild(bar);
      this.container.appendChild(this.wrap);

      // Handlers
      bar.querySelector('#btnLeft').onclick = () => this.shiftLane(-1);
      bar.querySelector('#btnRight').onclick = () => this.shiftLane(1);
      bar.querySelector('#btnHorn').onclick = () => this.honkHorn();

      const nitroBtn = bar.querySelector('#btnNitro');
      const startNitro = (e) => { e.preventDefault(); this.nitroActive = true; };
      const stopNitro = (e) => { e.preventDefault(); this.nitroActive = false; };
      nitroBtn.addEventListener('mousedown', startNitro);
      nitroBtn.addEventListener('mouseup', stopNitro);
      nitroBtn.addEventListener('touchstart', startNitro, { passive: false });
      nitroBtn.addEventListener('touchend', stopNitro);

      // Keyboard support
      this.keyHandler = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') this.shiftLane(-1);
        if (e.key === 'ArrowRight' || e.key === 'd') this.shiftLane(1);
        if (e.key === 'h' || e.key === ' ') this.honkHorn();
      };
      window.addEventListener('keydown', this.keyHandler);
    }

    shiftLane(dir) {
      if (this.gameOver) return;
      this.playerLane = Math.max(0, Math.min(2, this.playerLane + dir));
      ArcadeAudio.vibrate(20);
    }

    honkHorn() {
      ArcadeAudio.playCarHorn();
      // Horn makes obstacle in player lane swerve away!
      for (const t of this.traffic) {
        if (t.lane === this.playerLane && t.y < 380 && t.y > 100) {
          t.lane = t.lane === 0 ? 1 : t.lane === 2 ? 1 : (Math.random() > 0.5 ? 0 : 2);
          t.honked = true;
          break;
        }
      }
    }

    startLoop() {
      const loop = () => {
        if (this.destroyed) return;

        const currentSpeed = this.nitroActive ? this.speed * 1.8 : this.speed;
        this.roadOffset = (this.roadOffset + currentSpeed) % 60;
        this.score += this.nitroActive ? 2 : 1;

        const scoreEl = document.getElementById('funStageScore');
        if (scoreEl && this.score % 10 === 0) scoreEl.textContent = String(this.score);

        // Smooth steer towards lane center
        const targetX = this.lanes[this.playerLane];
        this.playerX += (targetX - this.playerX) * 0.25;

        // Spawn traffic
        this.spawnTimer += currentSpeed;
        if (this.spawnTimer > 180) {
          this.spawnTimer = 0;
          this.spawnTraffic();
        }

        // Update traffic
        for (let i = this.traffic.length - 1; i >= 0; i--) {
          const t = this.traffic[i];
          t.y += currentSpeed - t.baseSpeed;
          t.x += (this.lanes[t.lane] - t.x) * 0.15;

          // Check collision with player (player is at y: 440)
          const pBox = { x: this.playerX - 22, y: 440, w: 44, h: 72 };
          const tBox = { x: t.x - 22, y: t.y, w: 44, h: t.height };

          if (this.checkCollision(pBox, tBox)) {
            this.triggerGameOver();
            return;
          }

          if (t.y > 600) {
            this.traffic.splice(i, 1);
          }
        }

        // Render Road, Traffic & Car
        this.render();

        if (!this.gameOver) {
          this.raf = requestAnimationFrame(loop);
        }
      };
      this.raf = requestAnimationFrame(loop);
    }

    spawnTraffic() {
      const lane = Math.floor(Math.random() * 3);
      const types = [
        { name: 'Auto', color: '#eab308', h: 60, speed: 2, icon: '🛺' },
        { name: 'Truck', color: '#16a34a', h: 88, speed: 3.5, icon: '🚚' },
        { name: 'Taxi', color: '#f59e0b', h: 68, speed: 4.5, icon: '🚕' },
        { name: 'Police', color: '#3b82f6', h: 70, speed: 5.5, icon: '🚓' }
      ];
      const selected = types[Math.floor(Math.random() * types.length)];

      this.traffic.push({
        lane,
        x: this.lanes[lane],
        y: -100,
        height: selected.h,
        baseSpeed: selected.speed,
        color: selected.color,
        icon: selected.icon
      });
    }

    checkCollision(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 360, 540);

      // Asphalt Road Background
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 360, 540);

      // Road Curbs
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, 0, 20, 540);
      ctx.fillRect(340, 0, 20, 540);

      // Dashed Lane Dividers
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.setLineDash([30, 30]);
      ctx.lineDashOffset = -this.roadOffset;

      ctx.beginPath();
      ctx.moveTo(135, 0);
      ctx.lineTo(135, 540);
      ctx.moveTo(225, 0);
      ctx.lineTo(225, 540);
      ctx.stroke();
      ctx.setLineDash([]);

      // Traffic Vehicles
      for (const t of this.traffic) {
        ctx.save();
        ctx.fillStyle = t.color;
        ctx.beginPath();
        ctx.roundRect(t.x - 22, t.y, 44, t.height, 8);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(t.x - 18, t.y + 12, 36, 16);

        // Icon
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(t.icon, t.x, t.y + t.height * 0.75);
        ctx.restore();
      }

      // Player Car (Red Sports Car)
      ctx.save();
      const px = this.playerX;
      const py = 440;

      // Nitro exhaust flames
      if (this.nitroActive) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(px - 14, py + 72);
        ctx.lineTo(px, py + 92 + Math.random() * 15);
        ctx.lineTo(px + 14, py + 72);
        ctx.fill();
      }

      // Car Body
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(px - 22, py, 44, 72, 10);
      ctx.fill();

      // Roof & Windshields
      ctx.fillStyle = '#111827';
      ctx.fillRect(px - 18, py + 16, 36, 16);
      ctx.fillRect(px - 18, py + 48, 36, 10);

      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px - 20, py + 2, 8, 4);
      ctx.fillRect(px + 12, py + 2, 8, 4);

      // Tail lights
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px - 20, py + 68, 8, 4);
      ctx.fillRect(px + 12, py + 68, 8, 4);

      ctx.restore();
    }

    triggerGameOver() {
      this.gameOver = true;
      ArcadeAudio.playCrash();
      showGameOverOverlay(this.wrap, this.score, 'turbo_racer', () => {
        window.launchArcadeGame('turbo_racer');
      });
    }

    destroy() {
      this.destroyed = true;
      if (this.raf) cancelAnimationFrame(this.raf);
      if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
    }
  }

  // ==========================================
  // GAME 3: 🐦 FLAPPY DESI COMEDY
  // ==========================================
  class FlappyDesiGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.gameOver = false;
      this.birdY = 240;
      this.velocity = 0;
      this.pipes = [];
      this.timer = 0;

      this.initUI();
      this.startLoop();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'game-canvas-wrap';

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'game-canvas';
      this.canvas.width = 360;
      this.canvas.height = 540;
      this.ctx = this.canvas.getContext('2d');
      this.wrap.appendChild(this.canvas);
      this.container.appendChild(this.wrap);

      const flap = () => {
        if (this.gameOver) return;
        this.velocity = -6.8;
        ArcadeAudio.playFlap();
      };

      this.canvas.addEventListener('mousedown', flap);
      this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); }, { passive: false });
    }

    startLoop() {
      const loop = () => {
        if (this.destroyed) return;

        // Bird Physics
        this.velocity += 0.38;
        this.birdY += this.velocity;

        // Ground / Ceiling crash
        if (this.birdY > 500 || this.birdY < 10) {
          this.triggerGameOver();
          return;
        }

        // Spawn Pipes
        this.timer++;
        if (this.timer > 110) {
          this.timer = 0;
          const topH = 80 + Math.random() * 180;
          const gap = 135;
          this.pipes.push({ x: 370, topH, gap, passed: false });
        }

        // Move Pipes & Check Collision
        for (let i = this.pipes.length - 1; i >= 0; i--) {
          const p = this.pipes[i];
          p.x -= 2.6;

          // Check pass
          if (!p.passed && p.x + 55 < 80) {
            p.passed = true;
            this.score++;
            ArcadeAudio.playScore();
            const scoreEl = document.getElementById('funStageScore');
            if (scoreEl) scoreEl.textContent = String(this.score);
          }

          // Hitbox test (Bird at x: 80, r: 16)
          if (p.x < 100 && p.x + 55 > 60) {
            if (this.birdY - 14 < p.topH || this.birdY + 14 > p.topH + p.gap) {
              this.triggerGameOver();
              return;
            }
          }

          if (p.x < -60) this.pipes.splice(i, 1);
        }

        this.render();

        if (!this.gameOver) {
          this.raf = requestAnimationFrame(loop);
        }
      };
      this.raf = requestAnimationFrame(loop);
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 360, 540);

      // Sky Background
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, 360, 540);

      // Clouds
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(80, 80, 35, 0, Math.PI * 2);
      ctx.arc(120, 80, 45, 0, Math.PI * 2);
      ctx.arc(280, 120, 40, 0, Math.PI * 2);
      ctx.fill();

      // Pipes (Desi Comedy Columns)
      for (const p of this.pipes) {
        ctx.fillStyle = '#15803d';
        // Top pipe
        ctx.fillRect(p.x, 0, 55, p.topH);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(p.x - 3, p.topH - 22, 61, 22);

        // Bottom pipe
        const botY = p.topH + p.gap;
        ctx.fillStyle = '#15803d';
        ctx.fillRect(p.x, botY, 55, 540 - botY);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(p.x - 3, botY, 61, 22);
      }

      // Ground
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 510, 360, 30);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, 506, 360, 6);

      // Bird
      ctx.save();
      ctx.translate(80, this.birdY);
      ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, this.velocity * 0.08)));

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(10, -4);
      ctx.lineTo(24, 2);
      ctx.lineTo(10, 8);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(6, -6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(7, -6, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    triggerGameOver() {
      this.gameOver = true;
      ArcadeAudio.playDie();
      showGameOverOverlay(this.wrap, this.score, 'flappy_desi', () => {
        window.launchArcadeGame('flappy_desi');
      });
    }

    destroy() {
      this.destroyed = true;
      if (this.raf) cancelAnimationFrame(this.raf);
    }
  }

  // ==========================================
  // GAME 4: ♠️ CALL BREAK MASTER (4-Player Desi Taash)
  // ==========================================
  class CallBreakGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.userBid = 3;
      this.userTricks = 0;
      this.aiBids = [3, 2, 4];
      this.aiTricks = [0, 0, 0];
      this.currentTrick = [];
      this.leadSuit = null;
      this.myTurn = false;

      this.initUI();
      this.dealCards();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'cb-container';
      this.wrap.innerHTML = `
        <div class="cb-player-slot cb-slot-north"><span>👤 Guddu Bhaiya: Bid <b id="cbBidN">?</b> | Won <b id="cbWonN">0</b></span></div>
        <div class="cb-player-slot cb-slot-west"><span>👤 Ramesh: Bid <b id="cbBidW">?</b> | Won <b id="cbWonW">0</b></span></div>
        <div class="cb-player-slot cb-slot-east"><span>👤 Munna: Bid <b id="cbBidE">?</b> | Won <b id="cbWonE">0</b></span></div>
        <div class="cb-player-slot cb-slot-south"><span>🌟 You: Bid <b id="cbBidS">?</b> | Won <b id="cbWonS">0</b></span></div>

        <!-- Table Trick Center -->
        <div class="cb-trick-table" id="cbTrickTable"></div>

        <!-- Hand Cards Row -->
        <div class="cb-hand-row" id="cbHandRow"></div>

        <!-- Bidding Dialog Overlay -->
        <div class="cb-bid-overlay" id="cbBidOverlay">
          <h3 style="font-size:18px;font-weight:900;color:#fff;margin-bottom:6px">♠️ Call Break: Apni Bid Chuno!</h3>
          <p style="font-size:12px;color:#aaa">Aap kitne haath (tricks) jeetoge?</p>
          <div class="cb-bid-grid">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<button type="button" class="cb-bid-btn" data-bid="${n}">${n}</button>`).join('')}
          </div>
        </div>
      `;
      this.container.appendChild(this.wrap);

      this.wrap.querySelectorAll('.cb-bid-btn').forEach(btn => {
        btn.onclick = () => {
          this.userBid = parseInt(btn.getAttribute('data-bid'), 10);
          this.startRound();
        };
      });
    }

    dealCards() {
      ArcadeAudio.playCardSnap();
      // Generate standard deck
      const suits = ['♠', '♥', '♦', '♣'];
      const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      const deck = [];
      suits.forEach(s => ranks.forEach((r, idx) => deck.push({ suit: s, rank: r, value: idx + 2 })));
      // Shuffle
      deck.sort(() => Math.random() - 0.5);

      this.myCards = deck.slice(0, 13).sort((a, b) => {
        if (a.suit === b.suit) return b.value - a.value;
        return a.suit === '♠' ? -1 : 1;
      });
    }

    startRound() {
      const overlay = this.wrap.querySelector('#cbBidOverlay');
      if (overlay) overlay.style.display = 'none';

      document.getElementById('cbBidS').textContent = String(this.userBid);
      document.getElementById('cbBidN').textContent = String(this.aiBids[0]);
      document.getElementById('cbBidW').textContent = String(this.aiBids[1]);
      document.getElementById('cbBidE').textContent = String(this.aiBids[2]);

      this.renderHand();
      this.myTurn = true;
    }

    renderHand() {
      const row = this.wrap.querySelector('#cbHandRow');
      if (!row) return;
      row.innerHTML = '';

      this.myCards.forEach((c, idx) => {
        const isRed = c.suit === '♥' || c.suit === '♦';
        const cardEl = document.createElement('div');
        cardEl.className = `cb-hand-card ${isRed ? 'cb-card-red' : 'cb-card-black'}`;
        cardEl.innerHTML = `<span>${c.rank}</span><span>${c.suit}</span>`;
        cardEl.onclick = () => this.playUserCard(idx);
        row.appendChild(cardEl);
      });
    }

    playUserCard(idx) {
      if (!this.myTurn) return;
      const card = this.myCards.splice(idx, 1)[0];
      this.myTurn = false;
      this.renderHand();

      ArcadeAudio.playCardSnap();
      this.currentTrick.push({ player: 'You', card });
      this.leadSuit = card.suit;
      this.renderTrick();

      // AI opponents play
      setTimeout(() => this.playAITurns(), 600);
    }

    playAITurns() {
      ['Guddu', 'Ramesh', 'Munna'].forEach((name) => {
        const suits = ['♠', '♥', '♦', '♣'];
        const randomSuit = Math.random() > 0.4 ? this.leadSuit : suits[Math.floor(Math.random() * 4)];
        const ranks = ['7', '9', '10', 'J', 'Q', 'K', 'A'];
        const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
        const card = { suit: randomSuit, rank: randomRank, value: Math.floor(Math.random() * 12) + 2 };
        this.currentTrick.push({ player: name, card });
      });

      this.renderTrick();
      ArcadeAudio.playCardSnap();

      setTimeout(() => this.resolveTrick(), 900);
    }

    renderTrick() {
      const table = this.wrap.querySelector('#cbTrickTable');
      if (!table) return;
      table.innerHTML = '';
      this.currentTrick.forEach((t, i) => {
        const isRed = t.card.suit === '♥' || t.card.suit === '♦';
        const cardEl = document.createElement('div');
        cardEl.className = `cb-played-card ${isRed ? 'cb-card-red' : 'cb-card-black'}`;
        cardEl.style.transform = `rotate(${(i - 1.5) * 18}deg) translate(${i * 12}px, 0)`;
        cardEl.innerHTML = `<span>${t.card.rank}</span><span>${t.card.suit}</span>`;
        table.appendChild(cardEl);
      });
    }

    resolveTrick() {
      // Determine winner (Spade is highest trump, else highest lead suit)
      let winningPlay = this.currentTrick[0];
      for (let i = 1; i < this.currentTrick.length; i++) {
        const candidate = this.currentTrick[i];
        if (candidate.card.suit === '♠' && winningPlay.card.suit !== '♠') {
          winningPlay = candidate;
        } else if (candidate.card.suit === winningPlay.card.suit && candidate.card.value > winningPlay.card.value) {
          winningPlay = candidate;
        }
      }

      if (winningPlay.player === 'You') {
        this.userTricks++;
        document.getElementById('cbWonS').textContent = String(this.userTricks);
        ArcadeAudio.playDingSuccess();
      }

      setTimeout(() => {
        this.currentTrick = [];
        this.renderTrick();

        if (this.myCards.length === 0) {
          this.endGame();
        } else {
          this.myTurn = true;
        }
      }, 700);
    }

    endGame() {
      const points = this.userTricks >= this.userBid ? this.userBid * 10 + (this.userTricks - this.userBid) : -this.userBid * 10;
      this.score = Math.max(0, points);
      const scoreEl = document.getElementById('funStageScore');
      if (scoreEl) scoreEl.textContent = String(this.score);

      showGameOverOverlay(this.wrap, this.score, 'call_break', () => {
        window.launchArcadeGame('call_break');
      });
    }

    destroy() {}
  }

  // ==========================================
  // GAME 5: 🤖 AI COMEDY ROAST & LIE DETECTOR
  // ==========================================
  class AILieDetectorGame {
    constructor(container) {
      this.container = container;
      this.scanning = false;
      this.statements = [
        'Main roz subah 5 baje uthkar jogging karta hoon.',
        'Maine aaj tak kabhi kisi se jhooth nahi bola!',
        'Main 10th class me poore district me topper tha.',
        'Main phone me reels sirf 5 minute dekhta hoon.',
        'Maine kabhi gym ki subscription lekar paise barbaad nahi kiye.'
      ];
      this.initUI();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'ld-container';
      this.wrap.innerHTML = `
        <div class="ld-header">
          <h3>🤖 AI Lie Detector &amp; Roast</h3>
          <p style="font-size:12px;color:#aaa">Apna daawa likho aur biometric scan karke sachai jaano!</p>
        </div>

        <div class="ld-screen">
          <div class="ld-pulse-line" id="ldPulse">
            <svg viewBox="0 0 300 32" style="width:100%;height:32px;stroke:#38bdf8;fill:none;stroke-width:2">
              <path d="M0,16 L80,16 L95,4 L110,28 L125,8 L140,24 L150,16 L300,16"></path>
            </svg>
          </div>
          <div id="ldVerdict" style="display:none" class="ld-verdict"></div>
          <div id="ldRoastBox" class="ld-roast-box">
            👉 Apne doston ke samne koi bhi jhooth bolo aur neeche <b>Fingerprint</b> dabakar scan karo!
          </div>
        </div>

        <!-- Scanner Fingerprint Button -->
        <button type="button" class="ld-scanner-btn" id="ldScanBtn" title="Hold to scan">
          <span>👆</span>
        </button>
        <div style="text-align:center;font-size:12px;color:#888;margin-bottom:12px">FINGERPRINT DABAYE RAKHO (HOLD)</div>

        <!-- Inputs & Preset Chips -->
        <div class="ld-input-row">
          <div class="ld-quick-chips">
            ${this.statements.map(s => `<button type="button" class="ld-chip" onclick="document.getElementById('ldInput').value='${s}'">${s.slice(0, 26)}...</button>`).join('')}
          </div>
          <input type="text" class="ld-input" id="ldInput" placeholder="Apna statement yahan likho..." value="${this.statements[0]}">
        </div>
      `;
      this.container.appendChild(this.wrap);

      const btn = this.wrap.querySelector('#ldScanBtn');
      const startScan = (e) => { e.preventDefault(); this.startScanning(); };
      const stopScan = (e) => { e.preventDefault(); this.stopScanning(); };

      btn.addEventListener('mousedown', startScan);
      btn.addEventListener('mouseup', stopScan);
      btn.addEventListener('touchstart', startScan, { passive: false });
      btn.addEventListener('touchend', stopScan);
    }

    startScanning() {
      if (this.scanning) return;
      this.scanning = true;
      const btn = this.wrap.querySelector('#ldScanBtn');
      btn.classList.add('scanning');

      const roastBox = this.wrap.querySelector('#ldRoastBox');
      const verdict = this.wrap.querySelector('#ldVerdict');
      verdict.style.display = 'none';
      roastBox.innerHTML = '⚡ AI Brainwaves &amp; Heartbeat analyze ho rahi hai... ⏳';

      ArcadeAudio.playTicking();
      this.scanTimer = setTimeout(() => {
        this.evaluateStatement();
      }, 1800);
    }

    stopScanning() {
      if (!this.scanning) return;
      this.scanning = false;
      const btn = this.wrap.querySelector('#ldScanBtn');
      btn.classList.remove('scanning');
      if (this.scanTimer) clearTimeout(this.scanTimer);
    }

    async evaluateStatement() {
      this.stopScanning();
      const input = this.wrap.querySelector('#ldInput');
      const text = input ? input.value.trim() : 'Mera statement';
      const isLie = Math.random() > 0.25; // 75% chance of funny Lie verdict

      const verdictEl = this.wrap.querySelector('#ldVerdict');
      const roastBox = this.wrap.querySelector('#ldRoastBox');

      if (isLie) {
        ArcadeAudio.playBuzzer();
        verdictEl.className = 'ld-verdict lie';
        verdictEl.innerHTML = '🚨 100% MAHA-JHOOTH DETECTED! 🚨';
      } else {
        ArcadeAudio.playDingSuccess();
        verdictEl.className = 'ld-verdict truth';
        verdictEl.innerHTML = '✅ SACHAI (SURPRISINGLY TRUE!)';
      }
      verdictEl.style.display = 'block';

      // Fallback comedy roasts
      const lieRoasts = [
        `"Bhai rehem karo! Tumhare is jhooth se AI ke processor me dhuwan nikal gaya! 😂"`,
        `"Itna bada jhooth toh Bollywood ki filmein bhi nahi bolti bhai! 🤣"`,
        `"Bhai tumhare chehre ke heartbeat aur camera AI bata rahe hain ki ye 100% feka gaya hai! 💀"`
      ];
      const truthRoasts = [
        `"Arey baap re! Pehli baar machine ne kisi ka sach pakda hai! Tumhe 21 topon ki salami! 🫡"`,
        `"Kudrat ka karishma! Sach bolte hue pakde gaye bhai! Lallantop! 🌟"`
      ];

      let roast = isLie ? lieRoasts[Math.floor(Math.random() * lieRoasts.length)] : truthRoasts[Math.floor(Math.random() * truthRoasts.length)];

      roastBox.innerHTML = `<b>AI Roast:</b> ${roast} <br><button type="button" class="arcade-sound-toggle" style="margin-top:8px" id="speakRoastBtn">🔊 Bolkar Sunao</button>`;

      const speakBtn = roastBox.querySelector('#speakRoastBtn');
      if (speakBtn) {
        speakBtn.onclick = () => {
          if (typeof window.speakAIText === 'function') {
            window.speakAIText(roast);
          }
        };
      }

      addPlayerXP(15);
    }

    destroy() {
      if (this.scanTimer) clearTimeout(this.scanTimer);
    }
  }

  // ==========================================
  // GAME 6: 🧠 AI INFINITE COMEDY & MOVIE QUIZ
  // ==========================================
  class AIQuizGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.qIndex = 0;
      this.timeLeft = 15;
      this.timerInterval = null;

      this.questions = [
        { q: 'Hera Pheri film me Baburao ka pura naam kya tha?', options: ['Baburao Ganpatrao Apte', 'Baburao Ram Gopal Varma', 'Baburao Shinde', 'Baburao Deshmukh'], answer: 0 },
        { q: '"Teja main hoon, mark idhar hai" kis film ka iconic dialogue hai?', options: ['Sholay', 'Andaz Apna Apna', 'Golmaal', 'Dhamaal'], answer: 1 },
        { q: 'Gangs of Wasseypur me Ramadhir Singh kis cheez ko mana karte hain?', options: ['Chai peene se', 'Cinema dekhne se', 'Gaanja peene se', 'Gaadi chalane se'], answer: 1 },
        { q: 'Munna Bhai M.B.B.S me Circuit ka asli naam kya tha?', options: ['Sarkeshwar', 'Balkeshwar', 'Murli Prasad', 'Rameshwar'], answer: 0 },
        { q: '"Chhoti bacchi ho kya?" dialogue kis actor ka famous meme bana?', options: ['Tiger Shroff', 'Varun Dhawan', 'Ranveer Singh', 'Kartik Aaryan'], answer: 0 }
      ];

      this.initUI();
      this.loadQuestion();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'quiz-container';
      this.wrap.innerHTML = `
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" id="quizFill"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#aaa;margin-bottom:8px">
          <span id="quizNum">Sawal 1/5</span>
          <span id="quizTimerText">⏱️ 15s</span>
        </div>
        <div class="quiz-card" id="quizQuestion">Loading question...</div>
        <div class="quiz-options" id="quizOptions"></div>
      `;
      this.container.appendChild(this.wrap);
    }

    loadQuestion() {
      if (this.qIndex >= this.questions.length) {
        this.triggerGameOver();
        return;
      }

      const q = this.questions[this.qIndex];
      const numEl = document.getElementById('quizNum');
      const qEl = document.getElementById('quizQuestion');
      const optsEl = document.getElementById('quizOptions');

      if (numEl) numEl.textContent = `Sawal ${this.qIndex + 1}/${this.questions.length}`;
      if (qEl) qEl.textContent = q.q;
      if (optsEl) {
        optsEl.innerHTML = '';
        q.options.forEach((opt, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'quiz-opt-btn';
          btn.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;
          btn.onclick = () => this.handleAnswer(idx, btn);
          optsEl.appendChild(btn);
        });
      }

      this.startTimer();
    }

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timeLeft = 15;
      const fill = document.getElementById('quizFill');
      const timerText = document.getElementById('quizTimerText');

      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        if (fill) fill.style.width = `${(this.timeLeft / 15) * 100}%`;
        if (timerText) timerText.textContent = `⏱️ ${this.timeLeft}s`;
        ArcadeAudio.playTicking();

        if (this.timeLeft <= 0) {
          clearInterval(this.timerInterval);
          this.handleAnswer(-1, null);
        }
      }, 1000);
    }

    handleAnswer(selectedIdx, btnEl) {
      if (this.timerInterval) clearInterval(this.timerInterval);
      const q = this.questions[this.qIndex];
      const opts = this.wrap.querySelectorAll('.quiz-opt-btn');

      opts.forEach(b => (b.disabled = true));

      if (selectedIdx === q.answer) {
        if (btnEl) btnEl.classList.add('correct');
        this.score += 20 + this.timeLeft * 2;
        ArcadeAudio.playDingSuccess();
      } else {
        if (btnEl) btnEl.classList.add('wrong');
        if (opts[q.answer]) opts[q.answer].classList.add('correct');
        ArcadeAudio.playBuzzer();
      }

      const scoreEl = document.getElementById('funStageScore');
      if (scoreEl) scoreEl.textContent = String(this.score);

      setTimeout(() => {
        this.qIndex++;
        this.loadQuestion();
      }, 1200);
    }

    triggerGameOver() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      showGameOverOverlay(this.wrap, this.score, 'ai_quiz', () => {
        window.launchArcadeGame('ai_quiz');
      });
    }

    destroy() {
      if (this.timerInterval) clearInterval(this.timerInterval);
    }
  }

  // ==========================================
  // GAME 7: 🏏 PREMIER LEAGUE SUPER OVER CRICKET (Realistic 3D Stadium & Physics)
  // ==========================================
  class GullyCricketGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.wickets = 0;
      this.maxWickets = 2;
      this.totalBalls = 6; // Super Over
      this.ballsLeft = 6;
      this.target = 22; // Need 22 off 6 balls
      this.ballState = 'idle'; // 'idle', 'bowling', 'hit', 'celebrating'
      this.ballX = 180;
      this.ballY = 140;
      this.ballZ = 0; // Simulated height
      this.pitchTargetX = 180;
      this.pitchTargetY = 380;
      this.bowlerSpeed = 7.5;
      this.deliveryType = 'yorker';
      this.selectedShot = 'lofted'; // 'lofted', 'pull', 'drive', 'helicopter'
      this.particles = [];
      this.timingRing = 0;
      this.timingActive = false;
      this.bannerText = '';
      this.bannerColor = '#22c55e';
      this.bannerTimer = 0;
      this.commentary = '🔥 SUPER OVER: Jeetne ke liye 6 balls me 22 runs chahiye!';

      this.BOWLERS = [
        { name: 'J. Bumrah', type: 'yorker', speedText: '148 km/h • Toe-Crusher Yorker', color: '#38bdf8' },
        { name: 'M. Starc', type: 'inswinger', speedText: '152 km/h • Lethal Inswing', color: '#f87171' },
        { name: 'R. Khan', type: 'spin', speedText: '96 km/h • Sharp Mystery Googly', color: '#a855f7' },
        { name: 'H. Pandya', type: 'bouncer', speedText: '138 km/h • Heavy Bouncer', color: '#fbbf24' },
        { name: 'D. Bravo', type: 'slower', speedText: '112 km/h • Deceptive Slower Ball', color: '#34d399' }
      ];

      this.initUI();
      this.startLoop();
      setTimeout(() => this.bowlNextBall(), 800);
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'cricket-wrap';

      // Top Match HUD
      const topHud = document.createElement('div');
      topHud.className = 'cricket-top-hud';
      topHud.innerHTML = `
        <div>RUNS: <b id="crkScore" style="color:#22c55e;font-size:15px">0</b>/<b id="crkWkts">0</b></div>
        <div class="cricket-target-pill" id="crkTarget">TARGET: 22</div>
        <div>BALLS: <b id="crkBalls" style="color:#f59e0b;font-size:15px">6</b></div>
      `;
      this.wrap.appendChild(topHud);

      // Canvas 360x540
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'game-canvas';
      this.canvas.width = 360;
      this.canvas.height = 540;
      this.ctx = this.canvas.getContext('2d');
      this.wrap.appendChild(this.canvas);

      // Commentary Ticker
      this.commBox = document.createElement('div');
      this.commBox.className = 'cricket-commentary-bar';
      this.commBox.id = 'crkComm';
      this.commBox.textContent = this.commentary;
      this.wrap.appendChild(this.commBox);

      // Big Pop Banner
      this.banner = document.createElement('div');
      this.banner.className = 'cricket-banner';
      this.wrap.appendChild(this.banner);

      // 4 Dynamic Batting Shot Buttons
      const shotsBar = document.createElement('div');
      shotsBar.className = 'cricket-shots-bar';
      shotsBar.innerHTML = `
        <button type="button" class="cricket-shot-btn" id="shotLofted"><span>🚀</span><span>Lofted 6</span></button>
        <button type="button" class="cricket-shot-btn" id="shotPull"><span>⚡</span><span>Pull Shot</span></button>
        <button type="button" class="cricket-shot-btn" id="shotDrive"><span>💫</span><span>Cover Drive</span></button>
        <button type="button" class="cricket-shot-btn" id="shotHeli"><span>🔥</span><span>Helicopter</span></button>
      `;
      this.wrap.appendChild(shotsBar);
      this.container.appendChild(this.wrap);

      // Listeners
      shotsBar.querySelector('#shotLofted').onclick = () => this.hitShot('lofted');
      shotsBar.querySelector('#shotPull').onclick = () => this.hitShot('pull');
      shotsBar.querySelector('#shotDrive').onclick = () => this.hitShot('drive');
      shotsBar.querySelector('#shotHeli').onclick = () => this.hitShot('helicopter');

      // Tapping canvas also swings default shot
      this.canvas.onclick = () => this.hitShot(this.selectedShot);
    }

    bowlNextBall() {
      if (this.ballsLeft <= 0 || this.wickets >= this.maxWickets) {
        this.evaluateMatchResult();
        return;
      }

      this.ballState = 'bowling';
      this.ballX = 180;
      this.ballY = 130;
      this.ballZ = 0;
      this.timingRing = 38;
      this.timingActive = true;

      // Pick bowler & delivery
      const bObj = this.BOWLERS[Math.floor(Math.random() * this.BOWLERS.length)];
      this.currentBowler = bObj;
      this.deliveryType = bObj.type;

      // Pitch target coords
      if (this.deliveryType === 'yorker') {
        this.pitchTargetX = 176 + (Math.random() - 0.5) * 16;
        this.pitchTargetY = 440;
        this.bowlerSpeed = 8.8;
      } else if (this.deliveryType === 'bouncer') {
        this.pitchTargetX = 168 + (Math.random() - 0.5) * 20;
        this.pitchTargetY = 320;
        this.bowlerSpeed = 7.8;
      } else if (this.deliveryType === 'spin') {
        this.pitchTargetX = 195;
        this.pitchTargetY = 360;
        this.bowlerSpeed = 6.2;
      } else if (this.deliveryType === 'inswinger') {
        this.pitchTargetX = 165;
        this.pitchTargetY = 370;
        this.bowlerSpeed = 8.2;
      } else {
        // Slower
        this.pitchTargetX = 180;
        this.pitchTargetY = 360;
        this.bowlerSpeed = 5.2;
      }

      this.ballsLeft--;
      document.getElementById('crkBalls').textContent = String(this.ballsLeft);
      this.setCommentary(`🎯 ${bObj.name} bowling: ${bObj.speedText}`);
    }

    hitShot(shotType) {
      if (this.ballState !== 'bowling') return;

      this.selectedShot = shotType;
      this.timingActive = false;
      const distFromCrease = Math.abs(this.ballY - 450);

      ArcadeAudio.playBatHit();

      // Timing accuracy
      if (distFromCrease < 20) {
        // PERFECT TIMING!
        const isSix = shotType === 'lofted' || shotType === 'helicopter' || (Math.random() > 0.35);
        if (isSix) {
          const runs = 6;
          this.score += runs;
          this.ballState = 'hit';
          this.addFireworks(this.ballX, 150, '#38bdf8');
          ArcadeAudio.playCrowdCheer();
          this.showBanner(shotType === 'helicopter' ? '🚁 MAHA-HELICOPTER SIX! +6' : '🚀 108M MASSIVE SIX! +6', '#38bdf8');
          this.setCommentary(`💥 Ball gayi stadium ke paar! Bhai ne kya shot maara hai! (+6)`);
          this.launchBallInAir(shotType, 6);
        } else {
          this.score += 4;
          this.ballState = 'hit';
          this.showBanner('⚡ ROCKET BOUNDARY FOUR! +4', '#22c55e');
          this.setCommentary(`🔥 Goli ki tarah nikli ball boundary ke paar! (+4)`);
          this.launchBallInAir(shotType, 4);
        }
      } else if (distFromCrease < 42) {
        // GOOD TIMING
        this.score += 4;
        this.ballState = 'hit';
        this.showBanner('🔥 CRACKING FOUR! +4', '#eab308');
        this.setCommentary(`👏 Khubsurat shot! Fielder ke beech se 4 runs!`);
        this.launchBallInAir(shotType, 4);
      } else if (distFromCrease < 70) {
        // EDGED / EARLY / LATE
        const edgeRuns = Math.random() > 0.5 ? 2 : 1;
        this.score += edgeRuns;
        this.ballState = 'hit';
        this.showBanner(`🏃 QUICK ${edgeRuns} RUNS!`, '#cbd5e1');
        this.setCommentary(`Balle ka kinara laga par safe! 2 run bhag kar liye.`);
        this.launchBallInAir(shotType, edgeRuns);
      } else {
        // MISSED: OUT OR BOWLED
        this.ballState = 'out';
        this.wickets++;
        ArcadeAudio.playCrash();
        if (this.ballY > 440) {
          this.showBanner('💥 CLEAN BOWLED! STUMPS FLYING!', '#ef4444');
          this.setCommentary(`😱 Dande ukhad gaye! Bowled out!`);
        } else {
          this.showBanner('❌ CAUGHT AT DEEP MIDWICKET!', '#ef4444');
          this.setCommentary(`Hawa me utha diya shot aur fielder ne catch pakad liya!`);
        }
      }

      this.updateHUD();

      // Check early chase win
      if (this.score >= this.target) {
        setTimeout(() => this.evaluateMatchResult(), 1400);
        return;
      }

      setTimeout(() => this.bowlNextBall(), 1800);
    }

    launchBallInAir(shotType, runs) {
      this.ballTargetX = shotType === 'pull' ? 40 : shotType === 'drive' ? 320 : 180;
      this.ballTargetY = runs === 6 ? -60 : 40;
    }

    addFireworks(x, y, color = '#f59e0b') {
      for (let i = 0; i < 24; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 6;
        this.particles.push({
          x,
          y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          life: 30,
          maxLife: 30,
          color
        });
      }
    }

    showBanner(text, color) {
      this.banner.textContent = text;
      this.banner.style.color = color;
      this.banner.style.display = 'block';
      setTimeout(() => {
        this.banner.style.display = 'none';
      }, 1500);
    }

    setCommentary(msg) {
      this.commentary = msg;
      if (this.commBox) this.commBox.textContent = msg;
    }

    updateHUD() {
      const sEl = document.getElementById('crkScore');
      if (sEl) sEl.textContent = String(this.score);
      const wEl = document.getElementById('crkWkts');
      if (wEl) wEl.textContent = String(this.wickets);
      const scoreEl = document.getElementById('funStageScore');
      if (scoreEl) scoreEl.textContent = String(this.score);

      const req = Math.max(0, this.target - this.score);
      const tEl = document.getElementById('crkTarget');
      if (tEl) tEl.textContent = req === 0 ? '🏆 TARGET CHASED!' : `NEED ${req} IN ${this.ballsLeft}b`;
    }

    evaluateMatchResult() {
      this.ballState = 'idle';
      const isWon = this.score >= this.target;

      if (isWon) {
        ArcadeAudio.playDingSuccess();
        this.showBanner('🏆 CHAMPIONS! SUPER OVER WON! 🏆', '#38bdf8');
        this.setCommentary(`🎉 Balle Balle! Super Over Cup jeet liya!`);
      } else {
        ArcadeAudio.playDie();
        this.showBanner('💔 MATCH DRAW / LOST! AGLE MATCH ME DEKHTE HAIN!', '#ef4444');
        this.setCommentary(`Khel achha tha bhai! Agli baar trophy apni hogi.`);
      }

      setTimeout(() => {
        showGameOverOverlay(this.wrap, this.score, 'cricket', () => {
          window.launchArcadeGame('cricket');
        });
      }, 1800);
    }

    startLoop() {
      const loop = () => {
        if (this.destroyed) return;

        // Ball movement in air / on pitch
        if (this.ballState === 'bowling') {
          this.ballY += this.bowlerSpeed;

          // Curve / Spin physics
          if (this.deliveryType === 'spin' && this.ballY > this.pitchTargetY) {
            this.ballX -= 2.2; // sharp turn into batsman
          } else if (this.deliveryType === 'inswinger') {
            this.ballX += 0.8;
          }

          // Shrink timing circle towards pitch
          if (this.timingRing > 4) this.timingRing -= 1.2;

          // Ball reached keeper / unhit
          if (this.ballY > 520) {
            this.ballState = 'idle';
            this.showBanner('DOT BALL ❌', '#94a3b8');
            this.setCommentary('Dot ball nikal gayi! Batsman timing miss kar gaya.');
            setTimeout(() => this.bowlNextBall(), 1500);
          }
        } else if (this.ballState === 'hit') {
          // Ball traveling into stands
          this.ballX += (this.ballTargetX - this.ballX) * 0.12;
          this.ballY += (this.ballTargetY - this.ballY) * 0.12;
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          if (p.life <= 0) this.particles.splice(i, 1);
        }

        this.render();
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 360, 540);

      // 1. Stadium Night Sky & Floodlights
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 180);
      skyGrad.addColorStop(0, '#030a16');
      skyGrad.addColorStop(1, '#0c1e38');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 360, 180);

      // Stadium Stands & Cheering Crowd Silhouettes
      ctx.fillStyle = '#0f2442';
      ctx.beginPath();
      ctx.arc(180, 240, 220, Math.PI, 0);
      ctx.fill();

      // Floodlight Towers
      [30, 330].forEach(lx => {
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(lx, 40, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 2. Outfield Grass (Lush Green with cut lawn stripes)
      const grassGrad = ctx.createLinearGradient(0, 140, 0, 540);
      grassGrad.addColorStop(0, '#15803d');
      grassGrad.addColorStop(1, '#166534');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, 140, 360, 400);

      // 3. Perspective Turf Pitch Strip
      ctx.fillStyle = '#d97706'; // Clay turf
      ctx.beginPath();
      ctx.moveTo(150, 140);
      ctx.lineTo(210, 140);
      ctx.lineTo(250, 490);
      ctx.lineTo(110, 490);
      ctx.closePath();
      ctx.fill();

      // Crease Chalk Lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;

      // Bowler Crease (Top)
      ctx.beginPath();
      ctx.moveTo(146, 170);
      ctx.lineTo(214, 170);
      ctx.stroke();

      // Batting Popping Crease (Bottom)
      ctx.beginPath();
      ctx.moveTo(116, 455);
      ctx.lineTo(244, 455);
      ctx.stroke();

      // Return Crease marks
      ctx.beginPath();
      ctx.moveTo(125, 435);
      ctx.lineTo(125, 475);
      ctx.moveTo(235, 435);
      ctx.lineTo(235, 475);
      ctx.stroke();

      // 4. Stumps & Bails
      // Batsman Stumps (Bottom)
      ctx.fillStyle = '#fef08a';
      [174, 180, 186].forEach(sx => {
        ctx.fillRect(sx, 460, 3, 22);
      });
      // Bail
      ctx.fillRect(173, 458, 16, 2.5);

      // 5. Bowler Silhouette (Top)
      if (this.ballState === 'bowling' && this.ballY < 200) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(180, 120, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(177, 128, 6, 14);
      }

      // 6. Timing Circle Ring on Pitch
      if (this.timingActive && this.ballState === 'bowling') {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.pitchTargetX, this.pitchTargetY, Math.max(6, this.timingRing), 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(245,158,11,0.2)';
        ctx.fill();
      }

      // 7. Batsman Character (Bottom)
      ctx.save();
      const batAngle = this.ballState === 'hit' ? -Math.PI / 3 : 0.2;
      ctx.translate(155, 440);

      // Pads & Legs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, 12, 6, 18);
      ctx.fillRect(4, 12, 6, 18);

      // Body (India Blue Jersey)
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-8, -10, 20, 22);

      // Helmet (Dark Navy with Grill)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(2, -16, 8, 0, Math.PI * 2);
      ctx.fill();

      // Cricket Bat
      ctx.rotate(batAngle);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(8, -6, 6, 32); // Blade
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(9, -14, 4, 8); // Grip
      ctx.restore();

      // 8. Cricket Ball (Red leather with white seam & 3D shadow)
      if (this.ballState === 'bowling' || this.ballState === 'hit') {
        const ballSize = 6 + (this.ballY / 540) * 4;

        // Ball Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY + 4, ballSize * 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Leather Ball
        ctx.fillStyle = '#dc2626';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, ballSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // White Seam
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, ballSize, -0.4, 0.4);
        ctx.stroke();
      }

      // 9. Particle Celebrations
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    destroy() {
      this.destroyed = true;
      if (this.raf) cancelAnimationFrame(this.raf);
    }
  }

  // ==========================================
  // GAME 8: 🍉 CUT FRUIT NINJA (From Uploaded Screenshot)
  // ==========================================
  class CutFruitGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.lives = 3;
      this.gameOver = false;
      this.fruits = [];
      this.halfFruits = [];
      this.splatters = [];
      this.bladeTrail = [];
      this.comboCount = 0;
      this.comboTimer = 0;
      this.spawnTimer = 0;
      this.bannerText = '';
      this.bannerLife = 0;

      this.FRUIT_TYPES = [
        { name: 'Watermelon', icon: '🍉', r: 30, color: '#ef4444', pts: 10 },
        { name: 'Orange', icon: '🍊', r: 26, color: '#f97316', pts: 15 },
        { name: 'Pineapple', icon: '🍍', r: 28, color: '#eab308', pts: 20 },
        { name: 'Apple', icon: '🍎', r: 24, color: '#dc2626', pts: 15 },
        { name: 'Banana', icon: '🍌', r: 25, color: '#fef08a', pts: 15 },
        { name: 'Bomb', icon: '💣', r: 26, color: '#111827', isBomb: true }
      ];

      this.initUI();
      this.startLoop();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'game-canvas-wrap';

      // HUD Header: Lives & Score
      const hud = document.createElement('div');
      hud.className = 'cricket-hud';
      hud.innerHTML = `
        <div style="font-size:16px">🍉 Slice Fruits!</div>
        <div id="cfLives" style="font-size:18px">❤️❤️❤️</div>
        <div style="font-size:14px">Score: <b id="cfScore" style="color:#22c55e">0</b></div>
      `;
      this.wrap.appendChild(hud);

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'game-canvas';
      this.canvas.width = 360;
      this.canvas.height = 540;
      this.ctx = this.canvas.getContext('2d');
      this.wrap.appendChild(this.canvas);
      this.container.appendChild(this.wrap);

      // Touch & Mouse Blade Swipe Listener
      let isSwiping = false;

      const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: (clientX - rect.left) * (this.canvas.width / rect.width),
          y: (clientY - rect.top) * (this.canvas.height / rect.height)
        };
      };

      const startSwipe = (e) => {
        if (this.gameOver) return;
        isSwiping = true;
        const p = getPos(e);
        this.bladeTrail = [p];
        ArcadeAudio.playBladeSwish();
      };

      const moveSwipe = (e) => {
        if (!isSwiping || this.gameOver) return;
        const p = getPos(e);
        this.bladeTrail.push(p);
        if (this.bladeTrail.length > 8) this.bladeTrail.shift();
        this.checkBladeCollisions(this.bladeTrail[this.bladeTrail.length - 2], p);
      };

      const endSwipe = () => {
        isSwiping = false;
        this.bladeTrail = [];
      };

      this.canvas.addEventListener('mousedown', startSwipe);
      this.canvas.addEventListener('mousemove', moveSwipe);
      window.addEventListener('mouseup', endSwipe);

      this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startSwipe(e); }, { passive: false });
      this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); moveSwipe(e); }, { passive: false });
      window.addEventListener('touchend', endSwipe);
    }

    checkBladeCollisions(p1, p2) {
      if (!p1 || !p2) return;
      for (let i = this.fruits.length - 1; i >= 0; i--) {
        const f = this.fruits[i];
        if (f.sliced) continue;

        // Distance from point to line segment
        const dist = this.distToSegment({ x: f.x, y: f.y }, p1, p2);
        if (dist < f.r) {
          this.sliceFruit(f, i, p1, p2);
        }
      }
    }

    distToSegment(p, v, w) {
      const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
      if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
      let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    }

    sliceFruit(f, idx, p1, p2) {
      f.sliced = true;
      this.fruits.splice(idx, 1);

      if (f.isBomb) {
        ArcadeAudio.playBombExplode();
        this.lives = 0;
        this.updateHUD();
        this.triggerGameOver();
        return;
      }

      ArcadeAudio.playFruitChop();
      this.comboCount++;
      this.comboTimer = 25;
      const pts = f.pts * (this.comboCount > 1 ? this.comboCount : 1);
      this.score += pts;
      const scoreEl = document.getElementById('funStageScore');
      if (scoreEl) scoreEl.textContent = String(this.score);
      this.updateHUD();

      if (this.comboCount > 1) {
        this.bannerText = `${this.comboCount}x COMBO! 🔥 +${pts}`;
        this.bannerLife = 35;
      }

      // Juice Splatter Particles
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 5;
        this.splatters.push({
          x: f.x,
          y: f.y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          r: 3 + Math.random() * 4,
          color: f.color,
          life: 25,
          maxLife: 25
        });
      }

      // Create 2 sliced halves
      const sliceAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const perp = sliceAngle + Math.PI / 2;

      this.halfFruits.push({
        x: f.x,
        y: f.y,
        vx: f.vx + Math.cos(perp) * 3,
        vy: f.vy - 1.5,
        r: f.r,
        icon: f.icon,
        angle: f.angle,
        vRot: -0.1,
        life: 45
      });
      this.halfFruits.push({
        x: f.x,
        y: f.y,
        vx: f.vx - Math.cos(perp) * 3,
        vy: f.vy - 1.5,
        r: f.r,
        icon: f.icon,
        angle: f.angle,
        vRot: 0.1,
        life: 45
      });
    }

    spawnFruit() {
      const count = 1 + (Math.random() > 0.6 ? 1 : 0);
      for (let c = 0; c < count; c++) {
        const isBomb = Math.random() < 0.18;
        const type = isBomb
          ? this.FRUIT_TYPES.find(t => t.isBomb)
          : this.FRUIT_TYPES[Math.floor(Math.random() * (this.FRUIT_TYPES.length - 1))];

        const x = 50 + Math.random() * 260;
        const vx = (180 - x) * 0.015 + (Math.random() - 0.5) * 1.5;
        const vy = -12.5 - Math.random() * 3.5;

        this.fruits.push({
          ...type,
          x,
          y: 535,
          vx,
          vy,
          angle: 0,
          vRot: (Math.random() - 0.5) * 0.1,
          sliced: false
        });
      }
    }

    updateHUD() {
      const lEl = document.getElementById('cfLives');
      if (lEl) {
        let hearts = '';
        for (let i = 0; i < 3; i++) {
          hearts += i < this.lives ? '❤️' : '🖤';
        }
        lEl.textContent = hearts;
      }
      const sEl = document.getElementById('cfScore');
      if (sEl) sEl.textContent = String(this.score);
    }

    startLoop() {
      const loop = () => {
        if (this.destroyed) return;

        // Spawn timer
        this.spawnTimer++;
        if (this.spawnTimer > 65) {
          this.spawnTimer = 0;
          this.spawnFruit();
        }

        // Combo timer
        if (this.comboTimer > 0) {
          this.comboTimer--;
          if (this.comboTimer === 0) this.comboCount = 0;
        }

        // Update Fruits
        for (let i = this.fruits.length - 1; i >= 0; i--) {
          const f = this.fruits[i];
          f.vy += 0.32; // Gravity
          f.x += f.vx;
          f.y += f.vy;
          f.angle += f.vRot;

          // Dropped past bottom without slicing
          if (f.y > 550 && f.vy > 0) {
            if (!f.isBomb && !f.sliced) {
              this.lives--;
              this.updateHUD();
              ArcadeAudio.playDie();
              if (this.lives <= 0) {
                this.triggerGameOver();
                return;
              }
            }
            this.fruits.splice(i, 1);
          }
        }

        // Update Half Fruits
        for (let i = this.halfFruits.length - 1; i >= 0; i--) {
          const h = this.halfFruits[i];
          h.vy += 0.35;
          h.x += h.vx;
          h.y += h.vy;
          h.angle += h.vRot;
          h.life--;
          if (h.life <= 0 || h.y > 560) this.halfFruits.splice(i, 1);
        }

        // Update Splatters
        for (let i = this.splatters.length - 1; i >= 0; i--) {
          const s = this.splatters[i];
          s.x += s.vx;
          s.y += s.vy;
          s.life--;
          if (s.life <= 0) this.splatters.splice(i, 1);
        }

        this.render();

        if (!this.gameOver) {
          this.raf = requestAnimationFrame(loop);
        }
      };
      this.raf = requestAnimationFrame(loop);
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Dojo Cutting Board Background
      ctx.fillStyle = '#1e1610';
      ctx.fillRect(0, 0, 360, 540);

      // Wood Grain Texture lines
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 14;
      for (let y = 30; y < 540; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(360, y);
        ctx.stroke();
      }

      // Render Juice Splatters
      for (const s of this.splatters) {
        ctx.save();
        ctx.globalAlpha = s.life / s.maxLife;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Whole Flying Fruits
      for (const f of this.fruits) {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle);
        ctx.font = `${f.r * 1.6}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 10;
        ctx.fillText(f.icon, 0, 0);
        ctx.restore();
      }

      // Render Sliced Halves
      for (const h of this.halfFruits) {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.angle);
        ctx.font = `${h.r * 1.3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(h.icon, 0, 0);
        ctx.restore();
      }

      // Render Katana Blade Trail
      if (this.bladeTrail.length > 1) {
        for (let i = 1; i < this.bladeTrail.length; i++) {
          const p1 = this.bladeTrail[i - 1];
          const p2 = this.bladeTrail[i];
          const width = (i / this.bladeTrail.length) * 6;
          ctx.strokeStyle = '#38bdf8';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 12;
          ctx.lineWidth = width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Combo Banner
      if (this.bannerLife > 0) {
        this.bannerLife--;
        ctx.save();
        ctx.font = '900 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillText(this.bannerText, 180, 200);
        ctx.restore();
      }
    }

    triggerGameOver() {
      this.gameOver = true;
      ArcadeAudio.playDie();
      showGameOverOverlay(this.wrap, this.score, 'cut_fruit', () => {
        window.launchArcadeGame('cut_fruit');
      });
    }

    destroy() {
      this.destroyed = true;
      if (this.raf) cancelAnimationFrame(this.raf);
    }
  }

  // ==========================================
  // GAME 9: 🧪 WATER SORT COLOR PUZZLE (Guaranteed Solvable & Glossy Tubes)
  // ==========================================
  class WaterSortGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.level = 1;
      this.selectedTubeIdx = null;
      this.history = [];

      this.COLORS = [
        '#ef4444', // Red
        '#3b82f6', // Blue
        '#10b981', // Green
        '#eab308', // Yellow
        '#8b5cf6', // Purple
        '#f97316'  // Orange
      ];

      this.initUI();
      this.startLevel();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'ws-container';
      this.wrap.innerHTML = `
        <div class="ws-header">
          <div class="ws-title">🧪 Water Sort Color Puzzle</div>
          <div class="ws-subtitle">Sort every test tube to a single color! Level <b id="wsLevelNum" style="color:#c084fc">1</b></div>
        </div>
        <div class="ws-tubes-grid" id="wsTubesGrid"></div>
        <div class="ws-actions-row">
          <button type="button" class="ws-btn" id="wsUndoBtn">↩ Undo</button>
          <button type="button" class="ws-btn" id="wsRestartBtn">🔄 Restart</button>
          <button type="button" class="ws-btn" id="wsSolveBtn">💡 Hint</button>
        </div>
      `;
      this.container.appendChild(this.wrap);

      this.wrap.querySelector('#wsUndoBtn').onclick = () => this.undo();
      this.wrap.querySelector('#wsRestartBtn').onclick = () => this.startLevel();
      this.wrap.querySelector('#wsSolveBtn').onclick = () => {
        ArcadeAudio.playDingSuccess();
        alert('💡 Hint: Pehle empty tube ka use karke ek color ko alag karo, fir matching colors ko ek tube me bharo!');
      };
    }

    startLevel() {
      this.selectedTubeIdx = null;
      this.history = [];
      const numColors = Math.min(6, 2 + this.level);

      // Start with solved state: each tube full of 1 color, plus 2 empty tubes
      let initialTubes = [];
      for (let t = 0; t < numColors; t++) {
        initialTubes.push([this.COLORS[t], this.COLORS[t], this.COLORS[t], this.COLORS[t]]);
      }
      initialTubes.push([]);
      initialTubes.push([]);

      // Perform 25 random valid reverse pour moves to ensure 100% mathematically solvable!
      const totalTubes = initialTubes.length;
      for (let step = 0; step < 26; step++) {
        const fromIdx = Math.floor(Math.random() * totalTubes);
        const toIdx = Math.floor(Math.random() * totalTubes);
        if (fromIdx !== toIdx && initialTubes[fromIdx].length > 0 && initialTubes[toIdx].length < 4) {
          initialTubes[toIdx].push(initialTubes[fromIdx].pop());
        }
      }

      this.tubes = initialTubes;

      const lvlEl = document.getElementById('wsLevelNum');
      if (lvlEl) lvlEl.textContent = String(this.level);

      this.renderTubes();
    }

    renderTubes() {
      const grid = this.wrap.querySelector('#wsTubesGrid');
      if (!grid) return;
      grid.innerHTML = '';

      this.tubes.forEach((layers, idx) => {
        const tube = document.createElement('div');
        tube.className = 'ws-tube' + (this.selectedTubeIdx === idx ? ' selected' : '');
        tube.onclick = () => this.handleTubeClick(idx);

        layers.forEach(color => {
          const l = document.createElement('div');
          l.className = 'ws-liquid-layer';
          l.style.backgroundColor = color;
          tube.appendChild(l);
        });

        grid.appendChild(tube);
      });
    }

    handleTubeClick(idx) {
      if (this.selectedTubeIdx === null) {
        if (this.tubes[idx].length === 0) return;
        this.selectedTubeIdx = idx;
        ArcadeAudio.playFlap();
        this.renderTubes();
      } else if (this.selectedTubeIdx === idx) {
        // Deselect
        this.selectedTubeIdx = null;
        this.renderTubes();
      } else {
        // Try pour from selectedTubeIdx to idx
        this.pour(this.selectedTubeIdx, idx);
      }
    }

    pour(srcIdx, dstIdx) {
      const src = this.tubes[srcIdx];
      const dst = this.tubes[dstIdx];

      if (src.length === 0 || dst.length >= 4) {
        this.selectedTubeIdx = null;
        this.renderTubes();
        return;
      }

      const topSrc = src[src.length - 1];
      const topDst = dst.length > 0 ? dst[dst.length - 1] : null;

      if (topDst === null || topDst === topSrc) {
        // Save history for undo
        this.history.push(JSON.parse(JSON.stringify(this.tubes)));

        // Pour matching consecutive colors that fit
        while (src.length > 0 && src[src.length - 1] === topSrc && dst.length < 4) {
          dst.push(src.pop());
        }

        ArcadeAudio.playWaterPour();
        this.selectedTubeIdx = null;
        this.renderTubes();
        this.checkWin();
      } else {
        ArcadeAudio.playBuzzer();
        this.selectedTubeIdx = null;
        this.renderTubes();
      }
    }

    undo() {
      if (this.history.length === 0) return;
      this.tubes = this.history.pop();
      this.selectedTubeIdx = null;
      ArcadeAudio.playFlap();
      this.renderTubes();
    }

    checkWin() {
      const isWon = this.tubes.every(t => {
        if (t.length === 0) return true;
        if (t.length !== 4) return false;
        return t.every(c => c === t[0]);
      });

      if (isWon) {
        ArcadeAudio.playDingSuccess();
        this.score += 100 * this.level;
        const scoreEl = document.getElementById('funStageScore');
        if (scoreEl) scoreEl.textContent = String(this.score);

        setTimeout(() => {
          alert(`🎉 SHABASH! Level ${this.level} Sorted Perfectly! +${100 * this.level} Points`);
          this.level++;
          this.startLevel();
        }, 320);
      }
    }

    destroy() {}
  }

  // ==========================================
  // GAME 10: 🧱 COLOR BLOCK BLAST (From Uploaded Screenshot)
  // ==========================================
  class ColorBlocksGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.gridSize = 8;
      this.grid = Array(8).fill(null).map(() => Array(8).fill(null));
      this.availableShapes = [];
      this.selectedShapeIdx = null;

      this.SHAPES = [
        { name: '1x1', matrix: [[1]], color: '#eab308' },
        { name: '1x2', matrix: [[1, 1]], color: '#f97316' },
        { name: '2x1', matrix: [[1], [1]], color: '#f97316' },
        { name: '2x2', matrix: [[1, 1], [1, 1]], color: '#3b82f6' },
        { name: '1x3', matrix: [[1, 1, 1]], color: '#a855f7' },
        { name: '3x1', matrix: [[1], [1], [1]], color: '#a855f7' },
        { name: 'L-shape', matrix: [[1, 0], [1, 1]], color: '#22c55e' },
        { name: 'T-shape', matrix: [[1, 1, 1], [0, 1, 0]], color: '#ec4899' }
      ];

      this.initUI();
      this.spawnShapes();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'cb-blocks-container';
      this.wrap.innerHTML = `
        <div class="cb-hud-bar">
          <span>🧱 Block Blast</span>
          <span>Score: <b id="bbScore" style="color:#f59e0b">0</b></span>
        </div>
        <div class="cb-blocks-grid" id="cbGrid"></div>
        <div class="cb-shapes-tray" id="cbTray"></div>
      `;
      this.container.appendChild(this.wrap);

      // Render 8x8 Board
      const gridEl = this.wrap.querySelector('#cbGrid');
      gridEl.innerHTML = '';
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const cell = document.createElement('div');
          cell.className = 'cb-cell';
          cell.dataset.r = String(r);
          cell.dataset.c = String(c);
          cell.onclick = () => this.handleCellClick(r, c);
          gridEl.appendChild(cell);
        }
      }
    }

    spawnShapes() {
      this.availableShapes = [];
      for (let i = 0; i < 3; i++) {
        const shape = this.SHAPES[Math.floor(Math.random() * this.SHAPES.length)];
        this.availableShapes.push(shape);
      }
      this.selectedShapeIdx = 0; // auto-select first shape
      this.renderTray();

      if (!this.canAnyShapeFit()) {
        this.triggerGameOver();
      }
    }

    renderTray() {
      const tray = this.wrap.querySelector('#cbTray');
      tray.innerHTML = '';

      this.availableShapes.forEach((s, idx) => {
        if (!s) return;
        const card = document.createElement('div');
        card.className = 'cb-shape-card' + (this.selectedShapeIdx === idx ? ' selected' : '');
        card.onclick = () => {
          this.selectedShapeIdx = idx;
          ArcadeAudio.playFlap();
          this.renderTray();
        };

        // Mini preview grid
        const mini = document.createElement('div');
        mini.style.display = 'grid';
        mini.style.gridTemplateColumns = `repeat(${s.matrix[0].length}, 16px)`;
        mini.style.gap = '2px';

        s.matrix.forEach(row => {
          row.forEach(val => {
            const block = document.createElement('div');
            block.style.width = '16px';
            block.style.height = '16px';
            block.style.borderRadius = '3px';
            block.style.backgroundColor = val ? s.color : 'transparent';
            mini.appendChild(block);
          });
        });

        card.appendChild(mini);
        tray.appendChild(card);
      });
    }

    handleCellClick(startR, startC) {
      if (this.selectedShapeIdx === null) return;
      const shape = this.availableShapes[this.selectedShapeIdx];
      if (!shape) return;

      if (this.canFit(shape, startR, startC)) {
        this.placeShape(shape, startR, startC);
        this.availableShapes[this.selectedShapeIdx] = null;
        this.selectedShapeIdx = this.availableShapes.findIndex(s => s !== null);

        ArcadeAudio.playBlockPlace();
        this.checkLineClears();
        this.renderGrid();
        this.renderTray();

        if (this.availableShapes.every(s => s === null)) {
          this.spawnShapes();
        } else if (!this.canAnyShapeFit()) {
          this.triggerGameOver();
        }
      } else {
        ArcadeAudio.playBuzzer();
      }
    }

    canFit(shape, r, c) {
      for (let i = 0; i < shape.matrix.length; i++) {
        for (let j = 0; j < shape.matrix[0].length; j++) {
          if (shape.matrix[i][j]) {
            const targetR = r + i;
            const targetC = c + j;
            if (targetR >= 8 || targetC >= 8) return false;
            if (this.grid[targetR][targetC] !== null) return false;
          }
        }
      }
      return true;
    }

    canAnyShapeFit() {
      for (const s of this.availableShapes) {
        if (!s) continue;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (this.canFit(s, r, c)) return true;
          }
        }
      }
      return false;
    }

    placeShape(shape, r, c) {
      for (let i = 0; i < shape.matrix.length; i++) {
        for (let j = 0; j < shape.matrix[0].length; j++) {
          if (shape.matrix[i][j]) {
            this.grid[r + i][c + j] = shape.color;
            this.score += 5;
          }
        }
      }
      this.updateScore();
    }

    checkLineClears() {
      let rowsToClear = [];
      let colsToClear = [];

      for (let r = 0; r < 8; r++) {
        if (this.grid[r].every(cell => cell !== null)) rowsToClear.push(r);
      }
      for (let c = 0; c < 8; c++) {
        let full = true;
        for (let r = 0; r < 8; r++) {
          if (this.grid[r][c] === null) { full = false; break; }
        }
        if (full) colsToClear.push(c);
      }

      const totalLines = rowsToClear.length + colsToClear.length;
      if (totalLines > 0) {
        ArcadeAudio.playLineBlast();
        this.score += totalLines * 100 * totalLines;
        this.updateScore();

        rowsToClear.forEach(r => {
          for (let c = 0; c < 8; c++) this.grid[r][c] = null;
        });
        colsToClear.forEach(c => {
          for (let r = 0; r < 8; r++) this.grid[r][c] = null;
        });
      }
    }

    updateScore() {
      const el = document.getElementById('bbScore');
      if (el) el.textContent = String(this.score);
      const scoreEl = document.getElementById('funStageScore');
      if (scoreEl) scoreEl.textContent = String(this.score);
    }

    renderGrid() {
      const cells = this.wrap.querySelectorAll('.cb-cell');
      cells.forEach(cell => {
        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        const val = this.grid[r][c];
        if (val) {
          cell.className = 'cb-cell filled';
          cell.style.backgroundColor = val;
        } else {
          cell.className = 'cb-cell';
          cell.style.backgroundColor = '#090d16';
        }
      });
    }

    triggerGameOver() {
      ArcadeAudio.playDie();
      showGameOverOverlay(this.wrap, this.score, 'color_blocks', () => {
        window.launchArcadeGame('color_blocks');
      });
    }

    destroy() {}
  }

  // ==========================================
  // GAME 11: ⭕ NEON GLOW TIC TAC TOE (From Uploaded Screenshot)
  // ==========================================
  class NeonTicTacToeGame {
    constructor(container) {
      this.container = container;
      this.board = Array(9).fill(null);
      this.turn = 'X'; // 'X' is Cyan, 'O' is Pink
      this.mode = 'ai'; // 'ai' or '2p'
      this.gameOver = false;
      this.score = 0;
      this.scores = { X: 0, O: 0, ties: 0 };

      this.initUI();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'ttt-container';
      this.wrap.innerHTML = `
        <div class="ttt-mode-bar">
          <button type="button" class="ttt-mode-btn active" id="tttAiMode">🤖 vs Smart AI</button>
          <button type="button" class="ttt-mode-btn" id="ttt2pMode">👥 2-Player Pass</button>
        </div>
        <div class="ttt-status" id="tttStatus">Your turn: <b>X (Cyan)</b></div>
        <div class="ttt-board" id="tttBoard"></div>
        <div style="font-size:13px;color:#aaa">Score: X: <b id="tttScoreX" style="color:#06b6d4">0</b> | O: <b id="tttScoreO" style="color:#ec4899">0</b> | Ties: <b id="tttScoreT">0</b></div>
        <button type="button" class="ws-btn" id="tttRestartBtn" style="margin-top:4px">🔄 New Round</button>
      `;
      this.container.appendChild(this.wrap);

      this.wrap.querySelector('#tttAiMode').onclick = (e) => {
        this.mode = 'ai';
        e.target.classList.add('active');
        this.wrap.querySelector('#ttt2pMode').classList.remove('active');
        this.resetRound();
      };
      this.wrap.querySelector('#ttt2pMode').onclick = (e) => {
        this.mode = '2p';
        e.target.classList.add('active');
        this.wrap.querySelector('#tttAiMode').classList.remove('active');
        this.resetRound();
      };
      this.wrap.querySelector('#tttRestartBtn').onclick = () => this.resetRound();

      const boardEl = this.wrap.querySelector('#tttBoard');
      boardEl.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'ttt-cell';
        cell.onclick = () => this.handleMove(i);
        boardEl.appendChild(cell);
      }
    }

    handleMove(idx) {
      if (this.board[idx] || this.gameOver) return;

      this.board[idx] = this.turn;
      ArcadeAudio.playFlap();
      this.render();

      const winCombo = this.checkWin(this.turn);
      if (winCombo) {
        this.handleWin(this.turn, winCombo);
        return;
      }

      if (this.board.every(c => c !== null)) {
        this.handleTie();
        return;
      }

      this.turn = this.turn === 'X' ? 'O' : 'X';
      this.updateStatus();

      if (this.mode === 'ai' && this.turn === 'O') {
        setTimeout(() => this.aiMove(), 320);
      }
    }

    aiMove() {
      if (this.gameOver) return;

      // Smart AI: 1. Win if possible, 2. Block X, 3. Take Center, 4. Random Corner
      let move = this.findBestMove('O') || this.findBestMove('X') || (this.board[4] === null ? 4 : null);
      if (move === null) {
        const empties = this.board.map((v, i) => v === null ? i : null).filter(v => v !== null);
        move = empties[Math.floor(Math.random() * empties.length)];
      }

      this.board[move] = 'O';
      ArcadeAudio.playFlap();
      this.render();

      const winCombo = this.checkWin('O');
      if (winCombo) {
        this.handleWin('O', winCombo);
        return;
      }

      if (this.board.every(c => c !== null)) {
        this.handleTie();
        return;
      }

      this.turn = 'X';
      this.updateStatus();
    }

    findBestMove(player) {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];
      for (const [a, b, c] of lines) {
        if (this.board[a] === player && this.board[b] === player && this.board[c] === null) return c;
        if (this.board[a] === player && this.board[c] === player && this.board[b] === null) return b;
        if (this.board[b] === player && this.board[c] === player && this.board[a] === null) return a;
      }
      return null;
    }

    checkWin(player) {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];
      return lines.find(([a, b, c]) => this.board[a] === player && this.board[b] === player && this.board[c] === player) || null;
    }

    handleWin(player, winCombo) {
      this.gameOver = true;
      ArcadeAudio.playNeonWin();
      this.scores[player]++;
      this.score += 50;

      const cells = this.wrap.querySelectorAll('.ttt-cell');
      winCombo.forEach(idx => {
        cells[idx].style.boxShadow = `0 0 35px ${player === 'X' ? '#06b6d4' : '#ec4899'}`;
      });

      const st = this.wrap.querySelector('#tttStatus');
      st.innerHTML = `🎉 Winner: <b style="color:${player === 'X' ? '#06b6d4' : '#ec4899'}">${player === 'X' ? 'Player X (You)' : (this.mode === 'ai' ? 'AI Bot (O)' : 'Player O')}</b>`;

      this.updateScoresHUD();
    }

    handleTie() {
      this.gameOver = true;
      this.scores.ties++;
      ArcadeAudio.playBuzzer();
      this.wrap.querySelector('#tttStatus').innerHTML = `🤝 Match Draw! Ek aur round ho jaye?`;
      this.updateScoresHUD();
    }

    resetRound() {
      this.board = Array(9).fill(null);
      this.turn = 'X';
      this.gameOver = false;
      this.render();
      this.updateStatus();
    }

    updateStatus() {
      const st = this.wrap.querySelector('#tttStatus');
      st.innerHTML = `Turn: <b style="color:${this.turn === 'X' ? '#06b6d4' : '#ec4899'}">${this.turn} (${this.turn === 'X' ? 'Cyan' : 'Pink'})</b>`;
    }

    updateScoresHUD() {
      this.wrap.querySelector('#tttScoreX').textContent = String(this.scores.X);
      this.wrap.querySelector('#tttScoreO').textContent = String(this.scores.O);
      this.wrap.querySelector('#tttScoreT').textContent = String(this.scores.ties);
      const scoreEl = document.getElementById('funStageScore');
      if (scoreEl) scoreEl.textContent = String(this.score);
    }

    render() {
      const cells = this.wrap.querySelectorAll('.ttt-cell');
      cells.forEach((cell, idx) => {
        const val = this.board[idx];
        cell.textContent = val || '';
        cell.className = 'ttt-cell' + (val ? ` ${val.toLowerCase()}` : '');
        cell.style.boxShadow = '';
      });
    }

    destroy() {}
  }


  // ==========================================
  // GAME 12: 🏃 DESI STREET RUNNER (3-Lane Endless Rush)
  // ==========================================
  class RunnerDashGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.distance = 0;
      this.gameOver = false;
      this.playerLane = 1; // 0: Left, 1: Middle, 2: Right
      this.laneX = [80, 180, 280];
      this.playerX = 180;
      this.playerY = 440;
      this.playerZ = 0; // jump height
      this.isJumping = false;
      this.isSliding = false;
      this.jumpVy = 0;
      this.slideTimer = 0;
      this.speed = 5.5;
      this.obstacles = [];
      this.coins = [];
      this.spawnTimer = 0;
      this.magnetActive = false;
      this.magnetTimer = 0;

      this.initUI();
      this.startLoop();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'game-canvas-wrap';

      // HUD
      const hud = document.createElement('div');
      hud.className = 'cricket-hud';
      hud.innerHTML = `
        <div>🏃 Distance: <b id="rnDist" style="color:#38bdf8">0m</b></div>
        <div>🪙 Samosas: <b id="rnScore" style="color:#f59e0b">0</b></div>
      `;
      this.wrap.appendChild(hud);

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'game-canvas';
      this.canvas.width = 360;
      this.canvas.height = 540;
      this.ctx = this.canvas.getContext('2d');
      this.wrap.appendChild(this.canvas);

      // 4 Mobile Touch Buttons: Left, Jump, Slide, Right
      const touchBar = document.createElement('div');
      touchBar.className = 'runner-touch-bar';
      touchBar.innerHTML = `
        <button type="button" class="runner-touch-btn" id="rnLeftBtn">◀ Left</button>
        <button type="button" class="runner-touch-btn" id="rnJumpBtn" style="background:#e63946">▲ Jump</button>
        <button type="button" class="runner-touch-btn" id="rnSlideBtn" style="background:#ca8a04">▼ Slide</button>
        <button type="button" class="runner-touch-btn" id="rnRightBtn">Right ▶</button>
      `;
      this.wrap.appendChild(touchBar);
      this.container.appendChild(this.wrap);

      touchBar.querySelector('#rnLeftBtn').onclick = () => this.moveLeft();
      touchBar.querySelector('#rnRightBtn').onclick = () => this.moveRight();
      touchBar.querySelector('#rnJumpBtn').onclick = () => this.jump();
      touchBar.querySelector('#rnSlideBtn').onclick = () => this.slide();

      // Keyboard Controls
      this.keyHandler = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') this.moveLeft();
        if (e.key === 'ArrowRight' || e.key === 'd') this.moveRight();
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') this.jump();
        if (e.key === 'ArrowDown' || e.key === 's') this.slide();
      };
      window.addEventListener('keydown', this.keyHandler);

      // Swipe Gestures on Canvas
      let touchStartX = 0;
      let touchStartY = 0;
      this.canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      this.canvas.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 30) this.moveRight();
          else if (dx < -30) this.moveLeft();
        } else {
          if (dy < -30) this.jump();
          else if (dy > 30) this.slide();
        }
      }, { passive: true });
    }

    moveLeft() {
      if (this.playerLane > 0) {
        this.playerLane--;
        ArcadeAudio.playFlap();
      }
    }

    moveRight() {
      if (this.playerLane < 2) {
        this.playerLane++;
        ArcadeAudio.playFlap();
      }
    }

    jump() {
      if (!this.isJumping) {
        this.isJumping = true;
        this.jumpVy = 13.5;
        ArcadeAudio.playRunnerJump();
      }
    }

    slide() {
      if (!this.isSliding) {
        this.isSliding = true;
        this.slideTimer = 35;
        ArcadeAudio.playFlap();
      }
    }

    spawnObstacle() {
      const lane = Math.floor(Math.random() * 3);
      const types = [
        { type: 'barrier', icon: '🚧', color: '#eab308', w: 50, h: 32, requires: 'jump' },
        { type: 'rickshaw', icon: '🛺', color: '#16a34a', w: 46, h: 56, requires: 'dodge' },
        { type: 'cow', icon: '🐄', color: '#f8fafc', w: 52, h: 50, requires: 'dodge' },
        { type: 'banner', icon: '🎋', color: '#e11d48', w: 60, h: 25, requires: 'slide' }
      ];
      const sel = types[Math.floor(Math.random() * types.length)];
      this.obstacles.push({
        lane,
        x: this.laneX[lane],
        y: -60,
        ...sel
      });

      // Spawn coins in other lanes
      const coinLane = (lane + 1) % 3;
      for (let i = 0; i < 3; i++) {
        this.coins.push({
          lane: coinLane,
          x: this.laneX[coinLane],
          y: -80 - i * 40
        });
      }
    }

    startLoop() {
      const loop = () => {
        if (this.destroyed) return;

        this.distance += Math.floor(this.speed * 0.2);
        this.speed = Math.min(12, 5.5 + this.distance * 0.002);

        // Smooth X move towards target lane
        const targetX = this.laneX[this.playerLane];
        this.playerX += (targetX - this.playerX) * 0.25;

        // Jump physics
        if (this.isJumping) {
          this.playerZ += this.jumpVy;
          this.jumpVy -= 0.85; // Gravity
          if (this.playerZ <= 0) {
            this.playerZ = 0;
            this.isJumping = false;
          }
        }

        // Slide timer
        if (this.isSliding) {
          this.slideTimer--;
          if (this.slideTimer <= 0) this.isSliding = false;
        }

        // Spawn timer
        this.spawnTimer += this.speed;
        if (this.spawnTimer > 160) {
          this.spawnTimer = 0;
          this.spawnObstacle();
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
          const obs = this.obstacles[i];
          obs.y += this.speed;

          // Check Collision with player (player is at playerX, y: 440, playerZ)
          if (Math.abs(obs.x - this.playerX) < 28 && Math.abs(obs.y - this.playerY) < 36) {
            if (obs.requires === 'jump' && this.playerZ > 24) {
              // Safely jumped over!
            } else if (obs.requires === 'slide' && this.isSliding) {
              // Safely slid under!
            } else {
              // CRASH!
              this.triggerGameOver();
              return;
            }
          }

          if (obs.y > 580) this.obstacles.splice(i, 1);
        }

        // Update coins
        for (let i = this.coins.length - 1; i >= 0; i--) {
          const c = this.coins[i];
          c.y += this.speed;

          // Collect coin
          if (Math.abs(c.x - this.playerX) < 35 && Math.abs(c.y - this.playerY) < 40) {
            this.score += 10;
            ArcadeAudio.playCoinDrop();
            this.coins.splice(i, 1);
            continue;
          }

          if (c.y > 580) this.coins.splice(i, 1);
        }

        this.updateHUD();
        this.render();

        if (!this.gameOver) {
          this.raf = requestAnimationFrame(loop);
        }
      };
      this.raf = requestAnimationFrame(loop);
    }

    updateHUD() {
      const dEl = document.getElementById('rnDist');
      if (dEl) dEl.textContent = `${this.distance}m`;
      const sEl = document.getElementById('rnScore');
      if (sEl) sEl.textContent = String(this.score);
      const scoreEl = document.getElementById('funStageScore');
      if (scoreEl) scoreEl.textContent = String(this.score + Math.floor(this.distance / 2));
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 360, 540);

      // Indian City Street Road (Deep Terracotta & Concrete)
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, 360, 540);

      // Footpath curbs
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(0, 0, 20, 540);
      ctx.fillRect(340, 0, 20, 540);

      // Lane dividers
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.setLineDash([25, 25]);
      ctx.lineDashOffset = -this.distance * 2;
      [130, 230].forEach(lx => {
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, 540);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Render Coins / Samosas
      for (const c of this.coins) {
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪙', c.x, c.y);
      }

      // Render Obstacles
      for (const obs of this.obstacles) {
        ctx.font = `${obs.h * 0.9}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obs.icon, obs.x, obs.y);
      }

      // Render Player Character
      const px = this.playerX;
      const py = this.playerY - this.playerZ;

      // Player Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(px, this.playerY + 20, 18 * (1 - this.playerZ * 0.01), 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Running Character
      ctx.font = this.isSliding ? '32px sans-serif' : '44px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.isSliding ? '🧎' : '🏃', px, py);
    }

    triggerGameOver() {
      this.gameOver = true;
      ArcadeAudio.playCrash();
      const finalScore = this.score + Math.floor(this.distance / 2);
      showGameOverOverlay(this.wrap, finalScore, 'runner_dash', () => {
        window.launchArcadeGame('runner_dash');
      });
    }

    destroy() {
      this.destroyed = true;
      if (this.raf) cancelAnimationFrame(this.raf);
      if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
    }
  }

  // ==========================================
  // GAME 13: 🎲 REALISTIC SNAKE & LADDER 3D (Saanp Seedhi)
  // ==========================================
  class SnakeLadderGame {
    constructor(container) {
      this.container = container;
      this.playerPos = 1;
      this.aiPos = 1;
      this.turn = 'player'; // 'player' or 'ai'
      this.diceValue = 1;
      this.isRolling = false;
      this.score = 0;
      this.gameOver = false;

      // 7 Ladders (Climb Up!)
      this.LADDERS = {
        4: 25, 13: 46, 33: 69, 42: 74, 50: 91, 62: 81, 74: 95
      };

      // 7 Snakes (Slide Down!)
      this.SNAKES = {
        27: 5, 40: 18, 54: 31, 66: 45, 76: 58, 89: 53, 99: 12
      };

      this.initUI();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'sl-container';

      // HUD
      const hud = document.createElement('div');
      hud.className = 'sl-hud';
      hud.innerHTML = `
        <div>🔴 You: <b id="slPosYou" style="color:#ef4444;font-size:15px">1</b>/100</div>
        <div id="slTurnStatus" style="color:#fef08a">Aapki Baari: Roll Karo!</div>
        <div>🔵 Munna AI: <b id="slPosAi" style="color:#38bdf8;font-size:15px">1</b>/100</div>
      `;
      this.wrap.appendChild(hud);

      // Canvas Board (360x360)
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'game-canvas';
      this.canvas.width = 340;
      this.canvas.height = 340;
      this.ctx = this.canvas.getContext('2d');
      this.wrap.appendChild(this.canvas);

      // Dice Rolling Bottom Tray
      const tray = document.createElement('div');
      tray.className = 'sl-dice-tray';
      tray.innerHTML = `
        <div class="sl-dice-cube" id="slDiceCube">🎲 <b>1</b></div>
        <div id="slCommentary" style="font-size:12px;color:#cbd5e1;max-width:180px;text-align:center">Dice phenko aur 100 par pahuncho!</div>
        <button type="button" class="sl-roll-btn" id="slRollBtn">🎲 Roll</button>
      `;
      this.wrap.appendChild(tray);
      this.container.appendChild(this.wrap);

      tray.querySelector('#slRollBtn').onclick = () => this.handlePlayerRoll();
      tray.querySelector('#slDiceCube').onclick = () => this.handlePlayerRoll();

      this.renderBoard();
    }

    handlePlayerRoll() {
      if (this.isRolling || this.turn !== 'player' || this.gameOver) return;
      this.rollDice((val) => {
        this.moveToken('player', val, () => {
          if (!this.gameOver) {
            this.turn = 'ai';
            document.getElementById('slTurnStatus').textContent = "🤖 Munna AI roll kar raha hai...";
            setTimeout(() => this.handleAiRoll(), 900);
          }
        });
      });
    }

    handleAiRoll() {
      if (this.gameOver) return;
      this.rollDice((val) => {
        this.moveToken('ai', val, () => {
          if (!this.gameOver) {
            this.turn = 'player';
            document.getElementById('slTurnStatus').textContent = "Aapki Baari: Roll Karo!";
          }
        });
      });
    }

    rollDice(callback) {
      this.isRolling = true;
      ArcadeAudio.playDiceRoll();
      let rolls = 0;
      const cube = document.getElementById('slDiceCube');

      const interval = setInterval(() => {
        const temp = Math.floor(Math.random() * 6) + 1;
        if (cube) cube.innerHTML = `🎲 <b>${temp}</b>`;
        rolls++;
        if (rolls > 8) {
          clearInterval(interval);
          this.diceValue = temp;
          this.isRolling = false;
          callback(temp);
        }
      }, 50);
    }

    moveToken(who, steps, callback) {
      let currentPos = who === 'player' ? this.playerPos : this.aiPos;
      let targetPos = currentPos + steps;

      if (targetPos > 100) {
        // Can't move if exceeds 100
        this.setCommentary(`${who === 'player' ? 'Aapko' : 'Munna ko'} jeetne ke liye exactly ${100 - currentPos} chahiye the!`);
        callback();
        return;
      }

      currentPos = targetPos;
      if (who === 'player') this.playerPos = currentPos;
      else this.aiPos = currentPos;

      this.updateHUD();
      this.renderBoard();

      // Check Ladder or Snake
      setTimeout(() => {
        if (this.LADDERS[currentPos]) {
          const dest = this.LADDERS[currentPos];
          ArcadeAudio.playLadderClimb();
          this.setCommentary(`🪜 WAHA! Seedhi mil gayi! ${currentPos} -> ${dest}!`);
          if (who === 'player') { this.playerPos = dest; this.score += 20; }
          else this.aiPos = dest;
        } else if (this.SNAKES[currentPos]) {
          const dest = this.SNAKES[currentPos];
          ArcadeAudio.playSnakeBite();
          this.setCommentary(`🐍 Arey baap re! Saanp ne das liya! ${currentPos} -> ${dest}! 😂`);
          if (who === 'player') this.playerPos = dest;
          else this.aiPos = dest;
        }

        this.updateHUD();
        this.renderBoard();

        // Check Win
        if (this.playerPos === 100) {
          this.gameOver = true;
          ArcadeAudio.playDingSuccess();
          this.score += 100;
          this.setCommentary('🏆 Balle Balle! Aap Saanp Seedhi Champion ban gaye!');
          setTimeout(() => {
            showGameOverOverlay(this.wrap, this.score, 'snake_ladder', () => {
              window.launchArcadeGame('snake_ladder');
            });
          }, 1200);
          return;
        } else if (this.aiPos === 100) {
          this.gameOver = true;
          ArcadeAudio.playDie();
          this.setCommentary('Munna Bhaiya pehle 100 par pahunch gaya! Agli baar harana!');
          setTimeout(() => {
            showGameOverOverlay(this.wrap, this.score, 'snake_ladder', () => {
              window.launchArcadeGame('snake_ladder');
            });
          }, 1200);
          return;
        }

        callback();
      }, 500);
    }

    setCommentary(msg) {
      const el = document.getElementById('slCommentary');
      if (el) el.textContent = msg;
    }

    updateHUD() {
      const pEl = document.getElementById('slPosYou');
      if (pEl) pEl.textContent = String(this.playerPos);
      const aEl = document.getElementById('slPosAi');
      if (aEl) aEl.textContent = String(this.aiPos);
      const scoreEl = document.getElementById('funStageScore');
      if (scoreEl) scoreEl.textContent = String(this.score);
    }

    getSquareCoords(num) {
      // 1 to 100 in snake pattern
      const row = Math.floor((num - 1) / 10);
      const colInRow = (num - 1) % 10;
      const col = (row % 2 === 0) ? colInRow : (9 - colInRow);
      const cellSize = 34;
      return {
        x: col * cellSize + cellSize / 2,
        y: (9 - row) * cellSize + cellSize / 2
      };
    }

    renderBoard() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 340, 340);

      const cellSize = 34;

      // 10x10 Grid Cells
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const isEven = (r + c) % 2 === 0;
          ctx.fillStyle = isEven ? '#1e293b' : '#0f172a';
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);

          ctx.strokeStyle = 'rgba(255,255,255,0.08)';
          ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }

      // Draw Cell Numbers
      for (let n = 1; n <= 100; n++) {
        const pt = this.getSquareCoords(n);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(n), pt.x, pt.y);
      }

      // Draw Ladders (Golden Rungs)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3.5;
      for (const [from, to] of Object.entries(this.LADDERS)) {
        const p1 = this.getSquareCoords(Number(from));
        const p2 = this.getSquareCoords(Number(to));
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Ladder icon
        ctx.font = '14px sans-serif';
        ctx.fillText('🪜', (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
      }

      // Draw Snakes (Red Wavy Lines)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.5;
      for (const [from, to] of Object.entries(this.SNAKES)) {
        const p1 = this.getSquareCoords(Number(from));
        const p2 = this.getSquareCoords(Number(to));
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.font = '14px sans-serif';
        ctx.fillText('🐍', p1.x, p1.y);
      }

      // Draw Player Token 🔴
      const pPt = this.getSquareCoords(this.playerPos);
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pPt.x - 4, pPt.y - 4, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('P', pPt.x - 4, pPt.y - 4);

      // Draw AI Token 🔵
      const aPt = this.getSquareCoords(this.aiPos);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(aPt.x + 4, aPt.y + 4, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('AI', aPt.x + 4, aPt.y + 4);
    }

    destroy() {}
  }

  // ==========================================
  // GAME 14: 🔴🟡 LUDO MASTER CLASSIC
  // ==========================================
  class LudoMasterGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.turn = 'red'; // 'red' (You) or 'green' (CPU)
      this.redTokens = [0, 0, 0, 0]; // 0: Home yard, 1-51: track, 52-57: finish
      this.greenTokens = [0, 0, 0, 0];
      this.diceVal = 1;
      this.isRolling = false;
      this.gameOver = false;

      this.initUI();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'ludo-container';

      const hud = document.createElement('div');
      hud.className = 'sl-hud';
      hud.innerHTML = `
        <div style="color:#ef4444">🔴 You (Red)</div>
        <div id="ludoStatus" style="color:#fef08a">Aapki Baari: Dice phenko!</div>
        <div style="color:#10b981">🟢 CPU (Green)</div>
      `;
      this.wrap.appendChild(hud);

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'game-canvas';
      this.canvas.width = 340;
      this.canvas.height = 340;
      this.ctx = this.canvas.getContext('2d');
      this.wrap.appendChild(this.canvas);

      const tray = document.createElement('div');
      tray.className = 'sl-dice-tray';
      tray.innerHTML = `
        <div class="sl-dice-cube" id="ludoDice">🎲 <b>6</b></div>
        <div style="font-size:12px;color:#aaa">Roll 6 to open token!</div>
        <button type="button" class="sl-roll-btn" id="ludoRollBtn">Roll Dice</button>
      `;
      this.wrap.appendChild(tray);
      this.container.appendChild(this.wrap);

      tray.querySelector('#ludoRollBtn').onclick = () => this.rollPlayerDice();
      tray.querySelector('#ludoDice').onclick = () => this.rollPlayerDice();

      this.render();
    }

    rollPlayerDice() {
      if (this.isRolling || this.turn !== 'red' || this.gameOver) return;
      this.rollDiceAnim((val) => {
        this.diceVal = val;
        // Check if red has tokens in yard to unlock
        let moved = false;
        if (val === 6) {
          const lockedIdx = this.redTokens.findIndex(p => p === 0);
          if (lockedIdx !== -1) {
            this.redTokens[lockedIdx] = 1; // Unlocked!
            moved = true;
            this.score += 25;
            ArcadeAudio.playDingSuccess();
          }
        }

        if (!moved) {
          // Move the furthest unlocked token
          const unlocked = this.redTokens.map((p, i) => p > 0 && p + val <= 57 ? i : null).filter(i => i !== null);
          if (unlocked.length > 0) {
            const chosen = unlocked[unlocked.length - 1];
            this.redTokens[chosen] += val;
            ArcadeAudio.playFlap();
            this.score += val * 5;
          }
        }

        this.render();

        // Switch to CPU
        if (val !== 6) {
          this.turn = 'green';
          document.getElementById('ludoStatus').textContent = "🟢 CPU dice roll kar raha hai...";
          setTimeout(() => this.cpuTurn(), 800);
        } else {
          document.getElementById('ludoStatus').textContent = "🎉 6 AAYA! Ek aur turn!";
        }
      });
    }

    cpuTurn() {
      if (this.gameOver) return;
      this.rollDiceAnim((val) => {
        this.diceVal = val;
        let moved = false;
        if (val === 6) {
          const locked = this.greenTokens.findIndex(p => p === 0);
          if (locked !== -1) {
            this.greenTokens[locked] = 1;
            moved = true;
          }
        }
        if (!moved) {
          const unlocked = this.greenTokens.map((p, i) => p > 0 && p + val <= 57 ? i : null).filter(i => i !== null);
          if (unlocked.length > 0) {
            this.greenTokens[unlocked[0]] += val;
          }
        }
        this.render();

        if (val !== 6) {
          this.turn = 'red';
          document.getElementById('ludoStatus').textContent = "🔴 Aapki Baari: Dice phenko!";
        } else {
          setTimeout(() => this.cpuTurn(), 700);
        }
      });
    }

    rollDiceAnim(cb) {
      this.isRolling = true;
      ArcadeAudio.playDiceRoll();
      const el = document.getElementById('ludoDice');
      let count = 0;
      const timer = setInterval(() => {
        const v = Math.floor(Math.random() * 6) + 1;
        if (el) el.innerHTML = `🎲 <b>${v}</b>`;
        count++;
        if (count > 7) {
          clearInterval(timer);
          this.isRolling = false;
          cb(v);
        }
      }, 50);
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 340, 340);

      // Ludo Quadrants
      // Red Base (Top Left)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, 0, 136, 136);
      ctx.fillStyle = '#fff';
      ctx.fillRect(20, 20, 96, 96);

      // Green Base (Top Right)
      ctx.fillStyle = '#10b981';
      ctx.fillRect(204, 0, 136, 136);
      ctx.fillStyle = '#fff';
      ctx.fillRect(224, 20, 96, 96);

      // Yellow Base (Bottom Left)
      ctx.fillStyle = '#eab308';
      ctx.fillRect(0, 204, 136, 136);
      ctx.fillStyle = '#fff';
      ctx.fillRect(20, 224, 96, 96);

      // Blue Base (Bottom Right)
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(204, 204, 136, 136);
      ctx.fillStyle = '#fff';
      ctx.fillRect(224, 224, 96, 96);

      // Center Victory Triangle
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.moveTo(136, 136); ctx.lineTo(170, 170); ctx.lineTo(136, 204); ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.moveTo(136, 136); ctx.lineTo(170, 170); ctx.lineTo(204, 136); ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.moveTo(204, 136); ctx.lineTo(170, 170); ctx.lineTo(204, 204); ctx.fill();
      ctx.fillStyle = '#eab308';
      ctx.beginPath(); ctx.moveTo(136, 204); ctx.lineTo(170, 170); ctx.lineTo(204, 204); ctx.fill();

      // Draw Red Tokens
      this.redTokens.forEach((pos, idx) => {
        ctx.fillStyle = '#dc2626';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        let tx = 40 + (idx % 2) * 44;
        let ty = 40 + Math.floor(idx / 2) * 44;
        if (pos > 0) {
          // On track
          tx = 150;
          ty = Math.min(320, 40 + pos * 5);
        }
        ctx.beginPath();
        ctx.arc(tx, ty, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Green Tokens
      this.greenTokens.forEach((pos, idx) => {
        ctx.fillStyle = '#059669';
        let tx = 244 + (idx % 2) * 44;
        let ty = 40 + Math.floor(idx / 2) * 44;
        if (pos > 0) {
          tx = 190;
          ty = Math.min(320, 40 + pos * 5);
        }
        ctx.beginPath();
        ctx.arc(tx, ty, 11, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    destroy() {}
  }

  // ==========================================
  // GAME 15: 🐟 TINY FISH FEEDING FRENZY
  // ==========================================
  class TinyFishGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.playerLevel = 1;
      this.playerR = 14;
      this.playerX = 180;
      this.playerY = 270;
      this.facingRight = true;
      this.fishes = [];
      this.bubbles = [];
      this.spawnTimer = 0;
      this.gameOver = false;

      this.initUI();
      this.startLoop();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'game-canvas-wrap';

      const hud = document.createElement('div');
      hud.className = 'cricket-hud';
      hud.innerHTML = `
        <div>🐟 Level: <b id="tfLevel" style="color:#38bdf8">1 (Guppy)</b></div>
        <div>Score: <b id="tfScore" style="color:#22c55e">0</b></div>
      `;
      this.wrap.appendChild(hud);

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'game-canvas';
      this.canvas.width = 360;
      this.canvas.height = 540;
      this.ctx = this.canvas.getContext('2d');
      this.wrap.appendChild(this.canvas);
      this.container.appendChild(this.wrap);

      // Follow finger / cursor
      const handleMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const targetX = (clientX - rect.left) * (this.canvas.width / rect.width);
        const targetY = (clientY - rect.top) * (this.canvas.height / rect.height);

        if (targetX > this.playerX) this.facingRight = true;
        else if (targetX < this.playerX) this.facingRight = false;

        this.playerX = targetX;
        this.playerY = targetY;
      };

      this.canvas.addEventListener('mousemove', handleMove);
      this.canvas.addEventListener('touchmove', handleMove, { passive: false });
    }

    spawnFish() {
      const fromLeft = Math.random() > 0.5;
      const lvl = 1 + Math.floor(Math.random() * (this.playerLevel + 2));
      const r = 10 + lvl * 7;
      const speed = (fromLeft ? 1 : -1) * (1.5 + Math.random() * 2);

      this.fishes.push({
        x: fromLeft ? -40 : 400,
        y: 40 + Math.random() * 460,
        r,
        level: lvl,
        speed,
        color: lvl === 1 ? '#4ade80' : lvl === 2 ? '#f59e0b' : lvl === 3 ? '#ec4899' : '#ef4444'
      });
    }

    startLoop() {
      const loop = () => {
        if (this.destroyed) return;

        this.spawnTimer++;
        if (this.spawnTimer > 45) {
          this.spawnTimer = 0;
          this.spawnFish();
        }

        // Add ambient water bubbles
        if (Math.random() < 0.2) {
          this.bubbles.push({
            x: Math.random() * 360,
            y: 540,
            r: 2 + Math.random() * 4,
            speed: 1 + Math.random() * 2
          });
        }

        // Update bubbles
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
          const b = this.bubbles[i];
          b.y -= b.speed;
          if (b.y < -10) this.bubbles.splice(i, 1);
        }

        // Update Fish
        for (let i = this.fishes.length - 1; i >= 0; i--) {
          const f = this.fishes[i];
          f.x += f.speed;

          // Check Collision with player
          const dist = Math.hypot(f.x - this.playerX, f.y - this.playerY);
          if (dist < f.r + this.playerR) {
            if (this.playerR >= f.r) {
              // EAT IT!
              ArcadeAudio.playFishGulp();
              this.score += f.level * 20;
              this.playerR += 0.8;
              this.fishes.splice(i, 1);

              if (this.playerR > 20 && this.playerLevel === 1) this.evolve(2, 'Clownfish');
              else if (this.playerR > 32 && this.playerLevel === 2) this.evolve(3, 'Pufferfish');
              else if (this.playerR > 44 && this.playerLevel === 3) this.evolve(4, 'Great Shark');
              continue;
            } else {
              // EATEN BY BIGGER FISH!
              this.triggerGameOver();
              return;
            }
          }

          if (f.x < -60 || f.x > 420) this.fishes.splice(i, 1);
        }

        this.updateHUD();
        this.render();

        if (!this.gameOver) {
          this.raf = requestAnimationFrame(loop);
        }
      };
      this.raf = requestAnimationFrame(loop);
    }

    evolve(lvl, title) {
      this.playerLevel = lvl;
      ArcadeAudio.playDingSuccess();
      const el = document.getElementById('tfLevel');
      if (el) el.textContent = `${lvl} (${title})`;
    }

    updateHUD() {
      const sEl = document.getElementById('tfScore');
      if (sEl) sEl.textContent = String(this.score);
      const scoreEl = document.getElementById('funStageScore');
      if (scoreEl) scoreEl.textContent = String(this.score);
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 360, 540);

      // Deep Ocean Turquoise Gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 540);
      oceanGrad.addColorStop(0, '#0284c7');
      oceanGrad.addColorStop(0.7, '#075985');
      oceanGrad.addColorStop(1, '#082f49');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 360, 540);

      // Bubbles
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      for (const b of this.bubbles) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Swimming School Fish
      for (const f of this.fishes) {
        ctx.save();
        ctx.translate(f.x, f.y);
        if (f.speed < 0) ctx.scale(-1, 1);

        ctx.fillStyle = f.color;
        // Body ellipse
        ctx.beginPath();
        ctx.ellipse(0, 0, f.r, f.r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.beginPath();
        ctx.moveTo(-f.r * 0.8, 0);
        ctx.lineTo(-f.r * 1.4, -f.r * 0.5);
        ctx.lineTo(-f.r * 1.4, f.r * 0.5);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(f.r * 0.4, -f.r * 0.15, f.r * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(f.r * 0.45, -f.r * 0.15, f.r * 0.09, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Player Fish (Cute Glowing Goldfish)
      ctx.save();
      ctx.translate(this.playerX, this.playerY);
      if (!this.facingRight) ctx.scale(-1, 1);

      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.playerR, this.playerR * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Player Tail
      ctx.beginPath();
      ctx.moveTo(-this.playerR * 0.8, 0);
      ctx.lineTo(-this.playerR * 1.5, -this.playerR * 0.6);
      ctx.lineTo(-this.playerR * 1.5, this.playerR * 0.6);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.playerR * 0.4, -this.playerR * 0.2, this.playerR * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(this.playerR * 0.45, -this.playerR * 0.2, this.playerR * 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    triggerGameOver() {
      this.gameOver = true;
      ArcadeAudio.playDie();
      showGameOverOverlay(this.wrap, this.score, 'tiny_fish', () => {
        window.launchArcadeGame('tiny_fish');
      });
    }

    destroy() {
      this.destroyed = true;
      if (this.raf) cancelAnimationFrame(this.raf);
    }
  }

  // ==========================================
  // GAME 16: 🥞 STACK ALL ISOMETRIC TOWER
  // ==========================================
  class StackAllGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.combo = 0;
      this.gameOver = false;
      this.stack = [];
      this.currentWidth = 140;
      this.currentX = 0;
      this.direction = 3.5;
      this.layerHeight = 16;
      this.colors = [
        '#f43f5e', '#fb923c', '#facc15', '#4ade80',
        '#22d3ee', '#818cf8', '#c084fc', '#f472b6'
      ];

      this.initUI();
      this.startLoop();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'game-canvas-wrap';

      const hud = document.createElement('div');
      hud.className = 'cricket-hud';
      hud.innerHTML = `
        <div>🥞 Stack Height: <b id="stHeight" style="color:#c084fc">0</b></div>
        <div>Combo: <b id="stCombo" style="color:#facc15">0x</b></div>
      `;
      this.wrap.appendChild(hud);

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'game-canvas';
      this.canvas.width = 360;
      this.canvas.height = 540;
      this.ctx = this.canvas.getContext('2d');
      this.wrap.appendChild(this.canvas);
      this.container.appendChild(this.wrap);

      // Initial Base Slab
      this.stack.push({
        x: 180 - this.currentWidth / 2,
        y: 480,
        w: this.currentWidth,
        color: this.colors[0]
      });

      // Tap to drop
      const handleTap = () => {
        if (this.gameOver) return;
        this.placeSlab();
      };

      this.canvas.addEventListener('click', handleTap);
      this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleTap(); }, { passive: false });
    }

    placeSlab() {
      const top = this.stack[this.stack.length - 1];
      const diff = this.currentX - top.x;

      if (Math.abs(diff) < 3.5) {
        // PERFECT MATCH!
        this.combo++;
        this.currentX = top.x;
        ArcadeAudio.playMusicalChord(this.combo);
      } else {
        this.combo = 0;
        ArcadeAudio.playBlockSlice();

        if (diff > 0) {
          // Overhang on right
          this.currentWidth -= diff;
        } else {
          // Overhang on left
          this.currentWidth += diff;
          this.currentX = top.x;
        }
      }

      if (this.currentWidth <= 4) {
        this.triggerGameOver();
        return;
      }

      this.score++;
      const nextY = top.y - this.layerHeight;
      const color = this.colors[this.score % this.colors.length];

      this.stack.push({
        x: this.currentX,
        y: nextY,
        w: this.currentWidth,
        color
      });

      // Camera shift down if tower gets too tall
      if (nextY < 200) {
        this.stack.forEach(s => (s.y += this.layerHeight));
      }

      this.updateHUD();
    }

    updateHUD() {
      const hEl = document.getElementById('stHeight');
      if (hEl) hEl.textContent = String(this.score);
      const cEl = document.getElementById('stCombo');
      if (cEl) cEl.textContent = `${this.combo}x`;
      const scoreEl = document.getElementById('funStageScore');
      if (scoreEl) scoreEl.textContent = String(this.score);
    }

    startLoop() {
      const loop = () => {
        if (this.destroyed) return;

        // Move current sliding block
        this.currentX += this.direction;
        if (this.currentX + this.currentWidth > 340) {
          this.currentX = 340 - this.currentWidth;
          this.direction = -Math.abs(this.direction);
        } else if (this.currentX < 20) {
          this.currentX = 20;
          this.direction = Math.abs(this.direction);
        }

        this.render();

        if (!this.gameOver) {
          this.raf = requestAnimationFrame(loop);
        }
      };
      this.raf = requestAnimationFrame(loop);
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 360, 540);

      // Dreamy Pastel Sunset Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 540);
      skyGrad.addColorStop(0, '#1e112a');
      skyGrad.addColorStop(0.5, '#2e1065');
      skyGrad.addColorStop(1, '#090514');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 360, 540);

      // Render Stacked Slabs
      for (const s of this.stack) {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.roundRect(s.x, s.y, s.w, this.layerHeight, 4);
        ctx.fill();

        // 3D Top bevel
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(s.x, s.y, s.w, 3);
      }

      // Render Active Sliding Slab
      if (!this.gameOver) {
        const top = this.stack[this.stack.length - 1];
        const nextColor = this.colors[(this.score + 1) % this.colors.length];
        const nextY = top.y - this.layerHeight;

        ctx.fillStyle = nextColor;
        ctx.shadowColor = nextColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(this.currentX, nextY, this.currentWidth, this.layerHeight, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    triggerGameOver() {
      this.gameOver = true;
      ArcadeAudio.playDie();
      showGameOverOverlay(this.wrap, this.score, 'stack_all', () => {
        window.launchArcadeGame('stack_all');
      });
    }

    destroy() {
      this.destroyed = true;
      if (this.raf) cancelAnimationFrame(this.raf);
    }
  }


  // Fun Zone Player Avatar Upload
  async function uploadFunPlayerPhoto(input) {
    const file = input && input.files && input.files[0];
    if (!file) return;
    try {
      showToast("⏳ Avatar update ho raha hai...");
      const photoData = await compressProfilePhoto(file);
      const av = document.getElementById("funPlayerAvatar");
      if (av) av.src = photoData;
      localStorage.setItem("upch_arcade_avatar", photoData);
      if (window.currentUser) {
        localStorage.setItem("upch_user_photo_" + window.currentUser.uid, photoData);
        if (typeof currentProfilePhotoURL !== "undefined") currentProfilePhotoURL = photoData;
        const ph = document.getElementById("userPhoto");
        if (ph) ph.src = photoData;
      }
      showToast("✅ Arcade avatar updated!");
    } catch(e) {
      console.error(e);
      showToast("❌ Avatar update fail");
    } finally {
      input.value = "";
    }
  }
  window.uploadFunPlayerPhoto = uploadFunPlayerPhoto;

  // Initialize player card on script load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayerCard);
  } else {
    updatePlayerCard();
  }
})();


