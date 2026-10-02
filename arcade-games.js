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

  function updatePlayerCard() {
    const xp = parseInt(localStorage.getItem('upch_player_xp') || '0', 10);
    const level = Math.floor(xp / 100) + 1;
    const levelProgress = xp % 100;

    const meta = document.getElementById('funPlayerMeta');
    const fill = document.getElementById('funXpFill');
    if (meta) meta.textContent = `Level ${level} â€¢ ${xp} XP`;
    if (fill) fill.style.width = `${levelProgress}%`;

    // Try to sync with logged in user profile if available
    const avatar = document.getElementById('funPlayerAvatar');
    const nameEl = document.getElementById('funPlayerName');
    if (window.currentUser) {
      if (avatar && window.currentUser.photoURL) avatar.src = window.currentUser.photoURL;
      if (nameEl && window.currentUser.displayName) nameEl.textContent = window.currentUser.displayName + ' ðŸŒŸ';
    }
  }

  window.toggleArcadeSound = function() {
    ArcadeAudio.init();
    const enabled = ArcadeAudio.toggle();
    const label = enabled ? 'Sound ON' : 'Sound OFF';
    const icon = enabled ? 'ðŸ”Š' : 'ðŸ”‡';

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
        if (titleEl) titleEl.innerHTML = 'ðŸª™ Coin Merge Rush';
        activeGameInstance = new CoinMergeGame(stageBody);
        break;
      case 'turbo_racer':
        if (titleEl) titleEl.innerHTML = 'ðŸŽï¸ Turbo Highway Racer';
        activeGameInstance = new HighwayRacerGame(stageBody);
        break;
      case 'flappy_desi':
        if (titleEl) titleEl.innerHTML = 'ðŸ¦ Flappy Desi Comedy';
        activeGameInstance = new FlappyDesiGame(stageBody);
        break;
      case 'call_break':
        if (titleEl) titleEl.innerHTML = 'â™ ï¸ Call Break Master';
        activeGameInstance = new CallBreakGame(stageBody);
        break;
      case 'ai_roast':
        if (titleEl) titleEl.innerHTML = 'ðŸ¤– AI Lie Detector & Roast';
        activeGameInstance = new AILieDetectorGame(stageBody);
        break;
      case 'ai_quiz':
        if (titleEl) titleEl.innerHTML = 'ðŸ§  AI Comedy & Movie Quiz';
        activeGameInstance = new AIQuizGame(stageBody);
        break;
      case 'cricket':
        if (titleEl) titleEl.innerHTML = 'ðŸ Desi Gully Cricket';
        activeGameInstance = new GullyCricketGame(stageBody);
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
      <div class="game-over-title">GAME OVER! ðŸ’¥</div>
      <div class="game-over-subtitle">${isNewBest ? 'ðŸ”¥ NAYA RECORD BANAYA HAI! ðŸ”¥' : 'Bohot badiya khele bhai!'}</div>
      <div class="game-over-stats">
        <div style="font-size:12px;color:#aaa">FINAL SCORE</div>
        <div class="game-over-score">${score}</div>
        <div class="game-over-best">ðŸ† BEST: ${best}</div>
      </div>
      <div class="game-over-actions">
        <button type="button" class="game-btn-replay" id="replayBtn">ðŸ”„ Play Again</button>
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
  // GAME 1: ðŸª™ COIN MERGE RUSH (Desi Suika 2048 Physics)
  // ==========================================
  class CoinMergeGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.gameOver = false;
      this.coins = [];
      this.nextTier = 0;
      this.dropperX = 180;
      this.dangerTimer = 0;
      this.canDrop = true;

      this.TIERS = [
        { label: 'â‚¹1', r: 16, color: '#b45309', val: 1 },
        { label: 'â‚¹2', r: 20, color: '#c2410c', val: 2 },
        { label: 'â‚¹5', r: 25, color: '#ca8a04', val: 5 },
        { label: 'â‚¹10', r: 30, color: '#eab308', val: 10 },
        { label: 'â‚¹20', r: 36, color: '#16a34a', val: 20 },
        { label: 'â‚¹50', r: 42, color: '#0284c7', val: 50 },
        { label: 'â‚¹100', r: 48, color: '#9333ea', val: 100 },
        { label: 'â‚¹200', r: 54, color: '#ea580c', val: 200 },
        { label: 'â‚¹500', r: 60, color: '#475569', val: 500 },
        { label: 'â‚¹2K', r: 68, color: '#db2777', val: 2000 },
        { label: 'ðŸ’Ž', r: 76, color: '#38bdf8', val: 10000 }
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

      // Touch & Pointer controls
      const handleMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = (clientX - rect.left) * (this.canvas.width / rect.width);
        this.dropperX = Math.max(30, Math.min(330, x));
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
      // Starting coins are tiers 0, 1, or 2
      this.nextTier = Math.floor(Math.random() * 3);
    }

    dropCoin() {
      this.canDrop = false;
      const tierObj = this.TIERS[this.nextTier];
      this.coins.push({
        x: this.dropperX,
        y: 60,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 2,
        r: tierObj.r,
        tier: this.nextTier,
        restingTime: 0
      });
      ArcadeAudio.playCoinDrop();
      this.pickNextTier();

      setTimeout(() => {
        this.canDrop = true;
      }, 550);
    }

    startLoop() {
      const GRAVITY = 0.38;
      const RESTITUTION = 0.25;
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
          if (c.x - c.r < 0) {
            c.x = c.r;
            c.vx = -c.vx * RESTITUTION;
          }
          if (c.x + c.r > this.canvas.width) {
            c.x = this.canvas.width - c.r;
            c.vx = -c.vx * RESTITUTION;
          }
          // Floor bound
          if (c.y + c.r > this.canvas.height) {
            c.y = this.canvas.height - c.r;
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
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = a.r + b.r;

            if (dist < minDist) {
              // Same tier merge
              if (a.tier === b.tier && a.tier < this.TIERS.length - 1 && !mergedThisFrame) {
                mergedThisFrame = true;
                const newTier = a.tier + 1;
                const midX = (a.x + b.x) / 2;
                const midY = (a.y + b.y) / 2;

                this.coins.splice(j, 1);
                this.coins.splice(i, 1);

                this.coins.push({
                  x: midX,
                  y: midY,
                  vx: (Math.random() - 0.5) * 1.5,
                  vy: -2,
                  r: this.TIERS[newTier].r,
                  tier: newTier,
                  restingTime: 0
                });

                this.score += this.TIERS[newTier].val * 2;
                const scoreEl = document.getElementById('funStageScore');
                if (scoreEl) scoreEl.textContent = String(this.score);

                ArcadeAudio.playCoinMerge(newTier);
                break;
              }

              // Elastic push apart
              const overlap = minDist - dist;
              const nx = dx / (dist || 1);
              const ny = dy / (dist || 1);

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

        // Danger line check
        let isOverDanger = false;
        for (const c of this.coins) {
          if (c.y - c.r < DANGER_Y && Math.abs(c.vy) < 0.5) {
            isOverDanger = true;
            break;
          }
        }
        if (isOverDanger) {
          this.dangerTimer++;
          if (this.dangerTimer > 180 && !this.gameOver) {
            this.triggerGameOver();
          }
        } else {
          this.dangerTimer = Math.max(0, this.dangerTimer - 1);
        }

        // Render Canvas
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

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      bgGrad.addColorStop(0, '#1c1917');
      bgGrad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Danger line
      ctx.strokeStyle = this.dangerTimer > 60 ? '#ef4444' : 'rgba(239,68,68,0.3)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, 100);
      ctx.lineTo(350, 100);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top guide dropper
      if (this.canDrop && !this.gameOver) {
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.dropperX, 20);
        ctx.lineTo(this.dropperX, 540);
        ctx.stroke();

        // Next coin preview at dropper
        const nextObj = this.TIERS[this.nextTier];
        ctx.save();
        ctx.fillStyle = nextObj.color;
        ctx.shadowColor = nextObj.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.dropperX, 40, nextObj.r * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(nextObj.label, this.dropperX, 40);
        ctx.restore();
      }

      // Render Coins
      for (const c of this.coins) {
        const tierObj = this.TIERS[c.tier];
        ctx.save();
        ctx.fillStyle = tierObj.color;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();

        // Inner rim
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Shading shine
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(c.x - c.r * 0.25, c.y - c.r * 0.25, c.r * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(10, Math.floor(c.r * 0.58))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tierObj.label, c.x, c.y);
        ctx.restore();
      }
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
  // GAME 2: ðŸŽï¸ TURBO HIGHWAY RACER (PlayIt Style Dodger)
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
        <button type="button" class="game-touch-btn" id="btnLeft">â¬…ï¸</button>
        <button type="button" class="game-touch-btn" id="btnHorn">ðŸ“¢ HORN</button>
        <button type="button" class="game-touch-btn" id="btnNitro" style="color:#f59e0b">âš¡ NITRO</button>
        <button type="button" class="game-touch-btn" id="btnRight">âž¡ï¸</button>
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
        { name: 'Auto', color: '#eab308', h: 60, speed: 2, icon: 'ðŸ›º' },
        { name: 'Truck', color: '#16a34a', h: 88, speed: 3.5, icon: 'ðŸšš' },
        { name: 'Taxi', color: '#f59e0b', h: 68, speed: 4.5, icon: 'ðŸš•' },
        { name: 'Police', color: '#3b82f6', h: 70, speed: 5.5, icon: 'ðŸš“' }
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
  // GAME 3: ðŸ¦ FLAPPY DESI COMEDY
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
  // GAME 4: â™ ï¸ CALL BREAK MASTER (4-Player Desi Taash)
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
        <div class="cb-player-slot cb-slot-north"><span>ðŸ‘¤ Guddu Bhaiya: Bid <b id="cbBidN">?</b> | Won <b id="cbWonN">0</b></span></div>
        <div class="cb-player-slot cb-slot-west"><span>ðŸ‘¤ Ramesh: Bid <b id="cbBidW">?</b> | Won <b id="cbWonW">0</b></span></div>
        <div class="cb-player-slot cb-slot-east"><span>ðŸ‘¤ Munna: Bid <b id="cbBidE">?</b> | Won <b id="cbWonE">0</b></span></div>
        <div class="cb-player-slot cb-slot-south"><span>ðŸŒŸ You: Bid <b id="cbBidS">?</b> | Won <b id="cbWonS">0</b></span></div>

        <!-- Table Trick Center -->
        <div class="cb-trick-table" id="cbTrickTable"></div>

        <!-- Hand Cards Row -->
        <div class="cb-hand-row" id="cbHandRow"></div>

        <!-- Bidding Dialog Overlay -->
        <div class="cb-bid-overlay" id="cbBidOverlay">
          <h3 style="font-size:18px;font-weight:900;color:#fff;margin-bottom:6px">â™ ï¸ Call Break: Apni Bid Chuno!</h3>
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
      const suits = ['â™ ', 'â™¥', 'â™¦', 'â™£'];
      const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      const deck = [];
      suits.forEach(s => ranks.forEach((r, idx) => deck.push({ suit: s, rank: r, value: idx + 2 })));
      // Shuffle
      deck.sort(() => Math.random() - 0.5);

      this.myCards = deck.slice(0, 13).sort((a, b) => {
        if (a.suit === b.suit) return b.value - a.value;
        return a.suit === 'â™ ' ? -1 : 1;
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
        const isRed = c.suit === 'â™¥' || c.suit === 'â™¦';
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
        const suits = ['â™ ', 'â™¥', 'â™¦', 'â™£'];
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
        const isRed = t.card.suit === 'â™¥' || t.card.suit === 'â™¦';
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
        if (candidate.card.suit === 'â™ ' && winningPlay.card.suit !== 'â™ ') {
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
  // GAME 5: ðŸ¤– AI COMEDY ROAST & LIE DETECTOR
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
          <h3>ðŸ¤– AI Lie Detector &amp; Roast</h3>
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
            ðŸ‘‰ Apne doston ke samne koi bhi jhooth bolo aur neeche <b>Fingerprint</b> dabakar scan karo!
          </div>
        </div>

        <!-- Scanner Fingerprint Button -->
        <button type="button" class="ld-scanner-btn" id="ldScanBtn" title="Hold to scan">
          <span>ðŸ‘†</span>
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
      roastBox.innerHTML = 'âš¡ AI Brainwaves &amp; Heartbeat analyze ho rahi hai... â³';

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
        verdictEl.innerHTML = 'ðŸš¨ 100% MAHA-JHOOTH DETECTED! ðŸš¨';
      } else {
        ArcadeAudio.playDingSuccess();
        verdictEl.className = 'ld-verdict truth';
        verdictEl.innerHTML = 'âœ… SACHAI (SURPRISINGLY TRUE!)';
      }
      verdictEl.style.display = 'block';

      // Fallback comedy roasts
      const lieRoasts = [
        `"Bhai rehem karo! Tumhare is jhooth se AI ke processor me dhuwan nikal gaya! ðŸ˜‚"`,
        `"Itna bada jhooth toh Bollywood ki filmein bhi nahi bolti bhai! ðŸ¤£"`,
        `"Bhai tumhare chehre ke heartbeat aur camera AI bata rahe hain ki ye 100% feka gaya hai! ðŸ’€"`
      ];
      const truthRoasts = [
        `"Arey baap re! Pehli baar machine ne kisi ka sach pakda hai! Tumhe 21 topon ki salami! ðŸ«¡"`,
        `"Kudrat ka karishma! Sach bolte hue pakde gaye bhai! Lallantop! ðŸŒŸ"`
      ];

      let roast = isLie ? lieRoasts[Math.floor(Math.random() * lieRoasts.length)] : truthRoasts[Math.floor(Math.random() * truthRoasts.length)];

      roastBox.innerHTML = `<b>AI Roast:</b> ${roast} <br><button type="button" class="arcade-sound-toggle" style="margin-top:8px" id="speakRoastBtn">ðŸ”Š Bolkar Sunao</button>`;

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
  // GAME 6: ðŸ§  AI INFINITE COMEDY & MOVIE QUIZ
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
          <span id="quizTimerText">â±ï¸ 15s</span>
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
        if (timerText) timerText.textContent = `â±ï¸ ${this.timeLeft}s`;
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
  // GAME 7: ðŸ DESI GULLY CRICKET
  // ==========================================
  class GullyCricketGame {
    constructor(container) {
      this.container = container;
      this.score = 0;
      this.wickets = 0;
      this.balls = 12; // 2 overs
      this.ballState = 'idle'; // 'idle', 'bowling', 'hit'
      this.ballX = 180;
      this.ballY = 120;
      this.ballRadius = 7;
      this.bowlerSpeed = 6.5;

      this.initUI();
      this.startLoop();
      this.bowlBall();
    }

    initUI() {
      this.wrap = document.createElement('div');
      this.wrap.className = 'cricket-wrap';

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'game-canvas';
      this.canvas.width = 360;
      this.canvas.height = 540;
      this.ctx = this.canvas.getContext('2d');
      this.wrap.appendChild(this.canvas);

      // HUD & Banner
      const hud = document.createElement('div');
      hud.className = 'cricket-hud';
      hud.innerHTML = `
        <span>RUNS: <b id="cricketRuns" style="color:#22c55e">0</b>/<b id="cricketWkts">0</b></span>
        <span>BALLS: <b id="cricketBalls">12</b></span>
      `;
      this.wrap.appendChild(hud);

      this.banner = document.createElement('div');
      this.banner.className = 'cricket-banner';
      this.wrap.appendChild(this.banner);

      // Swing Bat Control
      const swingBar = document.createElement('div');
      swingBar.className = 'game-touch-bar';
      swingBar.innerHTML = `<button type="button" class="game-touch-btn" style="background:#e63946;color:#fff;font-size:16px" id="swingBatBtn">ðŸ SWING BAT (TAP TO HIT)</button>`;
      this.wrap.appendChild(swingBar);
      this.container.appendChild(this.wrap);

      swingBar.querySelector('#swingBatBtn').onclick = () => this.swingBat();
      this.canvas.onclick = () => this.swingBat();
    }

    bowlBall() {
      if (this.balls <= 0 || this.wickets >= 3) {
        this.triggerGameOver();
        return;
      }
      this.ballState = 'bowling';
      this.ballX = 180 + (Math.random() - 0.5) * 40;
      this.ballY = 120;
      this.balls--;
      document.getElementById('cricketBalls').textContent = String(this.balls);
    }

    swingBat() {
      if (this.ballState !== 'bowling') return;

      // Crease area is y: 440 to 480
      const dist = Math.abs(this.ballY - 450);
      ArcadeAudio.playBatHit();

      if (dist < 18) {
        // Perfect Timing: SIXER!
        this.ballState = 'hit';
        this.score += 6;
        this.showBanner('ðŸš€ SIX OUT OF STADIUM! +6', '#22c55e');
        ArcadeAudio.playCrowdCheer();
      } else if (dist < 38) {
        // Good Timing: FOUR!
        this.ballState = 'hit';
        this.score += 4;
        this.showBanner('ðŸ”¥ ROCKET FOUR! +4', '#38bdf8');
        ArcadeAudio.playDingSuccess();
      } else if (dist < 60) {
        this.ballState = 'hit';
        this.score += 1;
        this.showBanner('ðŸƒ SINGLE +1', '#eab308');
      } else {
        // Missed: Bowled out!
        this.ballState = 'out';
        this.wickets++;
        this.showBanner('ðŸ’¥ BOWLED OUT!', '#ef4444');
        ArcadeAudio.playCrash();
      }

      document.getElementById('cricketRuns').textContent = String(this.score);
      document.getElementById('cricketWkts').textContent = String(this.wickets);
      const scoreEl = document.getElementById('funStageScore');
      if (scoreEl) scoreEl.textContent = String(this.score);

      setTimeout(() => this.bowlBall(), 1500);
    }

    showBanner(text, color) {
      this.banner.textContent = text;
      this.banner.style.color = color;
      this.banner.style.display = 'block';
      setTimeout(() => {
        this.banner.style.display = 'none';
      }, 1200);
    }

    startLoop() {
      const loop = () => {
        if (this.destroyed) return;

        if (this.ballState === 'bowling') {
          this.ballY += this.bowlerSpeed;
          if (this.ballY > 520) {
            // Ball passed unhit
            this.ballState = 'idle';
            this.showBanner('DOT BALL', '#aaa');
            setTimeout(() => this.bowlBall(), 1200);
          }
        }

        this.render();
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, 360, 540);

      // Pitch Grass
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 360, 540);

      // Pitch Turf Strip
      ctx.fillStyle = '#d97706';
      ctx.fillRect(120, 0, 120, 540);

      // Bowling & Batting Crease lines
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(120, 140);
      ctx.lineTo(240, 140);
      ctx.moveTo(120, 460);
      ctx.lineTo(240, 460);
      ctx.stroke();

      // Wickets (Stumps)
      ctx.fillStyle = '#fef08a';
      // Bowler stumps
      ctx.fillRect(174, 110, 12, 16);
      // Batsman stumps
      ctx.fillRect(174, 470, 12, 18);

      // Ball
      if (this.ballState === 'bowling') {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(this.ballX, this.ballY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Batsman Silhouette
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(150, 450, 14, 0, Math.PI * 2);
      ctx.fill();
      // Bat
      ctx.fillStyle = '#78350f';
      ctx.fillRect(162, 442, 6, 26);
    }

    triggerGameOver() {
      this.ballState = 'idle';
      showGameOverOverlay(this.wrap, this.score, 'cricket', () => {
        window.launchArcadeGame('cricket');
      });
    }

    destroy() {
      this.destroyed = true;
      if (this.raf) cancelAnimationFrame(this.raf);
    }
  }

  // Initialize player card on script load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayerCard);
  } else {
    updatePlayerCard();
  }
})();
