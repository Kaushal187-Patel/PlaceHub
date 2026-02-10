import { useEffect, useRef, useState } from "react";

// Custom animated cursor (desktop only). Falls back to normal cursor on touch.
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  const [enabled, setEnabled] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    // Only enable on devices with a fine pointer (mouse/trackpad).
    const canUseFinePointer =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: fine)").matches;

    setEnabled(canUseFinePointer);
    if (!canUseFinePointer) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onOver = (e) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      const isInteractive = !!el.closest(
        "a, button, input, textarea, select, [role='button'], [data-cursor='pointer']",
      );
      setIsPointer(isInteractive);
      if (isInteractive) {
        root.classList.add("custom-cursor-over-clickable");
      } else {
        root.classList.remove("custom-cursor-over-clickable");
      }
    };

    const animate = () => {
      // smooth follow (lerp) for ring
      const dx = mouse.current.x - ring.current.x;
      const dy = mouse.current.y - ring.current.y;
      ring.current.x += dx * 0.16;
      ring.current.y += dy * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }

      rafId.current = window.requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    rafId.current = window.requestAnimationFrame(animate);

    return () => {
      root.classList.remove(
        "has-custom-cursor",
        "custom-cursor-over-clickable",
      );
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      if (rafId.current) window.cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        className={[
          "custom-cursor-ring",
          isPointer ? "custom-cursor-ring--pointer" : "",
        ].join(" ")}
        aria-hidden="true"
      />
      <div
        ref={dotRef}
        className={[
          "custom-cursor-dot",
          isPointer ? "custom-cursor-dot--pointer" : "",
        ].join(" ")}
        aria-hidden="true"
      />
    </>
  );
}
