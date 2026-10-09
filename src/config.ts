/**
 * Cấu hình chung cho Hội thi Rung chuông vàng
 * Chuyển đổi số xã Tam Anh năm 2026
 */

export const APP_CONFIG = {
  // Thông tin hội thi & Tiêu đề Banner
  contestName: "Hội thi Chuyển đổi số xã Tam Anh năm 2026",
  bannerTopTitle: "ỦY BAN NHÂN DÂN XÃ TAM ANH",
  bannerMainTitle: "HỘI THI CHUYỂN ĐỔI SỐ",
  bannerTheme: "Chủ đề: Công dân số, Văn hóa số xã Tam Anh năm 2026",
  bannerDate: "Tam Anh, ngày 10 tháng 10 năm 2026",
  shortName: "Rung Chuông Vàng",
  slogan: "Công dân số - Văn hóa số",
  organizer: "Ủy ban nhân dân xã Tam Anh",
  subOrganizer: "Ban Chỉ đạo Chuyển đổi số xã Tam Anh",
  location: "Hội trường UBND xã Tam Anh",
  year: "2026",

  // Số lượng câu hỏi chuẩn cho từng phần
  requirements: {
    main: 30,
    tiebreaker: 10,
    audience: 5,
  },

  // Thời gian đếm ngược mặc định (giây)
  defaultTimeLimits: {
    main: 10,
    tiebreaker: 10,
    audience: 15,
  },

  // Mật khẩu quản trị mặc định nếu chưa đặt trong .env (VITE_ADMIN_PASSCODE)
  defaultAdminPasscode: "taman2026",
};
