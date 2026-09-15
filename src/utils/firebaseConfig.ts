import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { VisualStylePreset } from '../types';
// Static production-grade config to bypass potential JSON parse issues during local bundle/Vite builds
const firebaseConfig = {
  apiKey: "AIzaSyB4lTCMFm5BATXF1Erceq66gFenLsVlsc8",
  authDomain: "enhanced-polygon-56shk.firebaseapp.com",
  projectId: "enhanced-polygon-56shk",
  storageBucket: "enhanced-polygon-56shk.firebasestorage.app",
  messagingSenderId: "447393315446",
  appId: "1:447393315446:web:77eefd3f0e3da6781c7d57"
};

// Initialize Firebase App safely (singleton)
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth Instance & Google Provider
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Firestore Instance (supporting databaseId if specified in config)
const databaseId = "ai-studio-webvideoeditor-2e0654e6-452f-4ecb-8718-6414384b1d0c";

export const db: Firestore = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

export interface FirestoreTimelinePayload {
  tracks: any[];
  duration: number;
  selectedSurahId?: number;
  alignmentScope?: string;
  aspectRatio?: string;
  name?: string;
  updatedAt?: any;
}

/**
 * Save user active timeline project to Firestore
 * Path: users/{userId}/projects/active-timeline
 */
export async function saveUserTimelineProject(userId: string, projectData: FirestoreTimelinePayload): Promise<void> {
  if (!userId) return;
  try {
    const projectRef = doc(db, 'users', userId, 'projects', 'active-timeline');
    await setDoc(projectRef, {
      ...projectData,
      userId,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.warn('[Firebase Firestore] Error saving active timeline project:', error);
  }
}

/**
 * Fetch user active timeline project from Firestore
 * Path: users/{userId}/projects/active-timeline
 */
export async function getUserTimelineProject(userId: string): Promise<FirestoreTimelinePayload | null> {
  if (!userId) return null;
  try {
    const projectRef = doc(db, 'users', userId, 'projects', 'active-timeline');
    const docSnap = await getDoc(projectRef);
    if (docSnap.exists()) {
      return docSnap.data() as FirestoreTimelinePayload;
    }
    return null;
  } catch (error) {
    console.warn('[Firebase Firestore] Error fetching active timeline project:', error);
    return null;
  }
}

/**
 * Save user visual style preset to Firestore profile
 * Path: users/{userId}/presets/{presetId}
 */
export async function saveUserStylePreset(userId: string, preset: VisualStylePreset): Promise<void> {
  if (!userId || !preset.id) return;
  try {
    const presetRef = doc(db, 'users', userId, 'presets', preset.id);
    await setDoc(presetRef, {
      ...preset,
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('[Firebase Firestore] Error saving user style preset:', error);
  }
}

/**
 * Fetch all visual style presets for user from Firestore
 * Path: users/{userId}/presets
 */
export async function getUserStylePresets(userId: string): Promise<VisualStylePreset[]> {
  if (!userId) return [];
  try {
    const presetsCol = collection(db, 'users', userId, 'presets');
    const snap = await getDocs(presetsCol);
    const list: VisualStylePreset[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), isFirestoreSynced: true } as VisualStylePreset);
    });
    return list;
  } catch (error) {
    console.warn('[Firebase Firestore] Error fetching user style presets:', error);
    return [];
  }
}

/**
 * Delete a visual style preset from Firestore
 * Path: users/{userId}/presets/{presetId}
 */
export async function deleteUserStylePreset(userId: string, presetId: string): Promise<void> {
  if (!userId || !presetId) return;
  try {
    const presetRef = doc(db, 'users', userId, 'presets', presetId);
    await deleteDoc(presetRef);
  } catch (error) {
    console.warn('[Firebase Firestore] Error deleting user style preset:', error);
  }
}

