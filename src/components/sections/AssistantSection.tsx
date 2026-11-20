import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useGlowUp } from '../../context/GlowUpContext';
import { SectionId } from '../../types/glowup';

const CAPABILITY_CARDS: {
  number: string;
  title: string;
  description: string;
  actionLabel: string;
  target: SectionId;
}[] = [
  {
    number: '01',
    title: 'Personalized Skin Insights',
    description:
      'Combine your daily skin behavior with guided visual previews to understand hydration, balance, and sensitivity patterns.',
    actionLabel: 'Open Skin Analysis',
    target: 'analysis',
  },
  {
    number: '02',
    title: 'Smart Product Recommendations',
    description:
      'Filter curated demonstration formulas by skin type, concern, and budget — with clear ingredient reasoning and sensitivity alerts.',
    actionLabel: 'Explore Products',
    target: 'products',
  },
  {
    number: '03',
    title: 'Custom Skincare Routines',
    description:
      'Build, reorder, and track your AM and PM rituals with built-in compatibility safeguards and daily consistency tracking.',
    actionLabel: 'Build My Routine',
    target: 'routine',
  },
];

export function AssistantSection() {
  const { scrollToSection } = useGlowUp();

  return (
    <section
      id="assistant"
      data-section="assistant"
      className="relative flex min-h-screen items-center py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.24em] text-[#E8DFF5]">
            03 · MEET YOUR PERSONAL BEAUTY ASSISTANT
          </p>
          <h2 className="font-editorial mt-3 text-4xl font-normal leading-[1.08] text-[#FFF9F0] sm:text-5xl lg:text-6xl">
            Meet your personal beauty intelligence.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#F5DDE6]/85 sm:text-base">
            GlowUp unites calm botanical sensibility with intelligent skincare curation — guiding you from understanding your barrier to assembling effortless morning and evening rituals.
          </p>
        </div>

        {/* Three interactive feature cards */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {CAPABILITY_CARDS.map((card, idx) => (
            <motion.div
              key={card.number}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="glow-glass group flex flex-col justify-between rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
            >
              <div>
                <p className="text-xs font-medium tracking-[0.2em] text-[#D9B18C]">
                  {card.number}
                </p>
                <h3 className="font-editorial mt-3 text-2xl font-medium text-[#FFF9F0]">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#F5DDE6]/80">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 border-t border-[#FFF9F0]/10 pt-4">
                <button
                  type="button"
                  onClick={() => scrollToSection(card.target)}
                  className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 text-xs font-semibold tracking-wider text-[#D9B18C] transition-colors group-hover:text-[#FFF9F0]"
                >
                  <span>{card.actionLabel}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
