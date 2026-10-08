# Rung Chuông Vàng - Hội Thi Chuyển Đổi Số Xã Tam Anh 2026

Ứng dụng web trình chiếu **"Rung Chuông Vàng"** chuyên nghiệp dành cho màn hình LED lớn và Tivi (tỷ lệ 16:9), phục vụ **"Hội thi Chuyển đổi số xã Tam Anh năm 2026"** với chủ đề **"Công dân số - Văn hóa số"**, do **Ủy ban nhân dân xã Tam Anh** tổ chức.

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **Hiển thị sân khấu chuẩn 16:9 & Độ tương phản cực cao**:
   - Chữ câu hỏi siêu lớn (~48px+), đáp án (~36-40px+), đồng hồ đếm ngược (~120px) đọc rõ nét từ khoảng cách xa.
   - 4 thẻ đáp án A, B, C, D phân biệt màu sắc, hiệu ứng ánh sáng phát quang khi công bố đáp án đúng.
2. **Luồng điều khiển thông minh cho MC**:
   - Phím tắt tiện lợi: `Space` (Đếm giờ/Tạm dừng), `Enter` (Công bố đáp án), `←` `→` (Câu trước/sau), `H` (Ẩn/Hiện thanh điều khiển MC), `R` (Đặt lại giờ), `F` (Toàn màn hình).
   - Bộ đếm **Số thí sinh còn lại** và **Số khán giả trả lời đúng** tùy chỉnh nhanh bằng nút `+/-`.
3. **Đầy đủ 3 Phần thi theo quy chế**:
   - **Phần thi chính**: 30 câu hỏi (10s/câu).
   - **Phần thi câu hỏi phụ**: 10 câu hỏi nâng cao (10s/câu) để phân định thứ hạng.
   - **Phần thi khán giả giao lưu**: 5 câu hỏi gần gũi (15s/câu) kèm **Công cụ quay số may mắn** chọn khán giả nhận quà.
4. **Màn hình Vinh Danh Chuông Vàng lớn & Hiệu ứng đặc biệt**:
   - Chuông Vàng kim loại rực rỡ vẽ bằng SVG, rung lắc khi chạm/click.
   - Pháo hoa nổ nhiều đợt phủ màn hình bằng Canvas.
   - Âm thanh tự tổng hợp bằng **Web Audio API** (chuông ngân vang, nhạc fanfare chiến thắng, tiếng tích tắc khẩn cấp, tiếng pháo hoa, tiếng quay số) - **100% không phụ thuộc file ngoài**.
5. **Khả năng chạy OFFLINE tuyệt đối**:
   - Tự động nạp sẵn 45 câu hỏi mẫu chuẩn tiếng Việt và lưu vào LocalStorage/Cache.
   - Dù mất mạng Internet hoàn toàn trong lúc thi, ứng dụng vẫn hoạt động mượt mà không bị gián đoạn.
6. **Quản trị câu hỏi (/admin)**:
   - Bảo vệ bằng mật khẩu quản trị (`VITE_ADMIN_PASSCODE` hoặc mặc định: `taman2026`).
   - Thêm, sửa, xóa, sắp xếp câu hỏi, xem trước trực tiếp trên màn hình sân khấu.
   - Xuất & Nhập hàng loạt qua file Excel/CSV chuẩn UTF-8 có dấu tiếng Việt.
   - Tính năng **Khóa bộ câu hỏi** để cố định đề trước giờ khai mạc.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Chạy trên máy tính cá nhân (Local)

```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi động máy chủ phát triển
npm run dev
```

Mở trình duyệt truy cập: `http://localhost:3000` (hoặc cổng được hiển thị trong terminal).

---

### 2. Thiết lập Firebase Firestore (Tùy chọn - Cloud Sync)

Nếu muốn đồng bộ câu hỏi giữa nhiều máy tính qua Cloud:

1. Truy cập [Firebase Console](https://console.firebase.google.com/) và bấm **Add project** (Tạo dự án mới).
2. Vào mục **Build** > **Firestore Database** > Chọn **Create database**.
   - Chọn chế độ **Production mode** (hoặc Test mode).
   - Chọn khu vực gần Việt Nam (ví dụ: `asia-southeast1` hoặc `asia-east1`).
3. Vào tab **Rules** của Firestore và cập nhật:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true; // Hoặc phân quyền theo nhu cầu
       }
     }
   }
   ```
4. Vào **Project Settings** > mục **Your apps** > Chọn biểu tượng Web `</>` để lấy cấu hình Firebase config.
5. Tạo file `.env` tại thư mục gốc và dán các biến vào:
   ```env
   VITE_ADMIN_PASSCODE=taman2026
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

*Lưu ý: Nếu chưa cấu hình Firebase, ứng dụng vẫn chạy 100% bình thường bằng bộ nhớ Offline sẵn có!*

---

### 3. Deploy lên Vercel

1. Đẩy mã nguồn lên kho chứa GitHub / GitLab.
2. Đăng nhập [Vercel](https://vercel.com/) và bấm **Add New...** > **Project**.
3. Chọn repo GitHub vừa tải lên.
4. Tại phần **Environment Variables**, thêm các biến môi trường từ file `.env` (nếu có).
5. Bấm **Deploy**. Tập tin `vercel.json` đã được định cấu hình sẵn để xử lý điều hướng Single Page App (SPA).

---

## ⌨️ BẢNG PHÍM TẮT CHO MC TRÊN SÂN KHẤU

| Phím tắt | Chức năng |
|---|---|
| **Space** (Phím cách) | Bắt đầu / Tạm dừng đếm ngược 10 giây |
| **Enter** | Công bố đáp án đúng (làm nổi bật đáp án) |
| **Mũi tên phải (→)** | Chuyển sang câu tiếp theo |
| **Mũi tên trái (←)** | Quay lại câu trước đó |
| **H** | Ẩn / Hiện thanh điều khiển MC (giúp màn hình LED sạch sẽ) |
| **R** | Đặt lại đồng hồ về thời gian ban đầu |
| **F** | Bật / Tắt chế độ Toàn màn hình (Fullscreen) |
