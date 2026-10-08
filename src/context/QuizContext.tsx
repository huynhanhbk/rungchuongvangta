import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Question, QuestionPool, QuizProgress, AppSettings, SyncStatus } from '../types';
import {
  getCachedQuestions,
  setCachedQuestions,
  getQuizProgress,
  saveQuizProgress,
  getSettings,
  saveSettings,
  syncQuestions,
  setQuestionsLocked,
} from '../services/storage';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';
import { saveQuestionsToCloud, fetchQuestionsFromCloud } from '../services/firebase';

interface QuizContextType {
  questions: Question[];
  mainQuestions: Question[];
  tiebreakerQuestions: Question[];
  audienceQuestions: Question[];
  progress: QuizProgress;
  settings: AppSettings;
  syncStatus: SyncStatus;
  isSyncing: boolean;
  updateProgress: (patch: Partial<QuizProgress>) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  updateQuestions: (newQuestions: Question[]) => void;
  resetToSampleQuestions: () => void;
  toggleLockQuestions: () => void;
  triggerSync: () => Promise<void>;
  uploadQuestionsToCloud: () => Promise<{ success: boolean; count: number; message: string }>;
  downloadQuestionsFromCloud: () => Promise<{ success: boolean; count: number; message: string }>;
}

const QuizContext = createContext<QuizContextType | null>(null);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>(() => getCachedQuestions());
  const [progress, setProgressState] = useState<QuizProgress>(() => getQuizProgress());
  const [settings, setSettingsState] = useState<AppSettings>(() => getSettings());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConfigured: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncedAt: null,
    syncSource: 'local_cache',
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Phân chia theo 3 nhóm câu hỏi
  const mainQuestions = useMemo(() => {
    return questions.filter((q) => q.pool === 'main').sort((a, b) => a.order - b.order);
  }, [questions]);

  const tiebreakerQuestions = useMemo(() => {
    return questions.filter((q) => q.pool === 'tiebreaker').sort((a, b) => a.order - b.order);
  }, [questions]);

  const audienceQuestions = useMemo(() => {
    return questions.filter((q) => q.pool === 'audience').sort((a, b) => a.order - b.order);
  }, [questions]);

  const updateProgress = useCallback((patch: Partial<QuizProgress>) => {
    setProgressState((prev) => {
      const updated = { ...prev, ...patch };
      saveQuizProgress(updated);
      return updated;
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...patch };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const updateQuestions = useCallback((newQuestions: Question[]) => {
    setQuestions(newQuestions);
    setCachedQuestions(newQuestions);
  }, []);

  const resetToSampleQuestions = useCallback(() => {
    setQuestions(SAMPLE_QUESTIONS);
    setCachedQuestions(SAMPLE_QUESTIONS);
    setQuestionsLocked(false);
    setSettingsState((prev) => ({ ...prev, questionsLocked: false }));
  }, []);

  const toggleLockQuestions = useCallback(() => {
    setSettingsState((prev) => {
      const nextLocked = !prev.questionsLocked;
      setQuestionsLocked(nextLocked);
      return { ...prev, questionsLocked: nextLocked };
    });
  }, []);

  const triggerSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await syncQuestions();
      setSyncStatus(res.status);
      setQuestions(res.questions);
    } catch (e) {
      console.error('Trigger sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const uploadQuestionsToCloud = useCallback(async (): Promise<{ success: boolean; count: number; message: string }> => {
    setIsSyncing(true);
    try {
      await saveQuestionsToCloud(questions);
      const nowStr = new Date().toLocaleString('vi-VN');
      localStorage.setItem('rcv_last_sync_v1', nowStr);
      setSyncStatus((prev) => ({
        ...prev,
        isConfigured: true,
        lastSyncedAt: nowStr,
        syncSource: 'cloud',
        error: undefined,
      }));
      return { success: true, count: questions.length, message: `Đã đẩy thành công ${questions.length} câu hỏi lên Firebase Firestore!` };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, count: 0, message: `Lỗi tải lên Firebase: ${msg}` };
    } finally {
      setIsSyncing(false);
    }
  }, [questions]);

  const downloadQuestionsFromCloud = useCallback(async (): Promise<{ success: boolean; count: number; message: string }> => {
    setIsSyncing(true);
    try {
      const cloudQ = await fetchQuestionsFromCloud();
      if (!cloudQ || cloudQ.length === 0) {
        return { success: false, count: 0, message: 'Dữ liệu trên Firebase đang rỗng hoặc chưa có câu hỏi nào được lưu.' };
      }
      setQuestions(cloudQ);
      setCachedQuestions(cloudQ);
      const nowStr = new Date().toLocaleString('vi-VN');
      localStorage.setItem('rcv_last_sync_v1', nowStr);
      setSyncStatus((prev) => ({
        ...prev,
        isConfigured: true,
        lastSyncedAt: nowStr,
        syncSource: 'cloud',
        error: undefined,
      }));
      return { success: true, count: cloudQ.length, message: `Đã đồng bộ ${cloudQ.length} câu hỏi từ Firebase về máy thành công!` };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, count: 0, message: `Lỗi tải từ Firebase: ${msg}` };
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Lắng nghe trạng thái online/offline của trình duyệt
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: true }));
      triggerSync();
    };
    const handleOffline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Tự động kiểm tra đồng bộ lúc mở ứng dụng
    triggerSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync]);

  return (
    <QuizContext.Provider
      value={{
        questions,
        mainQuestions,
        tiebreakerQuestions,
        audienceQuestions,
        progress,
        settings,
        syncStatus,
        isSyncing,
        updateProgress,
        updateSettings,
        updateQuestions,
        resetToSampleQuestions,
        toggleLockQuestions,
        triggerSync,
        uploadQuestionsToCloud,
        downloadQuestionsFromCloud,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
