import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  User,
} from 'firebase/auth';
import { DEFAULT_AM_STEPS, DEFAULT_PM_STEPS, SAMPLE_PRODUCTS } from '../data/catalog';
import { auth, googleProvider, mapFirebaseAuthError } from '../lib/firebase';
import {
  createAnalysisHistoryDoc,
  createJournalEntryDoc,
  deleteAllUserFirestoreData,
  deleteJournalEntryDoc,
  ensureUserAccountDoc,
  loadAnalysisHistory,
  loadJournalEntries,
  loadSkinProfileDoc,
  loadUserRoutinesDoc,
  saveSkinProfileDoc,
  saveUserRoutinesDoc,
  updateUserAccountDoc,
} from '../services/userDatabaseService';
import {
  ActivePage,
  AnalysisResult,
  AuthModalView,
  BeautyPreferences,
  ConsistencyDay,
  JournalEntry,
  NotificationPreferences,
  PrivacyPreferences,
  Product,
  RoutineStep,
  SectionId,
  SkinProfile,
  UserAccount,
} from '../types/glowup';

const DEFAULT_PROFILE: SkinProfile = {
  skinType: 'combination',
  concerns: ['hydration', 'dullness'],
  sensitivities: ['Fragrance-free preferred'],
  customAllergyNote: '',
  goals: ['Strengthen skin barrier', 'Achieve luminous daily glow'],
  budget: 'curated',
  preferences: ['Featherlight gel-serums', 'Botanical & peptide actives'],
};

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

interface AuthModalOptions {
  reason?: string;
  returnToPage?: ActivePage;
  returnToSection?: SectionId;
  onVerifiedAction?: () => void;
}

interface GlowUpContextValue {
  // Navigation & View Mode
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  navigateToPage: (page: ActivePage) => void;
  activeSection: SectionId;
  setActiveSection: (id: SectionId) => void;
  scrollToSection: (id: SectionId) => void;
  registerScrollHandler: (fn: (id: SectionId) => void) => void;

  // Auth & User State
  authReady: boolean;
  authUser: User | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  userDataLoading: boolean;
  userAccount: UserAccount | null;

  // Auth Modal & Actions
  authModalOpen: boolean;
  authModalView: AuthModalView;
  authModalReason: string | null;
  openAuthModal: (view: AuthModalView, options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: AuthModalView) => void;
  requireVerifiedAuth: (options: AuthModalOptions) => boolean;

  signInWithEmail: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signUpWithEmail: (fullName: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshVerificationStatus: () => Promise<boolean>;
  signOutAccount: () => Promise<void>;

  // Account & Profile Management
  updateAccountDetails: (updates: {
    fullName?: string;
    preferredName?: string;
    dateOfBirth?: string;
    photoDataUrl?: string;
  }) => Promise<void>;
  updateBeautyPreferences: (prefs: BeautyPreferences) => Promise<void>;
  updateNotificationPreferences: (prefs: NotificationPreferences) => Promise<void>;
  updatePrivacyPreferences: (prefs: PrivacyPreferences) => Promise<void>;
  changeAccountPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  exportPersonalData: () => void;
  deleteAccountPermanently: (currentPassword?: string) => Promise<void>;

  // Beauty State (Firestore-backed for verified users; transient preview for visitors)
  skinProfile: SkinProfile;
  updateSkinProfile: (next: SkinProfile) => void;

  savedProductIds: string[];
  toggleSaveProduct: (id: string) => void;
  savedProducts: Product[];

  amSteps: RoutineStep[];
  pmSteps: RoutineStep[];
  setAmSteps: React.Dispatch<React.SetStateAction<RoutineStep[]>>;
  setPmSteps: React.Dispatch<React.SetStateAction<RoutineStep[]>>;
  assignProductToStep: (period: 'AM' | 'PM', stepType: RoutineStep['stepType'], productId: string) => void;
  toggleStepCompleted: (period: 'AM' | 'PM', stepId: string) => void;
  saveRoutinesNow: () => void;
  lastRoutineSavedAt: string | null;

  analysisHistory: AnalysisResult[];
  addAnalysisResult: (res: AnalysisResult) => void;

  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  deleteJournalEntry: (id: string) => void;

  consistencyDays: ConsistencyDay[];
}

const GlowUpContext = createContext<GlowUpContextValue | null>(null);

export function GlowUpProvider({ children }: { children: React.ReactNode }) {
  const [activePage, setActivePage] = useState<ActivePage>('experience');
  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const scrollHandlerRef = useRef<((id: SectionId) => void) | null>(null);
  const pendingSectionScrollRef = useRef<SectionId | null>(null);

  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthModalView>('signin');
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const pendingAuthOptionsRef = useRef<AuthModalOptions | null>(null);
  const pendingSignupNameRef = useRef<string | null>(null);

  // User beauty data (isolated per UID in Firestore; clean preview defaults when signed out)
  const [skinProfile, setSkinProfile] = useState<SkinProfile>(DEFAULT_PROFILE);
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [amSteps, setAmSteps] = useState<RoutineStep[]>(DEFAULT_AM_STEPS);
  const [pmSteps, setPmSteps] = useState<RoutineStep[]>(DEFAULT_PM_STEPS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [consistencyDays, setConsistencyDays] = useState<ConsistencyDay[]>([]);
  const [lastRoutineSavedAt, setLastRoutineSavedAt] = useState<string | null>(null);

  const savedProductIdsRef = useRef<string[]>(savedProductIds);
  const amStepsRef = useRef<RoutineStep[]>(amSteps);
  const pmStepsRef = useRef<RoutineStep[]>(pmSteps);
  const consistencyDaysRef = useRef<ConsistencyDay[]>(consistencyDays);
  const hydratingUidRef = useRef<string | null>(null);

  useEffect(() => {
    savedProductIdsRef.current = savedProductIds;
  }, [savedProductIds]);

  useEffect(() => {
    amStepsRef.current = amSteps;
  }, [amSteps]);

  useEffect(() => {
    pmStepsRef.current = pmSteps;
  }, [pmSteps]);

  useEffect(() => {
    consistencyDaysRef.current = consistencyDays;
  }, [consistencyDays]);

  const resetUserStateToDefaults = useCallback(() => {
    hydratingUidRef.current = null;
    setUserAccount(null);
    setSkinProfile(DEFAULT_PROFILE);
    savedProductIdsRef.current = [];
    amStepsRef.current = DEFAULT_AM_STEPS;
    pmStepsRef.current = DEFAULT_PM_STEPS;
    consistencyDaysRef.current = [];
    setSavedProductIds([]);
    setAmSteps(DEFAULT_AM_STEPS);
    setPmSteps(DEFAULT_PM_STEPS);
    setJournalEntries([]);
    setAnalysisHistory([]);
    setConsistencyDays([]);
    setLastRoutineSavedAt(null);
  }, []);

  const hydrateUserFirestoreData = useCallback(async (user: User) => {
    if (!user.emailVerified) {
      setUserAccount(null);
      return;
    }
    if (hydratingUidRef.current === user.uid) {
      return;
    }

    hydratingUidRef.current = user.uid;
    setUserDataLoading(true);
    try {
      const account = await ensureUserAccountDoc(user, {
        fullName: pendingSignupNameRef.current || user.displayName || undefined,
      });
      pendingSignupNameRef.current = null;
      setUserAccount(account);

      const [loadedProfile, loadedRoutines, loadedJournal, loadedAnalyses] =
        await Promise.all([
          loadSkinProfileDoc(user.uid),
          loadUserRoutinesDoc(user.uid),
          loadJournalEntries(user.uid),
          loadAnalysisHistory(user.uid),
        ]);

      setSkinProfile(loadedProfile ?? DEFAULT_PROFILE);
      if (loadedRoutines) {
        const nextSaved = loadedRoutines.savedProductIds;
        const nextAm = loadedRoutines.amSteps.length > 0 ? loadedRoutines.amSteps : DEFAULT_AM_STEPS;
        const nextPm = loadedRoutines.pmSteps.length > 0 ? loadedRoutines.pmSteps : DEFAULT_PM_STEPS;
        const nextConsistency = loadedRoutines.consistencyDays;
        savedProductIdsRef.current = nextSaved;
        amStepsRef.current = nextAm;
        pmStepsRef.current = nextPm;
        consistencyDaysRef.current = nextConsistency;
        setSavedProductIds(nextSaved);
        setAmSteps(nextAm);
        setPmSteps(nextPm);
        setConsistencyDays(nextConsistency);
      } else {
        savedProductIdsRef.current = [];
        amStepsRef.current = DEFAULT_AM_STEPS;
        pmStepsRef.current = DEFAULT_PM_STEPS;
        consistencyDaysRef.current = [];
        setSavedProductIds([]);
        setAmSteps(DEFAULT_AM_STEPS);
        setPmSteps(DEFAULT_PM_STEPS);
        setConsistencyDays([]);
      }
      setJournalEntries(loadedJournal);
      setAnalysisHistory(loadedAnalyses);
    } catch (err) {
      hydratingUidRef.current = null;
      console.error('Error hydrating user beauty workspace:', err);
    } finally {
      setUserDataLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (user) {
        await hydrateUserFirestoreData(user);
      } else {
        resetUserStateToDefaults();
      }
    });

    return () => unsubscribe();
  }, [hydrateUserFirestoreData, resetUserStateToDefaults]);

  const registerScrollHandler = useCallback((fn: (id: SectionId) => void) => {
    scrollHandlerRef.current = fn;
    if (pendingSectionScrollRef.current) {
      const target = pendingSectionScrollRef.current;
      pendingSectionScrollRef.current = null;
      requestAnimationFrame(() => fn(target));
    }
  }, []);

  const scrollToSection = useCallback(
    (id: SectionId) => {
      if (activePage !== 'experience') {
        pendingSectionScrollRef.current = id;
        setActivePage('experience');
        setActiveSection(id);
        return;
      }
      if (scrollHandlerRef.current) {
        scrollHandlerRef.current(id);
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    },
    [activePage]
  );

  const navigateToPage = useCallback((page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openAuthModal = useCallback((view: AuthModalView, options?: AuthModalOptions) => {
    setAuthModalView(view);
    setAuthModalReason(options?.reason ?? null);
    pendingAuthOptionsRef.current = options ?? null;
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthModalReason(null);
    pendingAuthOptionsRef.current = null;
  }, []);

  const completePendingReturn = useCallback(() => {
    const opts = pendingAuthOptionsRef.current;
    pendingAuthOptionsRef.current = null;
    setAuthModalOpen(false);
    setAuthModalReason(null);

    if (opts?.onVerifiedAction) {
      opts.onVerifiedAction();
    }
    if (opts?.returnToPage && opts.returnToPage !== 'experience') {
      navigateToPage(opts.returnToPage);
    } else if (opts?.returnToSection) {
      scrollToSection(opts.returnToSection);
    }
  }, [navigateToPage, scrollToSection]);

  const requireVerifiedAuth = useCallback(
    (options: AuthModalOptions): boolean => {
      if (!authUser) {
        openAuthModal('signin', options);
        return false;
      }
      if (!authUser.emailVerified) {
        openAuthModal('verify-email', {
          ...options,
          reason:
            options.reason ||
            'Please verify your email address before saving personal skincare records.',
        });
        return false;
      }
      return true;
    },
    [authUser, openAuthModal]
  );

  // Authentication Actions
  const signInWithEmail = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      try {
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (!cred.user.emailVerified) {
          setAuthModalView('verify-email');
          setAuthModalReason(
            'Your account was created, but your email is not verified yet. Please check your inbox and verify before accessing saved data.'
          );
          return;
        }
        await hydrateUserFirestoreData(cred.user);
        completePendingReturn();
      } catch (err) {
        throw new Error(mapFirebaseAuthError(err));
      }
    },
    [completePendingReturn, hydrateUserFirestoreData]
  );

  const signUpWithEmail = useCallback(
    async (fullName: string, email: string, password: string) => {
      try {
        pendingSignupNameRef.current = fullName.trim();
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: fullName.trim() });
        await sendEmailVerification(cred.user);
        setAuthModalView('verify-email');
        setAuthModalReason(
          `We sent a verification link to ${email.trim()}. Verify your email to activate your personal GlowUp profile and private storage.`
        );
      } catch (err) {
        throw new Error(mapFirebaseAuthError(err));
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const cred = await signInWithPopup(auth, googleProvider);
      await hydrateUserFirestoreData(cred.user);
      completePendingReturn();
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  }, [completePendingReturn, hydrateUserFirestoreData]);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) throw new Error('No active user session found.');
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  }, []);

  const refreshVerificationStatus = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await reload(auth.currentUser);
    await auth.currentUser.getIdToken(true);
    const refreshed = auth.currentUser;
    setAuthUser(refreshed);
    if (refreshed.emailVerified) {
      await hydrateUserFirestoreData(refreshed);
      completePendingReturn();
      return true;
    }
    return false;
  }, [completePendingReturn, hydrateUserFirestoreData]);

  const signOutAccount = useCallback(async () => {
    await signOut(auth);
    resetUserStateToDefaults();
    setActivePage('experience');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetUserStateToDefaults]);

  // Account & Profile Management
  const updateAccountDetails = useCallback(
    async (updates: {
      fullName?: string;
      preferredName?: string;
      dateOfBirth?: string;
      photoDataUrl?: string;
    }) => {
      if (!authUser || !authUser.emailVerified) {
        throw new Error('Please verify your email and sign in to edit your profile.');
      }
      await updateUserAccountDoc(authUser.uid, updates);
      if (updates.fullName) {
        await updateProfile(authUser, { displayName: updates.fullName.trim() });
      }
      setUserAccount((prev) => (prev ? { ...prev, ...updates } : prev));
    },
    [authUser]
  );

  const updateBeautyPreferences = useCallback(
    async (beautyPrefs: BeautyPreferences) => {
      if (!authUser || !authUser.emailVerified) return;
      await updateUserAccountDoc(authUser.uid, { beautyPrefs });
      setUserAccount((prev) => (prev ? { ...prev, beautyPrefs } : prev));
    },
    [authUser]
  );

  const updateNotificationPreferences = useCallback(
    async (notificationPrefs: NotificationPreferences) => {
      if (!authUser || !authUser.emailVerified) return;
      await updateUserAccountDoc(authUser.uid, { notificationPrefs });
      setUserAccount((prev) => (prev ? { ...prev, notificationPrefs } : prev));
    },
    [authUser]
  );

  const updatePrivacyPreferences = useCallback(
    async (privacyPrefs: PrivacyPreferences) => {
      if (!authUser || !authUser.emailVerified) return;
      await updateUserAccountDoc(authUser.uid, { privacyPrefs });
      setUserAccount((prev) => (prev ? { ...prev, privacyPrefs } : prev));
    },
    [authUser]
  );

  const changeAccountPassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!authUser || !authUser.email) {
        throw new Error('No email-authenticated account is active.');
      }
      try {
        const cred = EmailAuthProvider.credential(authUser.email, currentPassword);
        await reauthenticateWithCredential(authUser, cred);
        await updatePassword(authUser, newPassword);
      } catch (err) {
        throw new Error(mapFirebaseAuthError(err));
      }
    },
    [authUser]
  );

  const exportPersonalData = useCallback(() => {
    const archive = {
      exportedAt: new Date().toISOString(),
      account: userAccount,
      skinProfile,
      savedProductIds,
      amRoutine: amSteps,
      pmRoutine: pmSteps,
      consistencyHistory: consistencyDays,
      skinJournal: journalEntries,
      demonstrationAnalyses: analysisHistory,
    };
    const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `glowup-personal-data-${getTodayKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [
    amSteps,
    analysisHistory,
    consistencyDays,
    journalEntries,
    pmSteps,
    savedProductIds,
    skinProfile,
    userAccount,
  ]);

  const deleteAccountPermanently = useCallback(
    async (currentPassword?: string) => {
      if (!authUser) throw new Error('No signed-in user.');
      const usesPassword = authUser.providerData.some((p) => p.providerId === 'password');
      try {
        if (usesPassword && currentPassword && authUser.email) {
          const cred = EmailAuthProvider.credential(authUser.email, currentPassword);
          await reauthenticateWithCredential(authUser, cred);
        } else if (!usesPassword) {
          await signInWithPopup(auth, googleProvider);
        }
        await deleteAllUserFirestoreData(authUser.uid);
        await deleteUser(authUser);
        resetUserStateToDefaults();
        setActivePage('experience');
      } catch (err) {
        throw new Error(mapFirebaseAuthError(err));
      }
    },
    [authUser, resetUserStateToDefaults]
  );

  // Helper to sync routines & saved products cleanly to Firestore
  const persistRoutinesToCloud = useCallback(
    async (
      nextSavedIds: string[],
      nextAm: RoutineStep[],
      nextPm: RoutineStep[],
      nextConsistency: ConsistencyDay[]
    ) => {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.emailVerified) return;
      await ensureUserAccountDoc(currentUser);
      await saveUserRoutinesDoc(currentUser.uid, {
        savedProductIds: nextSavedIds,
        amSteps: nextAm,
        pmSteps: nextPm,
        consistencyDays: nextConsistency,
      });
    },
    []
  );

  const updateSkinProfile = useCallback(
    (next: SkinProfile) => {
      const completed = { ...next, completedAt: new Date().toISOString() };
      const executeSave = async () => {
        setSkinProfile(completed);
        if (auth.currentUser && auth.currentUser.emailVerified) {
          await ensureUserAccountDoc(auth.currentUser);
          await saveSkinProfileDoc(auth.currentUser.uid, completed);
        }
      };

      if (
        !requireVerifiedAuth({
          reason: 'Sign in or create an account to save your personal Skin Profile.',
          returnToSection: 'profile',
          onVerifiedAction: () => {
            void executeSave();
          },
        })
      ) {
        return;
      }
      void executeSave();
    },
    [requireVerifiedAuth]
  );

  const toggleSaveProduct = useCallback(
    (id: string) => {
      const applyToggle = () => {
        const currentSaved = savedProductIdsRef.current;
        const nextSaved = currentSaved.includes(id)
          ? currentSaved.filter((item) => item !== id)
          : [...currentSaved, id];
        savedProductIdsRef.current = nextSaved;
        setSavedProductIds(nextSaved);
        void persistRoutinesToCloud(
          nextSaved,
          amStepsRef.current,
          pmStepsRef.current,
          consistencyDaysRef.current
        );
      };

      if (
        !requireVerifiedAuth({
          reason: 'Sign in to save skincare products to your personal collection.',
          returnToSection: 'products',
          onVerifiedAction: applyToggle,
        })
      ) {
        return;
      }

      applyToggle();
    },
    [persistRoutinesToCloud, requireVerifiedAuth]
  );

  const savedProducts = useMemo(
    () => SAMPLE_PRODUCTS.filter((p) => savedProductIds.includes(p.id)),
    [savedProductIds]
  );

  const buildUpdatedConsistency = useCallback(
    (nextAm: RoutineStep[], nextPm: RoutineStep[]): ConsistencyDay[] => {
      const today = getTodayKey();
      const amDone = nextAm.length > 0 && nextAm.every((s) => s.completedToday);
      const pmDone = nextPm.length > 0 && nextPm.every((s) => s.completedToday);
      const currentConsistency = consistencyDaysRef.current;
      const existing = currentConsistency.find((d) => d.date === today);
      if (existing) {
        return currentConsistency.map((d) => (d.date === today ? { ...d, amDone, pmDone } : d));
      }
      return [...currentConsistency.slice(-89), { date: today, amDone, pmDone }];
    },
    []
  );

  const toggleStepCompleted = useCallback(
    (period: 'AM' | 'PM', stepId: string) => {
      const applyToggle = () => {
        const currAm = amStepsRef.current;
        const currPm = pmStepsRef.current;
        if (period === 'AM') {
          const nextAm = currAm.map((s) =>
            s.id === stepId ? { ...s, completedToday: !s.completedToday } : s
          );
          const nextConsistency = buildUpdatedConsistency(nextAm, currPm);
          amStepsRef.current = nextAm;
          consistencyDaysRef.current = nextConsistency;
          setAmSteps(nextAm);
          setConsistencyDays(nextConsistency);
          void persistRoutinesToCloud(savedProductIdsRef.current, nextAm, currPm, nextConsistency);
        } else {
          const nextPm = currPm.map((s) =>
            s.id === stepId ? { ...s, completedToday: !s.completedToday } : s
          );
          const nextConsistency = buildUpdatedConsistency(currAm, nextPm);
          pmStepsRef.current = nextPm;
          consistencyDaysRef.current = nextConsistency;
          setPmSteps(nextPm);
          setConsistencyDays(nextConsistency);
          void persistRoutinesToCloud(savedProductIdsRef.current, currAm, nextPm, nextConsistency);
        }
      };

      if (
        !requireVerifiedAuth({
          reason: 'Sign in to track and persist your daily AM/PM skincare routine.',
          returnToSection: 'routine',
          onVerifiedAction: applyToggle,
        })
      ) {
        return;
      }

      applyToggle();
    },
    [buildUpdatedConsistency, persistRoutinesToCloud, requireVerifiedAuth]
  );

  const assignProductToStep = useCallback(
    (period: 'AM' | 'PM', stepType: RoutineStep['stepType'], productId: string) => {
      const applyAssign = () => {
        const updater = (prev: RoutineStep[]) => {
          const idx = prev.findIndex((s) => s.stepType === stepType);
          if (idx >= 0) {
            return prev.map((s, i) => (i === idx ? { ...s, assignedProductId: productId } : s));
          }
          return [
            ...prev,
            {
              id: `${period.toLowerCase()}-${Date.now()}`,
              period,
              stepType,
              title: `${stepType} Step`,
              instruction: 'Apply gently as part of your personalized sequence.',
              assignedProductId: productId,
              completedToday: false,
            },
          ];
        };

        const currAm = amStepsRef.current;
        const currPm = pmStepsRef.current;
        if (period === 'AM') {
          const nextAm = updater(currAm);
          amStepsRef.current = nextAm;
          setAmSteps(nextAm);
          void persistRoutinesToCloud(
            savedProductIdsRef.current,
            nextAm,
            currPm,
            consistencyDaysRef.current
          );
        } else {
          const nextPm = updater(currPm);
          pmStepsRef.current = nextPm;
          setPmSteps(nextPm);
          void persistRoutinesToCloud(
            savedProductIdsRef.current,
            currAm,
            nextPm,
            consistencyDaysRef.current
          );
        }
      };

      if (
        !requireVerifiedAuth({
          reason: 'Sign in to save custom products to your AM & PM routine.',
          returnToSection: 'products',
          onVerifiedAction: applyAssign,
        })
      ) {
        return;
      }
      applyAssign();
    },
    [persistRoutinesToCloud, requireVerifiedAuth]
  );

  const saveRoutinesNow = useCallback(() => {
    const draftAm = amStepsRef.current;
    const draftPm = pmStepsRef.current;
    const doSave = async () => {
      amStepsRef.current = draftAm;
      pmStepsRef.current = draftPm;
      setAmSteps(draftAm);
      setPmSteps(draftPm);
      await persistRoutinesToCloud(
        savedProductIdsRef.current,
        draftAm,
        draftPm,
        consistencyDaysRef.current
      );
      setLastRoutineSavedAt(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };

    if (
      !requireVerifiedAuth({
        reason: 'Sign in to save your personalized AM & PM skincare routine to your account.',
        returnToSection: 'routine',
        onVerifiedAction: () => {
          void doSave();
        },
      })
    ) {
      return;
    }

    void doSave();
  }, [persistRoutinesToCloud, requireVerifiedAuth]);

  const addAnalysisResult = useCallback(
    (res: AnalysisResult) => {
      const doSave = async () => {
        if (!auth.currentUser || !auth.currentUser.emailVerified) return;
        await ensureUserAccountDoc(auth.currentUser);
        const saved = await createAnalysisHistoryDoc(auth.currentUser.uid, res);
        setAnalysisHistory((prev) => [saved, ...prev].slice(0, 20));
      };

      if (
        !requireVerifiedAuth({
          reason: 'Sign in to save this demonstration skin analysis to your personal history.',
          returnToSection: 'analysis',
          onVerifiedAction: () => {
            void doSave();
          },
        })
      ) {
        return;
      }

      void doSave();
    },
    [requireVerifiedAuth]
  );

  const addJournalEntry = useCallback(
    (entry: Omit<JournalEntry, 'id'>) => {
      const doSave = async () => {
        if (!auth.currentUser || !auth.currentUser.emailVerified) return;
        await ensureUserAccountDoc(auth.currentUser);
        const created = await createJournalEntryDoc(auth.currentUser.uid, entry);
        setJournalEntries((prev) => [created, ...prev]);
      };

      if (
        !requireVerifiedAuth({
          reason: 'Sign in to save private skin journal reflections.',
          returnToSection: 'dashboard',
          onVerifiedAction: () => {
            void doSave();
          },
        })
      ) {
        return;
      }

      void doSave();
    },
    [requireVerifiedAuth]
  );

  const deleteJournalEntry = useCallback(
    (id: string) => {
      if (!authUser || !authUser.emailVerified) return;
      setJournalEntries((prev) => prev.filter((item) => item.id !== id));
      void deleteJournalEntryDoc(authUser.uid, id);
    },
    [authUser]
  );

  const isAuthenticated = Boolean(authUser);
  const isEmailVerified = Boolean(authUser?.emailVerified);

  const value = useMemo<GlowUpContextValue>(
    () => ({
      activePage,
      setActivePage,
      navigateToPage,
      activeSection,
      setActiveSection,
      scrollToSection,
      registerScrollHandler,
      authReady,
      authUser,
      isAuthenticated,
      isEmailVerified,
      userDataLoading,
      userAccount,
      authModalOpen,
      authModalView,
      authModalReason,
      openAuthModal,
      closeAuthModal,
      setAuthModalView,
      requireVerifiedAuth,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      requestPasswordReset,
      resendVerificationEmail,
      refreshVerificationStatus,
      signOutAccount,
      updateAccountDetails,
      updateBeautyPreferences,
      updateNotificationPreferences,
      updatePrivacyPreferences,
      changeAccountPassword,
      exportPersonalData,
      deleteAccountPermanently,
      skinProfile,
      updateSkinProfile,
      savedProductIds,
      toggleSaveProduct,
      savedProducts,
      amSteps,
      pmSteps,
      setAmSteps,
      setPmSteps,
      assignProductToStep,
      toggleStepCompleted,
      saveRoutinesNow,
      lastRoutineSavedAt,
      analysisHistory,
      addAnalysisResult,
      journalEntries,
      addJournalEntry,
      deleteJournalEntry,
      consistencyDays,
    }),
    [
      activePage,
      navigateToPage,
      activeSection,
      scrollToSection,
      registerScrollHandler,
      authReady,
      authUser,
      isAuthenticated,
      isEmailVerified,
      userDataLoading,
      userAccount,
      authModalOpen,
      authModalView,
      authModalReason,
      openAuthModal,
      closeAuthModal,
      requireVerifiedAuth,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      requestPasswordReset,
      resendVerificationEmail,
      refreshVerificationStatus,
      signOutAccount,
      updateAccountDetails,
      updateBeautyPreferences,
      updateNotificationPreferences,
      updatePrivacyPreferences,
      changeAccountPassword,
      exportPersonalData,
      deleteAccountPermanently,
      skinProfile,
      updateSkinProfile,
      savedProductIds,
      toggleSaveProduct,
      savedProducts,
      amSteps,
      pmSteps,
      assignProductToStep,
      toggleStepCompleted,
      saveRoutinesNow,
      lastRoutineSavedAt,
      analysisHistory,
      addAnalysisResult,
      journalEntries,
      addJournalEntry,
      deleteJournalEntry,
      consistencyDays,
    ]
  );

  return <GlowUpContext.Provider value={value}>{children}</GlowUpContext.Provider>;
}

export function useGlowUp() {
  const ctx = useContext(GlowUpContext);
  if (!ctx) throw new Error('useGlowUp must be used within GlowUpProvider');
  return ctx;
}
