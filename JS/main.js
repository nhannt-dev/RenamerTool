// Khai báo đối tượng Audio toàn cục và biến cờ kiểm soát âm thanh khi kết nối lần đầu
let globalAudio = new Audio();
window.isFirstConnectSoundPlayed = false;

const SCOPES =
  "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email";

// Dùng URL dạng này để Google API Client tự load chính xác v4 mà không lo lỗi 404
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
  "https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest",
];

let tokenClient;
let gapiInited = false;
let gisiInited = false;

window.addEventListener("load", () => {
  loadConfigFromStorage();
  gapiLoad();
  gisLoad();

  window.addEventListener("keydown", handleShortcutConnect);
});

/**
 * Hàm xử lý phím tắt Alt + C hoặc Option + C
 */
function handleShortcutConnect(event) {
  // 1. Nếu đang gõ trong ô Input hoặc Textarea thì bỏ qua để không bị lỗi khi nhập liệu
  if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
    return;
  }

  // 2. Sử dụng event.code === 'KeyC' để nhận diện chuẩn xác phím C vật lý
  if (event.altKey && event.code === 'KeyC') {
    // Ngăn chặn ngay lập tức hành vi mở Menu mặc định của phím Alt trên trình duyệt
    event.preventDefault();
    event.stopPropagation();

    console.log("-> Đã kích hoạt phím tắt Alt+C / Option+C thành công!");

    // 3. Gọi trực tiếp hàm xử lý click có sẵn trong file main.txt của bạn
    handleAuthClick();
  }
}

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

    toggleNamingSection(true);

    // Hiển thị dropdown và xử lý tự động phát khi tải lại trang thành công
    const soundSelector = document.getElementById("soundSelector");
    if (soundSelector) {
      soundSelector.classList.remove("hidden");
      
      const savedSound = localStorage.getItem("preferredSound") || "none";
      soundSelector.value = savedSound; // Đồng bộ lại giao diện dropdown từ localStorage

      if (!window.isFirstConnectSoundPlayed) {
        window.isFirstConnectSoundPlayed = true; // Đánh dấu đã phát xong âm thanh chào mừng

        if (savedSound != "none") {
          playWelcomeSound(savedSound);
        }
      }
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

    toggleNamingSection(false);

    // BỔ SUNG: Ẩn dropdown âm thanh và reset cờ khi ngắt kết nối
    const soundSelector = document.getElementById("soundSelector");
    if (soundSelector) {
      soundSelector.classList.add("hidden");
    }
    window.isFirstConnectSoundPlayed = false;
  }
}

async function fetchUserEmail() {
  const connectedEmailEl = document.getElementById("connectedEmail");
  if (!connectedEmailEl) return;

  // SỬA TẠI ĐÂY: Kiểm tra an toàn trước khi gọi getToken()
  if (!gapi || !gapi.client || typeof gapi.client.getToken !== "function") {
    connectedEmailEl.innerHTML = "";
    return;
  }

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

      const statusSpan = document.getElementById("sheetCodeStatus");
      const errorMsgDiv = document.getElementById("sheetCodeErrorMessage");

      // Kiểm tra khi chuỗi nhập vào đạt vừa đủ 6 ký tự
      if (value.length === 6) {
        const sheetIdValue = sheetIdInput ? sheetIdInput.value.trim() : "";

        // Nếu ô Google Sheets ID đang trống thì hiện modal thông báo lỗi đa ngôn ngữ
        if (!sheetIdValue) {
          showCustomAlert("errorSheetIdMissing", "error");
          if (statusSpan) statusSpan.innerHTML = "❌";
        } else {
          checkCodeInGoogleSheets(value);
        }
      } else {
        if (statusSpan) statusSpan.innerHTML = "";
        if (errorMsgDiv) errorMsgDiv.classList.add("hidden");
      }
    });
  }

  // BỔ SUNG: Khởi tạo giá trị ban đầu và sự kiện Change cho dropdown âm thanh
  const soundSelector = document.getElementById("soundSelector");
  if (soundSelector) {
    const savedSound = localStorage.getItem("preferredSound") || "none";
    soundSelector.value = savedSound;
    
    soundSelector.addEventListener("change", (e) => {
      const selectedSound = e.target.value;
      localStorage.setItem("preferredSound", selectedSound);

      if (selectedSound === "none") {
        globalAudio.pause();
        globalAudio.currentTime = 0;
      } else {
        globalAudio.pause();
        globalAudio.src = `Sounds/${selectedSound}.mp3`;
        globalAudio.loop = false;
        globalAudio.play().catch(err => console.error("Lỗi khi phát thử âm thanh:", err));
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

// Thêm hàm này vào cuối file main.js của bạn
function toggleNamingSection(isConnected) {
  const targetSection = document.getElementById("naming-and-upload-section");
  if (!targetSection) return;

  if (isConnected) {
    // TRƯỜNG HỢP: ĐÃ KẾT NỐI SUCCESS
    if (targetSection.classList.contains("hidden")) {
      // Xóa class ẩn và class hiệu ứng ẩn cũ (nếu có)
      targetSection.classList.remove("hidden", "animate__fadeOutDown");
      // Thêm hiệu ứng trượt lên hiện ra
      targetSection.classList.add("animate__fadeInUp");
    }
  } else {
    // TRƯỜNG HỢP: CHƯA KẾT NỐI HOẶC BỊ NGẮT KẾT NỐI
    if (!targetSection.classList.contains("hidden")) {
      // Xóa hiệu ứng hiện ra cũ
      targetSection.classList.remove("animate__fadeInUp");
      // Thêm hiệu ứng trượt xuống ẩn đi
      targetSection.classList.add("animate__fadeOutDown");

      // Chờ hiệu ứng trượt xuống chạy hết 300ms rồi mới ẩn hẳn phần tử khỏi màn hình
      setTimeout(() => {
        if (targetSection.classList.contains("animate__fadeOutDown")) {
          targetSection.classList.add("hidden");
        }
      }, 300);
    }
  }
}

/**
 * Kiểm tra mã Code 6 ký tự có tồn tại trong Google Sheets hay không
 * @param {string} code - Mã 6 ký tự người dùng nhập (Ví dụ: 1985CB)
 */
async function checkCodeInGoogleSheets(code) {
  const sheetId = document.getElementById("sheetId").value.trim();
  const statusSpan = document.getElementById("sheetCodeStatus");
  const errorMsgDiv = document.getElementById("sheetCodeErrorMessage");

  if (!sheetId || !code || code.length !== 6) return;

  // Lấy ngôn ngữ hiện tại để thông báo lỗi nếu cần
  const currentLang = localStorage.getItem("preferredLanguage") || "vi";
  const t = translations[currentLang] || translations["vi"];

  try {
    // 1. Hiển thị trạng thái đang kiểm tra (Loader nhỏ)
    statusSpan.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-gray-300 border-t-primaryBlue rounded-full animate-spin"></span>`;
    if (errorMsgDiv) errorMsgDiv.classList.add("hidden");

    // 2. Gọi API lấy dữ liệu từ Sheet đầu tiên (Mặc định đọc từ ô A1 đến Z10000)
    // Bạn có thể thay đổi "Trang_Tính_1" thành tên cụ thể nếu muốn, dùng "A1:Z" để quét toàn bộ sheet
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "A1:Z10000",
    });

    const rows = response.result.values;

    if (!rows || rows.length === 0) {
      updateCodeStatusUI(false);
      return;
    }

    // 3. Duyệt qua tất cả các ô dữ liệu để tìm kiếm (Không phân biệt chữ hoa/thường)
    let isFound = false;
    const targetCode = code.toUpperCase();

    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows[i].length; j++) {
        const cellValue = String(rows[i][j]).trim().toUpperCase();

        // Kiểm tra xem giá trị trong ô có kết thúc bằng 6 ký tự nhập vào không
        // Thỏa mãn cả "TK-1985CB" hay "TK1985CB" khi tìm kiếm bằng "1985CB"
        if (cellValue === targetCode || cellValue.endsWith(targetCode)) {
          isFound = true;
          break;
        }
      }
      if (isFound) break;
    }

    // 4. Cập nhật giao diện kết quả
    updateCodeStatusUI(isFound);
  } catch (err) {
    console.error("Lỗi khi truy vấn Google Sheets:", err);
    statusSpan.innerHTML = "❌";
    if (errorMsgDiv) {
      errorMsgDiv.innerText =
        t.sheetErrorAccess || "Lỗi truy cập dữ liệu Sheet!";
      errorMsgDiv.classList.remove("hidden");
    }
  }
}

/**
 * Cập nhật giao diện Tích xanh / X đỏ kế bên ô Code
 * @param {boolean} isSuccess
 */
function updateCodeStatusUI(isSuccess) {
  const statusSpan = document.getElementById("sheetCodeStatus");
  const errorMsgDiv = document.getElementById("sheetCodeErrorMessage");

  const currentLang = localStorage.getItem("preferredLanguage") || "vi";
  const t = translations[currentLang] || translations["vi"];

  if (isSuccess) {
    statusSpan.innerHTML = `<span class="inline-block text-base animate__animated animate__bounceIn">✅</span>`;
    if (errorMsgDiv) errorMsgDiv.classList.add("hidden");
  } else {
    statusSpan.innerHTML = `<span class="inline-block text-base animate__animated animate__bounceIn">❌</span>`;
    if (errorMsgDiv) {
      // Định nghĩa thêm câu thông báo trong file translations.js của bạn nếu muốn chuyên nghiệp hơn
      errorMsgDiv.classList.remove("hidden");
    }
  }
}
