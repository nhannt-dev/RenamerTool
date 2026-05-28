/**
 * Hàm hiển thị Modal thay thế cho alert() truyền thống
 * @param {string} messageKey - Key dịch thuật (ví dụ: 'invalidCode') HOẶC một chuỗi text thuần nếu không có key
 * @param {string} type - 'info' | 'warning' | 'error' | 'success' (để đổi màu sắc icon/tiêu đề)
 * @returns {Promise<boolean>} Trả về true khi người dùng bấm Đóng/Xác nhận
 */
function showCustomAlert(messageKey, type = "info") {
  return new Promise((resolve) => {
    // Tự động nhận diện ngôn ngữ hiện tại của hệ thống (Ví dụ: 'vi', 'ja', 'en'...)
    const lang =
      localStorage.getItem("language") || localStorage.getItem("lang") || "vi";
    // Kiểm tra xem translations[lang] và key tin nhắn có tồn tại không
    let message = messageKey;
    if (translations[lang] && translations[lang][messageKey]) {
      message = translations[lang][messageKey];
    }

    // Lấy tiêu đề và nhãn nút đóng tương ứng theo ngôn ngữ được chọn
    const titleText = translations[lang]?.modalTitle || "Thông báo";
    const btnText = translations[lang]?.close || "Đóng";

    // Phối màu icon theo type ('error', 'warning', 'success', 'info')
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
          <div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
            ${message}
          </div>
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

    const closeModal = () => {
      modalElement.classList.remove("animate__fadeIn");
      modalElement.classList.add("animate__fadeOut");
      setTimeout(() => {
        modalElement.remove();
        resolve(true);
      }, 200);
    };

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
    const lang = localStorage.getItem("language") || localStorage.getItem("lang") || "vi";
    
    let message = messageKey;
    if (typeof translations !== 'undefined' && translations[lang] && translations[lang][messageKey]) {
      message = translations[lang][messageKey];
    }

    const titleText = (typeof translations !== 'undefined' && translations[lang]?.modalTitle) || "Thông báo";
    const confirmBtnText = (typeof translations !== 'undefined' && translations[lang]?.confirm) || "Xác nhận";
    const cancelBtnText = (typeof translations !== 'undefined' && translations[lang]?.cancel) || "Hủy bỏ";

    let colorClass = "text-yellow-500 dark:text-yellow-400";
    if (type === "error") colorClass = "text-red-500 dark:text-red-400";
    if (type === "success") colorClass = "text-emerald-500 dark:text-emerald-400";
    if (type === "info") colorClass = "text-blue-500 dark:text-blue-400";

    const modalId = `custom-confirm-${Date.now()}`;

    // Sử dụng nháy đơn nội bộ để không bao giờ bị lỗi vỡ chuỗi template
    const modalHTML = `
      <div id='${modalId}' class='fixed inset-0 z- flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate__animated animate__fadeIn animate__faster'>
        <div class='bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-zinc-800 transform transition-all scale-100 animate__animated animate__zoomIn animate__faster'>
          <div class='flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4'>
            <span class='text-xl ${colorClass}'>⚠️</span>
            <h3 class='font-bold text-base text-gray-800 dark:text-gray-100'>${titleText}</h3>
          </div>
          <div class='text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-line'>
            ${message}
          </div>
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

    const closeModal = (result) => {
      if (!modalElement) return;
      modalElement.classList.remove("animate__fadeIn");
      modalElement.classList.add("animate__fadeOut");
      setTimeout(() => {
        modalElement.remove();
        resolve(result);
      }, 200);
    };

    cancelBtn?.addEventListener("click", () => closeModal(false));
    confirmBtn?.addEventListener("click", () => closeModal(true));
    
    modalElement?.addEventListener("click", (e) => {
      if (e.target === modalElement) closeModal(false);
    });
  });
}