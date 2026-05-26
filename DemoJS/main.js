document.addEventListener("DOMContentLoaded", () => {
  const splashScreen = document.getElementById("splash-screen");
  const splashBar = document.getElementById("splash-bar");
  const mainApp = document.getElementById("main-app");

  // --- CẤU HÌNH DELAY TẠI ĐÂY ---
  const DELAY_AFTER_LOAD = 2500;  // Thời gian chờ (miligiây) sau khi đạt 100% rồi mới ẩn Splash (800ms = 0.8 giây)
  const PROGRESS_SPEED = 10;      // Số càng nhỏ, thanh tiến trình chạy giả lập càng chậm lúc đầu
  // ------------------------------

  // 1. Chạy giả lập tiến trình mượt mà và chậm rãi khi nạp DOM
  let progress = 0;
  const progressInterval = setInterval(() => {
    if (progress < 85) {
      progress += Math.random() * PROGRESS_SPEED; 
      if (progress > 85) progress = 85;
      if (splashBar) splashBar.style.width = `${progress}%`;
    }
  }, 120); // Tăng nhẹ interval lên 120ms để chạy thong thả hơn

  // 2. Xử lý khi toàn bộ tài nguyên (scripts, css...) đã tải xong hẳn
  window.addEventListener("load", () => {
    clearInterval(progressInterval);
    
    // Đẩy lên 100% 
    if (splashBar) splashBar.style.width = "100%";

    // Tạo một khoảng delay "XÚI" theo ý bạn trước khi mở màn hình chính
    setTimeout(() => {
      if (splashScreen && mainApp) {
        // Ẩn splash screen bằng hiệu ứng CSS transition mượt mà
        splashScreen.classList.add("opacity-0", "pointer-events-none");
        
        // Hiện ứng dụng chính
        mainApp.classList.remove("opacity-0");
        mainApp.classList.add("opacity-100");

        // Xóa phần tử khỏi DOM sau khi hiệu ứng ẩn (500ms) kết thúc để giải phóng bộ nhớ
        setTimeout(() => {
          splashScreen.remove();
        }, 500);
      }
    }, DELAY_AFTER_LOAD); // Sử dụng biến cấu hình delay ở trên
  });
});

/**
 * Hàm thực hiện thay đổi ngôn ngữ hiển thị trên giao diện
 * @param {string} lang - Mã ngôn ngữ ('vi', 'en', 'th', 'ja', 'zh', 'fr')
 */
function changeLanguage(lang) {
  // 1. Kiểm tra xem mã ngôn ngữ có tồn tại trong file translations hay không
  if (!translations || !translations[lang]) {
    console.error(`Language '${lang}' not found in translations object.`);
    return;
  }

  const t = translations[lang];

  // 2. Định nghĩa bản đồ ánh xạ giữa Key trong dịch thuật và ID phần tử trên HTML
  const elementMapping = {
    "txt-title": t.title,
    "lbl-drive-config": t.driveConfig,
    "lbl-sheet-id": t.lblSheet,
    "lbl-folder-link": t.folderLink,
    "btn-connect-drive": t.connect, // Ghi chú: logic của bạn cần cập nhật lại nếu trạng thái đang là 'connected'
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

  // --- BỔ SUNG ĐOẠN ĐỘNG NÀY VÀO HÀM ---
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("statusText");
  const btnConnect = document.getElementById("btn-connect-drive");

  if (statusDot && statusText && btnConnect) {
    // Kiểm tra chính xác trạng thái mặc định (chứa lớp màu xám bg-gray-400 hoặc bg-gray-500)
    const isNotConnected = statusDot.classList.contains("bg-gray-400") || statusDot.classList.contains("bg-gray-500");
    
    if (isNotConnected) {
      statusText.textContent = t.notConnected; // Hiện "Chưa kết nối" / "Not Connected"
      btnConnect.textContent = t.connect;      // Hiện "Kết nối Drive" / "Connect Drive"
    } else {
      statusText.textContent = t.connected;    // Hiện "Đã kết nối" / "Connected"
      btnConnect.textContent = t.connected;    
    }
  }
  // -------------------------------------

  // 3. Tiến hành lặp qua bản đồ và cập nhật Text nội dung
  for (const [id, value] of Object.entries(elementMapping)) {
    const element = document.getElementById(id);
    if (element) {
      // Đối với vùng Kéo thả (dropzone), kiểm tra nếu có cả text tiếng Việt sót lại (như "hoặc Click để chọn file")
      if (id === "txt-drop") {
        element.innerHTML = value;
      } else {
        element.textContent = value;
      }
    }
  }

  // 4. Cập nhật các Placeholder cho các thẻ Input
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

  // 5. Lưu cấu hình ngôn ngữ của người dùng vào LocalStorage
  localStorage.setItem("preferredLanguage", lang);
  
  // 6. Cập nhật thuộc tính lang của thẻ <html> (Tốt cho SEO và trợ năng)
  document.documentElement.lang = lang;
}

/**
 * Khởi tạo sự kiện và thiết lập ngôn ngữ mặc định khi tải trang
 */
document.addEventListener("DOMContentLoaded", () => {
  const langSelector = document.getElementById("langSelector");

  if (langSelector) {
    // Lấy ngôn ngữ đã lưu trước đó, nếu không có mặc định lấy tiếng Việt 'vi'
    const savedLang = localStorage.getItem("preferredLanguage") || "vi";
    
    // Thiết lập giá trị ban đầu cho thanh Select
    langSelector.value = savedLang;
    
    // Thực thi chuyển ngữ ngay khi ứng dụng sẵn sàng
    changeLanguage(savedLang);

    // Lắng nghe sự kiện người dùng thay đổi ngôn ngữ trên Select box
    langSelector.addEventListener("change", (e) => {
      changeLanguage(e.target.value);
    });
  }
});

// 1. Khai báo các thành phần DOM
const themeSelector = document.getElementById('themeSelector');
const htmlEl = document.documentElement;

// 2. Hàm cốt lõi để thay đổi Class và Attribute
function applyTheme(theme) {
  if (theme === 'dark') {
    htmlEl.classList.add('dark');
    htmlEl.setAttribute('data-theme', 'dark');
    htmlEl.style.colorScheme = 'dark'; // Hỗ trợ giao diện thanh cuộn/hệ thống tối
  } else {
    htmlEl.classList.remove('dark');
    htmlEl.setAttribute('data-theme', 'light');
    htmlEl.style.colorScheme = 'light';
  }
}

// 3. Hàm kiểm tra logic và khởi tạo giao diện
function initTheme() {
  const savedTheme = localStorage.getItem('app-theme') || 'device';
  
  // Đồng bộ giá trị hiển thị của thanh chọn Select
  if (themeSelector && themeSelector.value !== savedTheme) {
    themeSelector.value = savedTheme;
  }

  if (savedTheme === 'device') {
    // Nếu là hệ thống, kiểm tra xem thiết bị đang là Dark hay Light
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(systemPrefersDark ? 'dark' : 'light');
  } else {
    // Nếu người dùng chọn đích danh Sáng hoặc Tối
    applyTheme(savedTheme);
  }
}

// 4. Lắng nghe sự kiện người dùng click chọn trên Menu thả xuống
if (themeSelector) {
  themeSelector.addEventListener('change', (e) => {
    localStorage.setItem('app-theme', e.target.value);
    initTheme();
  });
}

// 5. Lắng nghe cấu hình hệ thống thay đổi (Ví dụ: tự động từ ngày sang đêm)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const savedTheme = localStorage.getItem('app-theme') || 'device';
  if (savedTheme === 'device') {
    initTheme();
  }
});

// Run ngay lập tức để ép giao diện render đúng trước khi kịp hiển thị màn hình
initTheme();

// Các phạm vi quyền (Scopes) cần thiết để truy cập Google Drive và Picker
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

let tokenClient;
let gapiInited = false;
let gisiInited = false;

// 1. Tự động chạy khi trang web tải xong
window.addEventListener('load', () => {
    // Khôi phục cấu hình cũ từ Local Storage nếu có
    loadConfigFromStorage();
    // Khởi tạo các thư viện của Google
    gapiLoad();
    gisLoad();
});

// Lưu cấu hình vào Local Storage
function saveConfigToStorage() {
    localStorage.setItem('clientId', document.getElementById('clientId').value);
    localStorage.setItem('apiKey', document.getElementById('apiKey').value);
    localStorage.setItem('sheetId', document.getElementById('sheetId').value);
    localStorage.setItem('folderId', document.getElementById('folderId').value);
}

// Lấy cấu hình từ Local Storage đổ vào Input
function loadConfigFromStorage() {
    if (localStorage.getItem('clientId')) document.getElementById('clientId').value = localStorage.getItem('clientId');
    if (localStorage.getItem('apiKey')) document.getElementById('apiKey').value = localStorage.getItem('apiKey');
    if (localStorage.getItem('sheetId')) document.getElementById('sheetId').value = localStorage.getItem('sheetId');
    if (localStorage.getItem('folderId')) document.getElementById('folderId').value = localStorage.getItem('folderId');
}

// 2. Khởi tạo GAPI (Google API Client)
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

// 3. Khởi tạo GIS (Google Identity Services để Authenticate)
function gisLoad() {
    const clientId = document.getElementById('clientId').value;
    if (!clientId) return;

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: '', // Sẽ định nghĩa động khi bấm nút kết nối
    });
    gisiInited = true;
    checkBeforeAuth();
}

// Kiểm tra xem cả 2 thư viện đã sẵn sàng chưa để kích hoạt nút bấm
function checkBeforeAuth() {
    const btnConnect = document.getElementById('btn-connect-drive');
    if (gapiInited && gisiInited) {
        btnConnect.disabled = false;
    }
}

/**
 * HÀM CHÍNH: Xử lý kết nối đến Google Drive khi người dùng click nút
 * Hàm này bất đồng bộ (async), lưu cấu hình và trả về trạng thái kết nối (true/false)
 */
async function handleAuthClick() {
    // 1. Lưu lại thông tin vừa nhập vào Local Storage
    saveConfigToStorage();

    const clientId = document.getElementById('clientId').value;
    const apiKey = document.getElementById('apiKey').value;

    if (!clientId || !apiKey) {
        alert('Vui lòng nhập đầy đủ Client ID và API Key!');
        return false;
    }

    // Cập nhật lại cấu hình nếu người dùng vừa thay đổi trên giao diện
    if (!gisiInited) {
        gisLoad();
    }

    return new Promise((resolve) => {
        // Định nghĩa callback xử lý sau khi đăng nhập thành công/thất bại
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                updateDriveStatus(false, 'Kết nối thất bại');
                console.error(resp);
                resolve(false);
                return;
            }
            
            // Kết nối thành công, lấy email tài khoản vừa đăng nhập (tùy chọn)
            try {
                updateDriveStatus(true, 'Đã kết nối');
                // Hiển thị nút upload sau khi kết nối thành công
                document.getElementById('btnUploadDrive').classList.remove('hidden');
                resolve(true);
            } catch (err) {
                updateDriveStatus(true, 'Đã kết nối (Lỗi lấy Profile)');
                resolve(true);
            }
        };

        // Nếu đã có token cũ (đã đăng nhập trước đó rồi), bỏ qua bước bật pop-up đăng nhập
        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
}

// 4. Hàm cập nhật trạng thái UI dựa vào kết quả kết nối (Đã sửa lỗi đa ngôn ngữ)
function updateDriveStatus(isConnected, message) {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('statusText');
    const btnConnect = document.getElementById('btn-connect-drive');

    // Lấy ngôn ngữ hiện tại đang chọn, nếu không có thì mặc định 'vi'
    const currentLang = localStorage.getItem("preferredLanguage") || "vi";
    const t = translations[currentLang] || translations['vi'];

    if (isConnected) {
        statusDot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500"; 
        
        // Nếu có message custom từ hệ thống thì hiện, không thì lấy từ file dịch tương ứng (Ví dụ: "Đã kết nối" / "Connected")
        statusText.innerText = (message && message !== 'Đã kết nối') ? message : t.connected;
        statusText.className = "text-emerald-600 dark:text-emerald-400 font-medium";
        
        // Thay vì gán cứng "Đổi tài khoản", hãy dùng thuộc tính dịch (Ví dụ: t.changeAccount hoặc dùng tạm t.connected tùy bạn thiết kế)
        // Mình tạo một fallback nếu trong file translation chưa có key changeAccount thì dùng chữ 'Connected' hoặc 'Đổi tài khoản' phù hợp
        btnConnect.innerText = currentLang === 'vi' ? "Đổi tài khoản" : "Change Account";
    } else {
        statusDot.className = "w-2.5 h-2.5 rounded-full bg-rose-500"; 
        statusText.innerText = (message && message !== 'Chưa kết nối') ? message : t.notConnected;
        statusText.className = "text-rose-500 font-medium";
        btnConnect.innerText = t.connect;
    }
}

// Hàm bổ trợ xóa nhanh kí tự trong input có sẵn trong HTML của bạn
function clearInput(id) {
    document.getElementById(id).value = '';
    saveConfigToStorage();
}