/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { QuizProvider } from './context/QuizContext';
import { StageNav } from './components/StageNav';
import { HomeScreen } from './pages/HomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { GoldenBellScreen } from './pages/GoldenBellScreen';
import { AdminScreen } from './pages/AdminScreen';

// Sử dụng HashRouter (cực kỳ an toàn trên static/offline hosting hoặc Vercel)
export default function App() {
  return (
    <ThemeProvider>
      <QuizProvider>
        <HashRouter>
          <StageNav />
          <Routes>
            {/* Màn hình Chào mừng */}
            <Route path="/" element={<HomeScreen />} />

            {/* Phần thi chính: 30 câu */}
            <Route path="/quiz/main" element={<QuizScreen pool="main" />} />

            {/* Phần thi câu hỏi phụ: 10 câu */}
            <Route path="/quiz/tiebreaker" element={<QuizScreen pool="tiebreaker" />} />

            {/* Phần thi dành cho khán giả giao lưu: 5 câu */}
            <Route path="/quiz/audience" element={<QuizScreen pool="audience" />} />

            {/* Màn hình Chuông Vàng Vinh Danh */}
            <Route path="/vinh-danh" element={<GoldenBellScreen />} />

            {/* Trang Quản trị câu hỏi & Đồng bộ Cloud */}
            <Route path="/admin" element={<AdminScreen />} />

            {/* Điều hướng mặc định */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </QuizProvider>
    </ThemeProvider>
  );
}
