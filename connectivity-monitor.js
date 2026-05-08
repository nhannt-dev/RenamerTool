// connectivity-monitor.js (Version: Skeleton Lock Pro)
(function () {
  // 1. Tạo và chèn CSS cho Skeleton Overlay và Banner
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
        /* Banner Styles */
        #network-status-banner {
            position: fixed; top: 0; left: 0; width: 100%; padding: 12px 15px;
            text-align: center; z-index: 10001; font-weight: bold; display: none;
            transition: all 0.4s ease; font-family: system-ui, sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); fontSize: 14px; box-sizing: border-box;
        }
        @media (min-width: 768px) {
            #network-status-banner { font-size: 16px !important; padding: 15px !important; }
        }

        /* Skeleton Lock Styles */
        .skeleton-locked {
            position: relative !important;
            pointer-events: none !important; /* Chặn click/hover */
            user-select: none !important;
            filter: grayscale(0.5);
        }

        .skeleton-locked::after {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(90deg, 
                var(--container-bg) 25%, 
                var(--item-bg) 50%, 
                var(--container-bg) 75%);
            background-size: 200% 100%;
            animation: skeleton-shimmer 1.5s infinite linear;
            z-index: 9998;
            border-radius: 16px;
            opacity: 0.85;
        }

        @keyframes skeleton-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;
  document.head.appendChild(styleSheet);

  // 2. Tạo phần tử Banner
  const banner = document.createElement("div");
  banner.id = "network-status-banner";
  document.body.appendChild(banner);

  // 3. Hàm lấy bản dịch (Giữ nguyên logic của bạn)
  function getMessage(type) {
    const lang = localStorage.getItem("app-lang") || "vi";
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

    if (
      typeof translations !== "undefined" &&
      translations[lang] &&
      translations[lang].netOnline
    ) {
      return type === "online"
        ? translations[lang].netOnline
        : translations[lang].netOffline;
    }
    const selectedLang = fallback[lang] || fallback["en"];
    return type === "online" ? selectedLang.online : selectedLang.offline;
  }

  // 4. Hàm cập nhật trạng thái UI
  function updateStatus() {
    const mainApp = document.getElementById("main-app");

    if (navigator.onLine) {
      // Trạng thái ONLINE
      banner.innerText = getMessage("online");
      banner.style.backgroundColor = "#28a745";
      banner.style.color = "white";
      banner.style.display = "block";

      if (mainApp) mainApp.classList.remove("skeleton-locked");

      setTimeout(() => {
        banner.style.display = "none";
      }, 3000);
    } else {
      // Trạng thái OFFLINE
      banner.innerText = getMessage("offline");
      banner.style.backgroundColor = "#ff4d4d";
      banner.style.color = "white";
      banner.style.display = "block";

      // Kích hoạt Skeleton che phủ ứng dụng
      if (mainApp) mainApp.classList.add("skeleton-locked");
    }
  }

  // 5. Chặn phím tắt (Keyboard Interceptor)
  // Sử dụng { capture: true } để chặn sự kiện trước khi nó tới script của rename.html
  window.addEventListener(
    "keydown",
    function (e) {
      if (!navigator.onLine) {
        // Nếu là phím Esc thì có thể cho phép để đóng các modal cũ nếu cần,
        // nhưng theo yêu cầu là chặn tất cả phím tắt nên ta chặn hết.
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true,
  );

  // 6. Lắng nghe sự kiện hệ thống
  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);

  // Kiểm tra ngay khi load
  if (!navigator.onLine) {
    updateStatus();
  }
})();
