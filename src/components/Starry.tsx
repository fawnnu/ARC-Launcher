import { useRef, useEffect, useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";

const STAR_COUNT = 80;
const SPEED = 0.15;
const FADE_DURATION = 400;

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
}

function Starry() {
  const enabled = useSettingsStore((s) => s.animatedBg);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animRef = useRef<number>(0);
  const [visible, setVisible] = useState(enabled);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (enabled) {
      setVisible(true);
      setFading(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFading(false);
        });
      });
    } else {
      setFading(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setFading(false);
      }, FADE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    starsRef.current = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.2 + 0.4,
      opacity: Math.random() * 0.4 + 0.1,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
    }));

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const star of starsRef.current) {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = canvas!.width;
        if (star.x > canvas!.width) star.x = 0;
        if (star.y < 0) star.y = canvas!.height;
        if (star.y > canvas!.height) star.y = 0;

        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx!.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_DURATION}ms ease`,
      }}
    />
  );
}

export default Starry;
