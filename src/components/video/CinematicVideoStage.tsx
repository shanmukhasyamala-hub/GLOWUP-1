import { useEffect, useMemo, useRef, useState } from 'react';
import { SECTIONS, VIDEO_ASSETS } from '../../data/catalog';
import { SectionId } from '../../types/glowup';

interface CinematicVideoStageProps {
  activeSection: SectionId;
  reducedMotion: boolean;
}

type VideoKey = keyof typeof VIDEO_ASSETS;
const VIDEO_KEYS = Object.keys(VIDEO_ASSETS) as VideoKey[];

// Original uploaded MP4s are 478x850 (9:16) with active 16:9 content in center [y: 290..559].
// Computing scale against the active 474x264 region preserves 100% natural aspect ratio
// while eliminating black letterbox bars across desktop, tablet, and mobile viewports.
const NATIVE_W = 478;
const NATIVE_H = 850;
const ACTIVE_W = 472;
const ACTIVE_H = 260;

export function CinematicVideoStage({ activeSection, reducedMotion }: CinematicVideoStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Partial<Record<VideoKey, HTMLVideoElement | null>>>({});
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [failedKeys, setFailedKeys] = useState<Record<string, boolean>>({});
  const [loadedKeys, setLoadedKeys] = useState<Record<string, boolean>>({});

  const activeIndex = useMemo(
    () => Math.max(0, SECTIONS.findIndex((s) => s.id === activeSection)),
    [activeSection]
  );

  const activeVideoKey: VideoKey = SECTIONS[activeIndex]?.videoKey ?? 'hero';

  const adjacentKeys = useMemo(() => {
    const keys = new Set<VideoKey>([activeVideoKey]);
    if (SECTIONS[activeIndex - 1]) keys.add(SECTIONS[activeIndex - 1].videoKey);
    if (SECTIONS[activeIndex + 1]) keys.add(SECTIONS[activeIndex + 1].videoKey);
    return keys;
  }, [activeIndex, activeVideoKey]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setViewport({
        width: el.clientWidth || window.innerWidth,
        height: el.clientHeight || window.innerHeight,
      });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    window.addEventListener('resize', updateSize, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    VIDEO_KEYS.forEach((key) => {
      const video = videoRefs.current[key];
      if (!video) return;

      if (key === activeVideoKey && !reducedMotion) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            // Autoplay blocked or reduced power mode; poster/fallback keeps visual continuity
          });
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
      }
    });
  }, [activeVideoKey, reducedMotion]);

  const scale = Math.max(viewport.width / ACTIVE_W, viewport.height / ACTIVE_H);
  const renderedWidth = Math.ceil(NATIVE_W * scale);
  const renderedHeight = Math.ceil(NATIVE_H * scale);

  // Determine subtle section atmosphere tint so transitions feel seamless
  const sectionAtmosphere =
    activeSection === 'analysis'
      ? 'from-[#171221]/78 via-[#1B1326]/42 to-[#160F14]/84'
      : activeSection === 'dashboard' || activeSection === 'profile'
        ? 'from-[#160F14]/84 via-[#1C1219]/64 to-[#160F14]/88'
        : 'from-[#160F14]/68 via-[#1A1118]/34 to-[#160F14]/80';

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#160F14]"
    >
      {/* Warm luxury ambient gradient fallback layer */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 28% 24%, rgba(217,177,140,0.22) 0%, rgba(103,68,91,0.28) 42%, #160F14 100%)',
        }}
      />

      {VIDEO_KEYS.map((key) => {
        const asset = VIDEO_ASSETS[key];
        const isActive = key === activeVideoKey;
        const shouldPreload = adjacentKeys.has(key);
        const hasFailed = failedKeys[key];

        if (hasFailed) return null;

        return (
          <div
            key={key}
            className="absolute inset-0 overflow-hidden transition-opacity duration-1000 ease-out"
            style={{
              opacity: isActive ? (loadedKeys[key] ? 1 : 0.75) : 0,
              willChange: 'opacity',
            }}
          >
            <video
              ref={(node) => {
                videoRefs.current[key] = node;
              }}
              src={asset.src}
              muted
              loop
              playsInline
              preload={key === 'hero' || isActive ? 'auto' : shouldPreload ? 'metadata' : 'none'}
              onLoadedData={() => setLoadedKeys((prev) => (prev[key] ? prev : { ...prev, [key]: true }))}
              onError={() => setFailedKeys((prev) => ({ ...prev, [key]: true }))}
              style={{
                position: 'absolute',
                top: '50%',
                left: asset.focusX,
                width: `${renderedWidth}px`,
                height: `${renderedHeight}px`,
                maxWidth: 'none',
                transform: 'translate(-50%, -50%)',
                objectFit: 'contain',
              }}
            />
          </div>
        );
      })}

      {/* Calibrated cinematic contrast scrim */}
      <div className={`absolute inset-0 bg-gradient-to-b ${sectionAtmosphere} transition-colors duration-700`} />

      {/* Soft peripheral vignette for editorial depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 42%, rgba(18, 10, 16, 0.62) 100%)',
        }}
      />
    </div>
  );
}
