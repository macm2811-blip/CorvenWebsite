"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./fit-slide.module.css";
export function FitSlide({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null),
    page = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const resize = () => {
      if (frame.current && page.current)
        setScale(
          Math.min(
            frame.current.clientWidth / 960,
            frame.current.clientHeight /
              Math.max(540, page.current.scrollHeight),
          ),
        );
    };
    const observer = new ResizeObserver(resize);
    if (frame.current) observer.observe(frame.current);
    if (page.current) observer.observe(page.current);
    resize();
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={frame} className={styles.frame}>
      <div
        ref={page}
        className={styles.page}
        style={{ transform: `translate(-50%,-50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
