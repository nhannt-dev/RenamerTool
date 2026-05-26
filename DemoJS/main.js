document.addEventListener("DOMContentLoaded", () => {
  const splashScreen = document.getElementById("splash-screen");
  const splashBar = document.getElementById("splash-bar");
  const mainApp = document.getElementById("main-app");

  // --- CẤU HÌNH DELAY TẠI ĐÂY ---
  const DELAY_AFTER_LOAD = 2500;  // Thời gian chờ (miligiây) sau khi đạt 100% rồi mới ẩn Splash
  const PROGRESS_SPEED = 10;      // Số càng nhỏ, thanh tiến trình chạy giả lập càng chậm lúc đầu
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
    "btnClearAll": t.clearAll,
    "btnUploadText": t.uploadButton,
    "modalTitle": t.modalTitle,
    "opt-light": t.themeLight,
    "opt-dark": t.themeDark,
    "opt-device": t.themeDevice
  };

  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("statusText");
  const btnConnect = document.getElementById("btn-connect-drive");

  if (statusDot && statusText && btnConnect) {
    const isNotConnected = statusDot.classList.contains("bg-gray-400") || statusDot.classList.contains("bg-gray-500") || statusDot.classList.contains("bg-rose-500");
    
    if (isNotConnected) {
      statusText.textContent = t.notConnected; 
      btnConnect.textContent = t.connect;      
    } else {
      statusText.textContent = t.connected;    
      btnConnect.textContent = lang === 'vi' ? "Đổi tài khoản" : "Change Account";    
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

  // Cập nhật các Placeholder cho các thẻ Input
  const placeholders = {
    "clientId": t.placeholderClientId,
    "apiKey": t.placeholderApiKey,
    "sheetId": t.placeholderSheet,
    "folderId": t.placeholderFolder,
  };

  for (const [id, value] of Object.entries(placeholders)) {
    const inputEl = document.getElementById(id);
    if (inputEl) {
      inputEl.setAttribute("placeholder", value);
    }
  }

  // CẬP NHẬT CHUYỂN NGỮ LỖI TỨC THÌ QUA ATTRIBUTE (Không đợi gọi lại API)
  const sheetNameDisplay = document.getElementById('sheetNameDisplay');
  if (sheetNameDisplay && sheetNameDisplay.getAttribute('data-error-type') === 'access-error') {
    sheetNameDisplay.innerHTML = `<span class="text-rose-500 font-medium">${t.sheetErrorAccess}</span>`;
  } else if (sheetNameDisplay && sheetNameDisplay.getAttribute('data-status') === 'fetching') {
    sheetNameDisplay.innerHTML = `<span class="text-gray-400 animate-pulse">${t.fetchingSheet || "🔍 Checking..."}</span>`;
  }

  const folderNameDisplay = document.getElementById('folderNameDisplay');
  if (folderNameDisplay && folderNameDisplay.getAttribute('data-error-type') === 'access-error') {
    folderNameDisplay.innerHTML = `<span class="text-rose-500 font-medium">${t.folderErrorAccess}</span>`;
  } else if (folderNameDisplay && folderNameDisplay.getAttribute('data-status') === 'fetching') {
    folderNameDisplay.innerHTML = `<span class="text-gray-400 animate-pulse">${t.buildingTree || "🔍 Checking..."}</span>`;
  }

  // Giữ nguyên email cố định chữ "Email: "
  fetchUserEmail();

  localStorage.setItem("preferredLanguage", lang);
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

const themeSelector = document.getElementById('themeSelector');
const htmlEl = document.documentElement;

function applyTheme(theme) {
  if (theme === 'dark') {
    htmlEl.classList.add('dark');
    htmlEl.setAttribute('data-theme', 'dark');
    htmlEl.style.colorScheme = 'dark'; 
  } else {
    htmlEl.classList.remove('dark');
    htmlEl.setAttribute('data-theme', 'light');
    htmlEl.style.colorScheme = 'light';
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('app-theme') || 'device';
  
  if (themeSelector && themeSelector.value !== savedTheme) {
    themeSelector.value = savedTheme;
  }

  if (savedTheme === 'device') {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(systemPrefersDark ? 'dark' : 'light');
  } else {
    applyTheme(savedTheme);
  }
}

if (themeSelector) {
  themeSelector.addEventListener('change', (e) => {
    localStorage.setItem('app-theme', e.target.value);
    initTheme();
  });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const savedTheme = localStorage.getItem('app-theme') || 'device';
  if (savedTheme === 'device') {
    initTheme();
  }
});

initTheme();

const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

let tokenClient;
let gapiInited = false;
let gisiInited = false;

window.addEventListener('load', () => {
    loadConfigFromStorage(); 
    gapiLoad();              
    gisLoad();
});

function saveConfigToStorage() {
    localStorage.setItem('clientId', document.getElementById('clientId').value.trim());
    localStorage.setItem('apiKey', document.getElementById('apiKey').value.trim());
    localStorage.setItem('sheetId', document.getElementById('sheetId').value.trim());
    localStorage.setItem('folderId', document.getElementById('folderId').value.trim());
}

function loadConfigFromStorage() {
    if (localStorage.getItem('clientId')) document.getElementById('clientId').value = localStorage.getItem('clientId');
    if (localStorage.getItem('apiKey')) document.getElementById('apiKey').value = localStorage.getItem('apiKey');
    if (localStorage.getItem('sheetId')) document.getElementById('sheetId').value = localStorage.getItem('sheetId');
    if (localStorage.getItem('folderId')) document.getElementById('folderId').value = localStorage.getItem('folderId');
}

function gapiLoad() {
    gapi.load('client', async () => {
        try {
            const apiKey = document.getElementById('apiKey').value;
            await gapi.client.init({
                apiKey: apiKey,
                discoveryDocs: DISCOVERY_DOCS,
            });
            gapiInited = true;
            checkBeforeAuth();
        } catch (err) {
            console.error('Lỗi khởi tạo GAPI:', err);
            updateDriveStatus(false, 'Lỗi GAPI');
        }
    });
}

function gisLoad() {
    const clientId = document.getElementById('clientId').value;
    if (!clientId) return;

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: '', 
    });
    gisiInited = true;
    checkBeforeAuth();
}

function checkBeforeAuth() {
    const btnConnect = document.getElementById('btn-connect-drive');
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

    const clientId = document.getElementById('clientId').value;
    const apiKey = document.getElementById('apiKey').value;

    if (!clientId || !apiKey) {
        alert('Vui lòng nhập đầy đủ Client ID và API Key!');
        return false;
    }

    if (!gisiInited) {
        gisLoad();
    }

    return new Promise((resolve) => {
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                updateDriveStatus(false, 'Kết nối thất bại');
                console.error(resp);
                resolve(false);
                return;
            }
            
            try {
                document.getElementById('btnUploadDrive').classList.remove('hidden');
                await fetchUserEmail();
                updateDriveStatus(true, 'Đã kết nối');
                
                fetchAndDisplaySheetName();
                fetchAndDisplayFolderName();
                resolve(true);
            } catch (err) {
                updateDriveStatus(true, 'Đã kết nối (Lỗi lấy Profile)');
                resolve(true);
            }
        };

        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
}

function updateDriveStatus(isConnected, message) {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('statusText');
    const btnConnect = document.getElementById('btn-connect-drive');

    const currentLang = localStorage.getItem("preferredLanguage") || "vi";
    const t = translations[currentLang] || translations['vi'];

    if (isConnected) {
        statusDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500"; 
        statusText.innerText = (message && message !== 'Đã kết nối') ? message : t.connected;
        statusText.className = "text-emerald-600 dark:text-emerald-400 font-medium";
        btnConnect.innerText = currentLang === 'vi' ? "Đổi tài khoản" : "Change Account";
    } else {
        statusDot.className = "w-2.5 h-2.5 rounded-full bg-rose-500"; 
        statusText.innerText = (message && message !== 'Chưa kết nối') ? message : t.notConnected;
        statusText.className = "text-rose-500 font-medium";
        btnConnect.innerText = t.connect;
        
        const connectedEmailEl = document.getElementById('connectedEmail');
        if (connectedEmailEl) {
            connectedEmailEl.innerHTML = '';
        }
    }
}

async function fetchUserEmail() {
    const connectedEmailEl = document.getElementById('connectedEmail');
    if (!connectedEmailEl) return;

    const tokenObj = gapi.client.getToken();
    if (!tokenObj || !tokenObj.access_token) {
        connectedEmailEl.innerHTML = '';
        return;
    }

    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${tokenObj.access_token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.email) {
                const avatarHtml = data.picture 
                    ? `<img src="${data.picture}" alt="Avatar" class="w-4 h-4 rounded-full object-cover border border-gray-300 dark:border-gray-600">` 
                    : '';
                
                connectedEmailEl.innerHTML = `
                    <div class="flex items-center gap-1.5">
                        ${avatarHtml}
                        <span>Email: <strong>${data.email}</strong></span>
                    </div>
                `;
                return;
            }
        }
        connectedEmailEl.innerHTML = '';
    } catch (err) {
        console.error('Lỗi khi fetch Email người dùng:', err.message || err);
        connectedEmailEl.innerHTML = '';
    }
}

function clearInput(id) {
    document.getElementById(id).value = '';
    saveConfigToStorage();
    const targetDisplay = id === 'sheetId' ? 'sheetNameDisplay' : 'folderNameDisplay';
    const displayEl = document.getElementById(targetDisplay);
    if (displayEl) {
        displayEl.innerHTML = '';
        displayEl.removeAttribute('data-error-type');
        displayEl.removeAttribute('data-status');
    }
}

/**
 * XỬ LÝ HIỂN THỊ FILE SHEETS KÈM ĐÁNH DẤU TRẠNG THÁI ĐỂ ĐỔI NGÔN NGỮ TỨC THÌ
 */
async function fetchAndDisplaySheetName() {
    const sheetIdInput = document.getElementById('sheetId');
    const sheetNameDisplay = document.getElementById('sheetNameDisplay');
    
    if (!sheetIdInput || !sheetNameDisplay) return;

    const sheetId = sheetIdInput.value.trim();
    const currentLang = localStorage.getItem("preferredLanguage") || "vi";
    const t = translations[currentLang] || translations['vi'];

    if (!sheetId) {
        sheetNameDisplay.innerHTML = '';
        sheetNameDisplay.removeAttribute('data-error-type');
        sheetNameDisplay.removeAttribute('data-status');
        return;
    }

    const token = gapi.client.getToken();
    if (!token) {
        sheetNameDisplay.innerHTML = '';
        return;
    }

    try {
        sheetNameDisplay.setAttribute('data-status', 'fetching');
        sheetNameDisplay.removeAttribute('data-error-type');
        sheetNameDisplay.innerHTML = `<span class="text-gray-400 animate-pulse">${t.fetchingSheet || "🔍 Checking..."}</span>`;
        
        const response = await gapi.client.drive.files.get({
            fileId: sheetId,
            fields: 'name'
        });

        sheetNameDisplay.removeAttribute('data-status');
        const fileName = response.result.name;
        sheetNameDisplay.innerHTML = `📊 <span class="font-bold tracking-wide text-emerald-700 dark:text-emerald-400 uppercase">${fileName}</span>`;
        
    } catch (err) {
        console.error('Lỗi lấy tên Google Sheets:', err);
        // Đóng dấu có lỗi để chuyển ngữ ngay lập tức khi click select box
        sheetNameDisplay.setAttribute('data-error-type', 'access-error');
        sheetNameDisplay.removeAttribute('data-status');
        sheetNameDisplay.innerHTML = `<span class="text-rose-500 font-medium">${t.sheetErrorAccess}</span>`;
    }
}

/**
 * XỬ LÝ HIỂN THỊ THƯ MỤC KÈM ĐÁNH DẤU TRẠNG THÁI ĐỂ ĐỔI NGÔN NGỮ TỨC THÌ
 */
async function fetchAndDisplayFolderName() {
    const folderIdInput = document.getElementById('folderId');
    const folderNameDisplay = document.getElementById('folderNameDisplay');
    
    if (!folderIdInput || !folderNameDisplay) return;

    let rawValue = folderIdInput.value.trim();
    const currentLang = localStorage.getItem("preferredLanguage") || "vi";
    const t = translations[currentLang] || translations['vi'];

    if (!rawValue) {
        folderNameDisplay.innerHTML = '';
        folderNameDisplay.removeAttribute('data-error-type');
        folderNameDisplay.removeAttribute('data-status');
        return;
    }

    const token = gapi.client.getToken();
    if (!token) {
        folderNameDisplay.innerHTML = '';
        return;
    }

    let currentId = rawValue;
    const driveUrlRegex = /(?:folders\/|id=)([a-zA-Z0-9-_]{25,})/;
    const match = rawValue.match(driveUrlRegex);
    if (match && match) {
        currentId = match;
    }

    try {
        folderNameDisplay.setAttribute('data-status', 'fetching');
        folderNameDisplay.removeAttribute('data-error-type');
        folderNameDisplay.innerHTML = `<span class="text-gray-400 animate-pulse">${t.buildingTree || "🔍 Checking..."}</span>`;
        
        let pathParts = [];
        let maxDepth = 6; 

        while (currentId && maxDepth > 0) {
            if (currentId === 'root') {
                break;
            }

            const response = await gapi.client.drive.files.get({
                fileId: currentId,
                fields: 'id, name, parents',
                supportsAllDrives: true,
                includeItemsFromAllDrives: true
            });

            const fileData = response.result;
            if (fileData.name && fileData.name.trim() !== "My Drive" && fileData.name.trim() !== "Thư mục của tôi") {
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
        folderNameDisplay.removeAttribute('data-status');
        const fullBreadcrumb = pathParts.join(" > ");
        folderNameDisplay.innerHTML = `📁 <span class="text-emerald-600 dark:text-emerald-400 font-bold">${fullBreadcrumb}</span>`;
        
    } catch (err) {
        console.error('Lỗi xây dựng Breadcrumb thư mục:', err);
        // Đóng dấu có lỗi để chuyển ngữ ngay lập tức khi click select box
        folderNameDisplay.setAttribute('data-error-type', 'access-error');
        folderNameDisplay.removeAttribute('data-status');
        folderNameDisplay.innerHTML = `<span class="text-rose-500 font-medium">${t.folderErrorAccess}</span>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const inputs = ['clientId', 'apiKey', 'sheetId', 'folderId'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', saveConfigToStorage);
        }
    });

    const sheetIdInput = document.getElementById('sheetId');
    if (sheetIdInput) {
        sheetIdInput.addEventListener('input', fetchAndDisplaySheetName);
    }

    const folderIdInput = document.getElementById('folderId');
    if (folderIdInput) {
        folderIdInput.addEventListener('input', fetchAndDisplayFolderName);
    }
});