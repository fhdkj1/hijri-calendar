import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import type { UserNote } from '../utils/hijriCalendar';

// Firebase configuration for Hijri Calendar Sync
// authDomain must match the Authorized Redirect URI registered in Google Cloud Console OAuth Client
const firebaseConfig = {
  projectId: "workout-sync-2026",
  appId: "1:127182901874:web:04eb4a47fbc6f112d0a8eb",
  storageBucket: "workout-sync-2026.firebasestorage.app",
  apiKey: "AIzaSyC0Kq-4Fmnppbo5R13TJAEFf0kQ-I8wyGk",
  authDomain: "workout-sync-2026.firebaseapp.com",
  messagingSenderId: "127182901874",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Sign in with Google.
 * Uses popup by default, with automatic redirect fallback for mobile browsers that block popups.
 */
export async function signInWithGoogle(): Promise<User | null> {
  const isMobileOrStandalone =
    typeof window !== 'undefined' &&
    (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true);

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Popup sign in failed, trying redirect:', error);
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/cancelled-popup-request' ||
      isMobileOrStandalone
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

/**
 * Check if returning from redirect sign in
 */
export async function checkRedirectAuth(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (err) {
    console.error('Error handling redirect auth:', err);
    return null;
  }
}

/**
 * Sign out
 */
export async function logOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Listen to auth state changes
 */
export function onAuthChanged(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/**
 * Real-time listener for user's Hijri notes in Cloud Firestore.
 * Automatically syncs any changes across devices.
 */
export function subscribeToUserNotes(
  userId: string,
  onNotesUpdated: (notes: UserNote[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const notesRef = collection(db, 'hijri_users', userId, 'notes');

  return onSnapshot(
    notesRef,
    (snapshot) => {
      const notes: UserNote[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        notes.push({
          id: docSnap.id,
          hijriYear: data.hijriYear,
          hijriMonth: data.hijriMonth,
          hijriDay: data.hijriDay,
          title: data.title,
          details: data.details || '',
          icon: data.icon || 'pin',
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      // Sort newest first
      notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onNotesUpdated(notes);
    },
    (err) => {
      console.error('Firestore snapshot listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save or update a note in Cloud Firestore
 */
export async function saveNoteToCloud(userId: string, note: UserNote): Promise<void> {
  const noteRef = doc(db, 'hijri_users', userId, 'notes', note.id);
  await setDoc(noteRef, {
    hijriYear: note.hijriYear,
    hijriMonth: note.hijriMonth,
    hijriDay: note.hijriDay,
    title: note.title,
    details: note.details || '',
    icon: note.icon || 'pin',
    createdAt: note.createdAt,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Delete a note from Cloud Firestore
 */
export async function deleteNoteFromCloud(userId: string, noteId: string): Promise<void> {
  const noteRef = doc(db, 'hijri_users', userId, 'notes', noteId);
  await deleteDoc(noteRef);
}

/**
 * Migrate/merge local notes into Cloud Firestore when the user logs in
 */
export async function syncLocalNotesToCloud(userId: string, localNotes: UserNote[]): Promise<void> {
  if (!localNotes.length) return;

  const notesRef = collection(db, 'hijri_users', userId, 'notes');
  const existingDocs = await getDocs(notesRef);
  const existingIds = new Set(existingDocs.docs.map((d) => d.id));

  for (const note of localNotes) {
    if (!existingIds.has(note.id)) {
      await saveNoteToCloud(userId, note);
    }
  }
}
