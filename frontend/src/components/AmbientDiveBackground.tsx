"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * AmbientDiveBackground
 *
 * Sitewide ambient WebGL layer: a drifting particle field + a subtle
 * radial light-ray glow, with the camera slowly "diving" forward as
 * the user scrolls the page. Inspired by mesh3d.gallery's
 * "the-state-of-the-gallery" scroll experience, restyled in brand
 * electric-lime at low opacity so it never competes with content.
 *
 * Mount ONCE in ClientShell (not layout.tsx), guarded so it does not
 * render on /admin/* routes.
 */

// Brand token --color-electric-lime: #d3fd50 = 0xd3fd50 (r=211 g=253 b=80)
const ACCENT = 0xd3fd50;

function isReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function makeGlowTexture(): THREE.Texture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  // rgba values match --color-electric-lime #d3fd50 (r=211, g=253, b=80)
  gradient.addColorStop(0,    "rgba(211,253,80,0.55)");
  gradient.addColorStop(0.35, "rgba(211,253,80,0.18)");
  gradient.addColorStop(1,    "rgba(211,253,80,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function AmbientDiveBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = isReducedMotion();
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 220 : 550;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // --- particle field ---
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120 - 20;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particleMat = new THREE.PointsMaterial({
      color: ACCENT,
      size: 0.12,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- distant radial glow (the "light rays" horizon point) ---
    const glowTexture = makeGlowTexture();
    const glowMat = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(70, 70, 1);
    glow.position.set(0, -6, -90);
    scene.add(glow);

    // fainter secondary glow for depth
    const glow2 = new THREE.Sprite(glowMat.clone());
    (glow2.material as THREE.SpriteMaterial).opacity = 0.12;
    glow2.scale.set(40, 40, 1);
    glow2.position.set(0, -4, -50);
    scene.add(glow2);

    // --- scroll-driven dive, smoothed ---
    let targetProgress = 0;
    let currentProgress = 0;

    function getScrollProgress() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      return Math.min(1, Math.max(0, window.scrollY / scrollable));
    }

    function handleScroll() {
      targetProgress = getScrollProgress();
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleResize);

    let visible = document.visibilityState === "visible";
    function handleVisibility() {
      visible = document.visibilityState === "visible";
    }
    document.addEventListener("visibilitychange", handleVisibility);

    let rafId: number;
    const DIVE_DEPTH = 60; // how far the camera travels across full scroll

    function animate() {
      rafId = requestAnimationFrame(animate);
      if (!visible) return;

      if (!reduced) {
        currentProgress += (targetProgress - currentProgress) * 0.06;
        camera.position.z = 20 - currentProgress * DIVE_DEPTH;

        const t = performance.now() * 0.00005;
        particles.rotation.y = t;
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      particleGeo.dispose();
      particleMat.dispose();
      glowTexture.dispose();
      glowMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
