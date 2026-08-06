"use client";

import React, { useRef, useEffect } from "react";
import { CursorConfig } from "@/types/profile";

interface CursorEngineProps {
  config: CursorConfig;
}

export default function CursorEngine({ config }: CursorEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  
  const mouseRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Handle custom cursor rendering and trails
  useEffect(() => {
    if (config.type === "default" && config.trail === "none") {
      document.body.style.cursor = "default";
      return;
    }
    
    // Hide standard cursor when custom cursor is active
    document.body.style.cursor = "none";

    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext("2d") : null;
    let animationFrameId: number;
    let trailParticles: any[] = [];

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class TrailParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
      life: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.size = Math.random() * 4 + 2;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        this.life = 1;

        const trail = configRef.current.trail;
        if (trail === "rainbow") {
          const colors = ["#ff007f", "#7c3aed", "#00f2fe", "#4ade80", "#facc15"];
          this.color = colors[Math.floor(Math.random() * colors.length)];
        } else if (trail === "fire") {
          const colors = ["#ff3c00", "#ff8000", "#ffcc00"];
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.vy = -Math.random() * 1.5 - 0.5;
        } else if (trail === "hearts") {
          this.color = "#ff4b72";
        } else if (trail === "bubbles") {
          this.color = "rgba(255, 255, 255, 0.3)";
          this.vy = -Math.random() * 0.8 - 0.2;
        } else {
          this.color = configRef.current.glowColor || "#ff007f";
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        this.life -= this.decay;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;

        const trail = configRef.current.trail;
        if (trail === "sparkles" || trail === "stars") {
          ctx.beginPath();
          ctx.moveTo(this.x, this.y - this.size);
          ctx.lineTo(this.x + this.size * 0.3, this.y - this.size * 0.3);
          ctx.lineTo(this.x + this.size, this.y);
          ctx.lineTo(this.x + this.size * 0.3, this.y + this.size * 0.3);
          ctx.lineTo(this.x, this.y + this.size);
          ctx.lineTo(this.x - this.size * 0.3, this.y + this.size * 0.3);
          ctx.lineTo(this.x - this.size, this.y);
          ctx.lineTo(this.x - this.size * 0.3, this.y - this.size * 0.3);
          ctx.closePath();
          ctx.fill();
        } else if (trail === "hearts") {
          ctx.translate(this.x, this.y);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, 0, 0, this.size);
          ctx.bezierCurveTo(this.size, 0, this.size/2, -this.size/2, 0, 0);
          ctx.fill();
        } else if (trail === "bubbles") {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Glow, smoke, pixel trails
          ctx.beginPath();
          if (trail === "pixel") {
            ctx.rect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
          } else {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          }
          ctx.fill();
        }
        ctx.restore();
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      // Spawn trail particle
      if (configRef.current.trail !== "none" && ctx) {
        trailParticles.push(new TrailParticle(e.clientX, e.clientY));
        if (trailParticles.length > 80) {
          trailParticles.shift();
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Damping animation loop
    const animate = () => {
      // Smooth ring position follow dot (dampening)
      // dampening scale: 1 (sluggish) to 10 (fast/responsive)
      const damp = (configRef.current.dampening || 5) / 100;
      
      const dx = mouseRef.current.x - ringPosRef.current.x;
      const dy = mouseRef.current.y - ringPosRef.current.y;
      
      ringPosRef.current.x += dx * damp;
      ringPosRef.current.y += dy * damp;

      // Update inner pointer
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;
      }

      // Update outer ring
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0)`;
      }

      // Draw trails
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        trailParticles.forEach((p, index) => {
          p.update();
          p.draw();
          if (p.life <= 0) {
            trailParticles.splice(index, 1);
          }
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      document.body.style.cursor = "default";
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config.type, config.trail]);

  if (config.type === "default" && config.trail === "none") return null;

  return (
    <>
      {config.trail !== "none" && (
        <canvas
          ref={canvasRef}
          className="cursor-trail-canvas"
        />
      )}
      
      {config.type !== "default" && (
        <>
          {/* Custom Inner pointer dot */}
          <div
            ref={dotRef}
            className="fixed top-0 left-0 pointer-events-none z-9999 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75"
            style={{
              width: `${config.size / 2}px`,
              height: `${config.size / 2}px`,
              backgroundColor: config.glowColor || "#ffffff",
              boxShadow: config.glow ? `0 0 10px ${config.glowColor || "#ff007f"}` : "none",
            }}
          />
          {/* Custom Outer Ring follower */}
          <div
            ref={ringRef}
            className="fixed top-0 left-0 pointer-events-none z-9998 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-transform duration-100 ease-out"
            style={{
              width: `${config.size * 1.8}px`,
              height: `${config.size * 1.8}px`,
              borderColor: `${config.glowColor || "#ffffff"}80`,
              boxShadow: config.glow ? `0 0 15px ${config.glowColor || "#ff007f"}20` : "none",
            }}
          />
        </>
      )}
    </>
  );
}
