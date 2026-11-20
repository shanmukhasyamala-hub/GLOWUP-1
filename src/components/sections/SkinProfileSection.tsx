import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import {
  CONCERN_OPTIONS,
  GOAL_OPTIONS,
  PREFERENCE_OPTIONS,
  SENSITIVITY_OPTIONS,
  SKIN_TYPE_OPTIONS,
} from '../../data/catalog';
import { useGlowUp } from '../../context/GlowUpContext';
import { BudgetTier, SkinConcern, SkinProfile, SkinType } from '../../types/glowup';

const TOTAL_STEPS = 6;

const BUDGET_OPTIONS: { value: BudgetTier; label: string; range: string }[] = [
  { value: 'accessible', label: 'Accessible Essentials', range: '$15 – $35 per step' },
  { value: 'curated', label: 'Curated Clinical-Botanical', range: '$35 – $75 per step' },
  { value: 'luxury', label: 'Luxury Atelier', range: '$75+ per step' },
  { value: 'flexible', label: 'Flexible Across Steps', range: 'Mix of value & hero serums' },
];

export function SkinProfileSection() {
  const { skinProfile, updateSkinProfile, scrollToSection, isAuthenticated, isEmailVerified } =
    useGlowUp();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<SkinProfile>(skinProfile);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setDraft(skinProfile);
  }, [skinProfile]);

  const toggleArrayItem = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((i) => i !== value) : [...list, value];

  const handleSaveProfile = () => {
    updateSkinProfile(draft);
    if (isAuthenticated && isEmailVerified) {
      setSavedNotice(true);
    }
  };

  const handleNext = () => {
    setSavedNotice(false);
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleSaveProfile();
    }
  };

  const handlePrev = () => {
    setSavedNotice(false);
    setStep((s) => Math.max(1, s - 1));
  };

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <section
      id="profile"
      data-section="profile"
      className="relative flex min-h-screen items-center py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <div className="glow-glass rounded-2xl p-6 sm:p-10">
          {/* Header & Step Progress */}
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#FFF9F0]/12 pb-6">
            <div>
              <p className="text-xs font-medium tracking-[0.24em] text-[#D9B18C]">
                04 · YOUR SKIN PROFILE
              </p>
              <h2 className="font-editorial mt-2 text-3xl font-normal text-[#FFF9F0] sm:text-5xl">
                Let&apos;s get to know your skin.
              </h2>
            </div>

            <div className="text-right tabular-nums">
              <span className="text-xs text-[#F5DDE6]/75">
                Step {step} of {TOTAL_STEPS}
              </span>
              <div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-[#FFF9F0]/15">
                <div
                  className="h-full rounded-full bg-[#D9B18C] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Questionnaire Body */}
          <div className="mt-7 min-h-[260px]">
            {step === 1 && (
              <div>
                <h3 className="font-editorial text-2xl text-[#FFF9F0]">
                  How does your skin feel most days?
                </h3>
                <p className="mt-1 text-sm text-[#F5DDE6]/75">
                  Select the skin type that best describes your baseline complexion.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SKIN_TYPE_OPTIONS.map((opt) => {
                    const selected = draft.skinType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDraft({ ...draft, skinType: opt.value as SkinType })}
                        className={`min-h-[68px] cursor-pointer rounded-xl border p-4 text-left transition-all ${
                          selected
                            ? 'border-[#D9B18C] bg-[#D9B18C]/15 text-[#FFF9F0]'
                            : 'border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] text-[#F5DDE6]/85 hover:border-[#FFF9F0]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{opt.label}</span>
                          {selected && <Check className="h-4 w-4 text-[#D9B18C]" />}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-[#F5DDE6]/75">
                          {opt.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="font-editorial text-2xl text-[#FFF9F0]">
                  Which skin concerns matter most right now?
                </h3>
                <p className="mt-1 text-sm text-[#F5DDE6]/75">
                  Choose as many areas as you would like GlowUp to prioritize.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CONCERN_OPTIONS.map((opt) => {
                    const selected = draft.concerns.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            concerns: toggleArrayItem<SkinConcern>(draft.concerns, opt.value),
                          })
                        }
                        className={`min-h-[64px] cursor-pointer rounded-xl border p-4 text-left transition-all ${
                          selected
                            ? 'border-[#D9B18C] bg-[#D9B18C]/15 text-[#FFF9F0]'
                            : 'border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] text-[#F5DDE6]/85 hover:border-[#FFF9F0]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{opt.label}</span>
                          {selected && <Check className="h-4 w-4 text-[#D9B18C]" />}
                        </div>
                        <p className="mt-1 text-xs text-[#F5DDE6]/70">{opt.detail}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="font-editorial text-2xl text-[#FFF9F0]">
                  Any allergies or ingredient sensitivities?
                </h3>
                <p className="mt-1 text-sm text-[#F5DDE6]/75">
                  We highlight potential sensitivity flags across every recommendation.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {SENSITIVITY_OPTIONS.map((item) => {
                    const selected = draft.sensitivities.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            sensitivities: toggleArrayItem(draft.sensitivities, item),
                          })
                        }
                        className={`flex min-h-[46px] cursor-pointer items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition-all ${
                          selected
                            ? 'border-[#D9B18C] bg-[#D9B18C]/15 text-[#FFF9F0]'
                            : 'border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] text-[#F5DDE6]/85 hover:border-[#FFF9F0]/30'
                        }`}
                      >
                        <span>{item}</span>
                        {selected && <Check className="h-4 w-4 text-[#D9B18C]" />}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <label htmlFor="allergy-note" className="block text-xs text-[#F5DDE6]/75">
                    Optional specific ingredient to avoid
                  </label>
                  <input
                    id="allergy-note"
                    type="text"
                    value={draft.customAllergyNote}
                    onChange={(e) => setDraft({ ...draft, customAllergyNote: e.target.value })}
                    placeholder="e.g., Lavender oil, lanolin, high-percentage glycolic acid"
                    className="mt-1.5 w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12]/80 px-4 py-3 text-sm text-[#FFF9F0] placeholder:text-[#F5DDE6]/40 focus:border-[#D9B18C] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h3 className="font-editorial text-2xl text-[#FFF9F0]">
                  What are your primary beauty goals?
                </h3>
                <p className="mt-1 text-sm text-[#F5DDE6]/75">
                  Select the outcomes that feel most meaningful for your routine.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {GOAL_OPTIONS.map((goal) => {
                    const selected = draft.goals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() =>
                          setDraft({ ...draft, goals: toggleArrayItem(draft.goals, goal) })
                        }
                        className={`flex min-h-[48px] cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                          selected
                            ? 'border-[#D9B18C] bg-[#D9B18C]/15 text-[#FFF9F0]'
                            : 'border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] text-[#F5DDE6]/85 hover:border-[#FFF9F0]/30'
                        }`}
                      >
                        <span>{goal}</span>
                        {selected && <Check className="h-4 w-4 text-[#D9B18C]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h3 className="font-editorial text-2xl text-[#FFF9F0]">
                  What budget comfort suits your routine?
                </h3>
                <p className="mt-1 text-sm text-[#F5DDE6]/75">
                  Great skincare exists at every price tier — choose what feels sustainable.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {BUDGET_OPTIONS.map((opt) => {
                    const selected = draft.budget === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDraft({ ...draft, budget: opt.value })}
                        className={`min-h-[64px] cursor-pointer rounded-xl border p-4 text-left transition-all ${
                          selected
                            ? 'border-[#D9B18C] bg-[#D9B18C]/15 text-[#FFF9F0]'
                            : 'border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] text-[#F5DDE6]/85 hover:border-[#FFF9F0]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{opt.label}</span>
                          {selected && <Check className="h-4 w-4 text-[#D9B18C]" />}
                        </div>
                        <p className="mt-1 text-xs text-[#D9B18C] tabular-nums">{opt.range}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <h3 className="font-editorial text-2xl text-[#FFF9F0]">
                  Texture &amp; ritual preferences
                </h3>
                <p className="mt-1 text-sm text-[#F5DDE6]/75">
                  Tell us how you enjoy your skincare feeling on the skin.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {PREFERENCE_OPTIONS.map((pref) => {
                    const selected = draft.preferences.includes(pref);
                    return (
                      <button
                        key={pref}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            preferences: toggleArrayItem(draft.preferences, pref),
                          })
                        }
                        className={`flex min-h-[48px] cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                          selected
                            ? 'border-[#D9B18C] bg-[#D9B18C]/15 text-[#FFF9F0]'
                            : 'border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] text-[#F5DDE6]/85 hover:border-[#FFF9F0]/30'
                        }`}
                      >
                        <span>{pref}</span>
                        {selected && <Check className="h-4 w-4 text-[#D9B18C]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Saved confirmation */}
          {savedNotice && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#D9B18C]/40 bg-[#D9B18C]/12 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-[#FFF9F0]">
                  Your Skin Profile has been saved to your account.
                </p>
                <p className="mt-0.5 text-xs text-[#F5DDE6]/80">
                  Product filters, analysis context, and dashboard insights are now aligned to your {draft.skinType} profile.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => scrollToSection('analysis')}
                  className="min-h-[40px] cursor-pointer rounded-full bg-[#D9B18C] px-4 py-2 text-xs font-semibold text-[#1D1119] transition-colors hover:bg-[#E7C6A5]"
                >
                  Continue to Skin Analysis
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('products')}
                  className="min-h-[40px] cursor-pointer rounded-full border border-[#FFF9F0]/25 px-4 py-2 text-xs font-medium text-[#FFF9F0] transition-colors hover:border-[#D9B18C]"
                >
                  View Matched Products
                </button>
              </div>
            </div>
          )}

          {/* Footer controls */}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#FFF9F0]/12 pt-5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border border-[#FFF9F0]/20 px-5 py-2.5 text-xs font-medium text-[#FFF9F0] transition-colors hover:border-[#D9B18C] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-[#D9B18C] px-6 py-2.5 text-xs font-semibold tracking-wider text-[#1D1119] transition-colors hover:bg-[#E7C6A5]"
              >
                <span>{step === TOTAL_STEPS ? 'Save Skin Profile' : 'Continue'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
