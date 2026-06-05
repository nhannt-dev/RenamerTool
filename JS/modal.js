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
            <button id='${modalId}-btn-cancel' class='px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-all shadow-sm'>
              ${cancelBtnText}
            </button>
            <button id='${modalId}-btn-confirm' class='px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm'>
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

    // Hàm đóng modal gốc
    const closeModal = (result) => {
      if (!modalElement) return;
      window.removeEventListener("keydown", handleEsc); // Gỡ bỏ sự kiện Esc khi đóng
      modalElement.classList.remove("animate__fadeIn");
      modalElement.classList.add("animate__fadeOut");
      setTimeout(() => {
        modalElement.remove();
        resolve(result);
      }, 200);
    };

    // Nhấn Esc tương đương hành động Cancel (false)
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal(false);
    };

    window.addEventListener("keydown", handleEsc);
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
