/**
 * Hàm hiển thị Modal thay thế cho alert() truyền thống
 * @param {string} messageKey - Key dịch thuật HOẶC một chuỗi text thuần nếu không có key
 * @param {string} type - 'info' | 'warning' | 'error' | 'success'
 * @returns {Promise<boolean>} Trả về true khi người dùng bấm Đóng/Xác nhận
 */
function showCustomAlert(messageKey, type = "info") {
  return new Promise((resolve) => {
    const lang =
      localStorage.getItem("language") || localStorage.getItem("lang") || "vi";
    let message = messageKey;
    if (translations[lang] && translations[lang][messageKey]) {
      message = translations[lang][messageKey];
    }

    const titleText = translations[lang]?.modalTitle || "Thông báo";
    const btnText = translations[lang]?.close || "Đóng";

    let colorClass = "text-blue-600 dark:text-blue-400";
    if (type === "error") colorClass = "text-red-500 dark:text-red-400";
    if (type === "success")
      colorClass = "text-emerald-500 dark:text-emerald-400";
    if (type === "warning") colorClass = "text-amber-500 dark:text-amber-400";

    const modalId = `custom-alert-${Date.now()}`;
    const modalHTML = `
      <div id="${modalId}" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate__animated animate__fadeIn animate__faster">
        <div class="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 transform transition-all scale-100 animate__animated animate__zoomIn animate__faster">
          <div class="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
            <span class="text-xl ${colorClass}">➔</span>
            <h3 class="font-bold text-base text-gray-800 dark:text-gray-100">${titleText}</h3>
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-line">${message}</div>
          <div class="flex justify-end">
            <button id="${modalId}-btn" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-all shadow-sm">
              ${btnText}
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modalElement = document.getElementById(modalId);
    const closeBtn = document.getElementById(`${modalId}-btn`);

    // Hàm đóng modal gốc
    const closeModal = () => {
      window.removeEventListener("keydown", handleEsc); // Gỡ bỏ sự kiện Esc khi đóng
      modalElement.classList.remove("animate__fadeIn");
      modalElement.classList.add("animate__fadeOut");
      setTimeout(() => {
        modalElement.remove();
        resolve(true);
      }, 200);
    };

    // Hàm lắng nghe phím Esc
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleEsc);
    closeBtn.addEventListener("click", closeModal);
    modalElement.addEventListener("click", (e) => {
      if (e.target === modalElement) closeModal();
    });
  });
}

/**
 * Hàm hiển thị Modal Xác nhận (Confirm) an toàn tuyệt đối
 * @param {string} messageKey - Key dịch thuật HOẶC chuỗi text thuần
 * @param {string} type - 'info' | 'warning' | 'error' | 'success'
 * @returns {Promise<boolean>}
 */
function showCustomConfirm(messageKey, type = "warning") {
  return new Promise((resolve) => {
    const lang =
      localStorage.getItem("language") || localStorage.getItem("lang") || "vi";

    let message = messageKey;
    if (
      typeof translations !== "undefined" &&
      translations[lang] &&
      translations[lang][messageKey]
    ) {
      message = translations[lang][messageKey];
    }

    const titleText =
      (typeof translations !== "undefined" && translations[lang]?.modalTitle) ||
      "Thông báo";
    const confirmBtnText =
      (typeof translations !== "undefined" && translations[lang]?.confirm) ||
      "Xác nhận";
    const cancelBtnText =
      (typeof translations !== "undefined" && translations[lang]?.cancel) ||
      "Hủy bỏ";

    let colorClass = "text-yellow-500 dark:text-yellow-400";
    if (type === "error") colorClass = "text-red-500 dark:text-red-400";
    if (type === "success")
      colorClass = "text-emerald-500 dark:text-emerald-400";
    if (type === "info") colorClass = "text-blue-500 dark:text-blue-400";

    const modalId = `custom-confirm-${Date.now()}`;

    const modalHTML = `
      <div id='${modalId}' class='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate__animated animate__fadeIn animate__faster'>
        <div class='bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-zinc-800 transform transition-all scale-100 animate__animated animate__zoomIn animate__faster'>
          <div class='flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4'>
            <span class='text-xl ${colorClass}'>⚠️</span>
            <h3 class='font-bold text-base text-gray-800 dark:text-gray-100'>${titleText}</h3>
          </div>
          <div class='text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-line'>${message}</div>
          <div class='flex justify-end gap-2'>
            <button id='${modalId}-btn-cancel' class='px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-all shadow-sm focus:outline-none ring-2 ring-transparent'>
              ${cancelBtnText}
            </button>
            <button id='${modalId}-btn-confirm' class='px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm focus:outline-none ring-2 ring-transparent'>
              ${confirmBtnText}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modalElement = document.getElementById(modalId);
    const cancelBtn = document.getElementById(`${modalId}-btn-cancel`);
    const confirmBtn = document.getElementById(`${modalId}-btn-confirm`);
    const buttons = [cancelBtn, confirmBtn];

    // Mặc định chọn nút Hủy bỏ (index 0) để an toàn cho người dùng
    let currentFocusIndex = 0;

    // Hàm cập nhật hiệu ứng viền nổi bật (focus) khi dùng phím điều hướng
    function updateButtonFocus() {
      buttons.forEach((btn, idx) => {
        if (!btn) return;
        if (idx === currentFocusIndex) {
          btn.focus();
          if (idx === 0) {
            btn.classList.add("ring-red-500", "dark:ring-red-400");
          } else {
            btn.classList.add("ring-sky-500", "dark:ring-sky-400");
          }
        } else {
          btn.classList.remove("ring-sky-500", "dark:ring-sky-400", "ring-red-500", "dark:ring-red-400");
        }
      });
    }

    // Tự động gán trạng thái focus ban đầu sau một khoảng delay nhỏ để khớp hiệu ứng UI
    setTimeout(updateButtonFocus, 50);

    // Hàm đóng modal gốc
    const closeModal = (result) => {
      if (!modalElement) return;
      window.removeEventListener("keydown", handleModalKeydown); // Gỡ bỏ sự kiện khi đóng
      modalElement.classList.remove("animate__fadeIn");
      modalElement.classList.add("animate__fadeOut");
      setTimeout(() => {
        modalElement.remove();
        resolve(result);
      }, 200);
    };

    // Hàm tổng hợp lắng nghe các phím bấm điều hướng (Mũi tên, Enter, Esc)
    const handleModalKeydown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal(false);
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        // Luân chuyển trạng thái qua lại giữa nút Hủy (0) và nút Xác nhận (1)
        currentFocusIndex = currentFocusIndex === 0 ? 1 : 0;
        updateButtonFocus();
      } else if (e.key === "Enter") {
        e.preventDefault();
        // Đóng modal và trả về true nếu chọn Xác nhận (index 1), ngược lại trả về false
        closeModal(currentFocusIndex === 1);
      }
    };

    window.addEventListener("keydown", handleModalKeydown);
    cancelBtn?.addEventListener("click", () => closeModal(false));
    confirmBtn?.addEventListener("click", () => closeModal(true));
    modalElement?.addEventListener("click", (e) => {
      if (e.target === modalElement) closeModal(false);
    });
  });
}

/**
 * Hiển thị Modal kết quả tải lên chứa danh sách liên kết hoặc thư mục
 * @param {Array} results - Danh sách đối tượng chứa {fileName, link}
 */
function showUploadResultsModal(results) {
  let modal = document.getElementById("uploadResultsModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "uploadResultsModal";
    modal.className =
      "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-300";
    document.body.appendChild(modal);
  }

  const currentLang =
    localStorage.getItem("lang") ||
    document.getElementById("langSelector")?.value ||
    "vi";
  const titleText =
    (typeof translations !== "undefined" &&
      translations[currentLang]?.uploadSuccess) ||
    "Tải lên thành công!";
  const closeText =
    (typeof translations !== "undefined" && translations[currentLang]?.close) ||
    "Đóng";
  const copyAllText =
    (typeof translations !== "undefined" &&
      translations[currentLang]?.copyAll) ||
    "Copy tất cả";

  const listItemsHtml = results
    .map(
      (res) => `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700/50 gap-2">
      <div class="truncate flex flex-col min-w-0 flex-1">
        <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 truncate" title="${res.fileName}">${res.fileName}</span>
        <a href="${res.link}" target="_blank" class="text-sm font-medium text-sky-500 hover:underline truncate">${res.link}</a>
      </div>
      <button onclick="copyToClipboard('${res.link}')" class="bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition flex-shrink-0 self-end sm:self-center">Copy</button>
    </div>
  `,
    )
    .join("");

  modal.innerHTML = `
    <div class="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 dark:border-zinc-800 animate__animated animate__zoomIn animate__fast" onclick="event.stopPropagation()">
      <div class="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ${titleText}
        </h3>
        <button onclick="closeUploadResultsModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div class="p-5 overflow-y-auto space-y-3 flex-1 min-h-0">${listItemsHtml}</div>
      <div class="p-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-zinc-800/20 rounded-b-2xl">
        <button onclick="copyAllLinks()" class="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2 rounded-xl transition">${copyAllText}</button>
        <button onclick="closeUploadResultsModal()" class="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow transition">${closeText}</button>
      </div>
    </div>
  `;
  window.currentLinksToCopy = results.map((r) => r.link).join("\n");

  modal.classList.remove("hidden");
  void modal.offsetWidth;
  modal.classList.add("opacity-100");
  document.body.classList.add("overflow-hidden");
}

window.closeUploadResultsModal = function () {
  const modal = document.getElementById("uploadResultsModal");
  if (!modal) return;
  modal.classList.remove("opacity-100");
  const innerContainer = modal.querySelector(".animate__animated");
  if (innerContainer) {
    innerContainer.classList.remove("animate__zoomIn");
    innerContainer.classList.add("animate__zoomOut");
  }
  setTimeout(() => {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }, 300);
};

// Lắng nghe phím Esc riêng cho Upload Results Modal
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const uploadModal = document.getElementById("uploadResultsModal");
    if (uploadModal && !uploadModal.classList.contains("hidden")) {
      window.closeUploadResultsModal();
    }
  }
});

/**
 * Hàm sinh nội dung HTML chi tiết cho danh sách phím tắt dựa trên ngôn ngữ hiện tại
 * @param {Object} t - Đối tượng dịch thuật (translations[lang])
 * @param {boolean} isMac - Kiểm tra hệ điều hành có phải Mac không
 * @returns {string} Chuỗi HTML danh sách phím tắt
 */
function renderShortcutContent(t, isMac) {
  let shortcutData = [];

  if (isMac) {
    shortcutData = [
      { keys: ["⌘", "Enter"], desc: t.scUpload || "Tải file lên Drive" },
      { keys: ["⌘", "Backspace"], desc: t.scClearAll || "Xoá toàn bộ file được tải từ máy tính lên" },
      { keys: ["⌥ Option", "⌘", "Backspace"], desc: t.scClearConfig || "Xoá toàn bộ cấu hình kết nối Drive, Sheets và thư mục" },
      { keys: ["⌥ Option", "⌘", "O"], desc: t.scOpenPicker || "Chỉ định thư mục Drive cần được tải lên" },
      { keys: ["⌥ Option", "Backspace"], desc: t.btnReset || "Trả toàn bộ tên file về tên ban đầu" },
      { keys: ["⌥ Option", "C"], desc: t.scConnect || "Kết nối đến Drive API" },
      { keys: ["⌥ Option", "H"], desc: t.scShowThis || "Hiển thị danh sách phím tắt này" },
      { keys: ["Esc"], desc: t.scCloseEsc || "Đóng nhanh cửa sổ (Esc)" }
    ];
  } else {
    shortcutData = [
      { keys: ["Control", "Enter"], desc: t.scUpload || "Tải file lên Drive" },
      { keys: ["Control", "Backspace"], desc: t.scClearAll || "Xoá toàn bộ file được tải từ máy tính lên" },
      { keys: ["Control", "Alt", "Backspace"], desc: t.scClearConfig || "Xoá toàn bộ cấu hình kết nối Drive, Sheets và thư mục" },
      { keys: ["Control", "Alt", "O"], desc: t.scOpenPicker || "Chỉ định thư mục Drive cần được tải lên" },
      { keys: ["Alt", "Backspace"], desc: t.btnClearAll || "Trả toàn bộ tên file về tên ban đầu" },
      { keys: ["Alt", "C"], desc: t.scConnect || "Kết nối đến Drive API" },
      { keys: ["Alt", "H"], desc: t.scShowThis || "Hiển thị danh sách phím tắt này" },
      { keys: ["Esc"], desc: t.scCloseEsc || "Đóng nhanh cửa sổ (Esc)" }
    ];
  }

  return shortcutData.map(item => {
    const keysBadge = item.keys.map(k => `
      <kbd class="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md shadow-sm dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 font-sans">
        ${k}
      </kbd>
    `).join('<span class="text-gray-400 dark:text-zinc-600 font-light">+</span>');

    return `
      <div class="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-zinc-800/60 last:border-0 hover:bg-gray-50/50 dark:hover:bg-zinc-850/40 px-1 rounded-lg transition">
        <span class="text-gray-600 dark:text-zinc-400 font-medium text-[13px] pr-4">${item.desc}</span>
        <div class="flex items-center gap-1.5 shrink-0 select-none">
          ${keysBadge}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Hàm hiển thị danh sách phím tắt (Keyboard Shortcuts Modal)
 */
window.showShortcutList = function () {
  const lang = localStorage.getItem("preferredLanguage") || localStorage.getItem("lang") || "vi";
  const t = translations[lang] || translations["vi"];

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || 
                (navigator.userAgentData && navigator.userAgentData.platform === "macOS");

  let modal = document.getElementById("shortcutModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "shortcutModal";
    modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-300";
    
    modal.onclick = function (e) {
      if (e.target === modal) window.closeShortcutModal();
    };

    document.body.appendChild(modal);
  }

  // Đổ khung cấu trúc Modal chính
  modal.innerHTML = `
    <div class="relative bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-6 transform scale-95 transition-transform duration-300 animate__animated animate__zoomIn" onclick="event.stopPropagation()">
      <button 
        onclick="window.closeShortcutModal()" 
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
      >
        &times;
      </button>

      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        ⌨️ <span id="shortcutModalTitle">${t.scTitle || "Phím tắt bàn phím"}</span>
        <span class="text-xs font-normal text-sky-500 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400 px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-900/30">
          ${isMac ? "macOS" : "Windows/Linux"}
        </span>
      </h3>

      <div id="shortcutListContainer" class="space-y-1 max-h-[60vh] overflow-y-auto pr-1 text-sm">
        ${renderShortcutContent(t, isMac)}
      </div>

      <div class="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
        <button 
          id=\"btn-shortcut-close\"
          onclick="window.closeShortcutModal()" 
          class="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow transition"
        >
          ${t.close || "Đóng"}
        </button>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  void modal.offsetWidth; 
  modal.classList.add("opacity-100");
  document.body.classList.add("overflow-hidden");
};

/**
 * Hàm hỗ trợ cập nhật ngôn ngữ nóng cho Modal phím tắt khi người dùng đổi ngôn ngữ từ thanh Select
 */
window.updateShortcutModalLanguage = function (lang) {
  const modal = document.getElementById("shortcutModal");
  // Nếu modal không tồn tại hoặc đang ẩn thì không cần cập nhật
  if (!modal || modal.classList.contains("hidden")) return;

  const t = translations[lang] || translations["vi"];
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || 
                (navigator.userAgentData && navigator.userAgentData.platform === "macOS");

  // Cập nhật tiêu đề
  const titleEl = document.getElementById("shortcutModalTitle");
  if (titleEl) titleEl.innerText = t.scTitle || "Phím tắt bàn phím";

  // Cập nhật nút đóng
  const closeBtn = document.getElementById("btn-shortcut-close");
  if (closeBtn) closeBtn.innerText = t.close || "Đóng";

  // Kết xuất lại danh sách phím tắt bằng ngôn ngữ mới
  const container = document.getElementById("shortcutListContainer");
  if (container) {
    container.innerHTML = renderShortcutContent(t, isMac);
  }
};

window.closeShortcutModal = function () {
  const modal = document.getElementById("shortcutModal");
  if (!modal) return;

  modal.classList.remove("opacity-100");
  const innerContainer = modal.querySelector(".animate__animated");
  if (innerContainer) {
    innerContainer.classList.remove("animate__zoomIn");
    innerContainer.classList.add("animate__zoomOut");
  }

  setTimeout(() => {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }, 300);
};

// Sự kiện keydown toàn cục
document.addEventListener("keydown", (event) => {
  if (event.altKey && event.code === "KeyH") {
    event.preventDefault(); 
    window.showShortcutList();
  }
  if (event.key === "Escape") {
    const shortcutModal = document.getElementById("shortcutModal");
    if (shortcutModal && !shortcutModal.classList.contains("hidden")) {
      window.closeShortcutModal();
    }
  }
});