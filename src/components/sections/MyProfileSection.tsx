import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  Check,
  Edit3,
  Lock,
  Plus,
  Settings,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../../data/catalog';
import { useGlowUp } from '../../context/GlowUpContext';
import { ProductCategory } from '../../types/glowup';

const ALL_CATEGORIES: ProductCategory[] = [
  'Cleanser',
  'Toner',
  'Serum',
  'Moisturizer',
  'Sunscreen',
  'Treatment',
];

// Compress uploaded avatar image to small JPEG (<140KB) for Firestore document safety
async function compressAvatarFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 240;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => reject(new Error('Invalid image file.'));
      if (typeof reader.result === 'string') img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

export function MyProfileSection() {
  const {
    isAuthenticated,
    isEmailVerified,
    authUser,
    userAccount,
    userDataLoading,
    skinProfile,
    savedProducts,
    amSteps,
    pmSteps,
    consistencyDays,
    journalEntries,
    analysisHistory,
    openAuthModal,
    navigateToPage,
    scrollToSection,
    updateAccountDetails,
    updateBeautyPreferences,
  } = useGlowUp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [editingBeauty, setEditingBeauty] = useState(false);
  const [preferredCategories, setPreferredCategories] = useState<ProductCategory[]>([]);
  const [preferredIngredients, setPreferredIngredients] = useState<string[]>([]);
  const [avoidIngredients, setAvoidIngredients] = useState<string[]>([]);
  const [amPmPreference, setAmPmPreference] = useState('');
  const [newPreferredIng, setNewPreferredIng] = useState('');
  const [newAvoidIng, setNewAvoidIng] = useState('');

  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userAccount) return;
    setFullName(userAccount.fullName);
    setPreferredName(userAccount.preferredName);
    setDateOfBirth(userAccount.dateOfBirth);
    setPreferredCategories(userAccount.beautyPrefs.preferredCategories);
    setPreferredIngredients(userAccount.beautyPrefs.preferredIngredients);
    setAvoidIngredients(userAccount.beautyPrefs.avoidIngredients);
    setAmPmPreference(userAccount.beautyPrefs.amPmPreference);
  }, [userAccount]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatusMsg('Please select a valid image file (PNG, JPG, or WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatusMsg('Please choose an image smaller than 10 MB.');
      return;
    }
    setSaving(true);
    setStatusMsg(null);
    try {
      const compressed = await compressAvatarFile(file);
      await updateAccountDetails({ photoDataUrl: compressed });
      setStatusMsg('Profile photograph updated.');
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Unable to update photo.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setStatusMsg('Full name cannot be empty.');
      return;
    }
    setSaving(true);
    setStatusMsg(null);
    try {
      await updateAccountDetails({
        fullName: fullName.trim(),
        preferredName: preferredName.trim(),
        dateOfBirth: dateOfBirth.trim(),
      });
      setEditingPersonal(false);
      setStatusMsg('Personal details saved securely.');
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Unable to save details.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBeautyPrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      await updateBeautyPreferences({
        preferredCategories,
        preferredIngredients,
        avoidIngredients,
        amPmPreference: amPmPreference.trim(),
      });
      setEditingBeauty(false);
      setStatusMsg('Beauty preferences saved.');
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Unable to save beauty preferences.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (cat: ProductCategory) => {
    setPreferredCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const addPreferredIngredient = () => {
    const val = newPreferredIng.trim();
    if (!val || preferredIngredients.includes(val)) return;
    setPreferredIngredients((prev) => [...prev, val]);
    setNewPreferredIng('');
  };

  const addAvoidIngredient = () => {
    const val = newAvoidIng.trim();
    if (!val || avoidIngredients.includes(val)) return;
    setAvoidIngredients((prev) => [...prev, val]);
    setNewAvoidIng('');
  };

  // Protected route gate for unauthenticated or unverified visitors
  if (!isAuthenticated || !isEmailVerified) {
    return (
      <section className="relative flex min-h-screen items-center py-28">
        <div className="mx-auto w-full max-w-2xl px-5 sm:px-8">
          <div className="glow-glass rounded-2xl p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D9B18C]/40 bg-[#D9B18C]/15 text-[#D9B18C]">
              <Lock className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-medium tracking-[0.24em] text-[#D9B18C]">
              MY PERSONAL BEAUTY SPACE
            </p>
            <h1 className="font-editorial mt-2 text-4xl text-[#FFF9F0]">
              {isAuthenticated ? 'Verify your email to enter' : 'Your private GlowUp sanctuary'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#F5DDE6]/80">
              {isAuthenticated
                ? 'Please verify your email address so your skin profile, routines, and journal entries remain strictly private to your account.'
                : 'Sign in or create an account to curate your personal beauty profile, preferences, saved formulations, and skincare history.'}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => openAuthModal('verify-email', { returnToPage: 'my-profile' })}
                  className="min-h-[46px] cursor-pointer rounded-full bg-[#D9B18C] px-7 py-3 text-xs font-semibold tracking-[0.14em] text-[#1D1119] hover:bg-[#E7C6A5]"
                >
                  VERIFY EMAIL
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuthModal('signin', { returnToPage: 'my-profile' })}
                    className="min-h-[46px] cursor-pointer rounded-full bg-[#D9B18C] px-7 py-3 text-xs font-semibold tracking-[0.14em] text-[#1D1119] hover:bg-[#E7C6A5]"
                  >
                    SIGN IN
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('signup', { returnToPage: 'my-profile' })}
                    className="min-h-[46px] cursor-pointer rounded-full border border-[#FFF9F0]/30 px-7 py-3 text-xs font-medium tracking-[0.14em] text-[#FFF9F0] hover:border-[#D9B18C]"
                  >
                    CREATE ACCOUNT
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const completedRoutineCount = consistencyDays.filter((d) => d.amDone || d.pmDone).length;
  const createdDateFormatted = userAccount?.createdAtIso
    ? new Date(userAccount.createdAtIso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently joined';

  return (
    <section className="relative min-h-screen pb-24 pt-28 sm:pt-32">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        {/* Status Banner */}
        {statusMsg && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-[#D9B18C]/45 bg-[#2A1A24]/90 px-5 py-3 text-xs text-[#FFF9F0]">
            <span>{statusMsg}</span>
            <button
              type="button"
              onClick={() => setStatusMsg(null)}
              className="cursor-pointer text-[#D9B18C]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* PROFILE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="glow-glass rounded-2xl p-6 sm:p-9"
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-[#D9B18C]/65 bg-gradient-to-br from-[#F5DDE6]/25 via-[#67445B]/45 to-[#1E131B]">
                  {userAccount?.photoDataUrl ? (
                    <img
                      src={userAccount.photoDataUrl}
                      alt={`${userAccount.fullName} avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-10 w-10 text-[#F5DDE6]/80" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload profile photograph"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#FFF9F0]/25 bg-[#2B1924] text-[#D9B18C] hover:border-[#D9B18C]"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <div>
                <p className="text-xs font-medium tracking-[0.22em] text-[#D9B18C]">
                  MY BEAUTY SANCTUARY
                </p>
                <h1 className="font-editorial mt-1 text-3xl font-normal text-[#FFF9F0] sm:text-5xl">
                  {userAccount?.preferredName
                    ? `${userAccount.fullName} (${userAccount.preferredName})`
                    : userAccount?.fullName || authUser?.displayName || 'GlowUp Member'}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs text-[#F5DDE6]/80">
                  <span>{userAccount?.email || authUser?.email}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-[#D9B18C]">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Account
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">Member since {createdDateFormatted}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setEditingPersonal((v) => !v)}
                className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-full bg-[#F5DDE6] px-5 py-2 text-xs font-semibold text-[#2A1723] hover:bg-[#FFF9F0]"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>{editingPersonal ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToPage('account-settings')}
                className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-full border border-[#FFF9F0]/25 px-5 py-2 text-xs font-medium text-[#FFF9F0] hover:border-[#D9B18C]"
              >
                <Settings className="h-3.5 w-3.5 text-[#D9B18C]" />
                <span>Account Settings</span>
              </button>
            </div>
          </div>
        </motion.div>

        {userDataLoading ? (
          <div className="glow-glass mt-6 rounded-2xl p-10 text-center text-sm text-[#F5DDE6]/80">
            Loading your personal beauty space...
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* PERSONAL INFORMATION */}
            <div className="glow-glass rounded-2xl p-6 lg:col-span-5">
              <div className="flex items-center justify-between border-b border-[#FFF9F0]/12 pb-3">
                <h2 className="font-editorial text-2xl text-[#FFF9F0]">
                  Personal Information
                </h2>
                {!editingPersonal && (
                  <button
                    type="button"
                    onClick={() => setEditingPersonal(true)}
                    className="cursor-pointer text-xs font-medium text-[#D9B18C] underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingPersonal ? (
                <form onSubmit={handleSavePersonal} className="mt-4 space-y-3.5">
                  <div>
                    <label className="block text-xs text-[#F5DDE6]/75">Full name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12] px-3.5 py-2.5 text-sm text-[#FFF9F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#F5DDE6]/75">Preferred name (optional)</label>
                    <input
                      type="text"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      placeholder="How GlowUp addresses you"
                      className="mt-1 w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12] px-3.5 py-2.5 text-sm text-[#FFF9F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#F5DDE6]/75">Date of birth (optional)</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12] px-3.5 py-2.5 text-sm text-[#FFF9F0]"
                    />
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="min-h-[40px] cursor-pointer rounded-full bg-[#D9B18C] px-5 py-2 text-xs font-semibold text-[#1D1119]"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPersonal(false)}
                      className="min-h-[40px] cursor-pointer rounded-full border border-[#FFF9F0]/20 px-4 py-2 text-xs text-[#F5DDE6]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between gap-4 border-b border-[#FFF9F0]/8 pb-2.5">
                    <dt className="text-[#F5DDE6]/65">Full Name</dt>
                    <dd className="font-medium text-[#FFF9F0]">{userAccount?.fullName}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#FFF9F0]/8 pb-2.5">
                    <dt className="text-[#F5DDE6]/65">Preferred Name</dt>
                    <dd className="text-[#FFF9F0]">{userAccount?.preferredName || 'Not set'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[#FFF9F0]/8 pb-2.5">
                    <dt className="text-[#F5DDE6]/65">Email Address</dt>
                    <dd className="text-[#FFF9F0]">{userAccount?.email}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#F5DDE6]/65">Date of Birth</dt>
                    <dd className="text-[#FFF9F0] tabular-nums">
                      {userAccount?.dateOfBirth || 'Optional · Not provided'}
                    </dd>
                  </div>
                </dl>
              )}
            </div>

            {/* SKIN PROFILE */}
            <div className="glow-glass rounded-2xl p-6 lg:col-span-7">
              <div className="flex items-center justify-between border-b border-[#FFF9F0]/12 pb-3">
                <h2 className="font-editorial text-2xl text-[#FFF9F0]">Skin Profile</h2>
                <button
                  type="button"
                  onClick={() => scrollToSection('profile')}
                  className="cursor-pointer text-xs font-medium text-[#D9B18C] underline"
                >
                  Update Questionnaire
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                <div className="rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] p-4">
                  <p className="text-[#D9B18C]">Skin Type</p>
                  <p className="mt-1 text-base font-medium capitalize text-[#FFF9F0]">
                    {skinProfile.skinType}
                  </p>
                </div>
                <div className="rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] p-4">
                  <p className="text-[#D9B18C]">Preferred Budget</p>
                  <p className="mt-1 text-base font-medium capitalize text-[#FFF9F0]">
                    {skinProfile.budget}
                  </p>
                </div>
                <div className="rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] p-4">
                  <p className="text-[#D9B18C]">Skin Concerns</p>
                  <p className="mt-1 leading-relaxed text-[#FFF9F0]/90 capitalize">
                    {skinProfile.concerns.length > 0
                      ? skinProfile.concerns.join(' · ').replace(/-/g, ' ')
                      : 'Balanced maintenance'}
                  </p>
                </div>
                <div className="rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] p-4">
                  <p className="text-[#D9B18C]">Allergies &amp; Sensitivities</p>
                  <p className="mt-1 leading-relaxed text-[#FFF9F0]/90">
                    {skinProfile.sensitivities.join(' · ') || 'None listed'}
                    {skinProfile.customAllergyNote ? ` (${skinProfile.customAllergyNote})` : ''}
                  </p>
                </div>
                <div className="rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] p-4">
                  <p className="text-[#D9B18C]">Skin Goals</p>
                  <p className="mt-1 leading-relaxed text-[#E8DFF5]">
                    {skinProfile.goals.join(' · ') || 'Healthy daily balance'}
                  </p>
                </div>
                <div className="rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] p-4">
                  <p className="text-[#D9B18C]">Texture &amp; Product Preferences</p>
                  <p className="mt-1 leading-relaxed text-[#FFF9F0]/90">
                    {skinProfile.preferences.join(' · ') || 'Open to suggestions'}
                  </p>
                </div>
              </div>
            </div>

            {/* BEAUTY PREFERENCES */}
            <div className="glow-glass rounded-2xl p-6 lg:col-span-6">
              <div className="flex items-center justify-between border-b border-[#FFF9F0]/12 pb-3">
                <h2 className="font-editorial text-2xl text-[#FFF9F0]">Beauty Preferences</h2>
                <button
                  type="button"
                  onClick={() => setEditingBeauty((v) => !v)}
                  className="cursor-pointer text-xs font-medium text-[#D9B18C] underline"
                >
                  {editingBeauty ? 'Close Editor' : 'Customize'}
                </button>
              </div>

              {editingBeauty ? (
                <form onSubmit={handleSaveBeautyPrefs} className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs text-[#F5DDE6]/75">Preferred product categories</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ALL_CATEGORIES.map((cat) => {
                        const active = preferredCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1 text-xs ${
                              active
                                ? 'border-[#D9B18C] bg-[#D9B18C]/20 text-[#FFF9F0]'
                                : 'border-[#FFF9F0]/15 text-[#F5DDE6]/75'
                            }`}
                          >
                            {active && <Check className="h-3 w-3 text-[#D9B18C]" />}
                            <span>{cat}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#F5DDE6]/75">Preferred ingredients</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {preferredIngredients.map((ing) => (
                        <button
                          key={ing}
                          type="button"
                          onClick={() =>
                            setPreferredIngredients((p) => p.filter((x) => x !== ing))
                          }
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#E8DFF5]/25 bg-[#E8DFF5]/10 px-2.5 py-1 text-xs text-[#FFF9F0]"
                        >
                          <span>{ing}</span>
                          <X className="h-3 w-3 text-[#D9B18C]" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={newPreferredIng}
                        onChange={(e) => setNewPreferredIng(e.target.value)}
                        placeholder="Add ingredient (e.g. Panthenol)"
                        className="flex-1 rounded-lg border border-[#FFF9F0]/15 bg-[#140D12] px-3 py-2 text-xs text-[#FFF9F0]"
                      />
                      <button
                        type="button"
                        onClick={addPreferredIngredient}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#D9B18C]/45 px-3 py-2 text-xs text-[#D9B18C]"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#F5DDE6]/75">Ingredients to avoid</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {avoidIngredients.map((ing) => (
                        <button
                          key={ing}
                          type="button"
                          onClick={() => setAvoidIngredients((p) => p.filter((x) => x !== ing))}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#F5DDE6]/25 bg-[#F5DDE6]/10 px-2.5 py-1 text-xs text-[#FFF9F0]"
                        >
                          <span>{ing}</span>
                          <X className="h-3 w-3 text-[#F5DDE6]" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={newAvoidIng}
                        onChange={(e) => setNewAvoidIng(e.target.value)}
                        placeholder="Add ingredient to avoid"
                        className="flex-1 rounded-lg border border-[#FFF9F0]/15 bg-[#140D12] px-3 py-2 text-xs text-[#FFF9F0]"
                      />
                      <button
                        type="button"
                        onClick={addAvoidIngredient}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#D9B18C]/45 px-3 py-2 text-xs text-[#D9B18C]"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#F5DDE6]/75">
                      AM / PM routine philosophy
                    </label>
                    <input
                      type="text"
                      value={amPmPreference}
                      onChange={(e) => setAmPmPreference(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#FFF9F0]/15 bg-[#140D12] px-3 py-2 text-xs text-[#FFF9F0]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="min-h-[40px] cursor-pointer rounded-full bg-[#D9B18C] px-5 py-2 text-xs font-semibold text-[#1D1119]"
                  >
                    {saving ? 'Saving...' : 'Save Beauty Preferences'}
                  </button>
                </form>
              ) : (
                <div className="mt-4 space-y-3.5 text-xs">
                  <div>
                    <p className="text-[#D9B18C]">Preferred Product Categories</p>
                    <p className="mt-1 text-[#FFF9F0]">
                      {preferredCategories.join(' · ') || 'None selected'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#D9B18C]">Preferred Ingredients</p>
                    <p className="mt-1 text-[#E8DFF5]">
                      {preferredIngredients.join(' · ') || 'None listed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#D9B18C]">Ingredients to Avoid</p>
                    <p className="mt-1 text-[#F5DDE6]">
                      {avoidIngredients.join(' · ') || 'None listed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#D9B18C]">AM / PM Routine Preference</p>
                    <p className="mt-1 leading-relaxed text-[#FFF9F0]/85">{amPmPreference}</p>
                  </div>
                </div>
              )}
            </div>

            {/* MY GLOWUP ACTIVITY */}
            <div className="glow-glass rounded-2xl p-6 lg:col-span-6">
              <div className="flex items-center justify-between border-b border-[#FFF9F0]/12 pb-3">
                <h2 className="font-editorial text-2xl text-[#FFF9F0]">My GlowUp Activity</h2>
                <button
                  type="button"
                  onClick={() => scrollToSection('dashboard')}
                  className="cursor-pointer text-xs font-medium text-[#D9B18C] underline"
                >
                  Open Dashboard
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] p-3.5">
                  <p className="text-[11px] text-[#F5DDE6]/70">Saved Products</p>
                  <p className="mt-1 text-2xl font-medium text-[#FFF9F0] tabular-nums">
                    {savedProducts.length}
                  </p>
                </div>
                <div className="rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] p-3.5">
                  <p className="text-[11px] text-[#F5DDE6]/70">Completed Days</p>
                  <p className="mt-1 text-2xl font-medium text-[#FFF9F0] tabular-nums">
                    {completedRoutineCount}
                  </p>
                </div>
                <div className="rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] p-3.5">
                  <p className="text-[11px] text-[#F5DDE6]/70">Journal Entries</p>
                  <p className="mt-1 text-2xl font-medium text-[#FFF9F0] tabular-nums">
                    {journalEntries.length}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="rounded-xl border border-[#FFF9F0]/10 bg-[#140C12]/65 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#D9B18C]">Current AM &amp; PM Routine</span>
                    <button
                      type="button"
                      onClick={() => scrollToSection('routine')}
                      className="cursor-pointer text-[#FFF9F0] underline"
                    >
                      Edit Routine
                    </button>
                  </div>
                  <p className="mt-1 text-[#F5DDE6]/80">
                    AM ({amSteps.length} steps):{' '}
                    {amSteps
                      .map((s) => SAMPLE_PRODUCTS.find((p) => p.id === s.assignedProductId)?.name || s.title)
                      .slice(0, 3)
                      .join(' → ')}
                  </p>
                  <p className="mt-0.5 text-[#E8DFF5]/80">
                    PM ({pmSteps.length} steps):{' '}
                    {pmSteps
                      .map((s) => SAMPLE_PRODUCTS.find((p) => p.id === s.assignedProductId)?.name || s.title)
                      .slice(0, 3)
                      .join(' → ')}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[#FFF9F0]/10 bg-[#140C12]/65 p-3.5">
                  <div>
                    <span className="font-semibold text-[#D9B18C]">Assessment History</span>
                    <p className="mt-0.5 text-[#F5DDE6]/80 tabular-nums">
                      {analysisHistory.length} saved demonstration{' '}
                      {analysisHistory.length === 1 ? 'snapshot' : 'snapshots'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToSection('analysis')}
                    className="cursor-pointer text-[#FFF9F0] underline"
                  >
                    New Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
