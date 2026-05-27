/**
 * Hàm thực hiện thay đổi ngôn ngữ hiển thị trên giao diện tức thì
 * @param {string} lang - Mã ngôn ngữ ('vi', 'en', 'th', 'ja', 'zh', 'fr')
 */
function changeLanguage(lang) {
  if (!translations || !translations[lang]) {
    console.error(`Language '${lang}' not found in translations object.`);
    return;
  }

  const t = translations[lang];

  // Định nghĩa bản đồ ánh xạ giữa Key trong dịch thuật và ID phần tử trên HTML
  const elementMapping = {
    "txt-title": t.title,
    "lbl-drive-config": t.driveConfig,
    "lbl-sheet-id": t.lblSheet,
    "lbl-folder-link": t.folderLink,
    "btn-connect-drive": t.connect,
    "lbl-prefix": t.prefix,
    "lbl-code": t.code,
    "lbl-order": t.order,
    "lbl-street": t.street,
    "lbl-ward": t.ward,
    "lbl-preview": t.preview,
    "lbl-count-text": t.countText,
    "txt-drop": t.drop,
    btnClearAll: t.clearAll,
    btnUploadText: t.uploadButton,
    modalTitle: t.modalTitle,
    "opt-light": t.themeLight,
    "opt-dark": t.themeDark,
    "opt-device": t.themeDevice,

    // --- ĐỒNG BỘ THÊM CÁC ID CỦA MODAL EXPLORER TỪ FILE TRANSLATIONS ---
    exTitle: "📁 " + (t.exTitle || "Duyệt thư mục Google Drive"),
    exLoading: t.exLoading || "Đang tải dữ liệu...",
    exSelecting: t.exSelecting || "Đang chọn:",
    exBtnCancel: t.cancel || "Hủy bỏ",
    exBtnConfirm: t.exBtnConfirm || "Xác nhận chọn",
  };

  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("statusText");
  const btnConnect = document.getElementById("btn-connect-drive");

  if (statusDot && statusText && btnConnect) {
    const isNotConnected =
      statusDot.classList.contains("bg-gray-400") ||
      statusDot.classList.contains("bg-gray-500") ||
      statusDot.classList.contains("bg-rose-500");

    if (isNotConnected) {
      statusText.textContent = t.notConnected;
      btnConnect.textContent = t.connect;
    } else {
      statusText.textContent = t.connected;
      btnConnect.textContent =
        lang === "vi" ? "Đổi tài khoản" : "Change Account";
    }
  }

  for (const [id, value] of Object.entries(elementMapping)) {
    const element = document.getElementById(id);
    if (element) {
      if (id === "txt-drop") {
        element.innerHTML = value;
      } else {
        element.textContent = value;
      }
    }
  }

  // Cập nhật các Placeholder cho các thẻ Input bên ngoài
  const placeholders = {
    clientId: t.placeholderClientId,
    apiKey: t.placeholderApiKey,
    sheetId: t.placeholderSheet,
    folderId: t.placeholderFolder,
    // --- CẬP NHẬT PLACEHOLDER ĐA NGÔN NGỮ CHO Ô TÌM KIẾM TRONG MODAL ---
    modalSearchInput: t.exSearchPlaceholder || "Tìm kiếm thư mục...",
  };

  for (const [id, value] of Object.entries(placeholders)) {
    const inputEl = document.getElementById(id);
    if (inputEl) {
      inputEl.setAttribute("placeholder", value);
    }
  }

  // CẬP NHẬT CHUYỂN NGỮ LỖI TỨC THÌ QUA ATTRIBUTE
  const sheetNameDisplay = document.getElementById("sheetNameDisplay");
  if (
    sheetNameDisplay &&
    sheetNameDisplay.getAttribute("data-error-type") === "access-error"
  ) {
    sheetNameDisplay.innerHTML = `<span class="text-rose-500 font-medium">${t.sheetErrorAccess}</span>`;
  } else if (
    sheetNameDisplay &&
    sheetNameDisplay.getAttribute("data-status") === "fetching"
  ) {
    sheetNameDisplay.innerHTML = `<span class="text-gray-400 animate-pulse">${t.fetchingSheet || "🔍 Checking..."}</span>`;
  }

  const folderNameDisplay = document.getElementById("folderNameDisplay");
  if (
    folderNameDisplay &&
    folderNameDisplay.getAttribute("data-error-type") === "access-error"
  ) {
    folderNameDisplay.innerHTML = `<span class="text-rose-500 font-medium">${t.folderErrorAccess}</span>`;
  } else if (
    folderNameDisplay &&
    folderNameDisplay.getAttribute("data-status") === "fetching"
  ) {
    folderNameDisplay.innerHTML = `<span class="text-gray-400 animate-pulse">${t.buildingTree || "🔍 Checking..."}</span>`;
  }

  fetchUserEmail();

  localStorage.setItem("preferredLanguage", lang);
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;
}

/**
 * Khởi tạo sự kiện và thiết lập ngôn ngữ mặc định khi tải trang
 */
document.addEventListener("DOMContentLoaded", () => {
  const langSelector = document.getElementById("langSelector");

  if (langSelector) {
    const savedLang = localStorage.getItem("preferredLanguage") || "vi";
    langSelector.value = savedLang;
    changeLanguage(savedLang);

    langSelector.addEventListener("change", (e) => {
      changeLanguage(e.target.value);
    });
  }
});