'use client'

/**
 * logo-break.js
 *
 * Particle logo/tagline animation driven by a 0..1 scroll progress value.
 *
 *   progress 0 → particles at random scatter positions (initial/loading state)
 *   progress 1 → particles at home positions (logo/tagline fully assembled)
 *
 * Motion along quadratic bezier curves (not straight lines) gives organic arcing.
 * Per-particle random depth drives size + opacity variation for fake 2D parallax.
 *
 * Usage:
 *   const lb = new LogoBreak(canvas, { count: 2560, color: '#ffffff',
 *                                      displayWidth: W, displayHeight: H });
 *   await lb.loadFromImage('/logo-white.png', { sampleStride: 1, drawScale: 1.28 });
 *   await lb.loadFromImageAppend('/logo-white.png', { yStartFraction: 0.73,
 *                                count: 2304, radius: 1.3, drawScale: 1.28 });
 *   lb.start();
 *   lb.breakScrub(scrollProgress);  // call every scroll event
 */

export class LogoBreak {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');

    this.width  = opts.displayWidth  ?? canvas.width;
    this.height = opts.displayHeight ?? canvas.height;

    this.count           = opts.count           ?? 700;
    this.color           = opts.color           ?? '#ffffff';
    this.particleRadius  = opts.particleRadius  ?? 1.6;
    this.repelOnHover    = opts.repelOnHover    ?? true;
    this.repelRadius     = opts.repelRadius     ?? 55;
    this.repelStrength   = opts.repelStrength   ?? 3.2;
    this.homeEase        = opts.homeEase        ?? 0.15;
    this.explodeSpeedMin = opts.explodeSpeedMin ?? 3;
    this.explodeSpeedMax = opts.explodeSpeedMax ?? 10;
    this.explodeDrag     = opts.explodeDrag     ?? 0.96;
    this.returnDelayMs   = opts.returnDelayMs   ?? 900;
    this.springStrength  = opts.springStrength  ?? 0.02;
    this.springDamping   = opts.springDamping   ?? 0.82;

    this.particles      = [];
    this._scrubReady    = false;   // true once _initScrubVectors has run
    this._scrubTarget   = 0;       // raw target set by breakScrub()
    this._scrubProgress = 0;       // smoothed value lerped each frame toward _scrubTarget
    this._ambientMode   = false;   // true once startAmbient() is called (one-way)
    this.mouse          = { x: -9999, y: -9999, active: false };
    this._raf           = null;

    // Pause animation when the tab is hidden — only meaningful in ambient phase
    // where the animation runs indefinitely in the background.
    this._onVisibility = () => {
      if (!this._ambientMode) return;
      if (document.hidden) this.stop();
      else this.start();
    };
    document.addEventListener('visibilitychange', this._onVisibility);

    if (this.repelOnHover) {
      canvas.addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect();
        this.mouse.x = (e.clientX - r.left) * (this.width  / r.width);
        this.mouse.y = (e.clientY - r.top)  * (this.height / r.height);
        this.mouse.active = true;
      });
      canvas.addEventListener('pointerleave', () => {
        this.mouse.active = false;
      });
    }
  }

  // ── Asset loading ────────────────────────────────────────────────────

  async loadFromImage(src, {
    alphaThreshold      = 40,
    brightnessThreshold = 30,
    fit                 = 'contain',
    sampleStride        = 1,
    drawScale           = 1,
  } = {}) {
    const img = await this._loadImage(src);

    const off  = document.createElement('canvas');
    off.width  = this.width;
    off.height = this.height;
    const octx = off.getContext('2d');

    const baseScale = fit === 'contain'
      ? Math.min(this.width / img.width,  this.height / img.height)
      : Math.max(this.width / img.width,  this.height / img.height);
    const scale = baseScale * drawScale;
    const dw = img.width * scale, dh = img.height * scale;
    octx.drawImage(img, (this.width - dw) / 2, (this.height - dh) / 2, dw, dh);

    const { data } = octx.getImageData(0, 0, this.width, this.height);
    const candidates = [];
    const stride = Math.max(1, Math.round(sampleStride));
    for (let y = 0; y < this.height; y += stride) {
      for (let x = 0; x < this.width; x += stride) {
        const idx = (y * this.width + x) * 4;
        if (
          data[idx + 3] > alphaThreshold &&
          (data[idx] + data[idx + 1] + data[idx + 2]) / 3 > brightnessThreshold
        ) {
          candidates.push({ x, y });
        }
      }
    }
    this._setParticlesFromCandidates(candidates);
  }

  /**
   * Append a second particle population sampled from a vertical sub-region of the
   * image (e.g. the tagline band). Particles get a smaller radius for finer
   * letterform resolution. Triggers a full re-init of scatter vectors so the new
   * particles participate in the same animation as the logo-mark particles.
   */
  async loadFromImageAppend(src, {
    alphaThreshold      = 40,
    brightnessThreshold = 30,
    fit                 = 'contain',
    sampleStride        = 1,
    count               = 1500,
    yStartFraction      = 0,
    radius              = null,
    drawScale           = 1,
  } = {}) {
    const img = await this._loadImage(src);

    const off  = document.createElement('canvas');
    off.width  = this.width;
    off.height = this.height;
    const octx = off.getContext('2d');

    const baseScale = fit === 'contain'
      ? Math.min(this.width / img.width,  this.height / img.height)
      : Math.max(this.width / img.width,  this.height / img.height);
    const scale = baseScale * drawScale;
    const dw = img.width * scale, dh = img.height * scale;
    octx.drawImage(img, (this.width - dw) / 2, (this.height - dh) / 2, dw, dh);

    const { data } = octx.getImageData(0, 0, this.width, this.height);
    const candidates = [];
    const stride = Math.max(1, Math.round(sampleStride));
    const yStart = Math.floor(this.height * yStartFraction);

    for (let y = yStart; y < this.height; y += stride) {
      for (let x = 0; x < this.width; x += stride) {
        const idx = (y * this.width + x) * 4;
        if (
          data[idx + 3] > alphaThreshold &&
          (data[idx] + data[idx + 1] + data[idx + 2]) / 3 > brightnessThreshold
        ) {
          candidates.push({ x, y });
        }
      }
    }

    const n = Math.min(count, candidates.length);
    if (n === 0) return;
    const step = candidates.length / n;
    const r    = radius ?? this.particleRadius;
    for (let i = 0; i < n; i++) {
      const c = candidates[Math.floor(i * step)];
      this.particles.push({
        x: c.x, y: c.y,
        homeX: c.x, homeY: c.y,
        vx: 0, vy: 0,
        mode: 'scrubbing',
        radius: r,
        angle: Math.random() * Math.PI * 2,
        depth: Math.random(),
        sv: null,
      });
    }
    // Re-init scatter vectors so new particles are included and sorted by depth.
    this._initScrubVectors();
  }

  loadFromText(text, { font = '700 120px system-ui, -apple-system, sans-serif' } = {}) {
    const off  = document.createElement('canvas');
    off.width  = this.width;
    off.height = this.height;
    const octx = off.getContext('2d');
    octx.fillStyle    = '#ffffff';
    octx.font         = font;
    octx.textAlign    = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(text, this.width / 2, this.height / 2);

    const { data }   = octx.getImageData(0, 0, this.width, this.height);
    const candidates = [];
    for (let y = 0; y < this.height; y += 2) {
      for (let x = 0; x < this.width; x += 2) {
        const idx = (y * this.width + x) * 4;
        if (data[idx + 3] > 60) candidates.push({ x, y });
      }
    }
    this._setParticlesFromCandidates(candidates);
  }

  _loadImage(src) {
    return new Promise((resolve, reject) => {
      const img       = new Image();
      img.crossOrigin = 'anonymous';
      img.onload      = () => resolve(img);
      img.onerror     = reject;
      img.src         = src;
    });
  }

  _setParticlesFromCandidates(candidates) {
    const n    = Math.min(this.count, candidates.length);
    const step = candidates.length / n;
    this.particles = [];
    for (let i = 0; i < n; i++) {
      const c = candidates[Math.floor(i * step)];
      this.particles.push({
        x: c.x, y: c.y,
        homeX: c.x, homeY: c.y,
        vx: 0, vy: 0,
        mode: 'scrubbing',
        angle: Math.random() * Math.PI * 2,
        depth: Math.random(),
        sv: null,
      });
    }
    this._scrubTarget   = 0;
    this._scrubProgress = 0;
    this._initScrubVectors();
  }

  // ── Scatter / scrub initialisation ───────────────────────────────────

  _initScrubVectors() {
    const diagonal  = Math.sqrt(this.width * this.width + this.height * this.height);
    const baseSpeed = diagonal * 0.7;

    for (const p of this.particles) {
      const ang      = Math.random() * Math.PI * 2;
      const speed    = baseSpeed * (0.55 + Math.random() * 0.75);
      const vx       = Math.cos(ang) * speed;
      const vy       = Math.sin(ang) * speed;
      // curveMag: signed ratio of perpendicular control-point offset to path length.
      // Range ±0.45 gives noticeable arcing without wild overshoots.
      const curveMag = (Math.random() * 2 - 1) * 0.45;

      // Precompute bezier landmarks once so _tick does only multiplications.
      //   P0 = scatter position (progress 0)   = (homeX + vx, homeY + vy)
      //   P2 = home position   (progress 1)    = (homeX, homeY)
      //   P1 = control point at midpoint of P0→P2, offset perpendicular by curveMag.
      //        Perpendicular to direction (-vx,-vy) is (vy, -vx) (unit * |v|), so
      //        offset = (vy * curveMag, -vx * curveMag).
      const midX  = p.homeX + vx * 0.5;
      const midY  = p.homeY + vy * 0.5;

      p.sv = {
        vx, vy,
        delay:    Math.random(),          // stagger: 0 starts first, 1 starts last
        curveMag,
        scatterX: p.homeX + vx,           // P0
        scatterY: p.homeY + vy,
        ctrlX:    midX + vy * curveMag,   // P1
        ctrlY:    midY - vx * curveMag,
      };

      // Logo starts fully assembled at rest — progress 0 = home, progress 1 = scatter.
      p.x = p.homeX;
      p.y = p.homeY;
      p.mode = 'scrubbing';
    }

    // Sort by depth once so the draw loop can bin by alpha without re-sorting.
    this.particles.sort((a, b) => a.depth - b.depth);

    this._ambientMode  = false;
    this._scrubReady   = true;
    this._scrubProgress = 0;
  }

  // ── Public animation controls ─────────────────────────────────────────

  /**
   * Drive assembly from scroll position.
   *   progress 0 → fully scattered  (page top / intro not yet scrolled)
   *   progress 1 → fully assembled  (logo resolved, overlay exits)
   * Smooth the raw scroll value BEFORE calling this (e.g. lerp virtualScroll).
   */
  breakScrub(progress) {
    if (!this._scrubReady) this._initScrubVectors();
    this._scrubTarget = Math.max(0, Math.min(progress, 1));
  }

  break() {
    for (const p of this.particles) {
      const ang   = Math.random() * Math.PI * 2;
      const speed = this.explodeSpeedMin + Math.random() * (this.explodeSpeedMax - this.explodeSpeedMin);
      p.vx = Math.cos(ang) * speed;
      p.vy = Math.sin(ang) * speed;
      p.mode = 'exploding';
    }
    setTimeout(() => {
      for (const p of this.particles) p.mode = 'returning';
    }, this.returnDelayMs);
  }

  reassemble() {
    for (const p of this.particles) p.mode = 'returning';
  }

  /**
   * Switch all particles to independent ambient drift (one-way, irreversible).
   * Each particle gets a slow random velocity and transitions to 'ambient' mode.
   * Call this after the logo has broken enough that scroll-linking ends.
   */
  startAmbient() {
    for (const p of this.particles) {
      const ang   = Math.random() * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.18; // 0.08–0.26 px/frame at 60fps
      p.driftVx = Math.cos(ang) * speed;
      p.driftVy = Math.sin(ang) * speed;
      p.mode = 'ambient';
    }
    this._ambientMode = true;
  }

  // ── Render loop ───────────────────────────────────────────────────────

  _tick = () => {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // ── Smooth scroll progress ─────────────────────────────────────────
    // Lerp _scrubProgress toward the raw target set by breakScrub().
    // This decouples particle motion from scroll-event cadence: even a sudden
    // jump in _scrubTarget produces gradual particle movement.
    if (this._scrubReady) {
      this._scrubProgress += (this._scrubTarget - this._scrubProgress) * 0.08;
    }

    // MAX_DELAY: share of progress range reserved for per-particle stagger.
    // A particle with delay=1 won't start moving until progress > MAX_DELAY.
    const MAX_DELAY = 0.28;

    // ── Physics pass ──────────────────────────────────────────────────
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (p.mode === 'scrubbing') {
        const sv = p.sv;

        // Per-particle local progress with stagger shift.
        const localRaw = Math.max(0, Math.min(
          (this._scrubProgress - sv.delay * MAX_DELAY) / (1 - MAX_DELAY), 1
        ));

        // Ease-out quadratic: fast at the start of each particle's journey,
        // decelerates gracefully as it settles into its home position.
        const t  = 1 - Math.pow(1 - localRaw, 2);
        const mt = 1 - t;

        // Quadratic bezier: P0 (home) → P1 (control) → P2 (scatter).
        // progress=0 keeps particles at rest on the logo; progress=1 = fully broken.
        p.x = mt * mt * p.homeX + 2 * mt * t * sv.ctrlX + t * t * sv.scatterX;
        p.y = mt * mt * p.homeY + 2 * mt * t * sv.ctrlY + t * t * sv.scatterY;

      } else if (p.mode === 'exploding') {
        p.x  += p.vx; p.y  += p.vy;
        p.vx *= this.explodeDrag; p.vy *= this.explodeDrag;

      } else if (p.mode === 'returning') {
        p.vx += (p.homeX - p.x) * this.springStrength;
        p.vy += (p.homeY - p.y) * this.springStrength;
        p.vx *= this.springDamping; p.vy *= this.springDamping;
        p.x  += p.vx; p.y  += p.vy;
        if (
          Math.abs(p.homeX - p.x) < 0.3 && Math.abs(p.homeY - p.y) < 0.3 &&
          Math.abs(p.vx) < 0.1 && Math.abs(p.vy) < 0.1
        ) {
          p.x = p.homeX; p.y = p.homeY; p.vx = 0; p.vy = 0; p.mode = 'home';
        }

      } else if (p.mode === 'ambient') {
        // Independent gentle drift — no scroll link, no home target.
        // Tiny per-frame velocity perturbation produces organic floating motion.
        p.driftVx = (p.driftVx ?? 0) * 0.994 + (Math.random() - 0.5) * 0.006;
        p.driftVy = (p.driftVy ?? 0) * 0.994 + (Math.random() - 0.5) * 0.006;
        const spd = Math.sqrt(p.driftVx * p.driftVx + p.driftVy * p.driftVy);
        if (spd > 0.35) { p.driftVx *= 0.35 / spd; p.driftVy *= 0.35 / spd; }
        p.x += p.driftVx;
        p.y += p.driftVy;
        // Wrap far-off-screen particles to the opposite edge so the ambient
        // field stays populated without visible teleportation.
        if      (p.x < -80)               p.x = this.width  + 60;
        else if (p.x > this.width  + 80)  p.x = -60;
        if      (p.y < -80)               p.y = this.height + 60;
        else if (p.y > this.height + 80)  p.y = -60;

      } else { // 'home' — idle cursor repulsion + ease back to home
        if (this.repelOnHover && this.mouse.active) {
          const dx   = p.x - this.mouse.x;
          const dy   = p.y - this.mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < this.repelRadius && dist > 0.01) {
            const force = (this.repelRadius - dist) / this.repelRadius * this.repelStrength;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }
        p.x += (p.homeX - p.x) * this.homeEase;
        p.y += (p.homeY - p.y) * this.homeEase;
      }
    }

    // ── Boundary snap ────────────────────────────────────────────────
    // Snap to exact positions at the ends of the progress range to eliminate
    // floating-point drift from the exponential lerp never reaching 0 or 1.
    if (this._scrubReady) {
      if (this._scrubProgress < 0.002 && this._scrubTarget <= 0) {
        // Logo fully assembled — snap to exact home positions.
        for (const p of this.particles) {
          if (p.mode === 'scrubbing') { p.x = p.homeX; p.y = p.homeY; }
        }
        this._scrubProgress = 0;
      } else if (this._scrubProgress > 0.998 && this._scrubTarget >= 1) {
        // Logo fully broken — snap to scatter positions.
        for (const p of this.particles) {
          if (p.mode === 'scrubbing' && p.sv) { p.x = p.sv.scatterX; p.y = p.sv.scatterY; }
        }
        this._scrubProgress = 1;
      }
    }

    // ── Draw pass — depth-binned equilateral triangles ─────────────────
    //
    // Particles are sorted by depth (0 = far, 1 = near) from _initScrubVectors.
    // N_BINS alpha/size tiers are rendered in back-to-front order.
    // Each bin uses one beginPath/fill, so total draw calls = N_BINS (not N_particles).
    //
    // Size:  baseR * TRIANGLE_SCALE * (DEPTH_SIZE_MIN + depth * DEPTH_SIZE_RANGE)
    // Alpha: DEPTH_ALPHA_MIN + depth * DEPTH_ALPHA_RANGE
    //
    // Far particles are small and translucent; near particles are large and opaque.
    // This produces a convincing 2D parallax depth field with no extra geometry.
    const TWO_THIRDS_PI  = 2.0944;   // 2π/3
    const FOUR_THIRDS_PI = 4.1888;   // 4π/3
    const TRIANGLE_SCALE  = 1.4;     // circumradius multiplier vs the old circle radius
    const DEPTH_SIZE_MIN   = 0.55;
    const DEPTH_SIZE_RANGE = 0.90;   // size range: 0.55 → 1.45× base
    const DEPTH_ALPHA_MIN  = 0.30;
    const DEPTH_ALPHA_RANGE = 0.70;  // alpha range: 0.30 → 1.00
    const N_BINS = 5;

    ctx.fillStyle = this.color;
    let currentBin = -1;

    for (let i = 0; i < this.particles.length; i++) {
      const p   = this.particles[i];
      const bin = Math.min(Math.floor(p.depth * N_BINS), N_BINS - 1);

      if (bin !== currentBin) {
        if (currentBin >= 0) ctx.fill();          // commit previous bin
        currentBin       = bin;
        const t          = bin / (N_BINS - 1);    // 0..1 normalized bin position
        ctx.globalAlpha  = DEPTH_ALPHA_MIN + t * DEPTH_ALPHA_RANGE;
        ctx.beginPath();
      }

      const depthT  = p.depth;                    // exact depth, not binned
      const r = (p.radius ?? this.particleRadius) *
                TRIANGLE_SCALE *
                (DEPTH_SIZE_MIN + depthT * DEPTH_SIZE_RANGE);
      const a = p.angle ?? 0;

      ctx.moveTo(p.x + Math.cos(a)                 * r,  p.y + Math.sin(a)                 * r);
      ctx.lineTo(p.x + Math.cos(a + TWO_THIRDS_PI) * r,  p.y + Math.sin(a + TWO_THIRDS_PI) * r);
      ctx.lineTo(p.x + Math.cos(a + FOUR_THIRDS_PI)* r,  p.y + Math.sin(a + FOUR_THIRDS_PI)* r);
      ctx.closePath();
    }

    if (currentBin >= 0) {
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    this._raf = requestAnimationFrame(this._tick);
  };

  start() {
    if (!this._raf) this._raf = requestAnimationFrame(this._tick);
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  // ── Static helpers ────────────────────────────────────────────────────

  static async mountOverElement(el, opts = {}) {
    const rect   = el.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(rect.width  * 2);
    canvas.height = Math.round(rect.height * 2);
    canvas.style.cssText =
      'width:' + rect.width  + 'px;' +
      'height:' + rect.height + 'px;' +
      'position:absolute;left:0;top:0;pointer-events:none';

    const parent = el.parentElement;
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    el.style.opacity = '0';
    parent.appendChild(canvas);

    const lb  = new LogoBreak(canvas, opts);
    const src = el.tagName === 'IMG' ? el.src : null;
    if (src) await lb.loadFromImage(src);
    return lb;
  }
}
