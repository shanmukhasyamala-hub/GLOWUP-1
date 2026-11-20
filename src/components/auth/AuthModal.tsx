import React, { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, Lock, Mail, RefreshCw, ShieldCheck, User, X } from 'lucide-react';
import { useGlowUp } from '../../context/GlowUpContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePasswordRules(password: string) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

export function AuthModal() {
  const {
    authModalOpen,
    authModalView,
    authModalReason,
    closeAuthModal,
    setAuthModalView,
    authUser,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    requestPasswordReset,
    resendVerificationEmail,
    refreshVerificationStatus,
    signOutAccount,
  } = useGlowUp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    setInfoMsg(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [authModalView, authModalOpen]);

  useEffect(() => {
    if (!authModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  const passwordRules = validatePasswordRules(password);
  const isPasswordStrong =
    passwordRules.minLength &&
    passwordRules.hasUpper &&
    passwordRules.hasLower &&
    passwordRules.hasNumber;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmail(email, password, rememberMe);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!isPasswordStrong) {
      setErrorMsg('Please fulfill all password security requirements below.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('Please accept the Terms of Service and Privacy Policy to create your account.');
      return;
    }

    setSubmitting(true);
    try {
      await signUpWithEmail(fullName, email, password);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg('Please enter the email address associated with your account.');
      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setInfoMsg(
        `Password reset instructions have been sent to ${email.trim()}. Check your inbox and spam folder.`
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to sign in with Google.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      await resendVerificationEmail();
      setInfoMsg('Verification email resent. Please open the link in your inbox, then click Refresh Status.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not resend verification email.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckVerification = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      const verified = await refreshVerificationStatus();
      if (!verified) {
        setErrorMsg('Email is still unverified. Click the link in your inbox first, then try again.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not refresh verification status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="glowup-auth-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D070B]/80 p-4 overflow-y-auto"
    >
      <div className="glow-glass relative my-auto w-full max-w-md rounded-2xl p-6 sm:p-8">
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close authentication modal"
          className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#FFF9F0]/15 text-[#F5DDE6]/80 transition-colors hover:border-[#D9B18C] hover:text-[#FFF9F0]"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs font-medium tracking-[0.24em] text-[#D9B18C]">
          GLOWUP · PRIVATE SANCTUARY
        </p>

        <h2
          id="glowup-auth-title"
          className="font-editorial mt-2 text-3xl font-normal text-[#FFF9F0]"
        >
          {authModalView === 'signin' && 'Welcome back'}
          {authModalView === 'signup' && 'Create your GlowUp account'}
          {authModalView === 'forgot-password' && 'Reset your password'}
          {authModalView === 'verify-email' && 'Verify your email'}
        </h2>

        {authModalReason && (
          <p className="mt-2 rounded-xl border border-[#D9B18C]/30 bg-[#D9B18C]/10 px-3.5 py-2.5 text-xs leading-relaxed text-[#F5DDE6]">
            {authModalReason}
          </p>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-[#F5DDE6]/40 bg-[#4A1F31]/75 px-4 py-3 text-xs leading-relaxed text-[#FFF9F0]"
          >
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mt-4 rounded-xl border border-[#D9B18C]/45 bg-[#D9B18C]/15 px-4 py-3 text-xs leading-relaxed text-[#FFF9F0]">
            {infoMsg}
          </div>
        )}

        {/* SIGN IN VIEW */}
        {authModalView === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="signin-email" className="block text-xs text-[#F5DDE6]/80">
                Email address
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D9B18C]/75" />
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12]/85 py-2.5 pl-10 pr-4 text-sm text-[#FFF9F0] placeholder:text-[#F5DDE6]/35 focus:border-[#D9B18C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signin-password" className="block text-xs text-[#F5DDE6]/80">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D9B18C]/75" />
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12]/85 py-2.5 pl-10 pr-11 text-sm text-[#FFF9F0] placeholder:text-[#F5DDE6]/35 focus:border-[#D9B18C] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#F5DDE6]/70 hover:text-[#FFF9F0]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex cursor-pointer items-center gap-2 text-[#F5DDE6]/85">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-[#D9B18C]"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => setAuthModalView('forgot-password')}
                className="cursor-pointer font-medium text-[#D9B18C] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="min-h-[46px] w-full cursor-pointer rounded-full bg-[#D9B18C] px-6 py-3 text-xs font-semibold tracking-[0.14em] text-[#1D1119] transition-colors hover:bg-[#E7C6A5] disabled:opacity-60"
            >
              {submitting ? 'SIGNING IN...' : 'SIGN IN'}
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-[#FFF9F0]/12" />
              <span className="mx-3 text-[11px] text-[#F5DDE6]/55">or</span>
              <div className="flex-grow border-t border-[#FFF9F0]/12" />
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleSignIn}
              className="min-h-[44px] w-full cursor-pointer rounded-full border border-[#FFF9F0]/25 bg-[#FFF9F0]/[0.04] px-5 py-2.5 text-xs font-medium text-[#FFF9F0] transition-colors hover:border-[#D9B18C]"
            >
              Continue with Google
            </button>

            <p className="pt-2 text-center text-xs text-[#F5DDE6]/75">
              New to GlowUp?{' '}
              <button
                type="button"
                onClick={() => setAuthModalView('signup')}
                className="cursor-pointer font-semibold text-[#D9B18C] hover:underline"
              >
                Create Account
              </button>
            </p>
          </form>
        )}

        {/* CREATE ACCOUNT VIEW */}
        {authModalView === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="mt-5 space-y-3.5">
            <div>
              <label htmlFor="signup-name" className="block text-xs text-[#F5DDE6]/80">
                Full name
              </label>
              <div className="relative mt-1">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D9B18C]/75" />
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Elena Vance"
                  className="w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12]/85 py-2.5 pl-10 pr-4 text-sm text-[#FFF9F0] placeholder:text-[#F5DDE6]/35 focus:border-[#D9B18C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs text-[#F5DDE6]/80">
                Email address
              </label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D9B18C]/75" />
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12]/85 py-2.5 pl-10 pr-4 text-sm text-[#FFF9F0] placeholder:text-[#F5DDE6]/35 focus:border-[#D9B18C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs text-[#F5DDE6]/80">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D9B18C]/75" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12]/85 py-2.5 pl-10 pr-11 text-sm text-[#FFF9F0] placeholder:text-[#F5DDE6]/35 focus:border-[#D9B18C] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#F5DDE6]/70 hover:text-[#FFF9F0]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                <span className={passwordRules.minLength ? 'text-[#D9B18C]' : 'text-[#F5DDE6]/55'}>
                  {passwordRules.minLength ? '✓' : '·'} 8+ characters
                </span>
                <span className={passwordRules.hasUpper ? 'text-[#D9B18C]' : 'text-[#F5DDE6]/55'}>
                  {passwordRules.hasUpper ? '✓' : '·'} Uppercase letter
                </span>
                <span className={passwordRules.hasLower ? 'text-[#D9B18C]' : 'text-[#F5DDE6]/55'}>
                  {passwordRules.hasLower ? '✓' : '·'} Lowercase letter
                </span>
                <span className={passwordRules.hasNumber ? 'text-[#D9B18C]' : 'text-[#F5DDE6]/55'}>
                  {passwordRules.hasNumber ? '✓' : '·'} Number
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="signup-confirm" className="block text-xs text-[#F5DDE6]/80">
                Confirm password
              </label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D9B18C]/75" />
                <input
                  id="signup-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12]/85 py-2.5 pl-10 pr-11 text-sm text-[#FFF9F0] placeholder:text-[#F5DDE6]/35 focus:border-[#D9B18C] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#F5DDE6]/70 hover:text-[#FFF9F0]"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-relaxed text-[#F5DDE6]/80">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#D9B18C]"
              />
              <span>
                I agree to GlowUp&apos;s private skincare data storage and non-medical educational Terms &amp; Privacy Policy.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="min-h-[46px] w-full cursor-pointer rounded-full bg-[#D9B18C] px-6 py-3 text-xs font-semibold tracking-[0.14em] text-[#1D1119] transition-colors hover:bg-[#E7C6A5] disabled:opacity-60"
            >
              {submitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleSignIn}
              className="min-h-[44px] w-full cursor-pointer rounded-full border border-[#FFF9F0]/25 bg-[#FFF9F0]/[0.04] px-5 py-2.5 text-xs font-medium text-[#FFF9F0] transition-colors hover:border-[#D9B18C]"
            >
              Continue with Google
            </button>

            <p className="pt-1 text-center text-xs text-[#F5DDE6]/75">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalView('signin')}
                className="cursor-pointer font-semibold text-[#D9B18C] hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {authModalView === 'forgot-password' && (
          <form onSubmit={handleForgotSubmit} className="mt-5 space-y-4">
            <p className="text-xs leading-relaxed text-[#F5DDE6]/80">
              Enter your account email address and we will send a secure password reset link.
            </p>
            <div>
              <label htmlFor="reset-email" className="block text-xs text-[#F5DDE6]/80">
                Email address
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D9B18C]/75" />
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#FFF9F0]/15 bg-[#140D12]/85 py-2.5 pl-10 pr-4 text-sm text-[#FFF9F0] placeholder:text-[#F5DDE6]/35 focus:border-[#D9B18C] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="min-h-[46px] w-full cursor-pointer rounded-full bg-[#D9B18C] px-6 py-3 text-xs font-semibold tracking-[0.14em] text-[#1D1119] transition-colors hover:bg-[#E7C6A5] disabled:opacity-60"
            >
              {submitting ? 'SENDING LINK...' : 'SEND RESET LINK'}
            </button>

            <p className="text-center text-xs text-[#F5DDE6]/75">
              Remembered your password?{' '}
              <button
                type="button"
                onClick={() => setAuthModalView('signin')}
                className="cursor-pointer font-semibold text-[#D9B18C] hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          </form>
        )}

        {/* EMAIL VERIFICATION VIEW */}
        {authModalView === 'verify-email' && (
          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-[#FFF9F0]/12 bg-[#FFF9F0]/[0.03] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#D9B18C]" />
              <div className="text-xs leading-relaxed text-[#F5DDE6]/85">
                <p className="font-semibold text-[#FFF9F0]">
                  Verification link sent to {authUser?.email || email}
                </p>
                <p className="mt-1">
                  To protect your private skin profile and beauty journal, please confirm your email address via the link in your inbox.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleCheckVerification}
              className="inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#D9B18C] px-6 py-3 text-xs font-semibold tracking-[0.12em] text-[#1D1119] hover:bg-[#E7C6A5] disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              <span>I&apos;VE VERIFIED — REFRESH STATUS</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleResendVerification}
              className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#FFF9F0]/25 px-5 py-2.5 text-xs font-medium text-[#FFF9F0] hover:border-[#D9B18C]"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#D9B18C]" />
              <span>Resend Verification Email</span>
            </button>

            <div className="flex items-center justify-between pt-2 text-xs text-[#F5DDE6]/70">
              <button
                type="button"
                onClick={() => {
                  void signOutAccount();
                  closeAuthModal();
                }}
                className="cursor-pointer underline hover:text-[#FFF9F0]"
              >
                Sign out
              </button>
              <button
                type="button"
                onClick={closeAuthModal}
                className="cursor-pointer hover:text-[#FFF9F0]"
              >
                Continue browsing public site
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
