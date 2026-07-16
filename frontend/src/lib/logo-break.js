'use client'

/**
 * logo-break.js
 *
 * Turns a logo (image or text fallback) into a particle field.
 * Supports two break modes:
 *   - break()              fire-and-forget physics explosion (existing)
 *   - breakScrub(0..1)     scroll-driven, fully reversible (new)
 *
 * Usage:
 *   const lb = new LogoBreak(canvas, { count: 2000, color: '#ffffff',
 *                                      displayWidth: W, displayHeight: H });
 *   await lb.loadFromImage('/logo-white.png', { sampleStride: 1 });
 *   lb.start();
 *   lb.breakScrub(0.5); // particles 50% dispersed
 */

export class LogoBreak {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');

    // Allow DPR-scaled canvases: caller passes logical (CSS-pixel) display size.
    // All internal coordinates are in CSS pixels so the scaled ctx is transparent.
    this.width  = opts.displayWidth  ?? canvas.width;
    this.height = opts.displayHeight ?? canvas.height;

    this.count          = opts.count          ?? 700;
    this.color          = opts.color          ?? '#ffffff';
    this.particleRadius = opts.particleRadius ?? 1.6;
    this.repelOnHover   = opts.repelOnHover   ?? true;
    this.repelRadius    = opts.repelRadius    ?? 55;
    this.repelStrength  = opts.repelStrength  ?? 3.2;
    this.homeEase       = opts.homeEase       ?? 0.15;
    this.explodeSpeedMin = opts.explodeSpeedMin ?? 3;
    this.explodeSpeedMax = opts.explodeSpeedMax ?? 10;
    this.explodeDrag    = opts.explodeDrag    ?? 0.96;
    this.returnDelayMs  = opts.returnDelayMs  ?? 900;
    this.springStrength = opts.springStrength ?? 0.02;
    this.springDamping  = opts.springDamping  ?? 0.82;

    this.particles     = [];
    this._scrubVectors = null;
    this.mouse         = { x: -9999, y: -9999, active: false };
    this._raf          = null;

    if (this.repelOnHover) {
      canvas.addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect();
        // Mouse in CSS pixels — matches particle coordinate space.
        this.mouse.x = (e.clientX - r.left) * (this.width / r.width);
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
    alphaThreshold     = 40,
    brightnessThreshold = 30,
    fit                = 'contain',
    sampleStride       = 1,
  } = {}) {
    const img = await this._loadImage(src);

    const off  = document.createElement('canvas');
    off.width  = this.width;
    off.height = this.height;
    const octx = off.getContext('2d');

    const scale = fit === 'contain'
      ? Math.min(this.width / img.width,  this.height / img.height)
      : Math.max(this.width / img.width,  this.height / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    octx.drawImage(img, (this.width - dw) / 2, (this.height - dh) / 2, dw, dh);

    const { data }   = octx.getImageData(0, 0, this.width, this.height);
    const candidates = [];
    const stride     = Math.max(1, Math.round(sampleStride));
    for (let y = 0; y < this.height; y += stride) {
      for (let x = 0; x < this.width; x += stride) {
        const i = (y * this.width + x) * 4;
        if (
          data[i + 3] > alphaThreshold &&
          (data[i] + data[i + 1] + data[i + 2]) / 3 > brightnessThreshold
        ) {
          candidates.push({ x, y });
        }
      }
    }
    this._setParticlesFromCandidates(candidates);
  }

  loadFromText(text, { font = '700 120px system-ui, -apple-system, sans-serif' } = {}) {
    const off  = document.createElement('canvas');
    off.width  = this.width;
    off.height = this.height;
    const octx = off.getContext('2d');
    octx.fillStyle      = '#ffffff';
    octx.font           = font;
    octx.textAlign      = 'center';
    octx.textBaseline   = 'middle';
    octx.fillText(text, this.width / 2, this.height / 2);

    const { data }   = octx.getImageData(0, 0, this.width, this.height);
    const candidates = [];
    for (let y = 0; y < this.height; y += 2) {
      for (let x = 0; x < this.width; x += 2) {
        const i = (y * this.width + x) * 4;
        if (data[i + 3] > 60) candidates.push({ x, y });
      }
    }
    this._setParticlesFromCandidates(candidates);
  }

  _loadImage(src) {
    return new Promise((resolve, reject) => {
      const img        = new Image();
      img.crossOrigin  = 'anonymous';
      img.onload       = () => resolve(img);
      img.onerror      = reject;
      img.src          = src;
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
        mode: 'home',
      });
    }
    this._scrubVectors = null; // invalidate when particles change
  }

  // ── Scroll-scrubbed break (reversible) ───────────────────────────────

  _initScrubVectors() {
    const diagonal  = Math.sqrt(this.width * this.width + this.height * this.height);
    const baseSpeed = diagonal * 0.7;
    this._scrubVectors = this.particles.map(() => {
      const ang   = Math.random() * Math.PI * 2;
      const speed = baseSpeed * (0.55 + Math.random() * 0.75); // 55–130% of diagonal*0.7
      return { vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed };
    });
  }

  /**
   * Drive particle dispersion from scroll progress (0 = assembled, 1 = fully dispersed).
   * Fully reversible: breakScrub(0) re-assembles and restores cursor-repulsion mode.
   */
  breakScrub(progress) {
    if (!this._scrubVectors) this._initScrubVectors();

    if (progress <= 0) {
      for (const p of this.particles) {
        p.x = p.homeX; p.y = p.homeY;
        p.vx = 0; p.vy = 0;
        p.mode = 'home';
      }
      return;
    }

    // Ease-out quadratic: explosive start, tapering at full dispersion.
    const t = 1 - Math.pow(1 - Math.min(progress, 1), 2);

    for (let i = 0; i < this.particles.length; i++) {
      const p  = this.particles[i];
      const sv = this._scrubVectors[i];
      p.x    = p.homeX + sv.vx * t;
      p.y    = p.homeY + sv.vy * t;
      p.mode = 'scrubbing';
    }
  }

  // ── Physics-based break (fire-and-forget, existing API) ──────────────

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

  // ── Render loop ───────────────────────────────────────────────────────

  _tick = () => {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    for (const p of this.particles) {
      if (p.mode === 'scrubbing') {
        // Position driven externally by breakScrub() — render only, no physics.
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
      } else { // 'home' — cursor repulsion + ease to home
        if (this.repelOnHover && this.mouse.active) {
          const dx   = p.x - this.mouse.x, dy = p.y - this.mouse.y;
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

      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(p.x, p.y, this.particleRadius, 0, Math.PI * 2);
      ctx.fill();
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
    canvas.style.width         = rect.width  + 'px';
    canvas.style.height        = rect.height + 'px';
    canvas.style.position      = 'absolute';
    canvas.style.left          = '0';
    canvas.style.top           = '0';
    canvas.style.pointerEvents = 'none';

    const parent   = el.parentElement;
    const computed = getComputedStyle(parent);
    if (computed.position === 'static') parent.style.position = 'relative';

    el.style.opacity = '0';
    parent.appendChild(canvas);

    const lb  = new LogoBreak(canvas, opts);
    const src = el.tagName === 'IMG' ? el.src : null;
    if (src) await lb.loadFromImage(src);
    return lb;
  }
}
