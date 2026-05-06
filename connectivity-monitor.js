// connectivity-monitor.js
(function () {
  // 1. Tạo phần tử hiển thị thông báo với hỗ trợ Responsive
  const banner = document.createElement("div");
  banner.id = "network-status-banner";

  // Thiết lập Style cơ bản và Responsive
  Object.assign(banner.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    padding: "12px 15px",
    textAlign: "center",
    zIndex: "10000",
    fontWeight: "bold",
    display: "none",
    transition: "all 0.4s ease",
    fontFamily: "system-ui, -apple-system, sans-serif",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    fontSize: "14px",
    boxSizing: "border-box",
  });

  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
        @media (min-width: 768px) {
            #network-status-banner { font-size: 16px !important; padding: 15px !important; }
        }
    `;
  document.head.appendChild(styleSheet);
  document.body.appendChild(banner);

  // 2. Hàm lấy bản dịch đã fix lỗi undefined
  function getMessage(type) {
    const lang = localStorage.getItem("app-lang") || "vi";

    // Bảng dịch dự phòng (Fallback) đầy đủ 6 ngôn ngữ
    const fallback = {
      vi: {
        online: "🌐 Đã khôi phục kết nối Internet!",
        offline: "⚠️ Mất kết nối Internet. Vui lòng kiểm tra đường truyền!",
      },
      en: {
        online: "🌐 Internet connection restored!",
        offline: "⚠️ No Internet connection. Please check your network!",
      },
      th: {
        online: "🌐 การเชื่อมต่ออินเทอร์เน็ตกลับมาแล้ว!",
        offline: "⚠️ ขาดการเชื่อมต่ออินเทอร์เน็ต โปรดตรวจสอบเครือข่ายของคุณ!",
      },
      ja: {
        online: "🌐 インターネット接続が復旧しました！",
        offline:
          "⚠️ インターネット接続がありません。ネットワークを確認してください。",
      },
      zh: {
        online: "🌐 网络连接已恢复！",
        offline: "⚠️ 无网络连接，请检查您的网络！",
      },
      fr: {
        online: "🌐 Connexion Internet rétablie !",
        offline:
          "⚠️ Pas de connexion Internet. Veuillez vérifier votre réseau !",
      },
    };

    // FIX: Kiểm tra xem translations có tồn tại VÀ có chứa key netOnline/netOffline không
    if (
      typeof translations !== "undefined" &&
      translations[lang] &&
      translations[lang].netOnline
    ) {
      return type === "online"
        ? translations[lang].netOnline
        : translations[lang].netOffline;
    }

    // Nếu file rename.html chưa cập nhật key, sử dụng fallback ngay tại đây
    const selectedLang = fallback[lang] || fallback["en"];
    return type === "online" ? selectedLang.online : selectedLang.offline;
  }

  function updateStatus() {
    if (navigator.onLine) {
      banner.innerText = getMessage("online");
      banner.style.backgroundColor = "#28a745";
      banner.style.color = "white";
      banner.style.display = "block";

      // Tự động ẩn sau 3 giây khi có mạng lại[cite: 2]
      setTimeout(() => {
        banner.style.display = "none";
      }, 3000);
    } else {
      banner.innerText = getMessage("offline");
      banner.style.backgroundColor = "#ff4d4d";
      banner.style.color = "white";
      banner.style.display = "block";
    }
  }

  // Lắng nghe sự kiện kết nối[cite: 2]
  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);

  // Kiểm tra trạng thái ngay khi load file[cite: 2]
  if (!navigator.onLine) {
    updateStatus();
  }
})();
