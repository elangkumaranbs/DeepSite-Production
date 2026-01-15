"use client";

import { useEffect, useRef } from "react";

export function AnimatedDotsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<
    Array<{ x: number; y: number; targetColor: number; currentColor: number }>
  >([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Helper function to convert OKLCH to RGB
    const oklchToRgb = (
      oklchString: string
    ): { r: number; g: number; b: number } => {
      const temp = document.createElement("div");
      temp.style.color = oklchString;
      document.body.appendChild(temp);
      const computed = window.getComputedStyle(temp).color;
      document.body.removeChild(temp);

      // Parse RGB values from the computed color string
      const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
        };
      }
      return { r: 200, g: 200, b: 200 }; // Fallback
    };

    // Get theme colors from CSS variables
    const getThemeColors = () => {
      const style = getComputedStyle(document.documentElement);
      const mutedFg = style.getPropertyValue("--muted-foreground").trim();
      const primary = style.getPropertyValue("--primary").trim();

      return {
        base: oklchToRgb(`oklch(${mutedFg})`),
        accent: oklchToRgb(`oklch(${primary})`),
      };
    };

    const colors = getThemeColors();

    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Reinitialize dots when canvas size changes
      initializeDots();
    };

    const initializeDots = () => {
      const rect = canvas.getBoundingClientRect();
      const spacing = 30; // Space between dots
      const cols = Math.ceil(rect.width / spacing);
      const rows = Math.ceil(rect.height / spacing);

      dotsRef.current = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dotsRef.current.push({
            x: i * spacing + spacing / 2,
            y: j * spacing + spacing / 2,
            targetColor: 0, // 0 = gray, 1 = orange
            currentColor: 0,
          });
        }
      }
    };

    updateCanvasSize();

    // Handle mouse move
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", updateCanvasSize);

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const hoverRadius = 80; // Distance for hover effect
      const { x: mouseX, y: mouseY } = mouseRef.current;

      dotsRef.current.forEach((dot) => {
        // Calculate distance to mouse
        const dx = dot.x - mouseX;
        const dy = dot.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Update target color based on proximity to mouse
        if (distance < hoverRadius) {
          const intensity = 1 - distance / hoverRadius;
          dot.targetColor = intensity;
        } else {
          dot.targetColor = 0;
        }

        // Smooth transition with ease (lerp with easing factor)
        const easeSpeed = 0.1;
        dot.currentColor += (dot.targetColor - dot.currentColor) * easeSpeed;

        // Interpolate between base and accent colors from theme
        const r = Math.round(
          colors.base.r + (colors.accent.r - colors.base.r) * dot.currentColor
        );
        const g = Math.round(
          colors.base.g + (colors.accent.g - colors.base.g) * dot.currentColor
        );
        const b = Math.round(
          colors.base.b + (colors.accent.b - colors.base.b) * dot.currentColor
        );

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

        // Draw dot with size based on hover intensity
        const baseSize = 2;
        const hoverSize = 4;
        const size = baseSize + (hoverSize - baseSize) * dot.currentColor;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-1">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full -z-1"
        style={{ opacity: 0.6 }}
      />
      <div className="absolute inset-0 w-full h-full pointer-events-none bg-radial from-transparent dark:from-background/80 to-background z-1" />
    </div>
  );
}
