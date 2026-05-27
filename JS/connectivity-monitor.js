// connectivity-monitor.js (Version: Skeleton Lock Tailwind CSS Edition)
(function () {
  // 1. Tạo và chèn CSS bổ sung cho lớp phủ che chặn giao diện khi mất mạng
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
        .skeleton-locked {
            position: relative !important;
            pointer-events: none !important;
            user-select: none !important;
        }
        .skeleton-locked::after {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(18, 18, 20, 0.7);
            backdrop-filter: blur(4px);
            z-index: 9999;
            border-radius: 0.75rem;
            animation: pulseTailwind 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulseTailwind {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
  `;
  document.head.appendChild(styleSheet);

  // 2. Tạo Banner thông báo trạng thái mạng trên cùng màn hình nền phẳng Tailwind
  const banner = document.createElement("div");
  banner.id = "network-status-banner";
  banner.className =
    "fixed top-0 left-0 w-full text-center font-bold text-sm sm:text-base py-3 px-4 z- shadow-2xl transition-all duration-300 transform -translate-y-full hidden";
  document.body.appendChild(banner);

  // 3. Hệ thống đa ngôn ngữ cho trạng thái kết nối mạng
  const messages = {
    vi: {
      online: "🌐 Đã khôi phục kết nối internet. Hệ thống sẵn sàng!",
      offline: "🚨 Đã mất kết nối internet. Vui lòng kiểm tra đường truyền!",
    },
    en: {
      online: "🌐 Internet connection restored. System is ready!",
      offline: "🚨 Internet connection lost. Please check your network!",
    },
    fr: {
      online: "🌐 Connexion Internet rétablie. Le système est prêt !",
      offline: "🚨 Connexion Internet perdue. Veuillez vérifier votre réseau !",
    },
    th: {
      online: "🌐 การเชื่อมต่ออินเทอร์เน็ตกลับมาใช้งานได้แล้ว ระบบพร้อมทำงาน!",
      offline: "🚨 การ接続อินเทอร์เน็ตขาดหาย กรุณาตรวจสอบเครือข่ายของคุณ!",
    },
    ja: {
      online: "🌐 インターネット接続が復旧しました。システムは利用可能です！",
      offline:
        "🚨 インターネット接続が切断されました。ネットワークを確認してください！",
    },
    zh: {
      online: "🌐 互联网连接已恢复。系统准备就绪！",
      offline: "🚨 互联网连接断开。请检查您的网络设置！",
    },
  };

  function getMessage(status) {
    const langSelect = document.getElementById("langSelector");
    const currentLang = langSelect ? langSelect.value : "vi";
    return messages[currentLang]?.[status] || messages["vi"][status];
  }

  // 4. Cập nhật trạng thái UI tương thích Tailwind CSS linh hoạt
  function updateStatus() {
    const mainApp = document.getElementById("main-app");

    if (navigator.onLine) {
      // Trạng thái ONLINE
      banner.innerText = getMessage("online");
      banner.className =
        "fixed top-0 left-0 w-full text-center font-bold text-sm sm:text-base py-3 px-4 z- shadow-2xl transition-all duration-300 transform translate-y-0 bg-emerald-600 text-white block";

      if (mainApp) mainApp.classList.remove("skeleton-locked");

      setTimeout(() => {
        banner.classList.add("-translate-y-full");
        setTimeout(() => {
          banner.classList.add("hidden");
        }, 300);
      }, 3000);
    } else {
      // Trạng thái OFFLINE
      banner.innerText = getMessage("offline");
      banner.className =
        "fixed top-0 left-0 w-full text-center font-bold text-sm sm:text-base py-3 px-4 z- shadow-2xl transition-all duration-300 transform translate-y-0 bg-red-600 text-white block";

      // Kích hoạt hiệu ứng xương khóa mờ che phủ ứng dụng
      if (mainApp) mainApp.classList.add("skeleton-locked");
    }
  }

  // 5. Chặn phím tắt (Keyboard Interceptor) khi thiết bị đang ở trạng thái mất kết nối mạng
  window.addEventListener(
    "keydown",
    function (e) {
      if (!navigator.onLine) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true,
  );

  // 6. Lắng nghe sự kiện hệ thống mạng
  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);

  // Kiểm tra trạng thái ngay khi trang web tải xong cấu hình
  window.addEventListener("DOMContentLoaded", () => {
    if (!navigator.onLine) {
      updateStatus();
    }
  });
})();
