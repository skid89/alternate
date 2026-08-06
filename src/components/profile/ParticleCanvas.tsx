"use client";

import React, { useRef, useEffect } from "react";
import { ParticleConfig } from "@/types/profile";

interface ParticleCanvasProps {
  config: ParticleConfig;
}

export default function ParticleCanvas({ config }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef(config);

  // Keep configuration reference fresh to prevent restarting loop on simple changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const mouse = { x: -1000, y: -1000, radius: 120 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      angle: number;
      spin: number;
      character: string;

      constructor(canvasEl: HTMLCanvasElement) {
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.size = Math.random() * configRef.current.size + 1;
        this.color = configRef.current.color;
        this.alpha = Math.random() * configRef.current.opacity;
        this.vx = (Math.random() - 0.5) * configRef.current.speed;
        this.vy = (Math.random() - 0.5) * configRef.current.speed;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.02;
        this.character = "";

        // Customize particle properties depending on selected pattern style
        const type = configRef.current.type;
        if (type === "snow") {
          this.vy = Math.random() * configRef.current.speed + 0.2;
          this.vx = (Math.random() - 0.5) * 0.2;
        } else if (type === "rain") {
          this.vy = Math.random() * configRef.current.speed * 2 + 2;
          this.vx = (Math.random() - 0.2) * 0.5;
          this.size = Math.random() * 1.5 + 0.5;
        } else if (type === "sakura") {
          this.vy = Math.random() * configRef.current.speed + 0.4;
          this.vx = Math.random() * 0.5 - 0.1;
          this.size = Math.random() * 6 + 4;
          this.color = "#ffb7c5";
        } else if (type === "matrix") {
          this.vy = Math.random() * configRef.current.speed * 1.5 + 1;
          this.vx = 0;
          this.size = Math.random() * 8 + 8;
          const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$@#&%";
          this.character = chars.charAt(Math.floor(Math.random() * chars.length));
        } else if (type === "hearts") {
          this.vy = -(Math.random() * configRef.current.speed + 0.2);
          this.vx = (Math.random() - 0.5) * 0.3;
          this.size = Math.random() * 6 + 4;
          this.color = "#ff4b72";
        } else if (type === "bubbles") {
          this.vy = -(Math.random() * configRef.current.speed * 0.8 + 0.2);
          this.vx = (Math.random() - 0.5) * 0.4;
          this.size = Math.random() * 12 + 4;
        }
      }

      update(canvasEl: HTMLCanvasElement) {
        const type = configRef.current.type;

        // Apply velocities
        this.x += this.vx + configRef.current.wind;
        this.y += this.vy + configRef.current.gravity;

        // Sakura angle rotation
        if (type === "sakura" || type === "hearts") {
          this.angle += this.spin;
        }

        // Mouse interaction physics
        if (configRef.current.mouseInteraction) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            // Repel particles slightly
            this.x += Math.cos(angle) * force * 4;
            this.y += Math.sin(angle) * force * 4;
          }
        }

        // Keep boundaries
        if (this.x < 0) this.x = canvasEl.width;
        if (this.x > canvasEl.width) this.x = 0;

        if (type === "snow" || type === "rain" || type === "sakura" || type === "matrix") {
          if (this.y > canvasEl.height) {
            this.y = -20;
            this.x = Math.random() * canvasEl.width;
          }
        } else if (type === "hearts" || type === "bubbles") {
          if (this.y < -30) {
            this.y = canvasEl.height + 20;
            this.x = Math.random() * canvasEl.width;
          }
        } else {
          if (this.y < 0) this.y = canvasEl.height;
          if (this.y > canvasEl.height) this.y = 0;
        }
      }

      draw(ctxEl: CanvasRenderingContext2D) {
        const type = configRef.current.type;
        ctxEl.save();
        ctxEl.globalAlpha = this.alpha;
        ctxEl.fillStyle = this.color;

        if (type === "sakura") {
          ctxEl.translate(this.x, this.y);
          ctxEl.rotate(this.angle);
          ctxEl.beginPath();
          ctxEl.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
          ctxEl.fill();
        } else if (type === "matrix") {
          ctxEl.font = `${this.size}px Courier New`;
          ctxEl.fillStyle = this.color;
          ctxEl.fillText(this.character, this.x, this.y);
        } else if (type === "hearts") {
          ctxEl.translate(this.x, this.y);
          ctxEl.rotate(this.angle);
          ctxEl.beginPath();
          ctxEl.moveTo(0, 0);
          ctxEl.bezierCurveTo(-this.size/2, -this.size/2, -this.size, 0, 0, this.size);
          ctxEl.bezierCurveTo(this.size, 0, this.size/2, -this.size/2, 0, 0);
          ctxEl.fill();
        } else if (type === "bubbles") {
          ctxEl.beginPath();
          ctxEl.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctxEl.strokeStyle = this.color;
          ctxEl.lineWidth = 1;
          ctxEl.stroke();
          ctxEl.fillStyle = "rgba(255, 255, 255, 0.05)";
          ctxEl.fill();
        } else if (type === "sparkles") {
          ctxEl.beginPath();
          ctxEl.moveTo(this.x, this.y - this.size);
          ctxEl.lineTo(this.x + this.size * 0.3, this.y - this.size * 0.3);
          ctxEl.lineTo(this.x + this.size, this.y);
          ctxEl.lineTo(this.x + this.size * 0.3, this.y + this.size * 0.3);
          ctxEl.lineTo(this.x, this.y + this.size);
          ctxEl.lineTo(this.x - this.size * 0.3, this.y + this.size * 0.3);
          ctxEl.lineTo(this.x - this.size, this.y);
          ctxEl.lineTo(this.x - this.size * 0.3, this.y - this.size * 0.3);
          ctxEl.closePath();
          ctxEl.fill();
        } else if (type === "hexagons") {
          ctxEl.beginPath();
          const angle = Math.PI / 3;
          for (let i = 0; i < 6; i++) {
            ctxEl.lineTo(
              this.x + this.size * Math.cos(angle * i),
              this.y + this.size * Math.sin(angle * i)
            );
          }
          ctxEl.closePath();
          ctxEl.strokeStyle = this.color;
          ctxEl.stroke();
        } else {
          ctxEl.beginPath();
          if (type === "rain") {
            ctxEl.rect(this.x, this.y, 1, this.size * 4);
          } else {
            ctxEl.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          }
          ctxEl.fill();
        }

        ctxEl.restore();
      }
    }

    const initParticles = () => {
      particles = [];
      const density = configRef.current.density;
      for (let i = 0; i < density; i++) {
        particles.push(new Particle(canvas));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleCanvasClick = (e: MouseEvent) => {
      if (!configRef.current.clickInteraction) return;
      for (let i = 0; i < 8; i++) {
        const p = new Particle(canvas);
        p.x = e.clientX + (Math.random() - 0.5) * 40;
        p.y = e.clientY + (Math.random() - 0.5) * 40;
        p.vx = (Math.random() - 0.5) * 3;
        p.vy = (Math.random() - 0.5) * 3;
        particles.push(p);
      }
      if (particles.length > configRef.current.density * 2) {
        particles.splice(0, 8);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleCanvasClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (configRef.current.type !== "none") {
        particles.forEach((p) => {
          p.update(canvas);
          p.draw(ctx);
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
  }, [config.type, config.density]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
