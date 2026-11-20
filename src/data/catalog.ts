import { Product, RoutineStep, SectionId, SkinConcern, SkinProfile, SkinType } from '../types/glowup';

export interface SectionMeta {
  id: SectionId;
  index: string;
  label: string;
  videoKey: 'hero' | 'vanity' | 'portal' | 'studio' | 'scanner' | 'garden';
}

export const SECTIONS: SectionMeta[] = [
  { id: 'hero', index: '01', label: 'Discover', videoKey: 'hero' },
  { id: 'understand', index: '02', label: 'Understand', videoKey: 'vanity' },
  { id: 'assistant', index: '03', label: 'Intelligence', videoKey: 'portal' },
  { id: 'profile', index: '04', label: 'Skin Profile', videoKey: 'studio' },
  { id: 'analysis', index: '05', label: 'Skin Analysis', videoKey: 'scanner' },
  { id: 'products', index: '06', label: 'Products', videoKey: 'vanity' },
  { id: 'routine', index: '07', label: 'My Routine', videoKey: 'hero' },
  { id: 'dashboard', index: '08', label: 'Dashboard', videoKey: 'studio' },
  { id: 'experience', index: '09', label: 'Experience', videoKey: 'garden' },
];

export const VIDEO_ASSETS: Record<
  SectionMeta['videoKey'],
  { src: string; title: string; focusX: string }
> = {
  hero: {
    src: '/assets/aistudio/WhatsApp_Video_2026-11-21_at_3.17.48_AM_17767de0.mp4',
    title: 'Luminous portrait and rose-petal vanity reveal',
    focusX: '50%',
  },
  vanity: {
    src: '/assets/aistudio/WhatsApp_Video_2026-11-21_at_3.17.33_AM_5753adee.mp4',
    title: 'Marble vanity with rose-gold serum dropper',
    focusX: '48%',
  },
  portal: {
    src: '/assets/aistudio/WhatsApp_Video_2026-11-21_at_3.18.03_AM_8a9d8484.mp4',
    title: 'Luminous portal to botanical glass sanctuary',
    focusX: '50%',
  },
  studio: {
    src: '/assets/aistudio/WhatsApp_Video_2026-11-21_at_3.17.27_AM_f899afea.mp4',
    title: 'Editorial studio beauty portrait',
    focusX: '50%',
  },
  scanner: {
    src: '/assets/aistudio/WhatsApp_Video_2026-11-21_at_3.18.04_AM_9c007772.mp4',
    title: 'Biometric light halo scanning chamber',
    focusX: '50%',
  },
  garden: {
    src: '/assets/aistudio/WhatsApp_Video_2026-11-21_at_3.18.04_AM__1__218aaa44.mp4',
    title: 'Sunlit rose garden conservatory with orbital rings',
    focusX: '50%',
  },
};

export const SKIN_TYPE_OPTIONS: { value: SkinType; label: string; description: string }[] = [
  { value: 'normal', label: 'Normal', description: 'Generally balanced moisture and minimal shine throughout the day.' },
  { value: 'dry', label: 'Dry', description: 'Feels tight after cleansing, with occasional flaking or fine dehydration lines.' },
  { value: 'oily', label: 'Oily', description: 'Noticeable midday luminosity across cheeks, forehead, and chin.' },
  { value: 'combination', label: 'Combination', description: 'Oily T-zone paired with balanced or drier cheeks.' },
  { value: 'unsure', label: 'Unsure', description: 'Still learning how your skin behaves across seasons and routines.' },
];

export const CONCERN_OPTIONS: { value: SkinConcern; label: string; detail: string }[] = [
  { value: 'hydration', label: 'Dehydration & Tightness', detail: 'Replenishing water-binding humectants' },
  { value: 'uneven-tone', label: 'Uneven Tone & Radiance', detail: 'Gentle brightening and tone clarity' },
  { value: 'fine-lines', label: 'Fine Lines & Elasticity', detail: 'Peptide & barrier cushioning support' },
  { value: 'blemishes', label: 'Congestion & Pores', detail: 'Balanced sebum & pore refinement' },
  { value: 'redness', label: 'Redness & Sensitivity', detail: 'Barrier-calming botanical care' },
  { value: 'dullness', label: 'Fatigue & Dullness', detail: 'Antioxidant glow restoration' },
];

export const SENSITIVITY_OPTIONS = [
  'Fragrance-free preferred',
  'Essential oil sensitivity',
  'Retinoid sensitivity',
  'AHA / BHA exfoliant caution',
  'Alcohol-denat sensitive',
  'No known sensitivities',
];

export const GOAL_OPTIONS = [
  'Strengthen skin barrier',
  'Achieve luminous daily glow',
  'Calm reactive areas',
  'Refine visible texture',
  'Build a consistent 3–5 step habit',
];

export const PREFERENCE_OPTIONS = [
  'Featherlight gel-serums',
  'Rich velvet creams',
  'Minimalist 3-step ritual',
  'Botanical & peptide actives',
  'Fragrance-free formulas',
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-silk-cleanser',
    name: 'Camellia Cloud Milk Cleanser',
    brandLine: 'GlowUp Sample Formulation',
    category: 'Cleanser',
    price: 32,
    budgetTier: 'accessible',
    volume: '150 ml',
    silhouette: 'pump',
    accentHex: '#F5DDE6',
    suitableSkinTypes: ['normal', 'dry', 'combination', 'unsure'],
    targetConcerns: ['hydration', 'redness'],
    keyIngredients: ['Camellia Japonica Seed Oil', 'Glycerin', 'Oat Amino Acids'],
    benefits: [
      'Lifts daily SPF and impurities without stripping lipid barrier',
      'Leaves skin supple and calm immediately after rinsing',
    ],
    suitabilityReason: 'Low-foam pH-balanced emulsion ideal when tightness or redness is present.',
    potentialSensitivities: ['Contains gentle botanical seed oil; patch test if ultra-reactive'],
    activeGroup: 'gentle',
    isSampleData: true,
  },
  {
    id: 'prod-gel-cleanser',
    name: 'White Tea Balancing Gel Wash',
    brandLine: 'GlowUp Sample Formulation',
    category: 'Cleanser',
    price: 28,
    budgetTier: 'accessible',
    volume: '150 ml',
    silhouette: 'pump',
    accentHex: '#E8DFF5',
    suitableSkinTypes: ['oily', 'combination', 'normal'],
    targetConcerns: ['blemishes', 'dullness'],
    keyIngredients: ['White Tea Polyphenols', 'Zinc PCA', 'Panthenol'],
    benefits: [
      'Refreshes excess surface oil while preserving hydration',
      'Helps keep T-zone pores feeling clear',
    ],
    suitabilityReason: 'Sulfate-free gel texture suits oil-prone and combination zones.',
    potentialSensitivities: ['Minimal risk; avoid direct eye contact'],
    activeGroup: 'gentle',
    isSampleData: true,
  },
  {
    id: 'prod-lavender-toner',
    name: 'Iris & Panthenol Essence Mist',
    brandLine: 'GlowUp Sample Formulation',
    category: 'Toner',
    price: 42,
    budgetTier: 'curated',
    volume: '120 ml',
    silhouette: 'mist',
    accentHex: '#E8DFF5',
    suitableSkinTypes: ['normal', 'dry', 'combination', 'oily', 'unsure'],
    targetConcerns: ['hydration', 'redness', 'dullness'],
    keyIngredients: ['Provitamin B5 (Panthenol)', 'Centella Asiatica', 'Beta-Glucan'],
    benefits: [
      'Dampens skin smoothly ahead of water-binding serums',
      'Visibly softens tight, post-cleanse dehydration',
    ],
    suitabilityReason: 'Alcohol-free essence mist formulated for universal daily layering.',
    potentialSensitivities: ['Contains trace floral hydrosol; skip if sensitive to botanical extracts'],
    activeGroup: 'gentle',
    isSampleData: true,
  },
  {
    id: 'prod-lumiere-serum',
    name: 'Rose-Gold Peptide Glow Serum',
    brandLine: 'GlowUp Sample Formulation',
    category: 'Serum',
    price: 68,
    budgetTier: 'curated',
    volume: '30 ml',
    silhouette: 'dropper',
    accentHex: '#D9B18C',
    suitableSkinTypes: ['normal', 'dry', 'combination', 'unsure'],
    targetConcerns: ['fine-lines', 'dullness', 'hydration'],
    keyIngredients: ['Copper Tripeptide-1', 'Multi-Weight Hyaluronic Acid', 'Squalane'],
    benefits: [
      'Supports plush bounce and refined surface smoothness',
      'Delivers cushiony radiance without heavy silicones',
    ],
    suitabilityReason: 'Balanced humectant and peptide complex tailored for glass-skin vitality.',
    potentialSensitivities: ['Do not layer in the same routine step with low-pH direct acids'],
    activeGroup: 'gentle',
    isSampleData: true,
  },
  {
    id: 'prod-niacin-serum',
    name: '5% Niacinamide Clarity Ampoule',
    brandLine: 'GlowUp Sample Formulation',
    category: 'Serum',
    price: 48,
    budgetTier: 'curated',
    volume: '30 ml',
    silhouette: 'dropper',
    accentHex: '#E8DFF5',
    suitableSkinTypes: ['oily', 'combination', 'normal', 'unsure'],
    targetConcerns: ['uneven-tone', 'blemishes', 'dullness'],
    keyIngredients: ['5% Niacinamide', 'N-Acetyl Glucosamine', 'Allantoin'],
    benefits: [
      'Supports even-looking tone and balanced sebum appearance',
      'Moderate 5% concentration avoids high-percentage flushing',
    ],
    suitabilityReason: 'Evidence-aligned 5% sweet spot suitable for combination and uneven tone profiles.',
    potentialSensitivities: ['Rare sensitivity to niacinamide; introduce 3x weekly first'],
    activeGroup: 'vitamin-c',
    isSampleData: true,
  },
  {
    id: 'prod-barrier-cream',
    name: 'Ceramide Velvet Barrier Cream',
    brandLine: 'GlowUp Sample Formulation',
    category: 'Moisturizer',
    price: 64,
    budgetTier: 'curated',
    volume: '50 ml',
    silhouette: 'jar',
    accentHex: '#FFF9F0',
    suitableSkinTypes: ['dry', 'normal', 'combination', 'unsure'],
    targetConcerns: ['hydration', 'redness', 'fine-lines'],
    keyIngredients: ['Ceramide NP / AP / EOP', 'Phytosphingosine', 'Shea Esters'],
    benefits: [
      'Locks in hydration overnight with biomimetic skin lipids',
      'Comforts compromised or wind-chapped skin barriers',
    ],
    suitabilityReason: 'Fragrance-free 3-ceramide matrix built to seal moisture without heaviness.',
    potentialSensitivities: ['Rich emollient base may feel dense on very oily skin in humid climates'],
    activeGroup: 'gentle',
    isSampleData: true,
  },
  {
    id: 'prod-cloud-gelcream',
    name: 'Lotus Dew Water-Gel Cream',
    brandLine: 'GlowUp Sample Formulation',
    category: 'Moisturizer',
    price: 46,
    budgetTier: 'curated',
    volume: '50 ml',
    silhouette: 'jar',
    accentHex: '#F5DDE6',
    suitableSkinTypes: ['oily', 'combination', 'normal'],
    targetConcerns: ['hydration', 'blemishes'],
    keyIngredients: ['Ectoin', 'Hydrolyzed Hyaluronic Acid', 'Green Tea EGCG'],
    benefits: [
      'Weightless water-break hydration with satin non-greasy finish',
      'Calms midday shine while protecting moisture balance',
    ],
    suitabilityReason: 'Oil-free humectant gel-cream suited for humid climates or T-zone shine.',
    potentialSensitivities: ['Low irritation profile; suitable for sensitive combination skin'],
    activeGroup: 'gentle',
    isSampleData: true,
  },
  {
    id: 'prod-mineral-spf',
    name: 'Silk Veil Mineral SPF 50',
    brandLine: 'GlowUp Sample Formulation',
    category: 'Sunscreen',
    price: 38,
    budgetTier: 'accessible',
    volume: '50 ml',
    silhouette: 'tube',
    accentHex: '#D9B18C',
    suitableSkinTypes: ['normal', 'dry', 'oily', 'combination', 'unsure'],
    targetConcerns: ['uneven-tone', 'fine-lines', 'redness'],
    keyIngredients: ['Non-Nano Zinc Oxide 18%', 'Bisabolol', 'Squalane'],
    benefits: [
      'Broad-spectrum daily UV shield that wears cleanly under makeup',
      'Soft champagne tint counteracts mineral cast on varied tones',
    ],
    suitabilityReason: 'Daily UV protection is the cornerstone of preventing tone shifts and collagen loss.',
    potentialSensitivities: ['Contains mineral zinc dispersion; cleanse thoroughly each evening'],
    activeGroup: 'gentle',
    isSampleData: true,
  },
  {
    id: 'prod-azelaic-treatment',
    name: 'Bakuchiol & Azelaic Night Elixir',
    brandLine: 'GlowUp Sample Formulation',
    category: 'Treatment',
    price: 84,
    budgetTier: 'luxury',
    volume: '30 ml',
    silhouette: 'ampoule',
    accentHex: '#67445B',
    suitableSkinTypes: ['normal', 'combination', 'oily', 'dry'],
    targetConcerns: ['uneven-tone', 'fine-lines', 'blemishes', 'redness'],
    keyIngredients: ['1% Bakuchiol', '10% Azelaic Acid', 'Madecassoside'],
    benefits: [
      'Botanical retinoid-alternative clarity without traditional peeling',
      'Targets post-blemish marks and uneven texture overnight',
    ],
    suitabilityReason: 'Evening treatment option for those avoiding prescription-strength retinoids.',
    potentialSensitivities: ['Mild tingling on initial use; avoid pairing with AHA/BHA exfoliants'],
    activeGroup: 'retinoid',
    isSampleData: true,
  },
  {
    id: 'prod-pha-treatment',
    name: 'Mandelic & PHA Gentle Resurfacer',
    brandLine: 'GlowUp Sample Formulation',
    category: 'Treatment',
    price: 78,
    budgetTier: 'luxury',
    volume: '30 ml',
    silhouette: 'ampoule',
    accentHex: '#D9B18C',
    suitableSkinTypes: ['normal', 'oily', 'combination'],
    targetConcerns: ['dullness', 'blemishes', 'uneven-tone'],
    keyIngredients: ['6% Mandelic Acid', '4% Gluconolactone (PHA)', 'Licorice Root'],
    benefits: [
      'Large-molecule surface exfoliation promotes smooth luminosity',
      'Gentler penetration curve than high-strength glycolic acid',
    ],
    suitabilityReason: 'Best used 2–3 evenings weekly on non-retinoid nights.',
    potentialSensitivities: ['Contains AHA/PHA; skip if barrier is sensitized and always wear AM SPF'],
    activeGroup: 'exfoliant-acid',
    isSampleData: true,
  },
];

export const DEFAULT_AM_STEPS: RoutineStep[] = [
  {
    id: 'am-1',
    period: 'AM',
    stepType: 'Cleanser',
    title: 'Gentle Morning Cleanse',
    instruction: 'Massage with lukewarm water for 30 seconds or rinse lightly if skin feels dry.',
    assignedProductId: 'prod-silk-cleanser',
    completedToday: false,
  },
  {
    id: 'am-2',
    period: 'AM',
    stepType: 'Toner',
    title: 'Hydrating Essence Prep',
    instruction: 'Mist or press gently into damp skin to prime absorption (skip if minimalist routine).',
    assignedProductId: 'prod-lavender-toner',
    optional: true,
    completedToday: false,
  },
  {
    id: 'am-3',
    period: 'AM',
    stepType: 'Serum',
    title: 'Antioxidant & Peptide Serum',
    instruction: 'Apply 2–3 drops across cheeks and forehead while skin remains slightly dewy.',
    assignedProductId: 'prod-lumiere-serum',
    completedToday: false,
  },
  {
    id: 'am-4',
    period: 'AM',
    stepType: 'Moisturizer',
    title: 'Barrier Seal Moisturizer',
    instruction: 'Smooth a pea-sized veil upward along neck and jawline.',
    assignedProductId: 'prod-cloud-gelcream',
    completedToday: false,
  },
  {
    id: 'am-5',
    period: 'AM',
    stepType: 'Sunscreen',
    title: 'Broad-Spectrum Daily SPF',
    instruction: 'Finish every morning with two finger-lengths over face, ears, and neck.',
    assignedProductId: 'prod-mineral-spf',
    completedToday: false,
  },
];

export const DEFAULT_PM_STEPS: RoutineStep[] = [
  {
    id: 'pm-1',
    period: 'PM',
    stepType: 'Cleanser',
    title: 'Evening Reset Cleanse',
    instruction: 'Dissolve sunscreen and environmental buildup thoroughly for 60 seconds.',
    assignedProductId: 'prod-silk-cleanser',
    completedToday: false,
  },
  {
    id: 'pm-2',
    period: 'PM',
    stepType: 'Treatment',
    title: 'Targeted Night Treatment',
    instruction: 'Apply 2–4 evenings weekly on dry skin; avoid stacking conflicting strong acids.',
    assignedProductId: 'prod-azelaic-treatment',
    optional: true,
    completedToday: false,
  },
  {
    id: 'pm-3',
    period: 'PM',
    stepType: 'Moisturizer',
    title: 'Restorative Night Cream',
    instruction: 'Seal moisture overnight with ceramide-rich nourishment.',
    assignedProductId: 'prod-barrier-cream',
    completedToday: false,
  },
];

export function generatePersonalizedTips(profile: SkinProfile): { title: string; detail: string; category: string }[] {
  const tips: { title: string; detail: string; category: string }[] = [];

  if (profile.skinType === 'dry' || profile.concerns.includes('hydration')) {
    tips.push({
      category: 'Hydration Timing',
      title: 'Apply serums on damp skin within 60 seconds',
      detail: 'Humectants like hyaluronic acid and panthenol bind surface water far more effectively before evaporation occurs.',
    });
  }

  if (profile.skinType === 'oily' || profile.concerns.includes('blemishes')) {
    tips.push({
      category: 'Sebum Equilibrium',
      title: 'Avoid over-cleansing midday shine',
      detail: 'Stripping cleansers trigger rebound oiliness. Opt for gentle amino-acid washes and lightweight niacinamide hydration.',
    });
  }

  if (profile.concerns.includes('redness') || profile.sensitivities.length > 0) {
    tips.push({
      category: 'Patch Discipline',
      title: 'Introduce one new formula every 10–14 days',
      detail: 'Spacing new additions lets you identify reactive ingredients cleanly while keeping your barrier calm.',
    });
  }

  tips.push({
    category: 'UV Longevity',
    title: 'Daily mineral or broad-spectrum SPF anchors every goal',
    detail: 'Even indoor UVA exposure through windows accelerates uneven tone; consistent morning SPF protects your evening actives.',
  });

  if (profile.concerns.includes('uneven-tone') || profile.concerns.includes('dullness')) {
    tips.push({
      category: 'Active Alternation',
      title: 'Separate exfoliating acids from retinoid evenings',
      detail: 'Alternating nights preserves smoothness and luminosity without compromising your lipid barrier.',
    });
  }

  return tips.slice(0, 4);
}
