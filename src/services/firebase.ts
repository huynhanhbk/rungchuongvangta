import { initializeApp, getApps, getApp, deleteApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { Question } from '../types';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

const STORAGE_KEY_FIREBASE = 'rcv_custom_firebase_config_v1';

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

/**
 * Lấy cấu hình Firebase (ưu tiên cấu hình người dùng nhập trong Admin, fallback sang biến môi trường VITE_*)
 */
export const getActiveFirebaseConfig = (): FirebaseCustomConfig | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored Firebase config:', e);
  }

  // Fallback sang biến môi trường
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId && envApiKey !== 'MY_FIREBASE_API_KEY') {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
};

/**
 * Lưu cấu hình Firebase tùy chỉnh vào localStorage
 */
export const saveCustomFirebaseConfig = (config: FirebaseCustomConfig): void => {
  localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
  // Reset app instance để khởi tạo lại với cấu hình mới
  resetFirebaseInstances();
};

/**
 * Xóa cấu hình Firebase tùy chỉnh
 */
export const removeCustomFirebaseConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY_FIREBASE);
  resetFirebaseInstances();
};

/**
 * Reset instances khi cấu hình thay đổi
 */
export const resetFirebaseInstances = (): void => {
  try {
    if (appInstance) {
      deleteApp(appInstance).catch(() => {});
    }
  } catch (e) {
    // ignore
  }
  appInstance = null;
  dbInstance = null;
};

export const isFirebaseConfigured = (): boolean => {
  const config = getActiveFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId);
};

export const getFirestoreDb = (): Firestore | null => {
  const config = getActiveFirebaseConfig();
  if (!config) return null;

  if (!dbInstance) {
    try {
      // Nếu đã có app cùng tên thì xóa hoặc get
      const existingApps = getApps();
      if (existingApps.length > 0) {
        appInstance = existingApps[0];
      } else {
        appInstance = initializeApp(config);
      }
      dbInstance = getFirestore(appInstance);
    } catch (err) {
      console.warn('Failed to initialize Firebase Firestore:', err);
      return null;
    }
  }
  return dbInstance;
};

const COLLECTION_NAME = 'rungchuongvang_questions';

/**
 * Kiểm tra kết nối tới Firestore
 */
export const testFirebaseConnection = async (): Promise<{ success: boolean; message: string; count?: number }> => {
  try {
    const firestore = getFirestoreDb();
    if (!firestore) {
      return { success: false, message: 'Chưa có cấu hình Firebase hoặc cấu hình không hợp lệ.' };
    }

    const qCol = collection(firestore, COLLECTION_NAME);
    const snapshot = await getDocs(qCol);
    return {
      success: true,
      message: `Kết nối thành công! Đang có ${snapshot.size} câu hỏi trên Cloud.`,
      count: snapshot.size,
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes('permission-denied')) {
      return {
        success: false,
        message: 'Lỗi quyền truy cập (permission-denied). Hãy kiểm tra Rules trên Firestore đã cho phép "allow read, write: if true;" chưa.',
      };
    }
    return { success: false, message: `Lỗi kết nối Firebase: ${errMsg}` };
  }
};

/**
 * Tải toàn bộ câu hỏi từ Firestore
 */
export const fetchQuestionsFromCloud = async (): Promise<Question[] | null> => {
  const firestore = getFirestoreDb();
  if (!firestore) return null;

  try {
    const qCol = collection(firestore, COLLECTION_NAME);
    const snapshot = await getDocs(qCol);
    if (snapshot.empty) {
      return null;
    }
    const questions: Question[] = [];
    snapshot.forEach((docSnap) => {
      questions.push(docSnap.data() as Question);
    });
    return questions.sort((a, b) => a.order - b.order);
  } catch (err) {
    console.error('Error fetching questions from Firestore:', err);
    throw err;
  }
};

/**
 * Đẩy toàn bộ danh sách câu hỏi lên Firestore (ghi đè bộ câu hỏi)
 */
export const saveQuestionsToCloud = async (questions: Question[]): Promise<boolean> => {
  const firestore = getFirestoreDb();
  if (!firestore) {
    throw new Error('Chưa thiết lập kết nối Firebase.');
  }

  try {
    // Firestore batch tối đa 500 operations (ở đây chúng ta có ~45 câu hỏi, batch 1 lần là đủ)
    const batch = writeBatch(firestore);
    questions.forEach((q) => {
      const docRef = doc(firestore, COLLECTION_NAME, q.id);
      batch.set(docRef, q);
    });
    await batch.commit();
    return true;
  } catch (err) {
    console.error('Error saving questions to Firestore:', err);
    throw err;
  }
};
