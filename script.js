// --- LOGIC SPLASH SCREEN ---
function startSplashScreen() {
  const splash = document.getElementById("splash-screen");
  const bar = document.getElementById("splash-bar");
  const app = document.getElementById("main-app");
  let width = 0;
  const duration = 3500; // 3.5 giây
  const intervalTime = 35;
  const step = 100 / (duration / intervalTime);

  const timer = setInterval(() => {
    width += step;
    bar.style.width = width + "%";
    if (width >= 100) {
      clearInterval(timer);
      // Hiệu ứng ẩn splash screen
      splash.classList.add("animate__animated", "animate__fadeOut");
      setTimeout(() => {
        splash.style.display = "none";
        app.style.display = "block"; // Hiện giao diện chính
      }, 800);
    }
  }, intervalTime);
}

const translations = {
  vi: {
    title: "Rename & Upload Drive",
    prefix: "Tiền tố",
    code: "Mã (Code)",
    order: "Thứ tự",
    street: "Đường",
    ward: "Phường",
    preview: "Xem trước:",
    drop: "Kéo thả ảnh vào đây hoặc Click để chọn file",
    countText: "Số file:",
    remove: "Xóa",
    clearAll: "Xóa tất cả",
    connect: "Kết nối Drive",
    connected: "Đã kết nối",
    notConnected: "Chưa kết nối",
    driveConfig: "Cấu hình Google Drive",
    folderLink: "Link Thư mục Google Drive",
    uploadButton: "🚀 Tải lên Google Drive",
    uploading: "Đang tải lên...",
    uploadSuccess: "Tải lên thành công!",
    placeholderClientId: "Nhập Client ID...",
    placeholderApiKey: "Nhập API Key...",
    placeholderFolder: "Dán link thư mục hoặc ID thư mục",
    confirmClear: "Bạn có chắc chắn muốn xóa toàn bộ danh sách?",
    fetching: "🔍 Đang lấy tên thư mục...",
    notFound: "❌ Không tìm thấy thư mục",
    needConnect: "⚠️ Hãy nhấn Kết nối Drive trước",
    modalTitle: "Thông báo",
    close: "Đóng",
    confirm: "Xác nhận",
    cancel: "Hủy bỏ",
    errorMissing: "Thiếu Client ID/API Key",
    themeLight: "Sáng",
    themeDark: "Tối",
    themeDevice: "Hệ thống",
  },
  en: {
    title: "Rename & Upload Drive",
    prefix: "Prefix",
    code: "Code",
    order: "Order",
    street: "Street",
    ward: "Ward",
    preview: "Preview:",
    drop: "Drag & Drop images or Click to select",
    countText: "Files:",
    remove: "Remove",
    clearAll: "Clear All",
    connect: "Connect Drive",
    connected: "Connected",
    notConnected: "Not Connected",
    driveConfig: "Google Drive Config",
    folderLink: "Google Drive Folder Link",
    uploadButton: "🚀 Upload to Google Drive",
    uploading: "Uploading...",
    uploadSuccess: "Upload Successful!",
    placeholderClientId: "Enter Client ID...",
    placeholderApiKey: "Enter API Key...",
    placeholderFolder: "Paste folder link or Folder ID",
    confirmClear: "Are you sure you want to clear the list?",
    fetching: "🔍 Fetching folder name...",
    notFound: "❌ Folder not found",
    needConnect: "⚠️ Please click Connect Drive first",
    modalTitle: "Notification",
    close: "Close",
    confirm: "Confirm",
    cancel: "Cancel",
    errorMissing: "Missing Client ID/API Key",
    themeLight: "Light",
    themeDark: "Dark",
    themeDevice: "System",
  },
};

let filesArray = [];
let accessToken = null;
let pickerApiLoaded = false;

gapi.load("picker", () => {
  pickerApiLoaded = true;
});

function showPicker() {
  const lang = localStorage.getItem("app-lang") || "vi";
  if (!accessToken) {
    showModal(translations[lang].needConnect);
    return;
  }
  createPicker();
}

function createPicker() {
  if (pickerApiLoaded && accessToken) {
    const apiKey = document.getElementById("apiKey").value.trim();
    const view = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMimeTypes("application/vnd.google-apps.folder");

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  }
}

function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    const doc = data.docs[0];
    const folderIdInput = document.getElementById("folderId");
    folderIdInput.value = doc.id;
    fetchFolderName();
  }
}

function showModal(msg, type = "alert", onConfirm = null) {
  const modal = document.getElementById("customModal");
  const titleEl = document.getElementById("modalTitle");
  const msgEl = document.getElementById("modalMsg");
  const btnContainer = document.getElementById("modalBtns");
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang];

  titleEl.innerText = t.modalTitle;
  msgEl.innerText = msg;
  btnContainer.innerHTML = "";

  if (type === "alert") {
    const btn = document.createElement("button");
    btn.className = "btn-primary";
    btn.innerText = t.close;
    btn.onclick = () => (modal.style.display = "none");
    btnContainer.appendChild(btn);
  } else if (type === "confirm") {
    const btnOk = document.createElement("button");
    btnOk.className = "btn-primary";
    btnOk.innerText = t.confirm;
    btnOk.onclick = () => {
      modal.style.display = "none";
      if (onConfirm) onConfirm();
    };

    const btnCancel = document.createElement("button");
    btnCancel.className = "btn-primary";
    btnCancel.style.background = "var(--accent-color)";
    btnCancel.innerText = t.cancel;
    btnCancel.onclick = () => (modal.style.display = "none");

    btnContainer.appendChild(btnOk);
    btnContainer.appendChild(btnCancel);
  }
  modal.style.display = "flex";
}

window.onload = () => {
  // Chạy Splash Screen đầu tiên
  startSplashScreen();

  const savedLang = localStorage.getItem("app-lang") || "vi";
  document.getElementById("langSelector").value = savedLang;
  setLang(savedLang);

  const savedTheme = localStorage.getItem("app-theme") || "light";
  document.getElementById("themeSelector").value = savedTheme;
  setTheme(savedTheme);

  loadSavedConfig();
  updatePreview();
  initSortable();
  initDragAndDrop();

  document
    .getElementById("folderId")
    .addEventListener("input", fetchFolderName);

  const codeInput = document.getElementById("codeInput");
  codeInput.addEventListener("input", (e) => {
    let val = e.target.value;
    if (val.length > 6) {
      e.target.value = val.slice(-6);
    }
    updatePreview();
    renderFileList();
  });
};

function initDragAndDrop() {
  const dropzone = document.getElementById("dropzone");
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(
      eventName,
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      false,
    );
  });
  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(
      eventName,
      () => dropzone.classList.add("dragover"),
      false,
    );
  });
  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(
      eventName,
      () => dropzone.classList.remove("dragover"),
      false,
    );
  });
  dropzone.addEventListener(
    "drop",
    (e) => {
      handleFiles(e.dataTransfer.files);
    },
    false,
  );
}

function loadSavedConfig() {
  document.getElementById("clientId").value =
    localStorage.getItem("drive-client-id") || "";
  document.getElementById("apiKey").value =
    localStorage.getItem("drive-api-key") || "";
  document.getElementById("folderId").value =
    localStorage.getItem("drive-folder-id") || "";
}

function clearInput(id) {
  document.getElementById(id).value = "";
  localStorage.removeItem(
    "drive-" + id.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()),
  );
  if (id === "folderId")
    document.getElementById("folderNameDisplay").innerText = "";
}

function setLang(lang) {
  localStorage.setItem("app-lang", lang);
  const t = translations[lang];
  document.getElementById("txt-title").innerText = t.title;
  document.getElementById("lbl-prefix").innerText = t.prefix;
  document.getElementById("lbl-code").innerText = t.code;
  document.getElementById("lbl-order").innerText = t.order;
  document.getElementById("lbl-street").innerText = t.street;
  document.getElementById("lbl-ward").innerText = t.ward;
  document.getElementById("lbl-preview").innerText = t.preview;
  document.getElementById("txt-drop").innerText = t.drop;
  document.getElementById("lbl-count-text").innerText = t.countText;
  document.getElementById("btnClearAll").innerText = t.clearAll;
  document.getElementById("lbl-drive-config").innerText = t.driveConfig;
  document.getElementById("lbl-folder-link").innerText = t.folderLink;
  document.getElementById("btn-connect-drive").innerText = t.connect;
  document.getElementById("statusText").innerText = accessToken
    ? t.connected
    : t.notConnected;
  document.getElementById("modalTitle").innerText = t.modalTitle;
  document.getElementById("opt-light").innerText = t.themeLight;
  document.getElementById("opt-dark").innerText = t.themeDark;
  document.getElementById("opt-device").innerText = t.themeDevice;
  document.getElementById("clientId").placeholder = t.placeholderClientId;
  document.getElementById("apiKey").placeholder = t.placeholderApiKey;
  document.getElementById("folderId").placeholder = t.placeholderFolder;
  document.getElementById("btnUploadText").innerText = t.uploadButton;
  renderFileList();
}

function setTheme(theme) {
  localStorage.setItem("app-theme", theme);
  if (theme === "device") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

function extractFolderId(input) {
  if (!input) return null;
  const match = input.match(/(?:folders\/|id=)([a-zA-Z0-9-_]{25,})/);
  return match ? match[1] : input.trim();
}

async function fetchFolderName() {
  const input = document.getElementById("folderId").value.trim();
  const display = document.getElementById("folderNameDisplay");
  const lang = localStorage.getItem("app-lang") || "vi";
  if (!input) {
    display.innerText = "";
    return;
  }
  if (!accessToken) {
    display.innerText = translations[lang].needConnect;
    display.style.color = "orange";
    return;
  }
  const folderId = extractFolderId(input);
  if (folderId.length < 20) return;
  display.innerText = translations[lang].fetching;
  display.style.color = "var(--accent-color)";
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${folderId}?fields=name`,
      {
        headers: { Authorization: "Bearer " + accessToken },
      },
    );
    if (res.ok) {
      const data = await res.json();
      display.innerText = "📁 " + data.name;
      display.style.color = "var(--success-color)";
    } else {
      display.innerText = translations[lang].notFound;
      display.style.color = "var(--danger-color)";
    }
  } catch {
    display.innerText = "Error";
  }
}

function handleAuthClick() {
  const cid = document.getElementById("clientId").value.trim();
  const key = document.getElementById("apiKey").value.trim();
  const lang = localStorage.getItem("app-lang") || "vi";
  if (!cid || !key) {
    showModal(translations[lang].errorMissing);
    return;
  }
  localStorage.setItem("drive-client-id", cid);
  localStorage.setItem("drive-api-key", key);
  const client = google.accounts.oauth2.initTokenClient({
    client_id: cid,
    scope:
      "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.readonly",
    callback: (res) => {
      if (res.access_token) {
        accessToken = res.access_token;
        document
          .getElementById("driveStatus")
          .classList.add("status-connected");
        setLang(localStorage.getItem("app-lang") || "vi");
        fetchFolderName();
        renderFileList();
      }
    },
  });
  client.requestAccessToken();
}

function generateFileName(index, originalName) {
  const prefix = document.getElementById("prefix").value;
  if (prefix === "None") return "";
  const ext = originalName.split(".").pop();
  const code = document.getElementById("codeInput").value.toUpperCase();
  const order = document.getElementById("orderSelect").value;
  const street = document.getElementById("streetInput").value.toUpperCase();
  const ward = document.getElementById("wardInput").value.toUpperCase();
  let parts = [prefix, code];
  if (order !== "none") parts.push(index + 1);
  if (street) parts.push(street);
  if (ward) parts.push(ward);
  return parts.filter((p) => p !== "").join(".") + "." + ext;
}

function updatePreview() {
  const preview = generateFileName(0, "image.jpg").replace(".jpg", "");
  document.getElementById("namePreview").innerText = preview;
}

function renderFileList() {
  const list = document.getElementById("fileList");
  const lang = localStorage.getItem("app-lang") || "vi";
  list.innerHTML = "";
  document.getElementById("fileCountDisplay").innerText = filesArray.length;
  filesArray.forEach((file, i) => {
    const li = document.createElement("li");
    li.className = "file-item animate__animated animate__fadeIn";
    const newName = generateFileName(i, file.name);
    const thumb = URL.createObjectURL(file);
    li.innerHTML = `
            <img src="${thumb}" class="file-thumb">
            <div class="file-info">
                <span class="new-name">${newName || file.name}</span>
                <span class="old-name">${file.name}</span>
            </div>
            <button class="btn-primary" style="background:var(--danger-color); padding:5px;" onclick="removeFile(${i})">${translations[lang].remove}</button>
        `;
    list.appendChild(li);
  });
  document.getElementById("btnUploadDrive").style.display =
    filesArray.length > 0 && accessToken ? "flex" : "none";
}

function handleFiles(files) {
  const loader = document.getElementById("loader");
  const dropText = document.getElementById("txt-drop");
  loader.style.display = "block";
  loader.style.borderColor = "transparent";
  loader.style.borderTopColor = "var(--primary-color)";
  dropText.style.opacity = "0.3";
  setTimeout(() => {
    filesArray = [...filesArray, ...Array.from(files)];
    const order = document.getElementById("orderSelect").value;
    if (order === "asc")
      filesArray.sort((a, b) => a.name.localeCompare(b.name));
    if (order === "desc")
      filesArray.sort((a, b) => b.name.localeCompare(a.name));
    renderFileList();
    loader.style.display = "none";
    dropText.style.opacity = "1";
  }, 300);
}

function removeFile(i) {
  filesArray.splice(i, 1);
  renderFileList();
}

function confirmClearAll() {
  const lang = localStorage.getItem("app-lang") || "vi";
  showModal(translations[lang].confirmClear, "confirm", () => {
    filesArray = [];
    renderFileList();
  });
}

async function uploadAllToDrive() {
  const folderId = extractFolderId(document.getElementById("folderId").value);
  const btn = document.getElementById("btnUploadDrive");
  const btnText = document.getElementById("btnUploadText");
  const uploadLoader = document.getElementById("uploadLoader");
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang];

  btn.disabled = true;
  btnText.innerText = t.uploading;
  uploadLoader.style.display = "block";

  try {
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const name = generateFileName(i, file.name);
      const metadata = { name: name, parents: [folderId] };
      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], {
          type: "application/json",
        }),
      );
      form.append("file", file);

      await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: { Authorization: "Bearer " + accessToken },
          body: form,
        },
      );
    }
    showModal(t.uploadSuccess);
  } catch (e) {
    showModal("Error: " + e.message);
  } finally {
    btn.disabled = false;
    btnText.innerText = t.uploadButton;
    uploadLoader.style.display = "none";
  }
}

document.getElementById("dropzone").onclick = (e) => {
  if (e.target.id === "dropzone" || e.target.id === "txt-drop") {
    document.getElementById("fileInput").click();
  }
};
document.getElementById("fileInput").onchange = (e) =>
  handleFiles(e.target.files);
document.getElementById("themeSelector").onchange = (e) =>
  setTheme(e.target.value);
document.getElementById("langSelector").onchange = (e) =>
  setLang(e.target.value);
["prefix", "orderSelect", "streetInput", "wardInput"].forEach((id) => {
  document.getElementById(id).oninput = () => {
    updatePreview();
    renderFileList();
  };
});

function initSortable() {
  new Sortable(document.getElementById("fileList"), {
    animation: 150,
    onEnd: () => {
      const newList = [];
      document.querySelectorAll(".file-item").forEach((el) => {
        const oldName = el.querySelector(".old-name").innerText;
        const file = filesArray.find((f) => f.name === oldName);
        if (file) newList.push(file);
      });
      filesArray = newList;
      renderFileList();
    },
  });
}

function resetNamingConfig() {
  document.getElementById("prefix").value = "None";
  document.getElementById("codeInput").value = "";
  document.getElementById("streetInput").value = "";
  document.getElementById("wardInput").value = "";
  updatePreview();
  renderFileList();
}
