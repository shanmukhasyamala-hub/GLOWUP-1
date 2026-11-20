import { useMemo, useState } from 'react';
import { Bookmark, Check, Plus } from 'lucide-react';
import { CONCERN_OPTIONS, SAMPLE_PRODUCTS, SKIN_TYPE_OPTIONS } from '../../data/catalog';
import { useGlowUp } from '../../context/GlowUpContext';
import { BudgetTier, Product, ProductCategory, SkinConcern, SkinType } from '../../types/glowup';
import { ProductBottleArt } from '../ui/ProductBottleArt';

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Cleanser',
  'Toner',
  'Serum',
  'Moisturizer',
  'Sunscreen',
  'Treatment',
];

export function ProductDiscoverySection() {
  const {
    skinProfile,
    savedProductIds,
    toggleSaveProduct,
    assignProductToStep,
    scrollToSection,
    isAuthenticated,
    isEmailVerified,
  } = useGlowUp();

  const [useProfileMatch, setUseProfileMatch] = useState(false);
  const [skinTypeFilter, setSkinTypeFilter] = useState<'all' | SkinType>('all');
  const [concernFilter, setConcernFilter] = useState<'all' | SkinConcern>('all');
  const [budgetFilter, setBudgetFilter] = useState<'all' | Exclude<BudgetTier, 'flexible'>>('all');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ProductCategory>('All');
  const [assignedFeedback, setAssignedFeedback] = useState<string | null>(null);

  const applyProfileMatch = (nextState: boolean) => {
    setUseProfileMatch(nextState);
    if (nextState) {
      setSkinTypeFilter(skinProfile.skinType);
      setConcernFilter(skinProfile.concerns[0] ?? 'all');
      setBudgetFilter(skinProfile.budget === 'flexible' ? 'all' : skinProfile.budget);
    } else {
      setSkinTypeFilter('all');
      setConcernFilter('all');
      setBudgetFilter('all');
    }
  };

  const filteredProducts = useMemo(() => {
    return SAMPLE_PRODUCTS.filter((p) => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (skinTypeFilter !== 'all' && !p.suitableSkinTypes.includes(skinTypeFilter)) return false;
      if (concernFilter !== 'all' && !p.targetConcerns.includes(concernFilter)) return false;
      if (budgetFilter !== 'all' && p.budgetTier !== budgetFilter) return false;
      return true;
    });
  }, [categoryFilter, skinTypeFilter, concernFilter, budgetFilter]);

  const handleAssign = (product: Product) => {
    const period: 'AM' | 'PM' =
      product.category === 'Sunscreen'
        ? 'AM'
        : product.category === 'Treatment'
          ? 'PM'
          : 'AM';
    assignProductToStep(period, product.category, product.id);
    if (isAuthenticated && isEmailVerified) {
      setAssignedFeedback(`${product.name} assigned to ${period} ${product.category}`);
      setTimeout(() => setAssignedFeedback(null), 3200);
    }
  };

  return (
    <section
      id="products"
      data-section="products"
      className="relative py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.24em] text-[#D9B18C]">
              06 · SMART PRODUCT DISCOVERY
            </p>
            <h2 className="font-editorial mt-2 text-4xl font-normal text-[#FFF9F0] sm:text-5xl">
              The right products. The right reasons.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#F5DDE6]/85 sm:text-base">
              Sample demonstration formulations paired with ingredient transparency, suitability reasoning, and potential sensitivity notes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => applyProfileMatch(!useProfileMatch)}
            className={`min-h-[44px] cursor-pointer rounded-full border px-5 py-2.5 text-xs font-medium transition-colors ${
              useProfileMatch
                ? 'border-[#D9B18C] bg-[#D9B18C] text-[#1D1119]'
                : 'border-[#FFF9F0]/25 bg-[#1B1118]/75 text-[#FFF9F0] hover:border-[#D9B18C]'
            }`}
          >
            {useProfileMatch ? 'Matched to My Skin Profile ✓' : 'Match My Skin Profile'}
          </button>
        </div>

        {/* Filter Bar */}
        <div className="glow-glass mt-8 rounded-2xl p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="filter-skin" className="block text-xs text-[#F5DDE6]/75">
                Skin Type
              </label>
              <select
                id="filter-skin"
                value={skinTypeFilter}
                onChange={(e) => {
                  setUseProfileMatch(false);
                  setSkinTypeFilter(e.target.value as 'all' | SkinType);
                }}
                className="mt-1.5 w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12] px-3 py-2.5 text-xs text-[#FFF9F0]"
              >
                <option value="all">All skin types</option>
                {SKIN_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-concern" className="block text-xs text-[#F5DDE6]/75">
                Skin Concern
              </label>
              <select
                id="filter-concern"
                value={concernFilter}
                onChange={(e) => {
                  setUseProfileMatch(false);
                  setConcernFilter(e.target.value as 'all' | SkinConcern);
                }}
                className="mt-1.5 w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12] px-3 py-2.5 text-xs text-[#FFF9F0]"
              >
                <option value="all">All concerns</option>
                {CONCERN_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-budget" className="block text-xs text-[#F5DDE6]/75">
                Budget Tier
              </label>
              <select
                id="filter-budget"
                value={budgetFilter}
                onChange={(e) => {
                  setUseProfileMatch(false);
                  setBudgetFilter(e.target.value as 'all' | Exclude<BudgetTier, 'flexible'>);
                }}
                className="mt-1.5 w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12] px-3 py-2.5 text-xs text-[#FFF9F0]"
              >
                <option value="all">All price tiers</option>
                <option value="accessible">Accessible ($15 – $35)</option>
                <option value="curated">Curated ($35 – $75)</option>
                <option value="luxury">Luxury Atelier ($75+)</option>
              </select>
            </div>
          </div>

          {/* Category segmented controls */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#FFF9F0]/10 pt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`min-h-[38px] cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#F5DDE6] text-[#2A1723]'
                    : 'bg-[#FFF9F0]/[0.05] text-[#F5DDE6]/80 hover:bg-[#FFF9F0]/10 hover:text-[#FFF9F0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback bar when assigning to routine */}
        {assignedFeedback && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D9B18C]/45 bg-[#2A1A24]/95 px-5 py-3 text-xs text-[#FFF9F0]">
            <span>{assignedFeedback}</span>
            <button
              type="button"
              onClick={() => scrollToSection('routine')}
              className="cursor-pointer font-semibold text-[#D9B18C] underline"
            >
              Open My Routine
            </button>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="glow-glass mt-8 rounded-2xl p-10 text-center">
            <p className="font-editorial text-2xl text-[#FFF9F0]">
              No sample formulas match this exact filter combination.
            </p>
            <button
              type="button"
              onClick={() => {
                setUseProfileMatch(false);
                setSkinTypeFilter('all');
                setConcernFilter('all');
                setBudgetFilter('all');
                setCategoryFilter('All');
              }}
              className="mt-4 min-h-[42px] cursor-pointer rounded-full border border-[#D9B18C] px-5 py-2 text-xs font-medium text-[#D9B18C] hover:bg-[#D9B18C]/15"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const isSaved = savedProductIds.includes(product.id);
              const matchesUserSkin = product.suitableSkinTypes.includes(skinProfile.skinType);

              return (
                <article
                  key={product.id}
                  className="glow-glass flex flex-col justify-between rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <div>
                    <ProductBottleArt
                      silhouette={product.silhouette}
                      accentHex={product.accentHex}
                      label={product.name}
                    />

                    {/* Clean unboxed metadata line */}
                    <div className="mt-4 flex items-center justify-between gap-2 text-xs text-[#F5DDE6]/70">
                      <span>
                        {product.category} · {product.volume} · Sample Data
                      </span>
                      <span className="font-semibold text-[#FFF9F0] tabular-nums">
                        ${product.price}
                      </span>
                    </div>

                    <h3 className="font-editorial mt-1.5 text-2xl font-medium text-[#FFF9F0]">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-[#D9B18C]">
                      Key ingredients: {product.keyIngredients.join(' · ')}
                    </p>

                    <ul className="mt-3 space-y-1 text-xs leading-relaxed text-[#FFF9F0]/85">
                      {product.benefits.map((b) => (
                        <li key={b}>· {b}</li>
                      ))}
                    </ul>

                    <div className="mt-4 space-y-2 border-t border-[#FFF9F0]/10 pt-3 text-xs">
                      <p className="text-[#E8DFF5]/90">
                        <span className="font-semibold text-[#FFF9F0]">Suitability: </span>
                        {product.suitabilityReason}
                        {matchesUserSkin ? ` Aligned with your ${skinProfile.skinType} profile.` : ''}
                      </p>
                      <p className="text-[#F5DDE6]/70">
                        <span className="font-semibold text-[#F5DDE6]/90">Sensitivities: </span>
                        {product.potentialSensitivities[0]}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2.5 border-t border-[#FFF9F0]/10 pt-4">
                    <button
                      type="button"
                      onClick={() => toggleSaveProduct(product.id)}
                      aria-pressed={isSaved}
                      className={`inline-flex min-h-[42px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                        isSaved
                          ? 'border-[#D9B18C] bg-[#D9B18C]/20 text-[#FFF9F0]'
                          : 'border-[#FFF9F0]/20 text-[#F5DDE6] hover:border-[#D9B18C]'
                      }`}
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-[#D9B18C] text-[#D9B18C]' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAssign(product)}
                      className="inline-flex min-h-[42px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#F5DDE6] px-3 py-2 text-xs font-semibold text-[#2A1723] transition-colors hover:bg-[#FFF9F0]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add to Routine</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-6 flex items-center gap-2 text-xs text-[#F5DDE6]/60">
          <Check className="h-3.5 w-3.5 text-[#D9B18C]" />
          <span>
            All product entries above are clearly labelled sample demonstration formulations without fabricated reviews or clinical claims.
          </span>
        </p>
      </div>
    </section>
  );
}
