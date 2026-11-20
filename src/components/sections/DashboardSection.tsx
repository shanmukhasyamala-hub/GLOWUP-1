import React, { useMemo, useState } from 'react';
import { Check, Lock, Plus, Trash2 } from 'lucide-react';
import { generatePersonalizedTips, SAMPLE_PRODUCTS } from '../../data/catalog';
import { useGlowUp } from '../../context/GlowUpContext';

type DashboardTab =
  | 'overview'
  | 'saved'
  | 'routines'
  | 'tips'
  | 'journal'
  | 'history';

const TABS: { id: DashboardTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'saved', label: 'Saved Products' },
  { id: 'routines', label: 'AM & PM Routines' },
  { id: 'tips', label: 'Beauty Tips' },
  { id: 'journal', label: 'Skin Journal' },
  { id: 'history', label: 'Progress History' },
];

export function DashboardSection() {
  const {
    isAuthenticated,
    isEmailVerified,
    userAccount,
    authUser,
    userDataLoading,
    openAuthModal,
    navigateToPage,
    skinProfile,
    savedProducts,
    toggleSaveProduct,
    assignProductToStep,
    amSteps,
    pmSteps,
    toggleStepCompleted,
    journalEntries,
    addJournalEntry,
    deleteJournalEntry,
    analysisHistory,
    consistencyDays,
    scrollToSection,
  } = useGlowUp();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [journalNote, setJournalNote] = useState('');
  const [hydrationRating, setHydrationRating] = useState(4);
  const [comfortRating, setComfortRating] = useState(4);
  const [journalTag, setJournalTag] = useState('Balanced');

  const personalizedTips = useMemo(
    () => generatePersonalizedTips(skinProfile),
    [skinProfile]
  );

  const amCompleted = amSteps.filter((s) => s.completedToday).length;
  const pmCompleted = pmSteps.filter((s) => s.completedToday).length;

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalNote.trim()) return;
    addJournalEntry({
      date: new Date().toISOString().slice(0, 10),
      hydrationRating,
      comfortRating,
      note: journalNote.trim(),
      tags: [journalTag],
    });
    setJournalNote('');
  };

  const displayName =
    userAccount?.preferredName ||
    userAccount?.fullName ||
    authUser?.displayName ||
    'Beauty Explorer';

  return (
    <section
      id="dashboard"
      data-section="dashboard"
      className="relative py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.24em] text-[#E8DFF5]">
              08 · YOUR GLOWUP DASHBOARD
            </p>
            <h2 className="font-editorial mt-2 text-4xl font-normal text-[#FFF9F0] sm:text-5xl">
              {isAuthenticated && isEmailVerified
                ? `Welcome back, ${displayName}.`
                : 'Your beauty journey, all in one place.'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#F5DDE6]/85 sm:text-base">
              Review your skin profile, saved formulas, morning and evening checklists, personalized beauty notes, and journal reflections — secured privately to your account.
            </p>
          </div>

          {isAuthenticated && isEmailVerified && (
            <button
              type="button"
              onClick={() => navigateToPage('my-profile')}
              className="min-h-[42px] cursor-pointer rounded-full border border-[#D9B18C]/50 px-5 py-2 text-xs font-medium text-[#FFF9F0] transition-colors hover:bg-[#D9B18C]/15"
            >
              Open My Profile
            </button>
          )}
        </div>

        {/* Auth Gate for Personal Dashboard */}
        {!isAuthenticated || !isEmailVerified ? (
          <div className="glow-glass rounded-2xl p-8 text-center sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D9B18C]/40 bg-[#D9B18C]/15 text-[#D9B18C]">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-editorial mt-4 text-3xl text-[#FFF9F0]">
              {isAuthenticated
                ? 'Verify your email to unlock your personal dashboard'
                : 'Sign in to access your private GlowUp Dashboard'}
            </h3>
            <p className="mx-auto mt-2.5 max-w-lg text-sm leading-relaxed text-[#F5DDE6]/80">
              {isAuthenticated
                ? 'Your skin profile, saved products, routines, and journal entries are protected until your email address is confirmed.'
                : 'Each account keeps its own private skin profile, saved skincare collection, AM/PM consistency tracker, beauty journal, and demonstration analysis timeline.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() =>
                    openAuthModal('verify-email', { returnToSection: 'dashboard' })
                  }
                  className="min-h-[44px] cursor-pointer rounded-full bg-[#D9B18C] px-7 py-2.5 text-xs font-semibold tracking-wider text-[#1D1119] hover:bg-[#E7C6A5]"
                >
                  VERIFY EMAIL
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      openAuthModal('signin', { returnToSection: 'dashboard' })
                    }
                    className="min-h-[44px] cursor-pointer rounded-full bg-[#D9B18C] px-7 py-2.5 text-xs font-semibold tracking-wider text-[#1D1119] hover:bg-[#E7C6A5]"
                  >
                    SIGN IN TO DASHBOARD
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openAuthModal('signup', { returnToSection: 'dashboard' })
                    }
                    className="min-h-[44px] cursor-pointer rounded-full border border-[#FFF9F0]/25 px-7 py-2.5 text-xs font-medium text-[#FFF9F0] hover:border-[#D9B18C]"
                  >
                    CREATE ACCOUNT
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="glow-glass rounded-2xl p-5 sm:p-8">
            {/* Dashboard Navigation Tabs */}
            <div
              role="tablist"
              aria-label="GlowUp Dashboard Views"
              className="flex flex-wrap items-center gap-2 border-b border-[#FFF9F0]/12 pb-5"
            >
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-h-[40px] cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-[#F5DDE6] text-[#2A1723]'
                        : 'bg-[#FFF9F0]/[0.05] text-[#F5DDE6]/80 hover:bg-[#FFF9F0]/10 hover:text-[#FFF9F0]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {userDataLoading ? (
              <div className="py-12 text-center text-sm text-[#F5DDE6]/75">
                Syncing your private GlowUp records...
              </div>
            ) : (
              <div className="mt-6">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* My Skin Profile Summary */}
                    <div className="glow-glass-soft rounded-2xl p-6 lg:col-span-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-[#D9B18C]">MY SKIN PROFILE</p>
                          <h3 className="font-editorial mt-1 text-2xl capitalize text-[#FFF9F0]">
                            {skinProfile.skinType} Complexion
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => scrollToSection('profile')}
                          className="cursor-pointer text-xs font-medium text-[#D9B18C] underline"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="mt-4 space-y-3 text-xs">
                        <div>
                          <span className="text-[#F5DDE6]/70">Focus concerns: </span>
                          <span className="text-[#FFF9F0]">
                            {skinProfile.concerns.length > 0
                              ? skinProfile.concerns.join(' · ').replace(/-/g, ' ')
                              : 'General maintenance'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#F5DDE6]/70">Sensitivities: </span>
                          <span className="text-[#FFF9F0]">
                            {skinProfile.sensitivities.join(' · ') || 'None specified'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#F5DDE6]/70">Goals: </span>
                          <span className="text-[#E8DFF5]">
                            {skinProfile.goals.join(' · ') || 'Daily balance'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#F5DDE6]/70">Budget tier: </span>
                          <span className="capitalize text-[#FFF9F0]">{skinProfile.budget}</span>
                        </div>
                      </div>
                    </div>

                    {/* Daily Routine Tracker & AM/PM Preview */}
                    <div className="glow-glass-soft rounded-2xl p-6 lg:col-span-7">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-[#D9B18C]">DAILY ROUTINE TRACKER</p>
                          <h3 className="font-editorial mt-1 text-2xl text-[#FFF9F0]">
                            Today&apos;s Morning &amp; Evening Rituals
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('routines')}
                          className="cursor-pointer text-xs font-medium text-[#D9B18C] underline"
                        >
                          Check Steps
                        </button>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-[#FFF9F0]/12 bg-[#160F14]/65 p-4">
                          <p className="text-xs font-semibold text-[#D9B18C]">My Morning Routine</p>
                          <p className="mt-1 text-2xl font-medium text-[#FFF9F0] tabular-nums">
                            {amCompleted} / {amSteps.length}
                          </p>
                          <p className="mt-1 text-xs text-[#F5DDE6]/70">steps completed today</p>
                        </div>

                        <div className="rounded-xl border border-[#FFF9F0]/12 bg-[#160F14]/65 p-4">
                          <p className="text-xs font-semibold text-[#E8DFF5]">My Evening Routine</p>
                          <p className="mt-1 text-2xl font-medium text-[#FFF9F0] tabular-nums">
                            {pmCompleted} / {pmSteps.length}
                          </p>
                          <p className="mt-1 text-xs text-[#F5DDE6]/70">steps completed today</p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#FFF9F0]/12 pt-4 text-xs text-[#F5DDE6]/80">
                        <span className="tabular-nums">
                          Saved Products: <strong className="text-[#FFF9F0]">{savedProducts.length}</strong> · Journal Entries: <strong className="text-[#FFF9F0]">{journalEntries.length}</strong> · Tracked Days: <strong className="text-[#FFF9F0]">{consistencyDays.length}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('journal')}
                          className="cursor-pointer font-medium text-[#D9B18C] underline"
                        >
                          Write Journal Note
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'saved' && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-editorial text-2xl text-[#FFF9F0]">
                        My Saved Products ({savedProducts.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => scrollToSection('products')}
                        className="cursor-pointer text-xs font-medium text-[#D9B18C] underline"
                      >
                        Browse Catalog
                      </button>
                    </div>

                    {savedProducts.length === 0 ? (
                      <p className="mt-4 text-sm text-[#F5DDE6]/75">
                        No saved products yet. Save formulations from Smart Product Discovery to organize them here.
                      </p>
                    ) : (
                      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {savedProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex flex-col justify-between rounded-xl border border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] p-4"
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs text-[#F5DDE6]/70">
                                <span>
                                  {p.category} · {p.volume}
                                </span>
                                <span className="font-semibold text-[#FFF9F0] tabular-nums">${p.price}</span>
                              </div>
                              <h4 className="font-editorial mt-1 text-xl text-[#FFF9F0]">{p.name}</h4>
                              <p className="mt-1 text-xs text-[#D9B18C]">
                                {p.keyIngredients.join(' · ')}
                              </p>
                            </div>

                            <div className="mt-4 flex items-center gap-2 border-t border-[#FFF9F0]/10 pt-3">
                              <button
                                type="button"
                                onClick={() =>
                                  assignProductToStep(
                                    p.category === 'Treatment' ? 'PM' : 'AM',
                                    p.category,
                                    p.id
                                  )
                                }
                                className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full bg-[#F5DDE6] px-3.5 py-1.5 text-xs font-semibold text-[#2A1723]"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Assign to {p.category === 'Treatment' ? 'PM' : 'AM'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleSaveProduct(p.id)}
                                className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full border border-[#FFF9F0]/20 px-3.5 py-1.5 text-xs text-[#F5DDE6] hover:border-[#D9B18C]"
                              >
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'routines' && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {(['AM', 'PM'] as const).map((period) => {
                      const list = period === 'AM' ? amSteps : pmSteps;
                      return (
                        <div
                          key={period}
                          className="rounded-xl border border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] p-5"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-editorial text-2xl text-[#FFF9F0]">
                              {period === 'AM' ? 'My Morning Routine' : 'My Evening Routine'}
                            </h3>
                            <button
                              type="button"
                              onClick={() => scrollToSection('routine')}
                              className="cursor-pointer text-xs text-[#D9B18C] underline"
                            >
                              Customize
                            </button>
                          </div>

                          <div className="mt-4 space-y-2.5">
                            {list.map((s) => {
                              const assigned = SAMPLE_PRODUCTS.find((p) => p.id === s.assignedProductId);
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => toggleStepCompleted(period, s.id)}
                                  className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-xl border border-[#FFF9F0]/10 bg-[#150D12]/70 px-3.5 py-2.5 text-left transition-colors hover:border-[#D9B18C]/50"
                                >
                                  <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                      s.completedToday
                                        ? 'border-[#D9B18C] bg-[#D9B18C] text-[#1D1119]'
                                        : 'border-[#FFF9F0]/35'
                                    }`}
                                  >
                                    {s.completedToday && <Check className="h-3 w-3" />}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold text-[#FFF9F0]">
                                      {s.title}
                                    </p>
                                    <p className="truncate text-[11px] text-[#F5DDE6]/70">
                                      {assigned ? assigned.name : 'Unassigned'}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'tips' && (
                  <div>
                    <h3 className="font-editorial text-2xl text-[#FFF9F0]">
                      Curated Beauty Tips for Your {skinProfile.skinType} Profile
                    </h3>
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {personalizedTips.map((tip) => (
                        <div
                          key={tip.title}
                          className="rounded-xl border border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] p-5"
                        >
                          <p className="text-xs font-medium text-[#D9B18C]">{tip.category}</p>
                          <h4 className="font-editorial mt-1 text-xl text-[#FFF9F0]">{tip.title}</h4>
                          <p className="mt-2 text-xs leading-relaxed text-[#F5DDE6]/80">{tip.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'journal' && (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <form
                      onSubmit={handleSaveJournal}
                      className="rounded-xl border border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] p-5 lg:col-span-5"
                    >
                      <h3 className="font-editorial text-2xl text-[#FFF9F0]">New Skin Journal Entry</h3>
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-[#F5DDE6]/75">
                              Hydration (1–5)
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={5}
                              value={hydrationRating}
                              onChange={(e) => setHydrationRating(Number(e.target.value))}
                              className="mt-1 w-full rounded-lg border border-[#FFF9F0]/15 bg-[#140D12] px-3 py-2 text-xs text-[#FFF9F0] tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-[#F5DDE6]/75">
                              Comfort (1–5)
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={5}
                              value={comfortRating}
                              onChange={(e) => setComfortRating(Number(e.target.value))}
                              className="mt-1 w-full rounded-lg border border-[#FFF9F0]/15 bg-[#140D12] px-3 py-2 text-xs text-[#FFF9F0] tabular-nums"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-[#F5DDE6]/75">Focus Tag</label>
                          <select
                            value={journalTag}
                            onChange={(e) => setJournalTag(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-[#FFF9F0]/15 bg-[#140D12] px-3 py-2 text-xs text-[#FFF9F0]"
                          >
                            <option value="Balanced">Balanced</option>
                            <option value="Barrier Calm">Barrier Calm</option>
                            <option value="Dewy Hydration">Dewy Hydration</option>
                            <option value="Mild Sensitivity">Mild Sensitivity</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-[#F5DDE6]/75">Reflection</label>
                          <textarea
                            rows={3}
                            value={journalNote}
                            onChange={(e) => setJournalNote(e.target.value)}
                            placeholder="Note how your skin felt after today's AM or PM steps..."
                            className="mt-1 w-full rounded-lg border border-[#FFF9F0]/15 bg-[#140D12] px-3 py-2 text-xs text-[#FFF9F0] placeholder:text-[#F5DDE6]/35"
                          />
                        </div>

                        <button
                          type="submit"
                          className="min-h-[42px] w-full cursor-pointer rounded-full bg-[#D9B18C] px-4 py-2 text-xs font-semibold text-[#1D1119] hover:bg-[#E7C6A5]"
                        >
                          Save Journal Entry
                        </button>
                      </div>
                    </form>

                    <div className="space-y-3 lg:col-span-7">
                      {journalEntries.length === 0 ? (
                        <p className="text-sm text-[#F5DDE6]/75">
                          No journal notes yet. Capture how your skin feels today to track patterns over time.
                        </p>
                      ) : (
                        journalEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-xl border border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] p-4"
                          >
                            <div className="flex items-center justify-between gap-3 text-xs text-[#F5DDE6]/70 tabular-nums">
                              <span>
                                {entry.date} · Hydration {entry.hydrationRating}/5 · Comfort {entry.comfortRating}/5 · {entry.tags.join(', ')}
                              </span>
                              <button
                                type="button"
                                onClick={() => deleteJournalEntry(entry.id)}
                                aria-label="Delete journal entry"
                                className="cursor-pointer text-[#F5DDE6]/60 hover:text-[#FFF9F0]"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-[#FFF9F0]/90">{entry.note}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-editorial text-2xl text-[#FFF9F0]">
                        Progress &amp; Demonstration Analysis History
                      </h3>
                      <button
                        type="button"
                        onClick={() => scrollToSection('analysis')}
                        className="cursor-pointer text-xs font-medium text-[#D9B18C] underline"
                      >
                        New Demonstration Analysis
                      </button>
                    </div>

                    {analysisHistory.length === 0 ? (
                      <p className="mt-4 text-sm text-[#F5DDE6]/75">
                        No saved analysis snapshots yet. Run a demonstration analysis in Section 05 and save it to view your timeline here.
                      </p>
                    ) : (
                      <div className="mt-5 space-y-3">
                        {analysisHistory.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-xl border border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#D9B18C] tabular-nums">
                              <span>
                                {new Date(item.createdAt).toLocaleString()} · {item.sourceLabel}
                              </span>
                              <span>Demonstration Preview</span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-[#FFF9F0]/88">
                              {item.summary}
                            </p>
                            <p className="mt-1.5 text-xs text-[#E8DFF5]/80">
                              Key Ingredients: {item.recommendedIngredients.join(' · ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
