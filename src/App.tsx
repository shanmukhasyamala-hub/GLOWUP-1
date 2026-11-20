import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { SECTIONS } from './data/catalog';
import { GlowUpProvider, useGlowUp } from './context/GlowUpContext';
import { CinematicVideoStage } from './components/video/CinematicVideoStage';
import { FloatingNav } from './components/nav/FloatingNav';
import { LuxuryCursor } from './components/ui/LuxuryCursor';
import { GlowUpErrorBoundary } from './components/ui/GlowUpErrorBoundary';
import { AuthModal } from './components/auth/AuthModal';
import { HeroSection } from './components/sections/HeroSection';
import { UnderstandSkinSection } from './components/sections/UnderstandSkinSection';
import { AssistantSection } from './components/sections/AssistantSection';
import { SkinProfileSection } from './components/sections/SkinProfileSection';
import { SkinAnalysisSection } from './components/sections/SkinAnalysisSection';
import { ProductDiscoverySection } from './components/sections/ProductDiscoverySection';
import { RoutineBuilderSection } from './components/sections/RoutineBuilderSection';
import { DashboardSection } from './components/sections/DashboardSection';
import { ExperienceFinaleSection } from './components/sections/ExperienceFinaleSection';
import { MyProfileSection } from './components/sections/MyProfileSection';
import { AccountSettingsSection } from './components/sections/AccountSettingsSection';
import { SectionId } from './types/glowup';

gsap.registerPlugin(ScrollTrigger);

const LazyGlowUpScene = lazy(() =>
  import('./components/three/GlowUpScene').then((mod) => ({ default: mod.GlowUpScene }))
);

function GlowUpExperienceShell() {
  const { activePage, activeSection, setActiveSection, registerScrollHandler } = useGlowUp();
  const scrollProgressRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (activePage !== 'experience') {
      scrollProgressRef.current = 0.25;
      return;
    }

    const lenis = reducedMotion
      ? null
      : new Lenis({
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

    if (lenis) {
      lenis.on('scroll', () => {
        ScrollTrigger.update();
      });

      const onTick = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);

      registerScrollHandler((id: SectionId) => {
        const el = document.getElementById(id);
        if (el) {
          lenis.scrollTo(el, { offset: -20, duration: 1.1 });
        }
      });

      const globalTrigger = ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
        },
      });

      const sectionTriggers = SECTIONS.map((sec) => {
        const el = document.getElementById(sec.id);
        if (!el) return null;
        return ScrollTrigger.create({
          trigger: el,
          start: 'top 52%',
          end: 'bottom 48%',
          onEnter: () => setActiveSection(sec.id),
          onEnterBack: () => setActiveSection(sec.id),
        });
      });

      ScrollTrigger.refresh();

      return () => {
        gsap.ticker.remove(onTick);
        globalTrigger.kill();
        sectionTriggers.forEach((t) => t?.kill());
        lenis.destroy();
      };
    }

    registerScrollHandler((id: SectionId) => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto' });
    });

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgressRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;

      const midpoint = window.innerHeight * 0.45;
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= midpoint && rect.bottom >= midpoint) {
          setActiveSection(sec.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activePage, reducedMotion, registerScrollHandler, setActiveSection]);

  const effectiveVideoSection: SectionId =
    activePage === 'experience' ? activeSection : 'profile';

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#160F14] text-[#FFF9F0]">
      {/* Fixed Cinematic Video Stage (6 uploaded portrait MP4 clips preserved) */}
      <CinematicVideoStage activeSection={effectiveVideoSection} reducedMotion={reducedMotion} />

      {/* Lazy-Loaded Interactive 3D Three.js World */}
      <Suspense fallback={null}>
        <LazyGlowUpScene
          scrollProgressRef={scrollProgressRef}
          activeSection={effectiveVideoSection}
          reducedMotion={reducedMotion}
        />
      </Suspense>

      {/* Subtle Desktop Luxury Cursor */}
      <LuxuryCursor reducedMotion={reducedMotion} />

      {/* Minimal Floating Navigation with Profile/Account Menu */}
      <FloatingNav />

      {/* Authentication Modal */}
      <AuthModal />

      {/* Scroll-Driven 9-Section Editorial Layer OR Dedicated Profile / Account Settings Views */}
      <main className="relative z-10">
        {activePage === 'experience' && (
          <>
            <HeroSection />
            <UnderstandSkinSection />
            <AssistantSection />
            <SkinProfileSection />
            <SkinAnalysisSection />
            <ProductDiscoverySection />
            <RoutineBuilderSection />
            <DashboardSection />
            <ExperienceFinaleSection />
          </>
        )}

        {activePage === 'my-profile' && <MyProfileSection />}
        {activePage === 'account-settings' && <AccountSettingsSection />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <GlowUpErrorBoundary>
      <GlowUpProvider>
        <GlowUpExperienceShell />
      </GlowUpProvider>
    </GlowUpErrorBoundary>
  );
}
