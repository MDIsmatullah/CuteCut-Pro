import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
  getDocFromServer,
} from 'firebase/firestore';
import { VisualStylePreset } from '../types';
import firebaseConfigFile from '../../firebase-applet-config.json';

// Configuration loaded from firebase-applet-config.json
const firebaseConfig = {
  apiKey: firebaseConfigFile.apiKey || "AIzaSyB4lTCMFm5BATXF1Erceq66gFenLsVlsc8",
  authDomain: firebaseConfigFile.authDomain || "enhanced-polygon-56shk.firebaseapp.com",
  projectId: firebaseConfigFile.projectId || "enhanced-polygon-56shk",
  storageBucket: firebaseConfigFile.storageBucket || "enhanced-polygon-56shk.firebasestorage.app",
  messagingSenderId: firebaseConfigFile.messagingSenderId || "447393315446",
  appId: firebaseConfigFile.appId || "1:447393315446:web:77eefd3f0e3da6781c7d57",
  firestoreDatabaseId: firebaseConfigFile.firestoreDatabaseId || "ai-studio-webvideoeditor-2e0654e6-452f-4ecb-8718-6414384b1d0c",
};

// Initialize Firebase App safely (singleton)
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth Instance & Google Provider
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Firestore Instance (with exact databaseId)
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Standard Firestore Error Handling conforming to Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || false,
      isAnonymous: currentUser?.isAnonymous || false,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('[Firestore Error Details]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection Validation on Boot
export async function testFirestoreConnection(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return false;
  }
  try {
    const testDoc = await getDoc(doc(db, 'test', 'connection'));
    return testDoc.exists();
  } catch (error: any) {
    // Firestore operates in offline mode automatically; silent swallow
    return false;
  }
}

// Run connection check only when window is online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    testFirestoreConnection().catch(() => {});
  });
}

export interface FirestoreTimelinePayload {
  id?: string;
  userId?: string;
  tracks: any[];
  duration: number;
  selectedSurahId?: number;
  alignmentScope?: string;
  aspectRatio?: string;
  name?: string;
  watermark?: any;
  updatedAt?: any;
}

/**
 * Save user profile to Firestore
 * Path: users/{userId}
 */
export async function syncUserProfileToFirestore(user: {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
}): Promise<void> {
  if (!user.uid) return;
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        id: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        lastLoginAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save user active timeline project to Firestore
 * Path: users/{userId}/projects/active-timeline
 */
export async function saveUserTimelineProject(userId: string, projectData: FirestoreTimelinePayload): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}/projects/active-timeline`;
  try {
    const projectRef = doc(db, 'users', userId, 'projects', 'active-timeline');
    await setDoc(
      projectRef,
      {
        ...projectData,
        id: 'active-timeline',
        userId,
        name: projectData.name || 'Active Workspace Project',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch user active timeline project from Firestore
 * Path: users/{userId}/projects/active-timeline
 */
export async function getUserTimelineProject(userId: string): Promise<FirestoreTimelinePayload | null> {
  if (!userId) return null;
  const path = `users/${userId}/projects/active-timeline`;
  try {
    const projectRef = doc(db, 'users', userId, 'projects', 'active-timeline');
    const docSnap = await getDoc(projectRef);
    if (docSnap.exists()) {
      return docSnap.data() as FirestoreTimelinePayload;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save or update a named project in Firestore
 * Path: users/{userId}/projects/{projectId}
 */
export async function saveUserNamedProject(userId: string, projectId: string, projectData: FirestoreTimelinePayload): Promise<void> {
  if (!userId || !projectId) return;
  const path = `users/${userId}/projects/${projectId}`;
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await setDoc(
      projectRef,
      {
        ...projectData,
        id: projectId,
        userId,
        name: projectData.name || 'Untitled Video Project',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Get all saved user projects from Firestore
 * Path: users/{userId}/projects
 */
export async function getUserNamedProjects(userId: string): Promise<FirestoreTimelinePayload[]> {
  if (!userId) return [];
  const path = `users/${userId}/projects`;
  try {
    const colRef = collection(db, 'users', userId, 'projects');
    const snap = await getDocs(colRef);
    const projects: FirestoreTimelinePayload[] = [];
    snap.forEach((d) => {
      projects.push(d.data() as FirestoreTimelinePayload);
    });
    return projects;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Delete a user project from Firestore
 * Path: users/{userId}/projects/{projectId}
 */
export async function deleteUserNamedProject(userId: string, projectId: string): Promise<void> {
  if (!userId || !projectId) return;
  const path = `users/${userId}/projects/${projectId}`;
  try {
    const docRef = doc(db, 'users', userId, 'projects', projectId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save user visual style preset to Firestore profile
 * Path: users/{userId}/presets/{presetId}
 */
export async function saveUserStylePreset(userId: string, preset: VisualStylePreset): Promise<void> {
  if (!userId || !preset.id) return;
  const path = `users/${userId}/presets/${preset.id}`;
  try {
    const presetRef = doc(db, 'users', userId, 'presets', preset.id);
    await setDoc(
      presetRef,
      {
        ...preset,
        id: preset.id,
        userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch all visual style presets for user from Firestore
 * Path: users/{userId}/presets
 */
export async function getUserStylePresets(userId: string): Promise<VisualStylePreset[]> {
  if (!userId) return [];
  const path = `users/${userId}/presets`;
  try {
    const presetsCol = collection(db, 'users', userId, 'presets');
    const snap = await getDocs(presetsCol);
    const list: VisualStylePreset[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), isFirestoreSynced: true } as VisualStylePreset);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Delete a visual style preset from Firestore
 * Path: users/{userId}/presets/{presetId}
 */
export async function deleteUserStylePreset(userId: string, presetId: string): Promise<void> {
  if (!userId || !presetId) return;
  const path = `users/${userId}/presets/${presetId}`;
  try {
    const presetRef = doc(db, 'users', userId, 'presets', presetId);
    await deleteDoc(presetRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
