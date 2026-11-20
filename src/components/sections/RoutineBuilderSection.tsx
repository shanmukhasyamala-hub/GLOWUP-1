import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Plus, Save, Trash2 } from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../../data/catalog';
import { useGlowUp } from '../../context/GlowUpContext';
import { ProductCategory, RoutineStep } from '../../types/glowup';

export function RoutineBuilderSection() {
  const {
    amSteps,
    pmSteps,
    setAmSteps,
    setPmSteps,
    toggleStepCompleted,
    saveRoutinesNow,
    lastRoutineSavedAt,
    consistencyDays,
  } = useGlowUp();

  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [newStepCategory, setNewStepCategory] = useState<ProductCategory>('Serum');

  const steps = period === 'AM' ? amSteps : pmSteps;
  const setSteps = period === 'AM' ? setAmSteps : setPmSteps;

  // Gentle compatibility check across assigned PM/AM products
  const compatibilityWarning = useMemo(() => {
    const activeGroups = steps
      .map((s) => SAMPLE_PRODUCTS.find((p) => p.id === s.assignedProductId)?.activeGroup)
      .filter(Boolean);

    if (activeGroups.includes('retinoid') && activeGroups.includes('exfoliant-acid')) {
      return 'Gentle compatibility note: Combining a retinoid/bakuchiol treatment with an AHA/PHA exfoliant in the same ritual can increase sensitivity. Consider alternating them across different evenings.';
    }
    return null;
  }, [steps]);

  const handleAssignProduct = (stepId: string, productId: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, assignedProductId: productId || null } : s))
    );
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    setSteps((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const handleRemove = (stepId: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
  };

  const handleAddStep = () => {
    const matchingProduct = SAMPLE_PRODUCTS.find((p) => p.category === newStepCategory);
    const created: RoutineStep = {
      id: `${period.toLowerCase()}-${Date.now()}`,
      period,
      stepType: newStepCategory,
      title: `Custom ${newStepCategory} Step`,
      instruction: `Apply your selected ${newStepCategory.toLowerCase()} evenly and allow 30 seconds to settle.`,
      assignedProductId: matchingProduct?.id ?? null,
      optional: true,
      completedToday: false,
    };
    setSteps((prev) => [...prev, created]);
  };

  const completedCount = steps.filter((s) => s.completedToday).length;
  const todayKey = new Date().toISOString().slice(0, 10);

  // Build 7-day consistency strip ending today
  const weekDays = useMemo(() => {
    const arr: { date: string; label: string; amDone: boolean; pmDone: boolean }[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(Date.now() - offset * 86400000);
      const iso = d.toISOString().slice(0, 10);
      const found = consistencyDays.find((c) => c.date === iso);
      arr.push({
        date: iso,
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        amDone: found?.amDone ?? false,
        pmDone: found?.pmDone ?? false,
      });
    }
    return arr;
  }, [consistencyDays]);

  return (
    <section
      id="routine"
      data-section="routine"
      className="relative py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.24em] text-[#D9B18C]">
              07 · YOUR PERSONAL ROUTINE
            </p>
            <h2 className="font-editorial mt-2 text-4xl font-normal text-[#FFF9F0] sm:text-5xl">
              Your routine, thoughtfully personalized.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#F5DDE6]/85 sm:text-base">
              Organize your morning protection and evening restoration steps. Reorder, swap sample products, check off today&apos;s ritual, and save directly to your account.
            </p>
          </div>

          {/* AM / PM Switcher */}
          <div className="flex items-center gap-1 rounded-full border border-[#FFF9F0]/15 bg-[#1B1118]/80 p-1">
            <button
              type="button"
              onClick={() => setPeriod('AM')}
              className={`min-h-[40px] cursor-pointer rounded-full px-5 py-2 text-xs font-semibold transition-colors ${
                period === 'AM'
                  ? 'bg-[#D9B18C] text-[#1D1119]'
                  : 'text-[#F5DDE6]/80 hover:text-[#FFF9F0]'
              }`}
            >
              Morning (AM)
            </button>
            <button
              type="button"
              onClick={() => setPeriod('PM')}
              className={`min-h-[40px] cursor-pointer rounded-full px-5 py-2 text-xs font-semibold transition-colors ${
                period === 'PM'
                  ? 'bg-[#E8DFF5] text-[#2A1723]'
                  : 'text-[#F5DDE6]/80 hover:text-[#FFF9F0]'
              }`}
            >
              Evening (PM)
            </button>
          </div>
        </div>

        {compatibilityWarning && (
          <div className="mt-6 rounded-xl border border-[#D9B18C]/45 bg-[#2A1A23]/90 px-5 py-3.5 text-xs leading-relaxed text-[#F5DDE6]">
            {compatibilityWarning}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Routine Steps Column */}
          <div className="glow-glass rounded-2xl p-6 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#FFF9F0]/12 pb-4">
              <div>
                <h3 className="font-editorial text-2xl text-[#FFF9F0]">
                  {period === 'AM' ? 'Morning Protection Sequence' : 'Evening Restoration Sequence'}
                </h3>
                <p className="mt-0.5 text-xs text-[#F5DDE6]/70 tabular-nums">
                  {completedCount} of {steps.length} steps completed today
                </p>
              </div>

              <button
                type="button"
                onClick={saveRoutinesNow}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border border-[#D9B18C]/50 px-4 py-2 text-xs font-medium text-[#FFF9F0] transition-colors hover:bg-[#D9B18C]/20"
              >
                <Save className="h-3.5 w-3.5 text-[#D9B18C]" />
                <span>{lastRoutineSavedAt ? `Saved ${lastRoutineSavedAt}` : 'Save Routine'}</span>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {steps.map((step, idx) => {
                const candidateProducts = SAMPLE_PRODUCTS.filter(
                  (p) => p.category === step.stepType
                );
                const selectedProduct = SAMPLE_PRODUCTS.find(
                  (p) => p.id === step.assignedProductId
                );

                return (
                  <div
                    key={step.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      step.completedToday
                        ? 'border-[#D9B18C]/50 bg-[#D9B18C]/10'
                        : 'border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleStepCompleted(period, step.id)}
                          aria-label={`Mark ${step.title} complete`}
                          aria-pressed={step.completedToday}
                          className={`mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors ${
                            step.completedToday
                              ? 'border-[#D9B18C] bg-[#D9B18C] text-[#1D1119]'
                              : 'border-[#FFF9F0]/35 bg-transparent hover:border-[#D9B18C]'
                          }`}
                        >
                          {step.completedToday && <Check className="h-3.5 w-3.5" />}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#D9B18C]">
                            <span className="tabular-nums">Step 0{idx + 1}</span>
                            <span aria-hidden="true">·</span>
                            <span>{step.stepType}</span>
                            {step.optional && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#E8DFF5]/75">Optional if suitable</span>
                              </>
                            )}
                          </div>
                          <h4 className="mt-0.5 text-base font-medium text-[#FFF9F0]">
                            {step.title}
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-[#F5DDE6]/75">
                            {step.instruction}
                          </p>
                        </div>
                      </div>

                      {/* Reorder & Remove controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, -1)}
                          disabled={idx === 0}
                          aria-label={`Move ${step.title} up`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#FFF9F0]/12 text-[#F5DDE6]/75 hover:border-[#D9B18C] disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 1)}
                          disabled={idx === steps.length - 1}
                          aria-label={`Move ${step.title} down`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#FFF9F0]/12 text-[#F5DDE6]/75 hover:border-[#D9B18C] disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(step.id)}
                          aria-label={`Remove ${step.title}`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#FFF9F0]/12 text-[#F5DDE6]/75 hover:border-[#F5DDE6] hover:text-[#FFF9F0]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Product Assignment */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 pl-9">
                      <select
                        aria-label={`Assign product for ${step.title}`}
                        value={step.assignedProductId ?? ''}
                        onChange={(e) => handleAssignProduct(step.id, e.target.value)}
                        className="min-w-[220px] flex-1 rounded-lg border border-[#FFF9F0]/15 bg-[#140C12] px-3 py-2 text-xs text-[#FFF9F0]"
                      >
                        <option value="">No formula assigned yet</option>
                        {candidateProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${p.price})
                          </option>
                        ))}
                      </select>

                      {selectedProduct && (
                        <span className="text-xs text-[#E8DFF5]/80">
                          {selectedProduct.keyIngredients[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Step Control */}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#FFF9F0]/12 pt-5">
              <select
                aria-label="Choose step category to add"
                value={newStepCategory}
                onChange={(e) => setNewStepCategory(e.target.value as ProductCategory)}
                className="rounded-xl border border-[#FFF9F0]/15 bg-[#140C12] px-3.5 py-2.5 text-xs text-[#FFF9F0]"
              >
                <option value="Cleanser">Cleanser</option>
                <option value="Toner">Toner (if suitable)</option>
                <option value="Serum">Serum</option>
                <option value="Treatment">Suitable Treatment</option>
                <option value="Moisturizer">Moisturizer</option>
                <option value="Sunscreen">Sunscreen</option>
              </select>

              <button
                type="button"
                onClick={handleAddStep}
                className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-full border border-[#FFF9F0]/25 px-4 py-2 text-xs font-medium text-[#FFF9F0] transition-colors hover:border-[#D9B18C]"
              >
                <Plus className="h-3.5 w-3.5 text-[#D9B18C]" />
                <span>Add Step to {period}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Consistency Tracker & Ritual Guidance */}
          <div className="glow-glass flex flex-col justify-between rounded-2xl p-6 lg:col-span-4">
            <div>
              <p className="text-xs font-medium tracking-wider text-[#D9B18C]">
                DAILY CONSISTENCY TRACKER
              </p>
              <h3 className="font-editorial mt-2 text-2xl text-[#FFF9F0]">
                7-Day Ritual Rhythm
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#F5DDE6]/75">
                Completing all steps in your AM or PM list updates today&apos;s tracker automatically.
              </p>

              <div className="mt-6 grid grid-cols-7 gap-1.5 text-center">
                {weekDays.map((day) => {
                  const isToday = day.date === todayKey;
                  return (
                    <div
                      key={day.date}
                      className={`rounded-xl border p-2 ${
                        isToday
                          ? 'border-[#D9B18C] bg-[#D9B18C]/12'
                          : 'border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.02]'
                      }`}
                    >
                      <span className="block text-[10px] text-[#F5DDE6]/75">{day.label}</span>
                      <div className="mt-2 flex flex-col items-center gap-1">
                        <span
                          title="AM status"
                          className={`h-2.5 w-2.5 rounded-full ${
                            day.amDone ? 'bg-[#D9B18C]' : 'bg-[#FFF9F0]/15'
                          }`}
                        />
                        <span
                          title="PM status"
                          className={`h-2.5 w-2.5 rounded-full ${
                            day.pmDone ? 'bg-[#E8DFF5]' : 'bg-[#FFF9F0]/15'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-4 text-[11px] text-[#F5DDE6]/75">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#D9B18C]" /> AM Complete
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#E8DFF5]" /> PM Complete
                </span>
              </div>
            </div>

            <div className="mt-8 border-t border-[#FFF9F0]/12 pt-5">
              <p className="text-xs font-medium text-[#D9B18C]">Mindful Skincare Principle</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#F5DDE6]/80">
                Consistency with gentle cleansing, suitable hydration, and morning UV protection supports skin comfort over time without guaranteeing specific clinical outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
