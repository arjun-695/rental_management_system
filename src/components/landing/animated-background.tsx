"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  hue: number;
  alpha: number;
  shape: "circle" | "ring" | "diamond";
}

/** Full-viewport animated particle and shape canvas with 3D depth projection. */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 60;
    const MAX_DEPTH = 600;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
    }
    resize();
    window.addEventListener("resize", resize);

    // Seed particles
    const shapes: Particle["shape"][] = ["circle", "ring", "diamond"];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * MAX_DEPTH,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        vz: -(Math.random() * 0.8 + 0.2),
        size: Math.random() * 3 + 1.5,
        hue: 230 + Math.random() * 50, // indigo-violet range
        alpha: Math.random() * 0.4 + 0.1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    // Mouse parallax
    let mx = 0;
    let my = 0;
    function onMove(e: MouseEvent) {
      mx = (e.clientX / width - 0.5) * 30;
      my = (e.clientY / height - 0.5) * 30;
    }
    window.addEventListener("mousemove", onMove);

    function project(p: Particle) {
      const scale = MAX_DEPTH / (MAX_DEPTH + p.z);
      return {
        sx: (p.x + mx) * scale + width / 2,
        sy: (p.y + my) * scale + height / 2,
        s: scale,
      };
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      // Subtle gradient overlay
      const grad = ctx!.createRadialGradient(
        width / 2,
        height / 3,
        0,
        width / 2,
        height / 3,
        Math.max(width, height)
      );
      grad.addColorStop(0, "rgba(99, 102, 241, 0.04)");
      grad.addColorStop(0.5, "rgba(139, 92, 246, 0.02)");
      grad.addColorStop(1, "transparent");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, width, height);

      for (const p of particles) {
        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Reset if passed camera
        if (p.z < 1) {
          p.z = MAX_DEPTH;
          p.x = Math.random() * width - width / 2;
          p.y = Math.random() * height - height / 2;
        }

        const { sx, sy, s } = project(p);
        const r = p.size * s * 2;
        const alpha = p.alpha * s;

        ctx!.save();
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = `hsla(${p.hue}, 70%, 65%, 1)`;
        ctx!.strokeStyle = `hsla(${p.hue}, 70%, 65%, 1)`;
        ctx!.lineWidth = 1;

        if (p.shape === "circle") {
          ctx!.beginPath();
          ctx!.arc(sx, sy, r, 0, Math.PI * 2);
          ctx!.fill();
        } else if (p.shape === "ring") {
          ctx!.beginPath();
          ctx!.arc(sx, sy, r * 1.5, 0, Math.PI * 2);
          ctx!.stroke();
        } else {
          ctx!.beginPath();
          ctx!.moveTo(sx, sy - r * 1.6);
          ctx!.lineTo(sx + r, sy);
          ctx!.lineTo(sx, sy + r * 1.6);
          ctx!.lineTo(sx - r, sy);
          ctx!.closePath();
          ctx!.fill();
        }
        ctx!.restore();
      }

      // Draw subtle connection lines between close particles
      for (let i = 0; i < particles.length; i++) {
        const a = project(particles[i]);
        for (let j = i + 1; j < particles.length; j++) {
          const b = project(particles[j]);
          const dx = a.sx - b.sx;
          const dy = a.sy - b.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx!.save();
            ctx!.globalAlpha = (1 - dist / 140) * 0.08;
            ctx!.strokeStyle = "rgba(139, 92, 246, 1)";
            ctx!.lineWidth = 0.5;
            ctx!.beginPath();
            ctx!.moveTo(a.sx, a.sy);
            ctx!.lineTo(b.sx, b.sy);
            ctx!.stroke();
            ctx!.restore();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
