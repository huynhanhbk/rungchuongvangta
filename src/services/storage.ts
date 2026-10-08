import { Question, QuestionPool, AppSettings, QuizProgress, SyncStatus } from '../types';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';
import { APP_CONFIG } from '../config';
import { fetchQuestionsFromCloud, saveQuestionsToCloud, isFirebaseConfigured } from './firebase';

const STORAGE_KEYS = {
  QUESTIONS: 'rcv_questions_v1',
  SETTINGS: 'rcv_settings_v1',
  PROGRESS: 'rcv_progress_v1',
  LAST_SYNC: 'rcv_last_sync_v1',
  LOCKED: 'rcv_questions_locked_v1',
};

export const defaultSettings: AppSettings = {
  soundEnabled: true,
  volume: 0.85,
  mainTimeLimit: APP_CONFIG.defaultTimeLimits.main,
  tiebreakerTimeLimit: APP_CONFIG.defaultTimeLimits.tiebreaker,
  audienceTimeLimit: APP_CONFIG.defaultTimeLimits.audience,
  autoRevealTimeUp: false,
  questionsLocked: false,
};

export const defaultProgress: QuizProgress = {
  mainIndex: 0,
  tiebreakerIndex: 0,
  audienceIndex: 0,
  remainingParticipants: 50,
  correctAudienceCount: 0,
};

/**
 * Lấy danh sách câu hỏi từ Local Cache (hoặc nạp bộ mẫu nếu chưa có)
 */
export const getCachedQuestions = (): Question[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading cached questions:', e);
  }
  // Mặc định lưu bộ mẫu vào cache
  setCachedQuestions(SAMPLE_QUESTIONS);
  return SAMPLE_QUESTIONS;
};

/**
 * Ghi đè danh sách câu hỏi vào Local Cache
 */
export const setCachedQuestions = (questions: Question[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (e) {
    console.error('Error writing cached questions:', e);
  }
};

/**
 * Khóa hoặc mở khóa bộ đề thi
 */
export const isQuestionsLocked = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.LOCKED) === 'true';
};

export const setQuestionsLocked = (locked: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.LOCKED, locked ? 'true' : 'false');
};

/**
 * Lấy cài đặt ứng dụng
 */
export const getSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...defaultSettings, ...JSON.parse(raw), questionsLocked: isQuestionsLocked() };
    }
  } catch (e) {
    console.warn('Error reading settings:', e);
  }
  return { ...defaultSettings, questionsLocked: isQuestionsLocked() };
};

export const saveSettings = (settings: Partial<AppSettings>): AppSettings => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    if (settings.questionsLocked !== undefined) {
      setQuestionsLocked(settings.questionsLocked);
    }
  } catch (e) {
    console.warn('Error saving settings:', e);
  }
  return updated;
};

/**
 * Quản lý tiến trình thi (nhớ vị trí câu đang thi của từng phần)
 */
export const getQuizProgress = (): QuizProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (raw) {
      return { ...defaultProgress, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Error reading progress:', e);
  }
  return defaultProgress;
};

export const saveQuizProgress = (progress: Partial<QuizProgress>): QuizProgress => {
  const current = getQuizProgress();
  const updated = { ...current, ...progress };
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving progress:', e);
  }
  return updated;
};

/**
 * Đồng bộ câu hỏi giữa Cloud và Cache Offline
 */
export const syncQuestions = async (): Promise<{ status: SyncStatus; questions: Question[] }> => {
  const online = navigator.onLine;
  const isConfigured = isFirebaseConfigured();
  const cached = getCachedQuestions();
  const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

  if (!isConfigured) {
    return {
      status: {
        isConfigured: false,
        isOnline: online,
        lastSyncedAt: lastSync,
        syncSource: 'local_cache',
        error: 'Chưa cấu hình biến môi trường Firebase Firestore. Ứng dụng đang hoạt động bằng bộ nhớ Offline/Bộ đề mẫu.',
      },
      questions: cached,
    };
  }

  if (!online) {
    return {
      status: {
        isConfigured: true,
        isOnline: false,
        lastSyncedAt: lastSync,
        syncSource: 'local_cache',
        error: 'Thiết bị đang không có kết nối Internet. Đã nạp dữ liệu từ bộ nhớ Offline.',
      },
      questions: cached,
    };
  }

  try {
    const cloudQuestions = await fetchQuestionsFromCloud();
    if (cloudQuestions && cloudQuestions.length > 0) {
      // Cập nhật lại cache offline
      setCachedQuestions(cloudQuestions);
      const nowStr = new Date().toLocaleString('vi-VN');
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, nowStr);

      return {
        status: {
          isConfigured: true,
          isOnline: true,
          lastSyncedAt: nowStr,
          syncSource: 'cloud',
        },
        questions: cloudQuestions,
      };
    } else {
      // Cloud rỗng, upload bộ nhớ hiện tại lên Cloud
      await saveQuestionsToCloud(cached);
      const nowStr = new Date().toLocaleString('vi-VN');
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, nowStr);

      return {
        status: {
          isConfigured: true,
          isOnline: true,
          lastSyncedAt: nowStr,
          syncSource: 'cloud',
        },
        questions: cached,
      };
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Lỗi đồng bộ Firestore';
    return {
      status: {
        isConfigured: true,
        isOnline: true,
        lastSyncedAt: lastSync,
        syncSource: 'local_cache',
        error: `Không thể kết nối Firestore (${errMsg}). Đang dùng dữ liệu offline.`,
      },
      questions: cached,
    };
  }
};

/**
 * Xuất danh sách câu hỏi ra file CSV chuẩn UTF-8 có BOM (tương thích 100% với Excel tiếng Việt)
 */
export const exportQuestionsToCSV = (questions: Question[]): void => {
  const headers = ['bo_cau_hoi', 'thu_tu', 'noi_dung', 'dap_an_A', 'dap_an_B', 'dap_an_C', 'dap_an_D', 'dap_an_dung', 'giai_thich', 'chu_de', 'thoi_gian_giay'];

  const rows = questions.map((q) => {
    return [
      q.pool,
      q.order,
      escapeCSV(q.content),
      escapeCSV(q.options.A),
      escapeCSV(q.options.B),
      escapeCSV(q.options.C),
      escapeCSV(q.options.D),
      q.correctAnswer,
      escapeCSV(q.explanation || ''),
      escapeCSV(q.category || ''),
      q.customTimeLimit || '',
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `RungChuongVang_CauHoi_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function escapeCSV(text: string): string {
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Phân tích nội dung file CSV thành danh sách câu hỏi
 */
export const parseQuestionsFromCSV = (csvText: string): Question[] => {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('Tập tin CSV không đủ dòng dữ liệu (cần dòng tiêu đề và ít nhất 1 dòng câu hỏi)');
  }

  const results: Question[] = [];

  // Bỏ qua dòng tiêu đề
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const columns = parseCSVLine(rawLine);
    if (columns.length < 8) continue; // Phải có ít nhất bo_cau_hoi, thu_tu, noi_dung, A, B, C, D, dap_an_dung

    const poolVal = columns[0].trim().toLowerCase();
    const pool: QuestionPool = poolVal === 'tiebreaker' || poolVal === 'phu' ? 'tiebreaker'
      : poolVal === 'audience' || poolVal === 'khangia' ? 'audience'
      : 'main';

    const order = parseInt(columns[1], 10) || i;
    const content = columns[2].trim();
    const optA = columns[3].trim();
    const optB = columns[4].trim();
    const optC = columns[5].trim();
    const optD = columns[6].trim();
    const correctRaw = columns[7].trim().toUpperCase();
    const correctAnswer = ['A', 'B', 'C', 'D'].includes(correctRaw) ? (correctRaw as 'A' | 'B' | 'C' | 'D') : 'A';
    const explanation = columns[8]?.trim() || '';
    const category = columns[9]?.trim() || '';
    const customTimeLimit = parseInt(columns[10], 10) || undefined;

    if (!content || !optA || !optB || !optC || !optD) continue;

    results.push({
      id: `${pool}-${String(order).padStart(2, '0')}-${Date.now().toString(36).slice(-4)}`,
      order,
      pool,
      content,
      options: {
        A: optA,
        B: optB,
        C: optC,
        D: optD,
      },
      correctAnswer,
      explanation,
      category,
      customTimeLimit,
    });
  }

  if (results.length === 0) {
    throw new Error('Không phân tích được câu hỏi nào hợp lệ từ file CSV. Vui lòng kiểm tra đúng định dạng mẫu.');
  }

  return results;
};

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
