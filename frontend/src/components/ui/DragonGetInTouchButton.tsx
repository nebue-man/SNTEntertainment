"use client";

import { useRef, useEffect, useCallback, useState } from "react";

const PALETTE = {
  body: "#d3fd50", // matches --color-electric-lime exactly
  wing: "#5f7a1e",
  eye:  "#161c08",
};

const PX = 4;

type Point = [number, number];

const head: Point[] = [
  [-1, 0], [0, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
  [-1, 2], [0, 2], [1, 2],
];
const neck: Point[] = [[0, 3], [0, 4], [0, 5]];
const torso: Point[] = [
  [-1, 6], [0, 6], [1, 6],
  [-1, 7], [0, 7], [1, 7],
  [-2, 8], [-1, 8], [0, 8], [1, 8], [2, 8],
];
const tail: Point[] = [
  [0, 9],  [0, 10], [0, 11], [0, 12], [0, 13],
  [-1, 14], [0, 14], [1, 14],
  [0, 15], [0, 16],
];

const wingUpHalf: Point[] = [
  [2, 4], [3, 3], [4, 2], [5, 1], [6, 1],
  [3, 5], [4, 4], [5, 3], [6, 2], [7, 2],
  [4, 6], [5, 5], [6, 4], [7, 3], [8, 3],
  [5, 7], [6, 6], [7, 5], [8, 4], [9, 4],
];
const wingMidHalf: Point[] = [
  [2, 7],  [3, 7],  [4, 7],  [5, 7],  [6, 7],  [7, 7],  [8, 7],  [9, 7],
  [2, 8],  [4, 8],  [6, 8],  [8, 8],
  [10, 7], [11, 7],
];
const wingDownHalf: Point[] = [
  [2, 10], [3, 11], [4, 12], [5, 13], [6, 13],
  [3, 9],  [4, 10], [5, 11], [6, 12], [7, 12],
  [4, 8],  [5, 9],  [6, 10], [7, 11], [8, 11],
  [5, 7],  [6, 8],  [7, 9],  [8, 10], [9, 10],
];

function mirror(half: Point[]): Point[] {
  return [...half, ...half.map(([x, y]) => [-x, y] as Point)];
}

const wingsUp   = mirror(wingUpHalf);
const wingsMid  = mirror(wingMidHalf);
const wingsDown = mirror(wingDownHalf);
const flapFrames = [wingsUp, wingsMid, wingsDown, wingsMid];

const bodyPixels = [...head, ...neck, ...torso, ...tail];

// Canvas dimensions — separate from button dimensions since label now lives below canvas
const CANVAS_W = 180;
const CANVAS_H = 68;

interface DragonGetInTouchButtonProps {
  label?:     string;
  onClick?:   () => void;
  className?: string;
}

export default function DragonGetInTouchButton({
  label     = "GET IN TOUCH",
  onClick,
  className = "",
}: DragonGetInTouchButtonProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const hovering   = useRef(false);
  const frameIndex = useRef(0);
  const frameTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafId      = useRef<number | null>(null);
  const bob        = useRef(0);
  const [glow, setGlow] = useState(false);

  // draw() uses logical pixel coordinates, not physical canvas.width/canvas.height.
  // Using canvas.width after ctx.scale(dpr, dpr) would place the dragon at 2×
  // the intended position on HiDPI displays.
  const draw = useCallback(
    (wings: Point[], liftY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const cx = CANVAS_W / 2;
      const cy = CANVAS_H / 2 - 34 + liftY;

      ctx.fillStyle = PALETTE.wing;
      wings.forEach(([x, y]) => {
        ctx.fillRect(cx + x * PX, cy + y * PX, PX, PX);
      });

      ctx.fillStyle = PALETTE.body;
      bodyPixels.forEach(([x, y]) => {
        ctx.fillRect(cx + x * PX, cy + y * PX, PX, PX);
      });

      ctx.fillStyle = PALETTE.eye;
      ctx.fillRect(cx - 6, cy, PX, PX);
      ctx.fillRect(cx + PX, cy, PX, PX);
    },
    []
  );

  // Canvas setup — HiDPI-aware
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    draw(wingsMid, 0);
  }, [draw]);

  const stopFlap = useCallback(() => {
    if (frameTimer.current) {
      clearInterval(frameTimer.current);
      frameTimer.current = null;
    }
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    frameIndex.current = 0;
    bob.current        = 0;
    draw(wingsMid, 0);
  }, [draw]);

  const startFlap = useCallback(() => {
    hovering.current = true;

    frameTimer.current = setInterval(() => {
      frameIndex.current = (frameIndex.current + 1) % flapFrames.length;
    }, 130);

    let t = 0;
    const loop = () => {
      if (!hovering.current) return;
      t += 0.12;
      bob.current = Math.sin(t) * 2.5;
      draw(flapFrames[frameIndex.current], bob.current);
      rafId.current = requestAnimationFrame(loop);
    };
    loop();
  }, [draw]);

  const handleMouseEnter = () => {
    setGlow(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    startFlap();
  };

  const handleMouseLeave = () => {
    hovering.current = false;
    setGlow(false);
    stopFlap();
  };

  useEffect(() => {
    return () => {
      hovering.current = false;
      if (frameTimer.current) clearInterval(frameTimer.current);
      if (rafId.current)      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex flex-col items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d3fd50] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${className}`}
      style={{
        width:              CANVAS_W,
        paddingBottom:      10,
        background:         glow
          ? 'rgba(211, 253, 80, 0.04)'
          : 'rgba(0, 0, 0, 0.12)',
        backdropFilter:     'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border:             glow
          ? '1px solid rgba(211, 253, 80, 0.55)'
          : '1px solid rgba(211, 253, 80, 0.18)',
        borderRadius:       14,
        boxShadow:          glow
          ? '0 0 24px rgba(211, 253, 80, 0.18), inset 0 1px 0 rgba(211, 253, 80, 0.08)'
          : '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        transition:         'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        cursor:             'pointer',
      }}
      aria-label={label}
    >
      {/* Dragon canvas — transparent bg, flows naturally above the label */}
      <canvas
        ref={canvasRef}
        style={{ width: CANVAS_W, height: CANVAS_H, display: 'block', flexShrink: 0 }}
      />
      {/* Label below the dragon, never overlapping the animation */}
      <span
        className="select-none font-bold uppercase"
        style={{
          color:         "#d3fd50",
          fontFamily:    "var(--font-mono)",
          fontSize:      10,
          letterSpacing: "0.15em",
          lineHeight:    1,
          marginTop:     -2,
        }}
      >
        {label}
      </span>
    </button>
  );
}
