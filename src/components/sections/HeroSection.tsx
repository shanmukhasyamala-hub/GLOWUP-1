import { motion } from 'motion/react';
import { ArrowDownRight, Compass } from 'lucide-react';
import { useGlowUp } from '../../context/GlowUpContext';

export function HeroSection() {
  const { scrollToSection } = useGlowUp();

  return (
    <section
      id="hero"
      data-section="hero"
      className="relative flex min-h-screen items-end pb-16 pt-28 sm:items-center sm:pb-20"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 text-xs font-medium tracking-[0.26em] text-[#D9B18C]"
          >
            01 · DISCOVER YOUR GLOW
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="font-editorial text-5xl font-normal leading-[0.98] tracking-tight text-[#FFF9F0] sm:text-7xl lg:text-[5.5rem]"
          >
            GLOWUP
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="font-editorial mt-3 text-2xl italic text-[#F5DDE6] sm:text-3xl"
          >
            Your Personal AI Beauty Assistant.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-lg text-base leading-relaxed text-[#FFF9F0]/88 sm:text-lg"
          >
            Discover the beauty of understanding your skin. Thoughtful skincare intelligence shaped around your rhythm, barrier, and natural radiance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={() => scrollToSection('profile')}
              className="inline-flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-full bg-[#D9B18C] px-7 py-3 text-xs font-semibold tracking-[0.14em] text-[#1D1119] transition-all duration-200 hover:bg-[#E7C6A5] active:scale-[0.98]"
            >
              <span>BEGIN YOUR GLOW JOURNEY</span>
              <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('understand')}
              className="inline-flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-full border border-[#FFF9F0]/30 bg-[#1B1118]/55 px-6 py-3 text-xs font-medium tracking-[0.14em] text-[#FFF9F0] transition-all duration-200 hover:border-[#D9B18C] hover:text-[#F5DDE6]"
            >
              <Compass className="h-4 w-4 text-[#D9B18C]" aria-hidden="true" />
              <span>EXPLORE GLOWUP</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.48 }}
            className="mt-10 flex flex-wrap items-center gap-3 text-xs text-[#F5DDE6]/70"
          >
            <span>Personalized Skin Profile</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Demonstration Analysis</span>
            <span aria-hidden="true">·</span>
            <span>AM &amp; PM Routine Architecture</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
