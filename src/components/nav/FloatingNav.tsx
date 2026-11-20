import { useEffect, useRef, useState } from 'react';
import { LogOut, Menu, Settings, ShieldCheck, User, UserPlus, X } from 'lucide-react';
import { SECTIONS } from '../../data/catalog';
import { useGlowUp } from '../../context/GlowUpContext';
import { SectionId } from '../../types/glowup';

const NAV_ITEMS: { id: SectionId | 'my-profile'; label: string }[] = [
  { id: 'hero', label: 'Home' },
  { id: 'understand', label: 'Discover' },
  { id: 'analysis', label: 'Skin Analysis' },
  { id: 'products', label: 'Products' },
  { id: 'routine', label: 'My Routine' },
  { id: 'dashboard', label: 'My Dashboard' },
  { id: 'my-profile', label: 'My Profile' },
];

export function FloatingNav() {
  const {
    activePage,
    navigateToPage,
    activeSection,
    scrollToSection,
    isAuthenticated,
    isEmailVerified,
    userAccount,
    authUser,
    openAuthModal,
    signOutAccount,
  } = useGlowUp();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const activeIdx = Math.max(0, SECTIONS.findIndex((s) => s.id === activeSection));
  const currentMeta = SECTIONS[activeIdx] ?? SECTIONS[0];
  const progressPct = Math.round(((activeIdx + 1) / SECTIONS.length) * 100);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleNavigate = (id: SectionId | 'my-profile') => {
    setMobileOpen(false);
    setAccountMenuOpen(false);
    if (id === 'my-profile') {
      navigateToPage('my-profile');
      return;
    }
    scrollToSection(id);
  };

  const displayInitial = (
    userAccount?.preferredName ||
    userAccount?.fullName ||
    authUser?.displayName ||
    authUser?.email ||
    'G'
  )
    .slice(0, 1)
    .toUpperCase();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-3 sm:px-6 sm:pt-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        {/* Compact floating glass navigation container */}
        <nav
          aria-label="Primary navigation"
          className="glow-glass pointer-events-auto flex w-full items-center justify-between gap-3 rounded-full px-4 py-2.5 sm:px-6"
        >
          {/* Zone 1: Brand wordmark */}
          <button
            type="button"
            onClick={() => handleNavigate('hero')}
            className="font-editorial shrink-0 cursor-pointer whitespace-nowrap text-lg font-medium tracking-[0.18em] text-[#FFF9F0] transition-colors hover:text-[#D9B18C] sm:text-xl"
          >
            GLOWUP
          </button>

          {/* Zone 2: Desktop single-line nav links */}
          <div className="hidden items-center gap-4 lg:flex xl:gap-5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.id === 'my-profile'
                  ? activePage === 'my-profile' || activePage === 'account-settings'
                  : activePage === 'experience' &&
                    (activeSection === item.id ||
                      (item.id === 'understand' && activeSection === 'assistant'));
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`cursor-pointer whitespace-nowrap shrink-0 border-b pb-0.5 text-xs font-medium tracking-wide transition-colors duration-200 ${
                    isActive
                      ? 'border-[#D9B18C] text-[#FFF9F0]'
                      : 'border-transparent text-[#F5DDE6]/75 hover:text-[#FFF9F0]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Zone 3: Section progress indicator + Account Icon + Mobile menu */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <div
              className="flex items-center gap-2 text-xs text-[#F5DDE6]/85 tabular-nums"
              aria-label={`Section ${currentMeta.index} of 09: ${currentMeta.label}`}
            >
              <span className="hidden xl:inline text-[#D9B18C]">
                {activePage === 'my-profile'
                  ? 'Profile'
                  : activePage === 'account-settings'
                    ? 'Settings'
                    : currentMeta.label}
              </span>
              <span className="hidden xl:inline text-[#FFF9F0]/35" aria-hidden="true">·</span>
              <span className="hidden sm:inline font-medium text-[#FFF9F0]">
                {currentMeta.index} / 09
              </span>
              <div className="hidden h-1 w-10 overflow-hidden rounded-full bg-[#FFF9F0]/15 md:block">
                <div
                  className="h-full rounded-full bg-[#D9B18C] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Subtle Account / Profile Trigger */}
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((v) => !v)}
                aria-expanded={accountMenuOpen}
                aria-label="Account and profile menu"
                className={`flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border text-xs font-semibold transition-colors ${
                  isAuthenticated
                    ? 'border-[#D9B18C] bg-[#D9B18C]/20 text-[#FFF9F0]'
                    : 'border-[#FFF9F0]/20 text-[#F5DDE6] hover:border-[#D9B18C]'
                }`}
              >
                {isAuthenticated && userAccount?.photoDataUrl ? (
                  <img
                    src={userAccount.photoDataUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : isAuthenticated ? (
                  <span>{displayInitial}</span>
                ) : (
                  <User className="h-4 w-4" />
                )}
              </button>

              {accountMenuOpen && (
                <div className="glow-glass absolute right-0 mt-3 w-64 rounded-2xl p-2 shadow-2xl">
                  {!isAuthenticated ? (
                    <div className="space-y-1 p-1">
                      <p className="px-3 py-1.5 text-[11px] text-[#F5DDE6]/70">
                        GlowUp Private Account
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          openAuthModal('signin');
                        }}
                        className="flex min-h-[40px] w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#FFF9F0] hover:bg-[#FFF9F0]/10"
                      >
                        <User className="h-3.5 w-3.5 text-[#D9B18C]" />
                        <span>Sign In</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          openAuthModal('signup');
                        }}
                        className="flex min-h-[40px] w-full cursor-pointer items-center gap-2.5 rounded-xl bg-[#D9B18C]/15 px-3 py-2 text-left text-xs font-semibold text-[#FFF9F0] hover:bg-[#D9B18C]/25"
                      >
                        <UserPlus className="h-3.5 w-3.5 text-[#D9B18C]" />
                        <span>Create Account</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 p-1">
                      <div className="border-b border-[#FFF9F0]/10 px-3 py-2">
                        <p className="truncate text-xs font-semibold text-[#FFF9F0]">
                          {userAccount?.preferredName ||
                            userAccount?.fullName ||
                            authUser?.displayName ||
                            'GlowUp Member'}
                        </p>
                        <p className="truncate text-[11px] text-[#F5DDE6]/65">
                          {authUser?.email}
                        </p>
                      </div>

                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            openAuthModal('verify-email');
                          }}
                          className="flex min-h-[38px] w-full cursor-pointer items-center gap-2 rounded-xl bg-[#D9B18C]/15 px-3 py-2 text-left text-xs font-medium text-[#D9B18C]"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Verify Email Address</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleNavigate('my-profile')}
                        className="flex min-h-[40px] w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#FFF9F0] hover:bg-[#FFF9F0]/10"
                      >
                        <User className="h-3.5 w-3.5 text-[#D9B18C]" />
                        <span>My Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavigate('dashboard')}
                        className="flex min-h-[40px] w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#FFF9F0] hover:bg-[#FFF9F0]/10"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-[#D9B18C]" />
                        <span>My Dashboard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          navigateToPage('account-settings');
                        }}
                        className="flex min-h-[40px] w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#FFF9F0] hover:bg-[#FFF9F0]/10"
                      >
                        <Settings className="h-3.5 w-3.5 text-[#D9B18C]" />
                        <span>Account Settings</span>
                      </button>

                      <div className="border-t border-[#FFF9F0]/10 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            void signOutAccount();
                          }}
                          className="flex min-h-[40px] w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#F5DDE6] hover:bg-[#FFF9F0]/10"
                        >
                          <LogOut className="h-3.5 w-3.5 text-[#F5DDE6]" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#FFF9F0]/15 text-[#FFF9F0] transition-colors hover:border-[#D9B18C] lg:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile compact drawer */}
      {mobileOpen && (
        <div className="glow-glass pointer-events-auto mx-auto mt-2 max-w-6xl rounded-2xl p-4 lg:hidden">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.id === 'my-profile'
                  ? activePage === 'my-profile'
                  : activePage === 'experience' && activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`min-h-[44px] cursor-pointer rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'border border-[#D9B18C]/50 bg-[#D9B18C]/20 text-[#FFF9F0]'
                      : 'text-[#F5DDE6]/85 hover:bg-[#FFF9F0]/10'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
