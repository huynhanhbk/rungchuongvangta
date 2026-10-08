export type QuestionPool = 'main' | 'tiebreaker' | 'audience';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  order: number;
  pool: QuestionPool;
  content: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: OptionKey;
  explanation?: string;
  customTimeLimit?: number; // Tuỳ chọn ghi đè số giây riêng
  category?: string;
}

export interface QuizProgress {
  mainIndex: number;
  tiebreakerIndex: number;
  audienceIndex: number;
  remainingParticipants: number;
  correctAudienceCount: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  volume: number; // 0 to 1
  mainTimeLimit: number;
  tiebreakerTimeLimit: number;
  audienceTimeLimit: number;
  autoRevealTimeUp: boolean;
  questionsLocked: boolean; // Khóa bộ câu hỏi trước giờ thi
}

export interface SyncStatus {
  isConfigured: boolean;
  isOnline: boolean;
  lastSyncedAt: string | null;
  syncSource: 'cloud' | 'local_cache' | 'default_seed';
  error?: string;
}
