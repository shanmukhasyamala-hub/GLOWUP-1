export type SectionId =
  | 'hero'
  | 'understand'
  | 'assistant'
  | 'profile'
  | 'analysis'
  | 'products'
  | 'routine'
  | 'dashboard'
  | 'experience';

export type ActivePage = 'experience' | 'my-profile' | 'account-settings';

export type AuthModalView = 'signin' | 'signup' | 'forgot-password' | 'verify-email';

export type SkinType = 'normal' | 'dry' | 'oily' | 'combination' | 'unsure';

export type SkinConcern =
  | 'hydration'
  | 'uneven-tone'
  | 'fine-lines'
  | 'blemishes'
  | 'redness'
  | 'dullness';

export type BudgetTier = 'accessible' | 'curated' | 'luxury' | 'flexible';

export interface SkinProfile {
  skinType: SkinType;
  concerns: SkinConcern[];
  sensitivities: string[];
  customAllergyNote: string;
  goals: string[];
  budget: BudgetTier;
  preferences: string[];
  completedAt?: string;
}

export type ProductCategory =
  | 'Cleanser'
  | 'Toner'
  | 'Serum'
  | 'Moisturizer'
  | 'Sunscreen'
  | 'Treatment';

export type BottleSilhouette =
  | 'dropper'
  | 'jar'
  | 'pump'
  | 'mist'
  | 'tube'
  | 'ampoule';

export interface Product {
  id: string;
  name: string;
  brandLine: string;
  category: ProductCategory;
  price: number;
  budgetTier: Exclude<BudgetTier, 'flexible'>;
  volume: string;
  silhouette: BottleSilhouette;
  accentHex: string;
  suitableSkinTypes: SkinType[];
  targetConcerns: SkinConcern[];
  keyIngredients: string[];
  benefits: string[];
  suitabilityReason: string;
  potentialSensitivities: string[];
  activeGroup?: 'retinoid' | 'exfoliant-acid' | 'vitamin-c' | 'gentle';
  isSampleData: true;
}

export interface RoutineStep {
  id: string;
  period: 'AM' | 'PM';
  stepType: ProductCategory;
  title: string;
  instruction: string;
  assignedProductId: string | null;
  optional?: boolean;
  completedToday: boolean;
}

export interface SkinObservation {
  zone: string;
  observation: string;
  focusLevel: 'Balanced' | 'Mild Focus' | 'Priority Care';
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  sourceLabel: string;
  isDemonstration: true;
  summary: string;
  observations: SkinObservation[];
  possibleConcerns: string[];
  confidenceNote: string;
  educationalGuidance: string[];
  recommendedIngredients: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  hydrationRating: number;
  comfortRating: number;
  note: string;
  tags: string[];
}

export interface ConsistencyDay {
  date: string; // YYYY-MM-DD
  amDone: boolean;
  pmDone: boolean;
}

export interface NotificationPreferences {
  routineReminders: boolean;
  ingredientUpdates: boolean;
  weeklyDigest: boolean;
}

export interface PrivacyPreferences {
  privateProfile: boolean;
  analyticsOptIn: boolean;
}

export interface BeautyPreferences {
  preferredCategories: ProductCategory[];
  preferredIngredients: string[];
  avoidIngredients: string[];
  amPmPreference: string;
}

export interface UserAccount {
  uid: string;
  fullName: string;
  preferredName: string;
  email: string;
  dateOfBirth: string;
  photoDataUrl: string;
  termsAcceptedAt: string;
  createdAtIso: string;
  notificationPrefs: NotificationPreferences;
  privacyPrefs: PrivacyPreferences;
  beautyPrefs: BeautyPreferences;
}
