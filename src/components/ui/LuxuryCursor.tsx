import { useEffect, useRef, useState } from 'react';

export function LuxuryCursor({ reducedMotion }: { reducedMotion: boolean }) {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setEnabled(false);
      return;
    }
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return;
    setEnabled(true);

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let hoveringInteractive = false;
    let rafId = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const target = e.target as HTMLElement | null;
      hoveringInteractive = Boolean(
        target?.closest('button, a, input, select, textarea, label, [role="button"]')
      );
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      if (ringRef.current) {
        const scale = hoveringInteractive ? 1.45 : 1;
        ringRef.current.style.transform = `translate3d(${currentX - 18}px, ${currentY - 18}px, 0) scale(${scale})`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX - 3}px, ${targetY - 3}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reducedMotion]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 hidden md:block">
      <div
        ref={ringRef}
        className="fixed left-0 top-0 h-9 w-9 rounded-full border border-[#D9B18C]/55 transition-[border-color] duration-200"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-[#F5DDE6]"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}
