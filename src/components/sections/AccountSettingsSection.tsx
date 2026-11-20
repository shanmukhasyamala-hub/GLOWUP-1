import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Download,
  Eye,
  EyeOff,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useGlowUp } from '../../context/GlowUpContext';

async function resizeAvatarImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unavailable'));
          return;
        }
        const side = Math.min(img.width, img.height);
        ctx.drawImage(
          img,
          (img.width - side) / 2,
          (img.height - side) / 2,
          side,
          side,
          0,
          0,
          240,
          240
        );
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => reject(new Error('Invalid image file.'));
      if (typeof reader.result === 'string') img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Unable to read image.'));
    reader.readAsDataURL(file);
  });
}

export function AccountSettingsSection() {
  const {
    isAuthenticated,
    isEmailVerified,
    authUser,
    userAccount,
    openAuthModal,
    navigateToPage,
    updateAccountDetails,
    updateNotificationPreferences,
    updatePrivacyPreferences,
    changeAccountPassword,
    resendVerificationEmail,
    refreshVerificationStatus,
    exportPersonalData,
    deleteAccountPermanently,
  } = useGlowUp();

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [routineReminders, setRoutineReminders] = useState(true);
  const [ingredientUpdates, setIngredientUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [privateProfile, setPrivateProfile] = useState(true);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTyped, setDeleteTyped] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userAccount) return;
    setFullName(userAccount.fullName);
    setPreferredName(userAccount.preferredName);
    setDateOfBirth(userAccount.dateOfBirth);
    setRoutineReminders(userAccount.notificationPrefs.routineReminders);
    setIngredientUpdates(userAccount.notificationPrefs.ingredientUpdates);
    setWeeklyDigest(userAccount.notificationPrefs.weeklyDigest);
    setPrivateProfile(userAccount.privacyPrefs.privateProfile);
    setAnalyticsOptIn(userAccount.privacyPrefs.analyticsOptIn);
  }, [userAccount]);

  if (!isAuthenticated || !isEmailVerified) {
    return (
      <section className="relative flex min-h-screen items-center py-28">
        <div className="mx-auto w-full max-w-xl px-5 sm:px-8">
          <div className="glow-glass rounded-2xl p-8 text-center">
            <Lock className="mx-auto h-7 w-7 text-[#D9B18C]" />
            <h1 className="font-editorial mt-4 text-3xl text-[#FFF9F0]">
              Account Settings Protected
            </h1>
            <p className="mt-2 text-sm text-[#F5DDE6]/80">
              Sign in with a verified account to manage security, notifications, privacy, or data exports.
            </p>
            <button
              type="button"
              onClick={() =>
                openAuthModal(isAuthenticated ? 'verify-email' : 'signin', {
                  returnToPage: 'account-settings',
                })
              }
              className="mt-6 min-h-[44px] cursor-pointer rounded-full bg-[#D9B18C] px-7 py-2.5 text-xs font-semibold text-[#1D1119]"
            >
              {isAuthenticated ? 'Verify Email' : 'Sign In'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const usesPasswordProvider = Boolean(
    authUser?.providerData.some((p) => p.providerId === 'password')
  );

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrorMsg(null);
    if (!fullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    setBusy(true);
    try {
      await updateAccountDetails({
        fullName: fullName.trim(),
        preferredName: preferredName.trim(),
        dateOfBirth: dateOfBirth.trim(),
      });
      setFeedback('Personal details updated.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleChangePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, or WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Please choose an image smaller than 10 MB.');
      return;
    }
    setFeedback(null);
    setErrorMsg(null);
    setBusy(true);
    try {
      const compressed = await resizeAvatarImage(file);
      await updateAccountDetails({ photoDataUrl: compressed });
      setFeedback('Profile photograph updated.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to upload photograph.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemovePhoto = async () => {
    setFeedback(null);
    setErrorMsg(null);
    setBusy(true);
    try {
      await updateAccountDetails({ photoDataUrl: '' });
      setFeedback('Profile photograph removed.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to remove photograph.');
    } finally {
      setBusy(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrorMsg(null);
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      setErrorMsg(
        'New password must be at least 8 characters and include uppercase, lowercase, and a number.'
      );
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await changeAccountPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setFeedback('Your password has been updated securely.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to update password.');
    } finally {
      setBusy(false);
    }
  };

  const handleSavePreferences = async () => {
    setFeedback(null);
    setErrorMsg(null);
    setBusy(true);
    try {
      await Promise.all([
        updateNotificationPreferences({
          routineReminders,
          ingredientUpdates,
          weeklyDigest,
        }),
        updatePrivacyPreferences({
          privateProfile,
          analyticsOptIn,
        }),
      ]);
      setFeedback('Notification and privacy settings saved.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not save preferences.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    setErrorMsg(null);
    if (deleteTyped.trim() !== 'DELETE') {
      setErrorMsg('Type DELETE in uppercase to confirm permanent account deletion.');
      return;
    }
    if (usesPasswordProvider && !deletePassword) {
      setErrorMsg('Please enter your current password to confirm account deletion.');
      return;
    }
    setBusy(true);
    try {
      await deleteAccountPermanently(deletePassword);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Account deletion failed.');
      setBusy(false);
    }
  };

  return (
    <section className="relative min-h-screen pb-24 pt-28 sm:pt-32">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigateToPage('my-profile')}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#D9B18C] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to My Profile</span>
            </button>
            <h1 className="font-editorial mt-2 text-4xl font-normal text-[#FFF9F0] sm:text-5xl">
              Account Settings
            </h1>
          </div>
        </div>

        {feedback && (
          <div className="mb-5 rounded-xl border border-[#D9B18C]/45 bg-[#D9B18C]/15 px-5 py-3 text-xs text-[#FFF9F0]">
            {feedback}
          </div>
        )}
        {errorMsg && (
          <div className="mb-5 rounded-xl border border-[#F5DDE6]/40 bg-[#4A1F31]/75 px-5 py-3 text-xs text-[#FFF9F0]">
            {errorMsg}
          </div>
        )}

        <div className="space-y-6">
          {/* 1. Personal Details & Photo */}
          <div className="glow-glass rounded-2xl p-6 sm:p-7">
            <h2 className="font-editorial text-2xl text-[#FFF9F0]">
              Personal Details &amp; Profile Photograph
            </h2>

            <div className="mt-5 flex flex-wrap items-center gap-4 border-b border-[#FFF9F0]/12 pb-5">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-[#D9B18C]/60 bg-[#2A1723]">
                {userAccount?.photoDataUrl ? (
                  <img
                    src={userAccount.photoDataUrl}
                    alt="Profile avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[#D9B18C]">
                    {(userAccount?.fullName || 'G').slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleChangePhoto}
                className="hidden"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => avatarInputRef.current?.click()}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border border-[#FFF9F0]/25 px-4 py-2 text-xs font-medium text-[#FFF9F0] hover:border-[#D9B18C]"
              >
                <Camera className="h-3.5 w-3.5 text-[#D9B18C]" />
                <span>Change Profile Photograph</span>
              </button>
              {userAccount?.photoDataUrl && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleRemovePhoto()}
                  className="cursor-pointer text-xs text-[#F5DDE6]/70 underline hover:text-[#FFF9F0]"
                >
                  Remove photo
                </button>
              )}
            </div>

            <form onSubmit={handleSaveDetails} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                <label className="block text-xs text-[#F5DDE6]/75">Preferred name</label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12] px-3.5 py-2.5 text-sm text-[#FFF9F0]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F5DDE6]/75">Date of birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12] px-3.5 py-2.5 text-sm text-[#FFF9F0]"
                />
              </div>
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="min-h-[42px] cursor-pointer rounded-full bg-[#D9B18C] px-6 py-2 text-xs font-semibold text-[#1D1119] hover:bg-[#E7C6A5]"
                >
                  Save Personal Details
                </button>
              </div>
            </form>
          </div>

          {/* 2. Email Verification Status & Password Security */}
          <div className="glow-glass rounded-2xl p-6 sm:p-7">
            <h2 className="font-editorial text-2xl text-[#FFF9F0]">
              Security &amp; Email Verification
            </h2>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] px-4 py-3.5 text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[#D9B18C]" />
                <span>
                  Email status for <strong className="text-[#FFF9F0]">{authUser?.email}</strong>:{' '}
                  <span className="text-[#D9B18C]">
                    {authUser?.emailVerified ? 'Verified' : 'Pending verification'}
                  </span>
                </span>
              </div>
              {!authUser?.emailVerified && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void resendVerificationEmail()}
                    className="cursor-pointer text-[#D9B18C] underline"
                  >
                    Resend
                  </button>
                  <button
                    type="button"
                    onClick={() => void refreshVerificationStatus()}
                    className="cursor-pointer text-[#FFF9F0] underline"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>

            {usesPasswordProvider ? (
              <form onSubmit={handleChangePassword} className="mt-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#D9B18C]">Change Password</p>
                  <button
                    type="button"
                    onClick={() => setShowPasswords((v) => !v)}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs text-[#F5DDE6]/75 hover:text-[#FFF9F0]"
                  >
                    {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span>{showPasswords ? 'Hide' : 'Show'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    autoComplete="current-password"
                    className="rounded-xl border border-[#FFF9F0]/15 bg-[#140D12] px-3.5 py-2.5 text-xs text-[#FFF9F0]"
                  />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (8+ chars)"
                    autoComplete="new-password"
                    className="rounded-xl border border-[#FFF9F0]/15 bg-[#140D12] px-3.5 py-2.5 text-xs text-[#FFF9F0]"
                  />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="rounded-xl border border-[#FFF9F0]/15 bg-[#140D12] px-3.5 py-2.5 text-xs text-[#FFF9F0]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="min-h-[42px] cursor-pointer rounded-full border border-[#D9B18C]/55 px-5 py-2 text-xs font-medium text-[#FFF9F0] hover:bg-[#D9B18C]/20"
                >
                  Update Password
                </button>
              </form>
            ) : (
              <p className="mt-4 text-xs text-[#F5DDE6]/75">
                You signed in with Google. Password management is handled securely through your Google Account.
              </p>
            )}
          </div>

          {/* 3. Notification & Privacy Preferences */}
          <div className="glow-glass rounded-2xl p-6 sm:p-7">
            <h2 className="font-editorial text-2xl text-[#FFF9F0]">
              Notifications &amp; Privacy
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3 text-xs">
                <p className="font-medium text-[#D9B18C]">Notification Preferences</p>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] px-4 py-3">
                  <span>AM/PM routine reminders</span>
                  <input
                    type="checkbox"
                    checked={routineReminders}
                    onChange={(e) => setRoutineReminders(e.target.checked)}
                    className="h-4 w-4 accent-[#D9B18C]"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] px-4 py-3">
                  <span>Ingredient compatibility notes</span>
                  <input
                    type="checkbox"
                    checked={ingredientUpdates}
                    onChange={(e) => setIngredientUpdates(e.target.checked)}
                    className="h-4 w-4 accent-[#D9B18C]"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] px-4 py-3">
                  <span>Weekly skin journal digest</span>
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="h-4 w-4 accent-[#D9B18C]"
                  />
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <p className="font-medium text-[#D9B18C]">Privacy Settings</p>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] px-4 py-3">
                  <span>Keep skin profile strictly private</span>
                  <input
                    type="checkbox"
                    checked={privateProfile}
                    onChange={(e) => setPrivateProfile(e.target.checked)}
                    className="h-4 w-4 accent-[#D9B18C]"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#FFF9F0]/10 bg-[#FFF9F0]/[0.03] px-4 py-3">
                  <span>Optional anonymized experience insights</span>
                  <input
                    type="checkbox"
                    checked={analyticsOptIn}
                    onChange={(e) => setAnalyticsOptIn(e.target.checked)}
                    className="h-4 w-4 accent-[#D9B18C]"
                  />
                </label>
              </div>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={handleSavePreferences}
              className="mt-5 min-h-[42px] cursor-pointer rounded-full bg-[#F5DDE6] px-6 py-2 text-xs font-semibold text-[#2A1723] hover:bg-[#FFF9F0]"
            >
              Save Notification &amp; Privacy Settings
            </button>
          </div>

          {/* 4. Data Export & Account Deletion */}
          <div className="glow-glass rounded-2xl p-6 sm:p-7">
            <h2 className="font-editorial text-2xl text-[#FFF9F0]">
              Your Personal Data &amp; Account Control
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[#F5DDE6]/80">
              Export your complete skin profile, saved products, routines, and journal entries at any time, or permanently erase your account.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportPersonalData}
                className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-full border border-[#D9B18C]/50 px-5 py-2 text-xs font-medium text-[#FFF9F0] hover:bg-[#D9B18C]/15"
              >
                <Download className="h-4 w-4 text-[#D9B18C]" />
                <span>Download Personal Data (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteConfirmOpen((v) => !v)}
                className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-full border border-[#F5DDE6]/30 px-5 py-2 text-xs font-medium text-[#F5DDE6] hover:border-[#F5DDE6]"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </button>
            </div>

            {deleteConfirmOpen && (
              <div className="mt-5 rounded-xl border border-[#F5DDE6]/35 bg-[#3A1726]/70 p-5 text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#F5DDE6]" />
                  <div>
                    <p className="font-semibold text-[#FFF9F0]">
                      Confirm Permanent Account Deletion
                    </p>
                    <p className="mt-1 leading-relaxed text-[#F5DDE6]/85">
                      This permanently removes your profile, skin questionnaire, routines, journal entries, and saved analysis history. This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={deleteTyped}
                    onChange={(e) => setDeleteTyped(e.target.value)}
                    placeholder='Type "DELETE" to confirm'
                    className="rounded-xl border border-[#FFF9F0]/20 bg-[#140D12] px-3.5 py-2.5 text-xs text-[#FFF9F0]"
                  />
                  {usesPasswordProvider && (
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Confirm current password"
                      className="rounded-xl border border-[#FFF9F0]/20 bg-[#140D12] px-3.5 py-2.5 text-xs text-[#FFF9F0]"
                    />
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleDeleteAccount}
                    className="min-h-[40px] cursor-pointer rounded-full bg-[#F5DDE6] px-5 py-2 text-xs font-semibold text-[#2A1723]"
                  >
                    {busy ? 'Deleting...' : 'Permanently Delete My Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="min-h-[40px] cursor-pointer rounded-full border border-[#FFF9F0]/20 px-4 py-2 text-xs text-[#FFF9F0]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
