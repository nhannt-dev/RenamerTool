document.addEventListener("DOMContentLoaded", () => {
  const splashScreen = document.getElementById("splash-screen");
  const splashBar = document.getElementById("splash-bar");
  const mainApp = document.getElementById("main-app");

  // --- CẤU HÌNH DELAY TẠI ĐÂY ---
  const DELAY_AFTER_LOAD = 2500; // Thời gian chờ (miligiây) sau khi đạt 100% rồi mới ẩn Splash
  const PROGRESS_SPEED = 10; // Số càng nhỏ, thanh tiến trình chạy giả lập càng chậm lúc đầu
  // ------------------------------

  let progress = 0;
  const progressInterval = setInterval(() => {
    if (progress < 85) {
      progress += Math.random() * PROGRESS_SPEED;
      if (progress > 85) progress = 85;
      if (splashBar) splashBar.style.width = `${progress}%`;
    }
  }, 120);

  window.addEventListener("load", () => {
    clearInterval(progressInterval);
    if (splashBar) splashBar.style.width = "100%";

    setTimeout(() => {
      if (splashScreen && mainApp) {
        splashScreen.classList.add("opacity-0", "pointer-events-none");
        mainApp.classList.remove("opacity-0");
        mainApp.classList.add("opacity-100");

        setTimeout(() => {
          splashScreen.remove();
        }, 500);
      }
    }, DELAY_AFTER_LOAD);
  });
});

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

const themeSelector = document.getElementById("themeSelector");
const htmlEl = document.documentElement;

function applyTheme(theme) {
  if (theme === "dark") {
    htmlEl.classList.add("dark");
    htmlEl.setAttribute("data-theme", "dark");
    htmlEl.style.colorScheme = "dark";
  } else {
    htmlEl.classList.remove("dark");
    htmlEl.setAttribute("data-theme", "light");
    htmlEl.style.colorScheme = "light";
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("app-theme") || "device";

  if (themeSelector && themeSelector.value !== savedTheme) {
    themeSelector.value = savedTheme;
  }

  if (savedTheme === "device") {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    applyTheme(systemPrefersDark ? "dark" : "light");
  } else {
    applyTheme(savedTheme);
  }
}

if (themeSelector) {
  themeSelector.addEventListener("change", (e) => {
    localStorage.setItem("app-theme", e.target.value);
    initTheme();
  });
}

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    const savedTheme = localStorage.getItem("app-theme") || "device";
    if (savedTheme === "device") {
      initTheme();
    }
  });

initTheme();

const SCOPES =
  "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

let tokenClient;
let gapiInited = false;
let gisiInited = false;

window.addEventListener("load", () => {
  loadConfigFromStorage();
  gapiLoad();
  gisLoad();
});

function saveConfigToStorage() {
  localStorage.setItem(
    "clientId",
    document.getElementById("clientId").value.trim(),
  );
  localStorage.setItem(
    "apiKey",
    document.getElementById("apiKey").value.trim(),
  );
  localStorage.setItem(
    "sheetId",
    document.getElementById("sheetId").value.trim(),
  );
  localStorage.setItem(
    "folderId",
    document.getElementById("folderId").value.trim(),
  );
}

function loadConfigFromStorage() {
  if (localStorage.getItem("clientId"))
    document.getElementById("clientId").value =
      localStorage.getItem("clientId");
  if (localStorage.getItem("apiKey"))
    document.getElementById("apiKey").value = localStorage.getItem("apiKey");
  if (localStorage.getItem("sheetId"))
    document.getElementById("sheetId").value = localStorage.getItem("sheetId");
  if (localStorage.getItem("folderId"))
    document.getElementById("folderId").value =
      localStorage.getItem("folderId");
}

function gapiLoad() {
  gapi.load("client", async () => {
    try {
      const apiKey = document.getElementById("apiKey").value;
      await gapi.client.init({
        apiKey: apiKey,
        discoveryDocs: DISCOVERY_DOCS,
      });
      gapiInited = true;
      checkBeforeAuth();
    } catch (err) {
      console.error("Lỗi khởi tạo GAPI:", err);
      updateDriveStatus(false, "Lỗi GAPI");
    }
  });
}

function gisLoad() {
  const clientId = document.getElementById("clientId").value;
  if (!clientId) return;

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: "",
  });
  gisiInited = true;
  checkBeforeAuth();
}

function checkBeforeAuth() {
  const btnConnect = document.getElementById("btn-connect-drive");
  if (gapiInited && gisiInited) {
    btnConnect.disabled = false;

    setTimeout(async () => {
      await fetchUserEmail();
      fetchAndDisplaySheetName();
      fetchAndDisplayFolderName();
    }, 500);
  }
}

async function handleAuthClick() {
  saveConfigToStorage();

  const clientId = document.getElementById("clientId").value;
  const apiKey = document.getElementById("apiKey").value;

  if (!clientId || !apiKey) {
    showCustomAlert("errorMissing", "error");
    return false;
  }

  if (!gisiInited) {
    gisLoad();
  }

  return new Promise((resolve) => {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        updateDriveStatus(false, "Kết nối thất bại");
        console.error(resp);
        resolve(false);
        return;
      }

      try {
        document.getElementById("btnUploadDrive").classList.remove("hidden");
        await fetchUserEmail();
        updateDriveStatus(true, "Đã kết nối");

        fetchAndDisplaySheetName();
        fetchAndDisplayFolderName();
        resolve(true);
      } catch (err) {
        updateDriveStatus(true, "Đã kết nối (Lỗi lấy Profile)");
        resolve(true);
      }
    };

    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      tokenClient.requestAccessToken({ prompt: "" });
    }
  });
}

function updateDriveStatus(isConnected, message) {
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("statusText");
  const btnConnect = document.getElementById("btn-connect-drive");
  const connectedEmailEl = document.getElementById("connectedEmail");

  const currentLang = localStorage.getItem("preferredLanguage") || "vi";
  const t = translations[currentLang] || translations["vi"];

  if (isConnected) {
    statusDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500";
    statusText.innerText =
      message && message !== "Đã kết nối" ? message : t.connected;
    statusText.className = "text-emerald-600 dark:text-emerald-400 font-medium";
    btnConnect.innerText =
      currentLang === "vi" ? "Đổi tài khoản" : "Change Account";

    if (connectedEmailEl) {
      connectedEmailEl.classList.remove("hidden");
    }
  } else {
    statusDot.className = "w-2.5 h-2.5 rounded-full bg-rose-500";
    statusText.innerText =
      message && message !== "Chưa kết nối" ? message : t.notConnected;
    statusText.className = "text-rose-500 font-medium";
    btnConnect.innerText = t.connect;

    if (connectedEmailEl) {
      connectedEmailEl.innerHTML = "";
      connectedEmailEl.classList.add("hidden");
    }
  }
}

async function fetchUserEmail() {
  const connectedEmailEl = document.getElementById("connectedEmail");
  if (!connectedEmailEl) return;

  const tokenObj = gapi.client.getToken();
  if (!tokenObj || !tokenObj.access_token) {
    connectedEmailEl.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenObj.access_token}`,
        },
      },
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.email) {
        const avatarHtml = data.picture
          ? `<img src="${data.picture}" alt="Avatar" class="w-4 h-4 rounded-full object-cover border border-gray-300 dark:border-gray-600">`
          : "";

        connectedEmailEl.innerHTML = `
                    <div class="flex items-center gap-1.5">
                        ${avatarHtml}
                        <span>Email: <strong>${data.email}</strong></span>
                    </div>
                `;
        return;
      }
    }
    connectedEmailEl.innerHTML = "";
  } catch (err) {
    console.error("Lỗi khi fetch Email người dùng:", err.message || err);
    connectedEmailEl.innerHTML = "";
  }
}

function clearInput(id) {
  document.getElementById(id).value = "";
  saveConfigToStorage();
  const targetDisplay =
    id === "sheetId" ? "sheetNameDisplay" : "folderNameDisplay";
  const displayEl = document.getElementById(targetDisplay);
  if (displayEl) {
    displayEl.innerHTML = "";
    displayEl.removeAttribute("data-error-type");
    displayEl.removeAttribute("data-status");
  }

  if (id === "clientId" || id === "apiKey") {
    if (typeof gapi !== "undefined" && gapi.client) {
      gapi.client.setToken(null);
    }
    updateDriveStatus(false, "Chưa kết nối");
    const btnUploadDrive = document.getElementById("btnUploadDrive");
    if (btnUploadDrive) {
      btnUploadDrive.classList.add("hidden");
    }
  }
}

/**
 * XỬ LÝ HIỂN THỊ FILE SHEETS KÈM ĐÁNH DẤU TRẠNG THÁI ĐỂ ĐỔI NGÔN NGỮ TỨC THÌ
 */
async function fetchAndDisplaySheetName() {
  const sheetIdInput = document.getElementById("sheetId");
  const sheetNameDisplay = document.getElementById("sheetNameDisplay");

  if (!sheetIdInput || !sheetNameDisplay) return;

  const sheetId = sheetIdInput.value.trim();
  const currentLang = localStorage.getItem("preferredLanguage") || "vi";
  const t = translations[currentLang] || translations["vi"];

  if (!sheetId) {
    sheetNameDisplay.innerHTML = "";
    sheetNameDisplay.removeAttribute("data-error-type");
    sheetNameDisplay.removeAttribute("data-status");
    return;
  }

  const token = gapi.client.getToken();
  if (!token) {
    sheetNameDisplay.innerHTML = "";
    return;
  }

  try {
    sheetNameDisplay.setAttribute("data-status", "fetching");
    sheetNameDisplay.removeAttribute("data-error-type");
    sheetNameDisplay.innerHTML = `<span class="text-gray-400 animate-pulse">${t.fetchingSheet || "🔍 Checking..."}</span>`;

    const response = await gapi.client.drive.files.get({
      fileId: sheetId,
      fields: "name",
    });

    sheetNameDisplay.removeAttribute("data-status");
    const fileName = response.result.name;
    sheetNameDisplay.innerHTML = `📊 <span class="font-bold tracking-wide text-emerald-700 dark:text-emerald-400 uppercase">${fileName}</span>`;
  } catch (err) {
    console.error("Lỗi lấy tên Google Sheets:", err);
    sheetNameDisplay.setAttribute("data-error-type", "access-error");
    sheetNameDisplay.removeAttribute("data-status");
    sheetNameDisplay.innerHTML = `<span class="text-rose-500 font-medium">${t.sheetErrorAccess}</span>`;
  }
}

/**
 * XỬ LÝ HIỂN THỊ THƯ MỤC KÈM ĐÁNH DẤU TRẠNG THÁI ĐỂ ĐỔI NGÔN NGỮ TỨC THÌ
 */
async function fetchAndDisplayFolderName() {
  const folderIdInput = document.getElementById("folderId");
  const folderNameDisplay = document.getElementById("folderNameDisplay");

  if (!folderIdInput || !folderNameDisplay) return;

  let rawValue = folderIdInput.value.trim();
  const currentLang = localStorage.getItem("preferredLanguage") || "vi";
  const t = translations[currentLang] || translations["vi"];

  if (!rawValue) {
    folderNameDisplay.innerHTML = "";
    folderNameDisplay.removeAttribute("data-error-type");
    folderNameDisplay.removeAttribute("data-status");
    return;
  }

  const token = gapi.client.getToken();
  if (!token) {
    folderNameDisplay.innerHTML = "";
    return;
  }

  let currentId = rawValue;
  const driveUrlRegex = /(?:folders\/|id=)([a-zA-Z0-9-_]{25,})/;
  const match = rawValue.match(driveUrlRegex);
  if (match && match) {
    currentId = match;
  }

  try {
    folderNameDisplay.setAttribute("data-status", "fetching");
    folderNameDisplay.removeAttribute("data-error-type");
    folderNameDisplay.innerHTML = `<span class="text-gray-400 animate-pulse">${t.buildingTree || "🔍 Checking..."}</span>`;

    let pathParts = [];
    let maxDepth = 6;

    while (currentId && maxDepth > 0) {
      if (currentId === "root") {
        break;
      }

      const response = await gapi.client.drive.files.get({
        fileId: currentId,
        fields: "id, name, parents",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      const fileData = response.result;
      if (
        fileData.name &&
        fileData.name.trim() !== "My Drive" &&
        fileData.name.trim() !== "Thư mục của tôi"
      ) {
        pathParts.unshift(fileData.name);
      }

      if (fileData.parents && fileData.parents.length > 0) {
        currentId = fileData.parents;
      } else {
        currentId = null;
      }
      maxDepth--;
    }

    pathParts.unshift("My Drive");
    folderNameDisplay.removeAttribute("data-status");
    const fullBreadcrumb = pathParts.join(" > ");
    folderNameDisplay.innerHTML = `📁 <span class="text-emerald-600 dark:text-emerald-400 font-bold">${fullBreadcrumb}</span>`;
  } catch (err) {
    console.error("Lỗi xây dựng Breadcrumb thư mục:", err);
    folderNameDisplay.setAttribute("data-error-type", "access-error");
    folderNameDisplay.removeAttribute("data-status");
    folderNameDisplay.innerHTML = `<span class="text-rose-500 font-medium">${t.folderErrorAccess}</span>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const inputs = ["clientId", "apiKey", "sheetId", "folderId"];
  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", saveConfigToStorage);
    }
  });

  const sheetIdInput = document.getElementById("sheetId");
  if (sheetIdInput) {
    sheetIdInput.addEventListener("input", fetchAndDisplaySheetName);
  }

  const folderIdInput = document.getElementById("folderId");
  if (folderIdInput) {
    folderIdInput.addEventListener("input", fetchAndDisplayFolderName);
  }

  // 4. TỰ ĐỘNG CẮT LẤY 6 KÝ TỰ CUỐI KHI NHẬP MÃ CODE VÀ KIỂM TRA GOOGLE SHEETS ID
  const codeInput = document.getElementById("codeInput");
  if (codeInput) {
    codeInput.addEventListener("input", (e) => {
      let value = e.target.value.trim();

      // Giữ nguyên logic cắt lấy 6 ký tự cuối của bạn
      if (value.length > 6) {
        value = value.slice(-6);
        e.target.value = value;
      }

      // Kiểm tra khi chuỗi nhập vào đạt vừa đủ 6 ký tự
      if (value.length === 6) {
        const sheetIdValue = sheetIdInput ? sheetIdInput.value.trim() : "";

        // Nếu ô Google Sheets ID đang trống thì hiện modal thông báo lỗi đa ngôn ngữ
        if (!sheetIdValue) {
          showCustomAlert("errorSheetIdMissing", "error");
        }
      }
    });
  }
});

// =========================================================================
// --- TÍNH NĂNG: LOGIC MODAL FOLDER EXPLORER (TÌM KIẾM TOÀN CỤC DRIVE) ---
// =========================================================================
let currentFolderId = "root";
let currentFolderName = "My Drive";
let folderHistory = [{ id: "root", name: "My Drive" }];
let searchTimeout = null; // Biến phục vụ kỹ thuật Debounce hoãn gọi API liên tục
let isSearchingMode = false; // Biến kiểm soát trạng thái đang tìm kiếm toàn cục

/**
 * Hàm mở Modal Explorer (Gắn với nút id="btn-open-picker")
 */
async function showPicker() {
  const token = gapi.client.getToken();
  if (!token) {
    showCustomAlert("needConnect", "error");
    return;
  }

  const modal = document.getElementById("folderExplorerModal");
  if (modal) {
    modal.classList.remove("hidden");

    // Reset trạng thái ban đầu khi mở lên
    clearModalSearch();
    currentFolderId = "root";
    currentFolderName = "My Drive";
    folderHistory = [{ id: "root", name: "My Drive" }];

    await loadSubFolders(currentFolderId);

    setTimeout(() => {
      modal.onclick = (e) => {
        if (e.target === modal) {
          closeFolderExplorer();
        }
      };
    }, 0);

    // BỔ SUNG: Lắng nghe sự kiện click vào vùng nền tối để tự đóng modal
    // Xóa sự kiện cũ nếu có để tránh trùng lặp
    modal.onclick = null;
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeFolderExplorer();
      }
    };
  }
}

/**
 * Đóng Modal Explorer
 */
function closeFolderExplorer() {
  const modal = document.getElementById("folderExplorerModal");
  if (modal) modal.classList.add("hidden");
}

/**
 * Tải danh sách các thư mục con theo cấu trúc thư mục hiện tại
 * @param {string} parentId - ID của thư mục cha
 */
async function loadSubFolders(parentId) {
  const loader = document.getElementById("modalLoader");
  const container = document.getElementById("folderListContainer");
  const emptyMsg = document.getElementById("emptyFolderMsg");

  if (!container || !loader || !emptyMsg) return;

  isSearchingMode = false;
  container.innerHTML = "";
  loader.classList.remove("hidden");
  emptyMsg.classList.add("hidden");

  const currentSelectedTxt = document.getElementById(
    "currentSelectedFolderName",
  );
  if (currentSelectedTxt) currentSelectedTxt.innerText = currentFolderName;

  renderModalBreadcrumb();

  try {
    const response = await gapi.client.drive.files.list({
      q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name)",
      orderBy: "name",
      pageSize: 150,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const folders = response.result.files || [];
    loader.classList.add("hidden");
    renderFoldersList(folders);
  } catch (err) {
    console.error("Lỗi khi tải cấu trúc thư mục con từ Google Drive API:", err);
    loader.classList.add("hidden");
    container.innerHTML = `<li class="text-center py-5 text-sm text-rose-500 font-medium">Không thể truy cập dữ liệu thư mục này hoặc phiên làm việc đã hết hạn.</li>`;
  }
}

/**
 * Hàm vẽ danh sách các thư mục ra giao diện Modal
 * @param {Array} folders - Danh sách mảng các thư mục cần vẽ
 */
function renderFoldersList(folders) {
  const container = document.getElementById("folderListContainer");
  const emptyMsg = document.getElementById("emptyFolderMsg");

  if (!container || !emptyMsg) return;
  container.innerHTML = "";

  if (folders.length === 0) {
    emptyMsg.classList.remove("hidden");
    return;
  }
  emptyMsg.classList.add("hidden");

  folders.forEach((folder) => {
    const li = document.createElement("li");
    li.className =
      "flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer rounded-lg group transition animate__animated animate__fadeIn animate__faster";

    // Khi bấm vào thư mục, đi sâu vào bên trong thư mục đó
    li.onclick = () => navigateToFolder(folder.id, folder.name);

    li.innerHTML = `
            <div class="flex items-center gap-3 truncate">
                <span class="text-xl">📁</span>
                <div class="flex flex-col truncate">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primaryBlue truncate">${folder.name}</span>
                    ${isSearchingMode ? `<span class="text-[10px] text-gray-400 italic">Tìm kiếm toàn cục trên Drive</span>` : ""}
                </div>
            </div>
            <span class="text-xs text-gray-400 group-hover:text-primaryBlue font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">➔</span>
        `;
    container.appendChild(li);
  });
}

/**
 * Hàm tiếp nhận ký tự từ thanh input và áp dụng Debounce hoãn gọi API
 */
function handleSearchInput(value) {
  const btnReset = document.getElementById("btnResetSearch");
  const keyword = value.trim();

  // Ẩn/Hiện dấu x xóa nhanh từ khóa
  if (keyword.length > 0) {
    if (btnReset) btnReset.classList.remove("hidden");
  } else {
    if (btnReset) btnReset.classList.add("hidden");
    // Nếu người dùng xóa hết chữ, trả về danh sách thư mục con bình thường
    loadSubFolders(currentFolderId);
    return;
  }

  // Xóa bộ đếm thời gian cũ nếu người dùng đang gõ dở dang
  clearTimeout(searchTimeout);

  // Người dùng dừng gõ 500ms mới bắt đầu kích hoạt quét toàn cục
  searchTimeout = setTimeout(() => {
    searchFoldersGlobal(keyword);
  }, 500);
}

/**
 * Gọi API Google Drive tìm kiếm thư mục TOÀN CỤC theo tên
 * @param {string} keyword - Từ khóa tìm kiếm
 */
async function searchFoldersGlobal(keyword) {
  const loader = document.getElementById("modalLoader");
  const container = document.getElementById("folderListContainer");
  const emptyMsg = document.getElementById("emptyFolderMsg");
  const bcContainer = document.getElementById("modalBreadcrumb");

  if (!container || !loader || !emptyMsg) return;

  isSearchingMode = true;
  container.innerHTML = "";
  loader.classList.remove("hidden");
  emptyMsg.classList.add("hidden");

  // Đổi hiển thị breadcrumb thành text báo trạng thái tìm kiếm
  if (bcContainer) {
    bcContainer.innerHTML = `<span class="text-gray-400 italic">Kết quả tìm kiếm toàn cục: "${keyword}"</span>`;
  }

  try {
    // Truy vấn q tìm tên chứa từ khóa trên toàn bộ các folder không nằm trong thùng rác
    const response = await gapi.client.drive.files.list({
      q: `mimeType = 'application/vnd.google-apps.folder' and name contains '${keyword.replace(/'/g, "\\'")}' and trashed = false`,
      fields: "files(id, name)",
      orderBy: "name",
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const globalFolders = response.result.files || [];
    loader.classList.add("hidden");
    renderFoldersList(globalFolders);
  } catch (err) {
    console.error("Lỗi khi tìm kiếm toàn cục:", err);
    loader.classList.add("hidden");
    container.innerHTML = `<li class="text-center py-5 text-sm text-rose-500 font-medium">Đã xảy ra lỗi trong quá trình quét dữ liệu Drive toàn cục.</li>`;
  }
}

/**
 * Xóa trắng từ khóa tìm kiếm và khôi phục trạng thái danh sách thường
 */
function clearModalSearch() {
  const searchInput = document.getElementById("modalSearchInput");
  const btnReset = document.getElementById("btnResetSearch");

  if (searchInput) searchInput.value = "";
  if (btnReset) btnReset.classList.add("hidden");

  if (isSearchingMode) {
    loadSubFolders(currentFolderId);
  }
}

/**
 * Hàm điều hướng cây thư mục
 */
function navigateToFolder(id, name) {
  currentFolderId = id;
  currentFolderName = name;

  // Nếu đang ở chế độ tìm kiếm toàn cục mà người dùng click chọn thư mục nào đó,
  // ta sẽ biến thư mục đó thành thư mục con hiện tại để họ duyệt sâu tiếp vào bên trong.
  if (isSearchingMode) {
    folderHistory = [
      { id: "root", name: "My Drive" },
      { id: id, name: name },
    ];
  } else {
    const index = folderHistory.findIndex((item) => item.id === id);
    if (index !== -1) {
      folderHistory = folderHistory.slice(0, index + 1);
    } else {
      folderHistory.push({ id, name });
    }
  }

  loadSubFolders(currentFolderId);
}

/**
 * Vẽ thanh Breadcrumb đường dẫn
 */
function renderModalBreadcrumb() {
  const bcContainer = document.getElementById("modalBreadcrumb");
  if (!bcContainer || isSearchingMode) return;
  bcContainer.innerHTML = "";

  folderHistory.forEach((item, idx) => {
    const span = document.createElement("span");
    span.className =
      "cursor-pointer font-medium hover:underline transition " +
      (idx === folderHistory.length - 1
        ? "text-gray-800 dark:text-gray-200 font-bold pointer-events-none"
        : "text-primaryBlue");
    span.innerText = item.name;
    span.onclick = (e) => {
      e.stopPropagation();
      navigateToFolder(item.id, item.name);
    };

    bcContainer.appendChild(span);

    if (idx < folderHistory.length - 1) {
      const separator = document.createElement("span");
      separator.className = "text-gray-400 px-1 select-none";
      separator.innerText = ">";
      bcContainer.appendChild(separator);
    }
  });
}

/**
 * Nút xác nhận: Đẩy Folder ID vào input và tắt modal
 */
function confirmSelectFolder() {
  const folderIdInput = document.getElementById("folderId");
  if (folderIdInput) {
    folderIdInput.value = currentFolderId;
    saveConfigToStorage();
    fetchAndDisplayFolderName();
    closeFolderExplorer();
  }
}

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
