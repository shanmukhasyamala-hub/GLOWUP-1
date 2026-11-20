import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  AnalysisResult,
  ConsistencyDay,
  JournalEntry,
  RoutineStep,
  SkinObservation,
  SkinProfile,
  UserAccount,
} from '../types/glowup';

const DEFAULT_NOTIFICATION_PREFS = {
  routineReminders: true,
  ingredientUpdates: true,
  weeklyDigest: false,
};

const DEFAULT_PRIVACY_PREFS = {
  privateProfile: true,
  analyticsOptIn: false,
};

const DEFAULT_BEAUTY_PREFS = {
  preferredCategories: ['Serum', 'Moisturizer', 'Sunscreen'] as UserAccount['beautyPrefs']['preferredCategories'],
  preferredIngredients: ['Hyaluronic Acid', 'Niacinamide', 'Ceramides'],
  avoidIngredients: ['Added Fragrance'],
  amPmPreference: 'Balanced 3–5 step morning protection and restorative evening seal',
};

function sanitizeString(value: string | undefined, maxLen: number): string {
  return (value ?? '').trim().slice(0, maxLen);
}

function sanitizeArray<T>(arr: T[] | undefined, maxItems: number): T[] {
  return Array.isArray(arr) ? arr.slice(0, maxItems) : [];
}

export async function ensureUserAccountDoc(
  authUser: User,
  overrides?: { fullName?: string; termsAcceptedAt?: string }
): Promise<UserAccount> {
  const path = `users/${authUser.uid}`;
  const ref = doc(db, 'users', authUser.uid);

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const createdAtTs = data.createdAt as Timestamp | undefined;
      return {
        uid: authUser.uid,
        fullName: String(data.fullName ?? authUser.displayName ?? 'GlowUp Member'),
        preferredName: String(data.preferredName ?? ''),
        email: String(data.email ?? authUser.email ?? ''),
        dateOfBirth: String(data.dateOfBirth ?? ''),
        photoDataUrl: String(data.photoDataUrl ?? ''),
        termsAcceptedAt: String(data.termsAcceptedAt ?? ''),
        createdAtIso: createdAtTs?.toDate
          ? createdAtTs.toDate().toISOString()
          : authUser.metadata.creationTime ?? new Date().toISOString(),
        notificationPrefs: data.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS,
        privacyPrefs: data.privacyPrefs ?? DEFAULT_PRIVACY_PREFS,
        beautyPrefs: data.beautyPrefs ?? DEFAULT_BEAUTY_PREFS,
      };
    }

    const fullName = sanitizeString(
      overrides?.fullName || authUser.displayName || authUser.email?.split('@')[0] || 'GlowUp Member',
      120
    );
    const email = sanitizeString(authUser.email || '', 180);
    const termsAcceptedAt = sanitizeString(
      overrides?.termsAcceptedAt || new Date().toISOString(),
      40
    );

    await setDoc(ref, {
      uid: authUser.uid,
      fullName,
      preferredName: '',
      email,
      dateOfBirth: '',
      photoDataUrl: '',
      termsAcceptedAt,
      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      privacyPrefs: DEFAULT_PRIVACY_PREFS,
      beautyPrefs: DEFAULT_BEAUTY_PREFS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      uid: authUser.uid,
      fullName,
      preferredName: '',
      email,
      dateOfBirth: '',
      photoDataUrl: '',
      termsAcceptedAt,
      createdAtIso: authUser.metadata.creationTime ?? new Date().toISOString(),
      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      privacyPrefs: DEFAULT_PRIVACY_PREFS,
      beautyPrefs: DEFAULT_BEAUTY_PREFS,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserAccountDoc(
  uid: string,
  updates: Partial<
    Pick<
      UserAccount,
      | 'fullName'
      | 'preferredName'
      | 'email'
      | 'dateOfBirth'
      | 'photoDataUrl'
      | 'notificationPrefs'
      | 'privacyPrefs'
      | 'beautyPrefs'
    >
  >
): Promise<void> {
  const path = `users/${uid}`;
  const ref = doc(db, 'users', uid);

  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (updates.fullName !== undefined) payload.fullName = sanitizeString(updates.fullName, 120) || 'GlowUp Member';
  if (updates.preferredName !== undefined) payload.preferredName = sanitizeString(updates.preferredName, 80);
  if (updates.email !== undefined) payload.email = sanitizeString(updates.email, 180);
  if (updates.dateOfBirth !== undefined) payload.dateOfBirth = sanitizeString(updates.dateOfBirth, 20);
  if (updates.photoDataUrl !== undefined) payload.photoDataUrl = updates.photoDataUrl.slice(0, 180000);
  if (updates.notificationPrefs !== undefined) {
    payload.notificationPrefs = {
      routineReminders: Boolean(updates.notificationPrefs.routineReminders),
      ingredientUpdates: Boolean(updates.notificationPrefs.ingredientUpdates),
      weeklyDigest: Boolean(updates.notificationPrefs.weeklyDigest),
    };
  }
  if (updates.privacyPrefs !== undefined) {
    payload.privacyPrefs = {
      privateProfile: Boolean(updates.privacyPrefs.privateProfile),
      analyticsOptIn: Boolean(updates.privacyPrefs.analyticsOptIn),
    };
  }
  if (updates.beautyPrefs !== undefined) {
    payload.beautyPrefs = {
      preferredCategories: sanitizeArray(updates.beautyPrefs.preferredCategories, 12),
      preferredIngredients: sanitizeArray(updates.beautyPrefs.preferredIngredients, 20).map((s) =>
        sanitizeString(s, 60)
      ),
      avoidIngredients: sanitizeArray(updates.beautyPrefs.avoidIngredients, 20).map((s) =>
        sanitizeString(s, 60)
      ),
      amPmPreference: sanitizeString(updates.beautyPrefs.amPmPreference, 200),
    };
  }

  try {
    await updateDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function loadSkinProfileDoc(uid: string): Promise<SkinProfile | null> {
  const path = `users/${uid}/beauty/skinProfile`;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'beauty', 'skinProfile'));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      skinType: d.skinType,
      concerns: sanitizeArray(d.concerns, 10),
      sensitivities: sanitizeArray(d.sensitivities, 12),
      customAllergyNote: String(d.customAllergyNote ?? ''),
      goals: sanitizeArray(d.goals, 10),
      budget: d.budget,
      preferences: sanitizeArray(d.preferences, 10),
      completedAt: d.completedAt ? String(d.completedAt) : undefined,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveSkinProfileDoc(uid: string, profile: SkinProfile): Promise<void> {
  const path = `users/${uid}/beauty/skinProfile`;
  try {
    await setDoc(doc(db, 'users', uid, 'beauty', 'skinProfile'), {
      ownerId: uid,
      skinType: profile.skinType,
      concerns: sanitizeArray(profile.concerns, 10),
      sensitivities: sanitizeArray(profile.sensitivities, 12),
      customAllergyNote: sanitizeString(profile.customAllergyNote, 300),
      goals: sanitizeArray(profile.goals, 10),
      budget: profile.budget,
      preferences: sanitizeArray(profile.preferences, 10),
      completedAt: sanitizeString(profile.completedAt || new Date().toISOString(), 40),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface UserRoutinesPayload {
  savedProductIds: string[];
  amSteps: RoutineStep[];
  pmSteps: RoutineStep[];
  consistencyDays: ConsistencyDay[];
}

export async function loadUserRoutinesDoc(uid: string): Promise<UserRoutinesPayload | null> {
  const path = `users/${uid}/beauty/routines`;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'beauty', 'routines'));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      savedProductIds: sanitizeArray(d.savedProductIds, 50),
      amSteps: sanitizeArray(d.amSteps, 20),
      pmSteps: sanitizeArray(d.pmSteps, 20),
      consistencyDays: sanitizeArray(d.consistencyDays, 90),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserRoutinesDoc(
  uid: string,
  payload: UserRoutinesPayload
): Promise<void> {
  const path = `users/${uid}/beauty/routines`;
  try {
    await setDoc(doc(db, 'users', uid, 'beauty', 'routines'), {
      ownerId: uid,
      savedProductIds: sanitizeArray(payload.savedProductIds, 50),
      amSteps: sanitizeArray(payload.amSteps, 20),
      pmSteps: sanitizeArray(payload.pmSteps, 20),
      consistencyDays: sanitizeArray(payload.consistencyDays, 90),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadJournalEntries(uid: string): Promise<JournalEntry[]> {
  const path = `users/${uid}/journal`;
  try {
    const q = query(
      collection(db, 'users', uid, 'journal'),
      where('ownerId', '==', uid)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((docSnap) => {
        const d = docSnap.data();
        const ts = d.createdAt as Timestamp | undefined;
        return {
          id: docSnap.id,
          date: String(d.date ?? ''),
          hydrationRating: Number(d.hydrationRating ?? 4),
          comfortRating: Number(d.comfortRating ?? 4),
          note: String(d.note ?? ''),
          tags: sanitizeArray<string>(d.tags, 8),
          _sortMs: ts?.toMillis ? ts.toMillis() : 0,
        };
      })
      .sort((a, b) => b._sortMs - a._sortMs)
      .map(({ _sortMs: _, ...entry }) => entry);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createJournalEntryDoc(
  uid: string,
  entry: Omit<JournalEntry, 'id'>
): Promise<JournalEntry> {
  const id = `j_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `users/${uid}/journal/${id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'journal', id), {
      ownerId: uid,
      date: sanitizeString(entry.date, 20),
      hydrationRating: Math.min(5, Math.max(1, Number(entry.hydrationRating) || 4)),
      comfortRating: Math.min(5, Math.max(1, Number(entry.comfortRating) || 4)),
      note: sanitizeString(entry.note, 1500),
      tags: sanitizeArray(entry.tags, 8).map((t) => sanitizeString(t, 40)),
      createdAt: serverTimestamp(),
    });
    return { ...entry, id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteJournalEntryDoc(uid: string, entryId: string): Promise<void> {
  const path = `users/${uid}/journal/${entryId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'journal', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function loadAnalysisHistory(uid: string): Promise<AnalysisResult[]> {
  const path = `users/${uid}/analyses`;
  try {
    const q = query(
      collection(db, 'users', uid, 'analyses'),
      where('ownerId', '==', uid)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((docSnap) => {
        const d = docSnap.data();
        const ts = d.savedAt as Timestamp | undefined;
        return {
          id: docSnap.id,
          createdAt: String(d.createdAt ?? ''),
          sourceLabel: String(d.sourceLabel ?? ''),
          isDemonstration: true as const,
          summary: String(d.summary ?? ''),
          observations: sanitizeArray<SkinObservation>(d.observations, 6),
          possibleConcerns: sanitizeArray<string>(d.possibleConcerns, 10),
          confidenceNote: String(d.confidenceNote ?? ''),
          educationalGuidance: sanitizeArray<string>(d.educationalGuidance, 8),
          recommendedIngredients: sanitizeArray<string>(d.recommendedIngredients, 12),
          _sortMs: ts?.toMillis ? ts.toMillis() : 0,
        };
      })
      .sort((a, b) => b._sortMs - a._sortMs)
      .map(({ _sortMs: _, ...item }) => item);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createAnalysisHistoryDoc(
  uid: string,
  res: AnalysisResult
): Promise<AnalysisResult> {
  const id = `an_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `users/${uid}/analyses/${id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'analyses', id), {
      ownerId: uid,
      createdAt: sanitizeString(res.createdAt, 40),
      sourceLabel: sanitizeString(res.sourceLabel, 140),
      isDemonstration: true,
      summary: sanitizeString(res.summary, 1200),
      observations: sanitizeArray(res.observations, 6),
      possibleConcerns: sanitizeArray(res.possibleConcerns, 10),
      confidenceNote: sanitizeString(res.confidenceNote, 600),
      educationalGuidance: sanitizeArray(res.educationalGuidance, 8),
      recommendedIngredients: sanitizeArray(res.recommendedIngredients, 12),
      savedAt: serverTimestamp(),
    });
    return { ...res, id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteAllUserFirestoreData(uid: string): Promise<void> {
  try {
    const journalQ = query(collection(db, 'users', uid, 'journal'), where('ownerId', '==', uid));
    const journalSnap = await getDocs(journalQ);
    await Promise.all(journalSnap.docs.map((d) => deleteDoc(d.ref)));

    const analysesQ = query(collection(db, 'users', uid, 'analyses'), where('ownerId', '==', uid));
    const analysesSnap = await getDocs(analysesQ);
    await Promise.all(analysesSnap.docs.map((d) => deleteDoc(d.ref)));

    await deleteDoc(doc(db, 'users', uid, 'beauty', 'skinProfile')).catch(() => {});
    await deleteDoc(doc(db, 'users', uid, 'beauty', 'routines')).catch(() => {});
    await deleteDoc(doc(db, 'users', uid)).catch(() => {});
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
  }
}
