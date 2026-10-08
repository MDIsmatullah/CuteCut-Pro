import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

export interface CreatorPost {
  id: string;
  authorEmail: string;
  authorName: string;
  title: string;
  content: string;
  type: 'announcement' | 'audio' | 'video';
  mediaUrl?: string;
  mediaName?: string;
  youtubeUrl?: string;
  likes: number;
  tags?: string[];
  createdAt: string;
  isPinned?: boolean;
}

export const ADMIN_EMAIL = 'guldastaislamorquran@gmail.com';

// Initial sample creator posts so visitors immediately see rich content
export const INITIAL_CREATOR_POSTS: CreatorPost[] = [
  {
    id: 'post_surah_rahman_tilawat',
    authorEmail: ADMIN_EMAIL,
    authorName: 'Guldasta Islam & Quran Studio',
    title: 'Surah Ar-Rahman Beautiful Recitation (Acoustic 432Hz Master)',
    content: 'Assalam-o-Alaikum! We have uploaded a crystal-clear studio recitation of Surah Ar-Rahman. You can listen directly here or click "Load in Timeline" to automatically sync word-by-word Quran captions in 9:16 vertical video!',
    type: 'audio',
    mediaUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=meditation-spiritual-112191.mp3',
    mediaName: 'Surah_Ar_Rahman_Recitation_Studio.mp3',
    youtubeUrl: 'https://www.youtube.com/channel/UCVP3RNRdficqmriDszLjzcQ',
    likes: 342,
    tags: ['QuranRecitation', 'SurahRahman', 'AcousticAudio'],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isPinned: true
  },
  {
    id: 'post_cutecut_tutorial_reels',
    authorEmail: ADMIN_EMAIL,
    authorName: 'CuteCut Pro Official',
    title: 'How to Create 4K 60FPS Quran Reels in CuteCut Pro (CapCut Alternative Guide)',
    content: 'Check out our new tutorial on how to use CuteCut Pro word-by-word subtitle generator and aesthetic Arabic calligraphy without any watermark or subscription.',
    type: 'video',
    youtubeUrl: 'https://www.youtube.com/channel/UCgTnf68omNLAr4kHTYXa10g',
    likes: 518,
    tags: ['VideoTutorial', 'CuteCutPro', 'QuranReels'],
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    isPinned: false
  },
  {
    id: 'post_offline_desktop_update',
    authorEmail: ADMIN_EMAIL,
    authorName: 'CuteCut Pro Studio',
    title: 'CuteCut Pro Desktop & Android Offline Engine Update 2.5',
    content: 'SubhanAllah! The new offline desktop (.exe, .dmg, Linux) and Android engine now includes instant hardware AV rendering with zero latency timeline scrubbing.',
    type: 'announcement',
    likes: 289,
    tags: ['SoftwareUpdate', 'DesktopEngine', 'Android'],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isPinned: false
  }
];

const LOCAL_STORAGE_KEY = 'cutecut_creator_feed_posts';

export class CreatorFeedService {
  static getLocalPosts(): CreatorPost[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CREATOR_POSTS;
  }

  static saveLocalPosts(posts: CreatorPost[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
    } catch {}
  }

  static async fetchPosts(): Promise<CreatorPost[]> {
    try {
      const postsCol = collection(db, 'creator_posts');
      const q = query(postsCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const remotePosts: CreatorPost[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CreatorPost));

        this.saveLocalPosts(remotePosts);
        return remotePosts;
      }
    } catch (err) {
      console.warn('Firestore creator_posts fetch note (using cached/fallback):', err);
    }
    return this.getLocalPosts();
  }

  static async createPost(post: Omit<CreatorPost, 'id' | 'createdAt' | 'likes'>): Promise<CreatorPost> {
    const newPost: CreatorPost = {
      ...post,
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    // 1. Save locally
    const current = this.getLocalPosts();
    const updated = [newPost, ...current];
    this.saveLocalPosts(updated);

    // 2. Persist to Firestore
    try {
      const docRef = doc(db, 'creator_posts', newPost.id);
      await setDoc(docRef, {
        ...newPost,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore createPost sync error:', err);
    }

    return newPost;
  }

  static async deletePost(postId: string): Promise<void> {
    const current = this.getLocalPosts();
    const updated = current.filter(p => p.id !== postId);
    this.saveLocalPosts(updated);

    try {
      const docRef = doc(db, 'creator_posts', postId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deletePost sync error:', err);
    }
  }

  static async likePost(postId: string): Promise<number> {
    const current = this.getLocalPosts();
    let newLikes = 1;
    const updated = current.map(p => {
      if (p.id === postId) {
        newLikes = (p.likes || 0) + 1;
        return { ...p, likes: newLikes };
      }
      return p;
    });
    this.saveLocalPosts(updated);

    try {
      const docRef = doc(db, 'creator_posts', postId);
      await setDoc(docRef, { likes: newLikes }, { merge: true });
    } catch {}

    return newLikes;
  }
}
