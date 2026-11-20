import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useGlowUp } from '../../context/GlowUpContext';

const INGREDIENT_HIGHLIGHTS = [
  {
    index: '01',
    title: 'Understand your skin',
    ingredient: 'Ceramide & Lipid Architecture',
    detail:
      'Every complexion balances oil flow, water retention, and barrier resilience differently across seasons.',
  },
  {
    index: '02',
    title: 'Discover suitable ingredients',
    ingredient: '5% Niacinamide · Multi-Weight Hyaluronic · Squalane',
    detail:
      'Learn why gentle, well-calibrated concentrations outperform aggressive multi-acid layering.',
  },
  {
    index: '03',
    title: 'Make informed beauty choices',
    ingredient: 'Clarity Without Guesswork',
    detail:
      'See transparent reasoning behind every formula texture, sensitivity note, and routine placement.',
  },
];

export function UnderstandSkinSection() {
  const { scrollToSection } = useGlowUp();
  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <section
      id="understand"
      data-section="understand"
      className="relative flex min-h-screen items-center py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Left editorial column leaving right space open for the 3D Skincare Bottle Trio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="glow-glass rounded-2xl p-7 sm:p-10 lg:col-span-7"
          >
            <p className="text-xs font-medium tracking-[0.24em] text-[#D9B18C]">
              02 · UNDERSTAND YOUR SKIN
            </p>

            <h2 className="font-editorial mt-3 text-3xl font-normal leading-[1.1] text-[#FFF9F0] sm:text-5xl">
              Your skin is unique. Your care should be too.
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#F5DDE6]/85 sm:text-base">
              Navigating shelves of serums, active percentages, and conflicting beauty advice can feel overwhelming. GlowUp translates formulation science into calm, personalized guidance tailored to what your skin genuinely responds to.
            </p>

            {/* Interactive feature highlights */}
            <div className="mt-8 divide-y divide-[#FFF9F0]/12 border-y border-[#FFF9F0]/12">
              {INGREDIENT_HIGHLIGHTS.map((item, idx) => {
                const active = selectedIdx === idx;
                return (
                  <button
                    key={item.index}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={`w-full cursor-pointer py-4 text-left transition-colors duration-200 ${
                      active ? 'text-[#FFF9F0]' : 'text-[#F5DDE6]/70 hover:text-[#FFF9F0]'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-editorial text-xl font-medium sm:text-2xl">
                        <span className="mr-3 text-sm font-interface text-[#D9B18C]">{item.index}.</span>
                        {item.title}
                      </span>
                      <span className="text-xs text-[#D9B18C]">
                        {active ? 'Viewing' : 'Inspect'}
                      </span>
                    </div>
                    {active && (
                      <div className="mt-2.5 pl-7">
                        <p className="text-xs font-medium tracking-wide text-[#E8DFF5]">
                          {item.ingredient}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-[#FFF9F0]/80">
                          {item.detail}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => scrollToSection('profile')}
                className="inline-flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-full bg-[#F5DDE6] px-7 py-3 text-xs font-semibold tracking-[0.14em] text-[#2A1723] transition-all duration-200 hover:bg-[#FFF9F0]"
              >
                <span>GET TO KNOW YOUR SKIN</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>

          {/* Right visual space stays open for 3D Skincare Trio & Vanity Droplet Video */}
          <div className="hidden lg:col-span-5 lg:flex lg:flex-col lg:items-end lg:justify-end lg:self-end lg:pb-4">
            <div className="glow-glass-soft max-w-xs rounded-xl px-5 py-4 text-right">
              <p className="text-xs font-medium text-[#D9B18C]">3D Formulation Showcase</p>
              <p className="mt-1 text-xs leading-relaxed text-[#FFF9F0]/75">
                Move your cursor gently across the glass vessels to explore light refraction and texture harmony.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
