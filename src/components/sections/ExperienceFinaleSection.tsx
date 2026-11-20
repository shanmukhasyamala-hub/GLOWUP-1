import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useGlowUp } from '../../context/GlowUpContext';

const FINALE_CARDS = [
  {
    title: 'Personalized Insights',
    body: 'Gentle clarity about your unique barrier, hydration rhythm, and sensitivities.',
  },
  {
    title: 'Smart Recommendations',
    body: 'Ingredient-first formulation discovery without noise, hype, or guesswork.',
  },
  {
    title: 'Daily Beauty Companion',
    body: 'Morning and evening routines that evolve alongside your skin and seasons.',
  },
];

export function ExperienceFinaleSection() {
  const { scrollToSection } = useGlowUp();

  return (
    <section
      id="experience"
      data-section="experience"
      className="relative flex min-h-screen flex-col justify-between pb-12 pt-28 sm:pt-36"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium tracking-[0.26em] text-[#D9B18C]">
            09 · THE GLOWUP EXPERIENCE
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-editorial mt-4 text-4xl font-normal leading-[1.06] text-[#FFF9F0] sm:text-6xl"
          >
            Your journey. Your confidence. Your glow.
          </motion.h2>
        </div>

        {/* Three floating translucent cards */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {FINALE_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="glow-glass-soft rounded-2xl p-6 text-center"
            >
              <h3 className="font-editorial text-2xl text-[#FFF9F0]">{card.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#F5DDE6]/85">{card.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Final brand presentation */}
        <div className="mt-16 text-center">
          <p className="font-editorial text-5xl tracking-[0.14em] text-[#FFF9F0] sm:text-6xl">
            GLOWUP
          </p>
          <p className="font-editorial mt-2 text-2xl italic text-[#F5DDE6]">
            Your Personal AI Beauty Assistant.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => scrollToSection('profile')}
              className="inline-flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-full bg-[#D9B18C] px-8 py-3.5 text-xs font-semibold tracking-[0.16em] text-[#1D1119] transition-all duration-200 hover:bg-[#E7C6A5]"
            >
              <span>START YOUR GLOW JOURNEY</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Quiet Editorial Footer */}
      <footer className="mx-auto mt-20 w-full max-w-6xl border-t border-[#FFF9F0]/15 px-5 pt-6 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#F5DDE6]/70">
          <span>GLOWUP · Discover Your Glow</span>
          <div className="flex flex-wrap items-center gap-5">
            <button type="button" onClick={() => scrollToSection('hero')} className="cursor-pointer hover:text-[#FFF9F0]">
              Top
            </button>
            <button type="button" onClick={() => scrollToSection('analysis')} className="cursor-pointer hover:text-[#FFF9F0]">
              Skin Analysis
            </button>
            <button type="button" onClick={() => scrollToSection('products')} className="cursor-pointer hover:text-[#FFF9F0]">
              Products
            </button>
            <button type="button" onClick={() => scrollToSection('routine')} className="cursor-pointer hover:text-[#FFF9F0]">
              My Routine
            </button>
            <button type="button" onClick={() => scrollToSection('dashboard')} className="cursor-pointer hover:text-[#FFF9F0]">
              Dashboard
            </button>
          </div>
          <span>Educational Beauty Platform · Non-Medical Demonstration</span>
        </div>
      </footer>
    </section>
  );
}
