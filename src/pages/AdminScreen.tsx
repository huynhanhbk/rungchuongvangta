import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  X,
  FileSpreadsheet,
  Check,
  Save,
  HelpCircle,
  Settings,
  ExternalLink
} from 'lucide-react';
import { Question, QuestionPool, OptionKey } from '../types';
import { useQuiz } from '../context/QuizContext';
import { APP_CONFIG } from '../config';
import { exportQuestionsToCSV, parseQuestionsFromCSV } from '../services/storage';
import {
  testFirebaseConnection,
  getActiveFirebaseConfig,
  saveCustomFirebaseConfig,
  removeCustomFirebaseConfig,
  FirebaseCustomConfig,
} from '../services/firebase';

export const AdminScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    questions,
    mainQuestions,
    tiebreakerQuestions,
    audienceQuestions,
    settings,
    syncStatus,
    isSyncing,
    updateQuestions,
    updateSettings,
    resetToSampleQuestions,
    toggleLockQuestions,
    triggerSync,
    uploadQuestionsToCloud,
    downloadQuestionsFromCloud,
  } = useQuiz();

  // Authentication state for Admin
  const adminPasscode = import.meta.env.VITE_ADMIN_PASSCODE || APP_CONFIG.defaultAdminPasscode;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('rcv_admin_auth') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');

  // Firebase configuration modal & cloud action state
  const [showFirebaseModal, setShowFirebaseModal] = useState<boolean>(false);
  const [firebaseConfigForm, setFirebaseConfigForm] = useState<FirebaseCustomConfig>(() => {
    return (
      getActiveFirebaseConfig() || {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      }
    );
  });
  const [pasteSnippet, setPasteSnippet] = useState<string>('');
  const [testResult, setTestResult] = useState<{ testing: boolean; message?: string; success?: boolean }>({ testing: false });
  const [cloudActionMsg, setCloudActionMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Tab management: 'main' | 'tiebreaker' | 'audience'
  const [activeTab, setActiveTab] = useState<QuestionPool>('main');

  // Question Editor modal state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState<boolean>(false);

  // Stage Preview modal state
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === adminPasscode) {
      setIsAuthenticated(true);
      sessionStorage.setItem('rcv_admin_auth', 'true');
      setPasscodeError('');
    } else {
      setPasscodeError('Mật khẩu không đúng. Vui lòng thử lại!');
    }
  };

  const currentPoolQuestions = activeTab === 'main'
    ? mainQuestions
    : activeTab === 'tiebreaker'
    ? tiebreakerQuestions
    : audienceQuestions;

  const targetCount = APP_CONFIG.requirements[activeTab];
  const countDiff = currentPoolQuestions.length - targetCount;

  // Sắp xếp câu hỏi lên/xuống
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (settings.questionsLocked) {
      alert('Bộ câu hỏi đang bị KHÓA. Hãy mở khóa trước khi sắp xếp!');
      return;
    }
    const newPool = [...currentPoolQuestions];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newPool.length) return;

    const temp = newPool[index];
    newPool[index] = newPool[targetIdx];
    newPool[targetIdx] = temp;

    // Cập nhật lại thứ tự
    const reorderedPool = newPool.map((q, idx) => ({ ...q, order: idx + 1 }));

    // Cập nhật vào danh sách tổng
    const otherQuestions = questions.filter((q) => q.pool !== activeTab);
    updateQuestions([...otherQuestions, ...reorderedPool]);
  };

  // Xóa câu hỏi
  const deleteQuestion = (id: string) => {
    if (settings.questionsLocked) {
      alert('Bộ câu hỏi đang bị KHÓA. Hãy mở khóa trước khi xóa!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      const remaining = questions.filter((q) => q.id !== id);
      // Đánh lại số thứ tự cho pool hiện tại
      const updated = remaining.map((q) => {
        if (q.pool === activeTab) {
          // find order
          const poolItems = remaining.filter((p) => p.pool === activeTab);
          const idx = poolItems.findIndex((item) => item.id === q.id);
          return { ...q, order: idx + 1 };
        }
        return q;
      });
      updateQuestions(updated);
    }
  };

  // Thêm câu hỏi mới
  const handleAddNew = () => {
    if (settings.questionsLocked) {
      alert('Bộ câu hỏi đang bị KHÓA. Hãy mở khóa trước khi thêm mới!');
      return;
    }
    const newQ: Question = {
      id: `${activeTab}-${Date.now().toString(36)}`,
      order: currentPoolQuestions.length + 1,
      pool: activeTab,
      content: '',
      options: {
        A: '',
        B: '',
        C: '',
        D: '',
      },
      correctAnswer: 'A',
      explanation: '',
      category: 'Chuyển đổi số',
    };
    setIsNewQuestion(true);
    setEditingQuestion(newQ);
  };

  // Lưu câu hỏi đang chỉnh sửa
  const handleSaveQuestion = (q: Question) => {
    if (settings.questionsLocked) {
      alert('Bộ câu hỏi đang bị KHÓA!');
      return;
    }
    if (!q.content.trim() || !q.options.A.trim() || !q.options.B.trim() || !q.options.C.trim() || !q.options.D.trim()) {
      alert('Vui lòng nhập đầy đủ nội dung câu hỏi và cả 4 đáp án A, B, C, D!');
      return;
    }

    let updated: Question[];
    if (isNewQuestion) {
      updated = [...questions, q];
    } else {
      updated = questions.map((item) => (item.id === q.id ? q : item));
    }
    updateQuestions(updated);
    setEditingQuestion(null);
  };

  // Xuất file CSV
  const handleExportCSV = () => {
    exportQuestionsToCSV(questions);
  };

  // Nhập file CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings.questionsLocked) {
      alert('Bộ câu hỏi đang bị KHÓA. Hãy mở khóa trước khi nhập dữ liệu mới!');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseQuestionsFromCSV(text);
        if (confirm(`Đã tìm thấy ${parsed.length} câu hỏi trong file CSV. Bạn có muốn ghi đè bộ câu hỏi hiện tại?`)) {
          updateQuestions(parsed);
          setImportStatusMessage(`Đã nhập thành công ${parsed.length} câu hỏi!`);
          setTimeout(() => setImportStatusMessage(null), 4000);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi đọc file CSV';
        alert(`Lỗi nhập CSV: ${msg}`);
      }
    };
    reader.readAsText(file, 'utf-8');
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Trích xuất cấu hình từ đoạn mã dán (Snippet)
  const handleParseSnippet = (snippet: string) => {
    setPasteSnippet(snippet);
    try {
      const apiKeyMatch = snippet.match(/apiKey:\s*["']([^"']+)["']/);
      const authDomainMatch = snippet.match(/authDomain:\s*["']([^"']+)["']/);
      const projectIdMatch = snippet.match(/projectId:\s*["']([^"']+)["']/);
      const storageBucketMatch = snippet.match(/storageBucket:\s*["']([^"']+)["']/);
      const messagingSenderIdMatch = snippet.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const appIdMatch = snippet.match(/appId:\s*["']([^"']+)["']/);

      if (apiKeyMatch && projectIdMatch) {
        setFirebaseConfigForm({
          apiKey: apiKeyMatch[1],
          authDomain: authDomainMatch ? authDomainMatch[1] : `${projectIdMatch[1]}.firebaseapp.com`,
          projectId: projectIdMatch[1],
          storageBucket: storageBucketMatch ? storageBucketMatch[1] : '',
          messagingSenderId: messagingSenderIdMatch ? messagingSenderIdMatch[1] : '',
          appId: appIdMatch ? appIdMatch[1] : '',
        });
        setTestResult({ testing: false, success: true, message: 'Đã nhận dạng cấu hình thành công! Hãy bấm "Lưu cấu hình" hoặc "Kiểm tra kết nối".' });
      }
    } catch (e) {
      // ignore
    }
  };

  // Kiểm tra kết nối Firestore
  const handleTestConnection = async () => {
    setTestResult({ testing: true });
    if (firebaseConfigForm.apiKey && firebaseConfigForm.projectId) {
      saveCustomFirebaseConfig(firebaseConfigForm);
    }
    const res = await testFirebaseConnection();
    setTestResult({ testing: false, success: res.success, message: res.message });
  };

  // Lưu cấu hình Firebase vào trình duyệt
  const handleSaveFirebaseConfig = () => {
    if (!firebaseConfigForm.apiKey.trim() || !firebaseConfigForm.projectId.trim()) {
      alert('Vui lòng nhập tối thiểu API Key và Project ID!');
      return;
    }
    saveCustomFirebaseConfig(firebaseConfigForm);
    triggerSync();
    setCloudActionMsg({ type: 'success', text: 'Đã lưu cấu hình Firebase thành công!' });
    setShowFirebaseModal(false);
    setTimeout(() => setCloudActionMsg(null), 5000);
  };

  // Xóa cấu hình Firebase trở về Offline
  const handleRemoveFirebase = () => {
    if (confirm('Bạn có chắc muốn xóa cấu hình Firebase và trở về chế độ Offline?')) {
      removeCustomFirebaseConfig();
      setFirebaseConfigForm({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      });
      setPasteSnippet('');
      setTestResult({ testing: false });
      triggerSync();
      setShowFirebaseModal(false);
      setCloudActionMsg({ type: 'info', text: 'Đã chuyển về chế độ Offline mặc định.' });
      setTimeout(() => setCloudActionMsg(null), 5000);
    }
  };

  // Đẩy dữ liệu câu hỏi từ máy này lên Firebase
  const handleUploadCloud = async () => {
    if (settings.questionsLocked) {
      alert('Bộ câu hỏi đang bị KHÓA. Hãy mở khóa trước khi thao tác!');
      return;
    }
    if (!confirm(`Bạn có chắc muốn ĐẨY toàn bộ ${questions.length} câu hỏi hiện tại lên Cloud Firebase để đồng bộ sang các máy khác?`)) {
      return;
    }
    const res = await uploadQuestionsToCloud();
    setCloudActionMsg({ type: res.success ? 'success' : 'error', text: res.message });
    setTimeout(() => setCloudActionMsg(null), 6000);
  };

  // Tải dữ liệu câu hỏi từ Firebase về máy này
  const handleDownloadCloud = async () => {
    if (settings.questionsLocked) {
      alert('Bộ câu hỏi đang bị KHÓA. Hãy mở khóa trước khi thao tác!');
      return;
    }
    if (!confirm('Bạn có chắc muốn TẢI VỀ và GHI ĐÈ bộ câu hỏi từ Cloud Firebase vào máy tính này?')) {
      return;
    }
    const res = await downloadQuestionsFromCloud();
    setCloudActionMsg({ type: res.success ? 'success' : 'error', text: res.message });
    setTimeout(() => setCloudActionMsg(null), 6000);
  };

  // MÀN HÌNH ĐĂNG NHẬP PASSCODE NẾU CHƯA XÁC THỰC
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6 select-none">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-600/20 border border-indigo-500/40 rounded-2xl text-indigo-400">
              <Shield className="w-10 h-10" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-center text-white mb-2">Trang Quản Trị Câu Hỏi</h2>
          <p className="text-sm text-slate-400 text-center mb-6">
            Nhập mật khẩu quản trị để thiết lập đề thi {APP_CONFIG.shortName} 2026
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2">
                Mật khẩu quản trị
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
              />
              {passcodeError && (
                <p className="text-xs text-rose-400 mt-2 font-medium">{passcodeError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              Đăng Nhập Quản Trị
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Quay lại trang chủ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Về trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Quản Trị Hệ Thống</span>
              <span className="text-xs text-slate-500">|</span>
              <span className="text-xs text-slate-400">{APP_CONFIG.organizer}</span>
            </div>
            <h1 className="text-xl font-bold text-white">Quản Lý Bộ Câu Hỏi Đề Thi</h1>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-3">
          {/* Lock toggle button */}
          <button
            onClick={toggleLockQuestions}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
              settings.questionsLocked
                ? 'bg-rose-950/60 border-rose-700/60 text-rose-300'
                : 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
            }`}
            title="Khóa đề thi trước giờ thi để tránh chỉnh sửa ngoài ý muốn"
          >
            {settings.questionsLocked ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
            {settings.questionsLocked ? 'Bộ Đề Đang KHÓA' : 'Bộ Đề Mở Khóa'}
          </button>

          {/* Cloud sync button */}
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors"
            title="Đồng bộ với Firebase Firestore"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Ngay'}
          </button>

          {/* Quick exit admin */}
          <button
            onClick={() => {
              sessionStorage.removeItem('rcv_admin_auth');
              setIsAuthenticated(false);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Firebase Cloud Sync Control Center */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl ${syncStatus.isConfigured ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'}`}>
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2 text-base">
                  <span>Đồng Bộ Dữ Liệu Cloud Firebase</span>
                  {syncStatus.isConfigured ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã kết nối Cloud
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Chưa cài đặt Firebase
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {syncStatus.lastSyncedAt
                    ? `Đã đồng bộ gần nhất lúc: ${syncStatus.lastSyncedAt} • Dùng được trên Internet và nhiều máy tính`
                    : 'Cấu hình Firebase để đồng bộ đề thi giữa máy chiếu MC, máy dự phòng và máy nhập đề.'}
                </div>
              </div>
            </div>

            {/* Cloud Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowFirebaseModal(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors shadow"
                title="Cấu hình thông tin Firebase kết nối"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                Cài Đặt Firebase
              </button>

              <button
                onClick={handleUploadCloud}
                disabled={isSyncing || settings.questionsLocked}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
                title="Tải toàn bộ bộ câu hỏi từ máy này lên Firebase để các máy khác có thể tải về"
              >
                <ArrowUp className="w-4 h-4" />
                Đẩy Lên Cloud (Upload)
              </button>

              <button
                onClick={handleDownloadCloud}
                disabled={isSyncing || settings.questionsLocked}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
                title="Kéo bộ câu hỏi mới nhất từ Firebase về máy tính này"
              >
                <ArrowDown className="w-4 h-4" />
                Tải Về Từ Cloud (Download)
              </button>
            </div>
          </div>

          {/* Sub Toolbar: CSV & Default Seeding */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span className="font-medium">Công cụ dự phòng Offline / Xuất nhập file:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 border border-slate-700/60 transition-colors"
                title="Xuất đề thi ra Excel/CSV UTF-8"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" /> Xuất Excel/CSV
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={settings.questionsLocked}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-medium flex items-center gap-1.5 border border-slate-700/60 transition-colors"
                title="Nhập hàng loạt từ file CSV"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" /> Nhập file CSV
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => {
                  if (settings.questionsLocked) {
                    alert('Bộ câu hỏi đang bị KHÓA!');
                    return;
                  }
                  if (confirm('Khôi phục toàn bộ 45 câu hỏi mẫu chuẩn (30 chính, 10 phụ, 5 khán giả)?')) {
                    resetToSampleQuestions();
                  }
                }}
                disabled={settings.questionsLocked}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 text-amber-300 font-medium flex items-center gap-1.5 border border-slate-700/60 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Nạp Đề Mẫu Chuẩn
              </button>
            </div>
          </div>
        </div>

        {cloudActionMsg && (
          <div className={`p-3.5 rounded-2xl border text-sm flex items-center gap-2.5 animate-fade-in ${
            cloudActionMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
              : cloudActionMsg.type === 'error'
              ? 'bg-rose-950/80 border-rose-600 text-rose-300'
              : 'bg-blue-950/80 border-blue-600 text-blue-300'
          }`}>
            {cloudActionMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
            <span className="font-medium">{cloudActionMsg.text}</span>
          </div>
        )}

        {importStatusMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {importStatusMessage}
          </div>
        )}

        {/* ============================================================== */}
        {/* TABS SELECTOR (Chính: 30 / Phụ: 10 / Khán giả: 5)             */}
        {/* ============================================================== */}
        <div className="flex border-b border-slate-800 gap-4">
          {[
            { key: 'main' as QuestionPool, label: 'Phần Thi Chính', count: mainQuestions.length, target: 30, color: 'blue' },
            { key: 'tiebreaker' as QuestionPool, label: 'Câu Hỏi Phụ', count: tiebreakerQuestions.length, target: 10, color: 'amber' },
            { key: 'audience' as QuestionPool, label: 'Khán Giả Giao Lưu', count: audienceQuestions.length, target: 5, color: 'emerald' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            const isMatch = tab.count === tab.target;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 px-4 font-bold text-sm flex items-center gap-2.5 transition-all relative ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                    isMatch
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {tab.count}/{tab.target} {isMatch ? '✓' : ''}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Header Status Details */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {countDiff === 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Đã đủ tiêu chuẩn {targetCount} câu hỏi cho phần này.
              </span>
            ) : countDiff < 0 ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Cảnh báo: Đang thiếu {Math.abs(countDiff)} câu hỏi (Hiện có {currentPoolQuestions.length}/{targetCount}).
              </span>
            ) : (
              <span className="text-blue-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Đang có {currentPoolQuestions.length} câu (vượt {countDiff} câu so với chuẩn {targetCount}).
              </span>
            )}
          </div>

          <button
            onClick={handleAddNew}
            disabled={settings.questionsLocked}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Thêm Câu Hỏi Mới
          </button>
        </div>

        {/* ============================================================== */}
        {/* QUESTIONS LIST TABLE                                           */}
        {/* ============================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-850 border-b border-slate-800 text-xs uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">STT</th>
                  <th className="py-3.5 px-4">Nội Dung Câu Hỏi</th>
                  <th className="py-3.5 px-4 w-32">Chủ Đề</th>
                  <th className="py-3.5 px-4 w-28 text-center">Đáp Án Đúng</th>
                  <th className="py-3.5 px-4 w-44 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentPoolQuestions.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-4 px-4 text-center font-bold text-amber-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white leading-relaxed">{q.content}</div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                        A: {q.options.A} | B: {q.options.B} | C: {q.options.C} | D: {q.options.D}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                        {q.category || 'Chuyển đổi số'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-sm inline-flex items-center justify-center border border-emerald-500/40">
                        {q.correctAnswer}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-1">
                      {/* Move up */}
                      <button
                        onClick={() => moveQuestion(idx, 'up')}
                        disabled={idx === 0 || settings.questionsLocked}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-colors"
                        title="Di chuyển lên"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      {/* Move down */}
                      <button
                        onClick={() => moveQuestion(idx, 'down')}
                        disabled={idx === currentPoolQuestions.length - 1 || settings.questionsLocked}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-colors"
                        title="Di chuyển xuống"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      {/* Preview modal */}
                      <button
                        onClick={() => setPreviewQuestion(q)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                        title="Xem trước giao diện sân khấu"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => {
                          setIsNewQuestion(false);
                          setEditingQuestion({ ...q });
                        }}
                        disabled={settings.questionsLocked}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-400 transition-colors"
                        title="Chỉnh sửa câu hỏi"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        disabled={settings.questionsLocked}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 disabled:opacity-30 text-rose-400 transition-colors"
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* MODAL: EDIT / ADD QUESTION                                     */}
      {/* ============================================================== */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-xl font-bold text-amber-400">
                {isNewQuestion ? 'Thêm Câu Hỏi Mới' : `Chỉnh Sửa Câu Số ${editingQuestion.order}`}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                  Nội dung câu hỏi
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.content}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, content: e.target.value })}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>Đáp án {key}</span>
                      <button
                        type="button"
                        onClick={() => setEditingQuestion({ ...editingQuestion, correctAnswer: key })}
                        className={`text-[11px] px-2 py-0.5 rounded ${
                          editingQuestion.correctAnswer === key
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {editingQuestion.correctAnswer === key ? '✓ ĐÁP ÁN ĐÚNG' : 'Chọn làm đáp án đúng'}
                      </button>
                    </label>
                    <input
                      type="text"
                      value={editingQuestion.options[key]}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          options: { ...editingQuestion.options, [key]: e.target.value },
                        })
                      }
                      placeholder={`Nội dung phương án ${key}...`}
                      className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white focus:outline-none ${
                        editingQuestion.correctAnswer === key ? 'border-emerald-400' : 'border-slate-700 focus:border-amber-400'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Category & Time limit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                    Chủ đề / Nhóm kiến thức
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.category || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                    placeholder="VD: An toàn thông tin, VNeID..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                    Thời gian đếm ngược (để trống để dùng mặc định)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={editingQuestion.customTimeLimit || ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        customTimeLimit: parseInt(e.target.value, 10) || undefined,
                      })
                    }
                    placeholder="VD: 10 giây"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
                  Giải thích đáp án (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  placeholder="Căn cứ pháp lý hoặc giải thích ngắn gọn..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-sm"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQuestion(editingQuestion)}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30"
                >
                  Lưu Câu Hỏi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: LIVE STAGE PREVIEW                                      */}
      {/* ============================================================== */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                Xem Trước Trên Màn Hình LED (Câu {previewQuestion.order})
              </span>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage simulation */}
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 mb-4">
              <div className="text-xl md:text-2xl font-black text-center mb-6 leading-relaxed">
                {previewQuestion.content}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => {
                  const isCorrect = previewQuestion.correctAnswer === key;
                  return (
                    <div
                      key={key}
                      className={`p-3.5 rounded-xl border-2 flex items-center gap-3 ${
                        isCorrect
                          ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                          : 'border-slate-800 bg-slate-900 text-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                        isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white'
                      }`}>
                        {key}
                      </div>
                      <div className="font-semibold text-sm">{previewQuestion.options[key]}</div>
                    </div>
                  );
                })}
              </div>

              {previewQuestion.explanation && (
                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-300 text-xs">
                  <strong>Giải thích:</strong> {previewQuestion.explanation}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm"
              >
                Đóng xem trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CẤU HÌNH ĐỒNG BỘ FIREBASE CLOUD                        */}
      {/* ============================================================== */}
      {showFirebaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Cấu Hình Đồng Bộ Firebase Cloud</h3>
                  <p className="text-xs text-slate-400">Đồng bộ câu hỏi tức thì qua Internet giữa các máy tính khác nhau</p>
                </div>
              </div>
              <button
                onClick={() => setShowFirebaseModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Quick paste helper */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center justify-between">
                  <span>Dán nhanh mã cấu hình Firebase (Firebase SDK Snippet)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Tự động điền các ô bên dưới</span>
                </label>
                <textarea
                  rows={3}
                  value={pasteSnippet}
                  onChange={(e) => handleParseSnippet(e.target.value)}
                  placeholder={`Dán đoạn mã từ Firebase Console vào đây, ví dụ:\nconst firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "rcv-tam-anh",\n  appId: "1:..."\n};`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    API Key <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={firebaseConfigForm.apiKey}
                    onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Project ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={firebaseConfigForm.projectId}
                    onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, projectId: e.target.value })}
                    placeholder="my-contest-app"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Auth Domain
                  </label>
                  <input
                    type="text"
                    value={firebaseConfigForm.authDomain}
                    onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, authDomain: e.target.value })}
                    placeholder="my-contest-app.firebaseapp.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    App ID
                  </label>
                  <input
                    type="text"
                    value={firebaseConfigForm.appId}
                    onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, appId: e.target.value })}
                    placeholder="1:123456789:web:abcdef"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              {/* Test status banner */}
              {testResult.message && (
                <div className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300'
                    : 'bg-rose-950/70 border-rose-600 text-rose-300'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />}
                  <div>{testResult.message}</div>
                </div>
              )}

              {/* Instructions guide */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
                <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Cách tạo Firebase Firestore miễn phí trong 2 phút:
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Vào <strong>console.firebase.google.com</strong> &gt; Tạo dự án mới.</li>
                  <li>Mục <strong>Firestore Database</strong> &gt; Bấm <em>Create database</em>.</li>
                  <li>Tab <strong>Rules</strong> của Firestore &gt; Đổi thành: <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">allow read, write: if true;</code> rồi bấm <em>Publish</em>.</li>
                  <li>Vào <strong>Project Settings</strong> &gt; Thêm Web App <code className="text-blue-300">&lt;/&gt;</code> &gt; Copy mã cấu hình dán vào ô trên.</li>
                </ol>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleRemoveFirebase}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-colors"
                >
                  Xóa Cấu Hình (Dùng Offline)
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testResult.testing}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${testResult.testing ? 'animate-spin' : ''}`} />
                    {testResult.testing ? 'Đang kiểm tra...' : 'Kiểm Tra Kết Nối'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveFirebaseConfig}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Lưu Cấu Hình
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
