function startSplashScreen() {
  const splash = document.getElementById("splash-screen");
  const bar = document.getElementById("splash-bar");
  const app = document.getElementById("main-app");
  let width = 0;
  const duration = 2000;
  const intervalTime = 20;
  const step = 100 / (duration / intervalTime);
  const timer = setInterval(() => {
    width += step;
    bar.style.width = width + "%";
    if (width >= 100) {
      clearInterval(timer);
      splash.classList.add("animate__animated", "animate__fadeOut");
      setTimeout(() => {
        splash.style.display = "none";
        app.style.display = "block";
      }, 500);
    }
  }, intervalTime);
}

let filesArray = [];
let accessToken = null;
let connectedUserEmail = "";
const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

// --- BẮT ĐẦU CODE THÊM MỚI: Xử lý âm thanh thông báo ---
const notificationAudio = new Audio("./Sounds/ding_dong_notify.wav");
notificationAudio.loop = true;
let isWaitingForUser = false;

function stopNotification() {
  // Bỏ điều kiện if (isWaitingForUser) để đảm bảo âm thanh luôn được ngắt
  if (!notificationAudio.paused) {
    notificationAudio.pause();
    notificationAudio.currentTime = 0;
  }
  isWaitingForUser = false;
}

// Xử lý khi người dùng thu nhỏ trình duyệt, nhảy qua lại các tab hoặc nhấp qua phần mềm khác
document.addEventListener("visibilitychange", () => {
  if (!document.hidden || document.visibilityState === "visible") {
    stopNotification();
  }
});
window.addEventListener("focus", stopNotification);
window.addEventListener("click", stopNotification);
window.addEventListener("keydown", stopNotification);
window.addEventListener("pointerdown", stopNotification);
// --- KẾT THÚC CODE THÊM MỚI ---

let currentExplorerFolder = "root";
let explorerStack = [{ id: "root", name: "My Drive" }];
let currentSearchQuery = "";

async function showPicker() {
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  if (!accessToken) {
    showModal(t.needConnect);
    return;
  }
  currentExplorerFolder = "root";
  explorerStack = [{ id: "root", name: "My Drive" }];
  currentSearchQuery = "";
  renderExplorerModal();
}

async function renderExplorerModal() {
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  currentSearchQuery = "";
  showModal(
    `<div id="explorer-container">
             <div style="display: flex; gap: 8px; margin-bottom: 15px;">
               <input type="text" id="explorerSearchInput" placeholder="${t.exSearchPlaceholder}" style="flex: 1; height: 38px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--container-bg); color: var(--text-color); font-size: 14px;">
               <button class="btn-primary" style="height: 38px; padding: 0 15px;" onclick="executeExplorerSearch()">🔍 ${t.exSearchBtn}</button>
             </div>
             <div id="explorer-list-container"><div class="loader" style="display:block"></div></div>
           </div>`,
    "alert",
  );
  document.getElementById("modalTitle").innerText = t.exTitle;

  setTimeout(() => {
    const searchInput = document.getElementById("explorerSearchInput");
    if (searchInput) {
      searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          executeExplorerSearch();
        }
      });
    }
  }, 100);

  await refreshExplorerList();
}

async function executeExplorerSearch() {
  const input = document.getElementById("explorerSearchInput");
  if (!input) return;
  currentSearchQuery = input.value.trim();
  await refreshExplorerList();
}

async function clearExplorerSearch() {
  currentSearchQuery = "";
  const input = document.getElementById("explorerSearchInput");
  if (input) input.value = "";
  await refreshExplorerList();
}

async function enterFolderFromSearch(id, name) {
  currentSearchQuery = "";
  const input = document.getElementById("explorerSearchInput");
  if (input) input.value = "";
  explorerStack = [
    { id: "root", name: "My Drive" },
    { id: id, name: name },
  ];
  currentExplorerFolder = id;
  await refreshExplorerList();
}

async function refreshExplorerList() {
  const container = document.getElementById("explorer-list-container");
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  if (!container) return;
  try {
    container.innerHTML =
      '<div class="loader" style="display:block; margin: 20px auto;"></div>';
    let html = "";
    let query = "";

    if (currentSearchQuery) {
      html += `<div class="breadcrumb-nav"><span onclick="clearExplorerSearch()"><b>${t.exBack}</b></span> > <span>${t.exSearchResults} "${currentSearchQuery}"</span></div>`;
      query = `name contains '${currentSearchQuery.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    } else {
      html += `<div class="breadcrumb-nav">`;
      explorerStack.forEach((folder, idx) => {
        html += `<span onclick="navigateToStack(${idx})">${folder.name}</span> ${idx < explorerStack.length - 1 ? ">" : ""} `;
      });
      html += `</div>`;
      query = `'${currentExplorerFolder}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    }

    html += `<ul class="explorer-list">`;

    const fieldsParam = currentSearchQuery
      ? "files(id,name,parents)"
      : "files(id,name)";
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${fieldsParam}&orderBy=name`,
      { headers: { Authorization: "Bearer " + accessToken } },
    );
    const data = await response.json();

    let parentMap = {};
    if (currentSearchQuery && data.files && data.files.length > 0) {
      const parentIds = [
        ...new Set(
          data.files.map((f) => f.parents && f.parents).filter(Boolean),
        ),
      ];
      if (parentIds.length > 0) {
        try {
          const parentQuery = parentIds.map((id) => `id='${id}'`).join(" or ");
          const pResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(parentQuery)}&fields=files(id,name)`,
            { headers: { Authorization: "Bearer " + accessToken } },
          );
          if (pResponse.ok) {
            const pData = await pResponse.json();
            if (pData.files) {
              pData.files.forEach((p) => {
                parentMap[p.id] = p.name;
              });
            }
          }
        } catch (err) {
          console.error("Error fetching parent names:", err);
        }
      }
    }

    if (data.files && data.files.length > 0) {
      data.files.forEach((folder) => {
        if (currentSearchQuery) {
          const parentId = folder.parents ? folder.parents : null;
          const parentName = parentId
            ? parentMap[parentId] || "My Drive"
            : "My Drive";
          html += `<li class="explorer-item" onclick="enterFolderFromSearch('${folder.id}', '${folder.name}')" style="display:flex; flex-direction:column; align-items:flex-start; gap:2px;">
                  <div style="display:flex; align-items:center; gap:10px;">📁 <span>${folder.name}</span></div>
                  <div style="font-size:0.75em; color:var(--accent-color); margin-left:24px; font-style:italic;">${t.exLocation} ${parentName}</div>
                </li>`;
        } else {
          html += `<li class="explorer-item" onclick="enterFolder('${folder.id}', '${folder.name}')">📁 ${folder.name}</li>`;
        }
      });
    } else {
      html += `<li class="explorer-item" style="cursor:default; color:gray;">${currentSearchQuery ? t.exNoResults : t.exEmpty}</li>`;
    }
    html += `</ul>`;

    const currentFolder = explorerStack[explorerStack.length - 1];
    if (!currentSearchQuery) {
      html += `<div style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:15px;">
              <p style="font-size:0.85em; margin-bottom:10px;">${t.exSelecting} <strong>${currentFolder.name}</strong></p>
              <button class="btn-primary" onclick="confirmPickerSelection('${currentFolder.id}')">${t.exBtnConfirm}</button>
            </div>`;
    } else {
      html += `<div style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:15px;">
              <p style="font-size:0.85em; color:var(--accent-color);">${t.exClickToSelect}</p>
            </div>`;
    }

    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = `<p style="color:red">Error loading data: ${e.message}</p>`;
  }
}

async function enterFolder(id, name) {
  currentExplorerFolder = id;
  explorerStack.push({ id, name });
  await refreshExplorerList();
}

async function navigateToStack(index) {
  explorerStack = explorerStack.slice(0, index + 1);
  currentExplorerFolder = explorerStack[index].id;
  await refreshExplorerList();
}

function confirmPickerSelection(id) {
  document.getElementById("folderId").value = id;
  document.getElementById("customModal").style.display = "none";
  fetchFolderName();
}

function showModal(msg, type = "alert", onConfirm = null) {
  const modal = document.getElementById("customModal");
  const titleEl = document.getElementById("modalTitle");
  const msgEl = document.getElementById("modalMsg");
  const btnContainer = document.getElementById("modalBtns");
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];

  titleEl.innerText = t.modalTitle;
  msgEl.innerHTML = msg;
  btnContainer.innerHTML = "";

  if (type === "alert") {
    const btn = document.createElement("button");
    btn.className = "btn-primary modal-btn-nav";
    btn.innerText = t.close;
    btn.onclick = () => (modal.style.display = "none");
    btnContainer.appendChild(btn);
  } else if (type === "confirm") {
    const btnOk = document.createElement("button");
    btnOk.className = "btn-primary modal-btn-nav";
    btnOk.innerText = t.confirm;
    btnOk.onclick = () => {
      modal.style.display = "none";
      if (onConfirm) onConfirm();
    };
    const btnCancel = document.createElement("button");
    btnCancel.className = "btn-primary modal-btn-nav";
    btnCancel.style.background = "var(--accent-color)";
    btnCancel.innerText = t.cancel;
    btnCancel.onclick = () => (modal.style.display = "none");
    btnContainer.appendChild(btnOk);
    btnContainer.appendChild(btnCancel);
  }
  modal.style.display = "flex";
  setTimeout(() => {
    const firstBtn = btnContainer.querySelector(".modal-btn-nav");
    if (firstBtn) firstBtn.focus();
  }, 100);
}

function copyToClipboard(text) {
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById("copyToast");
    toast.innerText = t.copySuccess;
    toast.style.display = "block";
    toast.classList.add("animate__animated", "animate__fadeInUp");
    setTimeout(() => {
      toast.classList.replace("animate__fadeInUp", "animate__fadeOutDown");
      setTimeout(() => {
        toast.style.display = "none";
        toast.classList.remove("animate__animated", "animate__fadeOutDown");
      }, 500);
    }, 2000);
  });
}

window.onload = () => {
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
  document.getElementById("sheetId").addEventListener("input", fetchSheetName);
  document.getElementById("codeInput").addEventListener("input", (e) => {
    if (e.target.value.length > 6) e.target.value = e.target.value.slice(-6);
    updatePreview();
    renderFileList();
    updateBase64Code();
    if (e.target.value.length === 6) {
      checkCodeInSheet(e.target.value.trim().toUpperCase());
    } else {
      document.getElementById("sheetCodeStatus").innerText = "";
    }
  });
  renderFileList();
};

function updateBase64Code() {
  const codeValue = document.getElementById("codeInput").value.trim();
  const display = document.getElementById("base64Display");
  if (codeValue.length === 6) {
    try {
      const encoded = btoa(codeValue);
      display.innerText = `B64: ${encoded}`;
      display.onclick = () => copyToClipboard(encoded);
    } catch (e) {
      display.innerText = "";
    }
  } else {
    display.innerText = "";
  }
}

function initDragAndDrop() {
  const dropzone = document.getElementById("dropzone");
  ["dragenter", "dragover", "dragleave", "drop"].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }),
  );
  ["dragenter", "dragover"].forEach((ev) =>
    dropzone.addEventListener(ev, () => dropzone.classList.add("dragover")),
  );
  ["dragleave", "drop"].forEach((ev) =>
    dropzone.addEventListener(ev, () => dropzone.classList.remove("dragover")),
  );
  dropzone.addEventListener("drop", (e) => handleFiles(e.dataTransfer.files));
}

function loadSavedConfig() {
  document.getElementById("clientId").value =
    localStorage.getItem("drive-client-id") || "";
  document.getElementById("apiKey").value =
    localStorage.getItem("drive-api-key") || "";
  document.getElementById("folderId").value =
    localStorage.getItem("drive-folder-id") || "";
  document.getElementById("sheetId").value =
    localStorage.getItem("drive-sheet-id") || "";
}

function clearInput(id) {
  document.getElementById(id).value = "";
  let storageKey =
    "drive-" + id.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
  localStorage.removeItem(storageKey);
  if (id === "folderId")
    document.getElementById("folderNameDisplay").innerText = "";
  if (id === "sheetId")
    document.getElementById("sheetNameDisplay").innerText = "";
  if (id === "sheetId")
    document.getElementById("sheetCodeStatus").innerText = "";
}

function setLang(lang) {
  localStorage.setItem("app-lang", lang);
  const t = translations[lang] || translations["en"];
  const modKey = isMac ? "option" : "Alt";
  const ctrlKey = isMac ? "⌘" : "Ctrl";

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
  document.getElementById("lbl-sheet-id").innerText = t.lblSheet;
  document.getElementById("btn-connect-drive").innerText = t.connect;
  document.getElementById("statusText").innerText = accessToken
    ? t.connected
    : t.notConnected;
  if (connectedUserEmail)
    document.getElementById("connectedEmail").innerText =
      t.account + connectedUserEmail;
  document.getElementById("clientId").placeholder = t.placeholderClientId;
  document.getElementById("apiKey").placeholder = t.placeholderApiKey;
  document.getElementById("folderId").placeholder = t.placeholderFolder;
  document.getElementById("sheetId").placeholder = t.placeholderSheet;
  document.getElementById("btnUploadText").innerText = t.uploadButton;
  document.getElementById("opt-light").innerText = t.themeLight;
  document.getElementById("opt-dark").innerText = t.themeDark;
  document.getElementById("opt-device").innerText = t.themeDevice;

  document.getElementById("shortcut-tip").innerText = t.shortcutTip.replace(
    "{mod}",
    modKey,
  );

  const modUpper = modKey.toUpperCase();
  document.getElementById("tip-connect").innerText = `${modUpper} + C`;
  document.getElementById("tip-reset").innerText = `${modUpper} + Backspace`;
  document.getElementById("tip-clear").innerText =
    `${ctrlKey} + ${modUpper} + Backspace`;
  document.getElementById("tip-upload").innerText = `${ctrlKey} + Enter`;

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
  } else document.documentElement.setAttribute("data-theme", theme);
}

function extractFolderId(input) {
  if (!input) return null;
  const match = input.match(/(?:folders\/|id=)([a-zA-Z0-9-_]{25,})/);
  return match ? match : input.trim();
}

function extractSheetId(input) {
  if (!input) return null;
  const match = input.match(/\/d\/([a-zA-Z0-9-_]{25,})/);
  return match ? match : input.trim();
}

async function fetchFolderName() {
  const input = document.getElementById("folderId").value.trim();
  const display = document.getElementById("folderNameDisplay");
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  if (!input) {
    display.innerText = "";
    return;
  }
  if (!accessToken) {
    display.innerText = t.needConnect;
    display.style.color = "orange";
    return;
  }
  const fId = extractFolderId(input);
  display.innerText = t.fetching;
  try {
    let currentId = fId;
    let pathParts = [];
    let loopCount = 0;
    let hasMoreParents = false;

    while (currentId && loopCount < 4) {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${currentId}?fields=name,parents`,
        { headers: { Authorization: "Bearer " + accessToken } },
      );
      if (!res.ok) {
        if (pathParts.length === 0) throw new Error();
        break;
      }
      const data = await res.json();
      pathParts.unshift(data.name);

      if (data.parents && data.parents.length > 0) {
        currentId = data.parents;
        if (loopCount === 3) {
          hasMoreParents = true;
        }
      } else {
        currentId = null;
      }
      loopCount++;
    }

    let pathString = pathParts.join(" > ");
    if (hasMoreParents) {
      pathString = "... > " + pathString;
    }

    display.innerText = "📁 " + pathString;
    display.style.color = "var(--success-color)";
    localStorage.setItem("drive-folder-id", input);
  } catch (e) {
    display.innerText = t.notFound;
    display.style.color = "var(--danger-color)";
  }
}

async function fetchSheetName() {
  const input = document.getElementById("sheetId").value.trim();
  const display = document.getElementById("sheetNameDisplay");
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  if (!input) {
    display.innerText = "";
    return;
  }
  if (!accessToken) {
    display.innerText = t.needConnect;
    display.style.color = "orange";
    return;
  }
  const sId = extractSheetId(input);
  display.innerText = t.fetchingSheet;
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${sId}?fields=name`,
      { headers: { Authorization: "Bearer " + accessToken } },
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    display.innerText = "📊 " + data.name;
    display.style.color = "var(--success-color)";
    localStorage.setItem("drive-sheet-id", input);
  } catch (e) {
    display.innerText = t.sheetNotFound;
    display.style.color = "var(--danger-color)";
  }
}

async function checkCodeInSheet(code) {
  const sId = extractSheetId(document.getElementById("sheetId").value.trim());
  const statusIcon = document.getElementById("sheetCodeStatus");
  if (!sId || !accessToken) return;

  statusIcon.innerText = "⏳";
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sId}/values/A1:Z1000`,
      { headers: { Authorization: "Bearer " + accessToken } },
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    const rows = data.values || [];

    const found = rows.some((row) =>
      row.some((cell) => String(cell).toUpperCase().includes(code)),
    );

    if (found) {
      statusIcon.innerText = "✅";
      statusIcon.title = "Mã hợp lệ";
    } else {
      statusIcon.innerText = "❌";
      statusIcon.title = "Mã không tồn tại";
    }
  } catch (e) {
    statusIcon.innerText = "⚠️";
  }
}

async function fetchUserEmail() {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: "Bearer " + accessToken },
    });
    if (res.ok) {
      const data = await res.json();
      connectedUserEmail = data.email;
      const lang = localStorage.getItem("app-lang") || "vi";
      const t = translations[lang] || translations["en"];
      document.getElementById("connectedEmail").innerText =
        t.account + connectedUserEmail;
    }
  } catch (e) {
    console.error("Failed to fetch user email", e);
  }
}

function handleAuthClick() {
  const cid = document.getElementById("clientId").value.trim();
  const key = document.getElementById("apiKey").value.trim();
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  if (!cid || !key) {
    showModal(t.errorMissing);
    return;
  }
  localStorage.setItem("drive-client-id", cid);
  localStorage.setItem("drive-api-key", key);
  const client = google.accounts.oauth2.initTokenClient({
    client_id: cid,
    scope:
      "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/spreadsheets.readonly",
    callback: (res) => {
      if (res.access_token) {
        accessToken = res.access_token;
        document
          .getElementById("driveStatus")
          .classList.add("status-connected");
        setLang(lang);
        fetchFolderName();
        fetchSheetName();
        fetchUserEmail();
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
  const t = translations[lang] || translations["en"];
  list.innerHTML = "";
  const count = filesArray.length;
  document.getElementById("fileCountDisplay").innerText = count;
  const btnClear = document.getElementById("btnClearAll");
  if (count === 0) {
    btnClear.disabled = true;
    btnClear.style.opacity = "0.5";
    btnClear.style.cursor = "not-allowed";
  } else {
    btnClear.disabled = false;
    btnClear.style.opacity = "1";
    btnClear.style.cursor = "pointer";
  }

  filesArray.forEach((file, i) => {
    const li = document.createElement("li");
    li.className = "file-item";
    li.id = `item-${i}`;
    const newName = generateFileName(i, file.name);
    const imgUrl = URL.createObjectURL(file);
    li.innerHTML = `
            <div class="file-main-info">
              <div class="thumbnail-preview-container">
                <img src="${imgUrl}" class="file-thumb">
                <img src="${imgUrl}" class="magnifier-zoom">
              </div>
              <div class="file-info">
                <span class="new-name">${newName || file.name}</span>
                <span class="old-name">${file.name}</span>
              </div>
              <div class="status-icon" id="status-${i}">✅</div>
              <button class="btn-primary" id="btn-remove-${i}" style="background:var(--danger-color); padding:5px; margin-left:10px;" onclick="removeFile(${i})">${t.remove}</button>
            </div>
            <div class="item-progress-container" id="progress-cont-${i}">
              <div class="item-progress-bar" id="progress-bar-${i}"></div>
            </div>
          `;
    list.appendChild(li);
  });
  document.getElementById("btnUploadDrive").style.display =
    filesArray.length > 0 && accessToken ? "flex" : "none";
}

function handleFiles(files) {
  filesArray = [...filesArray, ...Array.from(files)];
  const order = document.getElementById("orderSelect").value;
  if (order === "asc") filesArray.sort((a, b) => a.name.localeCompare(b.name));
  if (order === "desc") filesArray.sort((a, b) => b.name.localeCompare(a.name));
  renderFileList();
}

function removeFile(i) {
  filesArray.splice(i, 1);
  renderFileList();
}

function confirmClearAll() {
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  showModal(t.confirmClear, "confirm", () => {
    filesArray = [];
    renderFileList();
  });
}

async function uploadFileWithProgress(file, metadata, index) {
  const progressCont = document.getElementById(`progress-cont-${index}`);
  const progressBar = document.getElementById(`progress-bar-${index}`);
  const statusIcon = document.getElementById(`status-${index}`);
  const btnRemove = document.getElementById(`btn-remove-${index}`);

  progressCont.style.display = "block";
  if (btnRemove) btnRemove.style.display = "none";

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=webViewLink",
      true,
    );
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        progressBar.style.width = percentComplete + "%";
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        progressBar.style.width = "100%";
        statusIcon.style.display = "block";
        statusIcon.innerText = "✅";
        resolve(response);
      } else {
        statusIcon.style.display = "block";
        statusIcon.innerText = "❌";
        reject(new Error(xhr.responseText));
      }
    };

    xhr.onerror = () => {
      statusIcon.style.display = "block";
      statusIcon.innerText = "❌";
      reject(new Error("Network Error"));
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
    );
    form.append("file", file);
    xhr.send(form);
  });
}

async function uploadAllToDrive() {
  const fId = extractFolderId(document.getElementById("folderId").value);
  const btn = document.getElementById("btnUploadDrive");
  const btnText = document.getElementById("btnUploadText");
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  const currentPrefix = document.getElementById("prefix").value.toUpperCase();

  // --- BẮT ĐẦU CODE SỬA BUG: Chặn khi chưa chỉ định folderId ---
  if (!fId) {
    showModal(t.errorFolderMissing); // Hiển thị thông báo bằng ngôn ngữ tương ứng
    return; // Chặn đứng hành vi upload tiếp theo
  }
  // --- KẾT THÚC CODE SỬA BUG ---

  btn.scrollIntoView({ behavior: "smooth", block: "center" });

  btn.disabled = true;
  btnText.innerText = t.uploading;
  document.getElementById("uploadLoader").style.display = "block";

  // --- BẮT ĐẦU CODE THÊM MỚI: Mồi âm thanh để vượt rào cấm Autoplay của trình duyệt ---
  notificationAudio.muted = true;
  notificationAudio
    .play()
    .then(() => {
      notificationAudio.pause();
      notificationAudio.muted = false;
    })
    .catch((e) => console.log("Init audio failed:", e));
  // --- KẾT THÚC CODE THÊM MỚI ---

  let links = [];
  try {
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const meta = {
        name: generateFileName(i, file.name),
        parents: [fId],
      };

      const data = await uploadFileWithProgress(file, meta, i);

      if (currentPrefix === "P") {
        let fLink = `https://drive.google.com/drive/u/0/folders/${fId}`;
        if (!links.includes(fLink)) links.push(fLink);
      } else {
        links.push(data.webViewLink);
      }
    }
    showResultModal(links);

    // --- BẮT ĐẦU CODE THÊM MỚI: Phát âm thanh nếu đang ở tab/cửa sổ khác ---
    if (!document.hasFocus() || document.hidden) {
      isWaitingForUser = true;
      notificationAudio
        .play()
        .catch((e) => console.log("Lỗi phát âm thanh:", e));
    }
    // --- KẾT THÚC CODE THÊM MỚI ---
  } catch (e) {
    showModal("Error: " + e.message);
  } finally {
    btn.disabled = false;
    btnText.innerText = t.uploadButton;
    document.getElementById("uploadLoader").style.display = "none";
  }
}

function showResultModal(links) {
  const modal = document.getElementById("customModal");
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  document.getElementById("modalTitle").innerText = t.uploadSuccess;
  let html = `<div style="text-align:left; max-height:300px; overflow-y:auto;">`;
  links.forEach((l) => {
    html += `<div class="copy-item"><input type="text" value="${l}" readonly><button class="btn-copy-small" onclick="copyToClipboard('${l}')">Copy</button></div>`;
  });
  document.getElementById("modalMsg").innerHTML = html + `</div>`;
  const btn = document.createElement("button");
  btn.className = "btn-primary modal-btn-nav";
  btn.innerText = t.close;
  btn.onclick = () => {
    modal.style.display = "none";
    filesArray = [];
    renderFileList();
  };
  document.getElementById("modalBtns").innerHTML = "";
  document.getElementById("modalBtns").appendChild(btn);
  modal.style.display = "flex";
  setTimeout(() => btn.focus(), 100);
}

document.getElementById("dropzone").onclick = (e) => {
  if (e.target.id === "dropzone" || e.target.id === "txt-drop")
    document.getElementById("fileInput").click();
};
document.getElementById("fileInput").onchange = (e) =>
  handleFiles(e.target.files);
document.getElementById("themeSelector").onchange = (e) =>
  setTheme(e.target.value);
document.getElementById("langSelector").onchange = (e) =>
  setLang(e.target.value);

["prefix", "orderSelect", "streetInput", "wardInput"].forEach(
  (id) =>
    (document.getElementById(id).oninput = () => {
      if (id === "orderSelect") {
        const order = document.getElementById("orderSelect").value;
        if (order === "asc")
          filesArray.sort((a, b) => a.name.localeCompare(b.name));
        else if (order === "desc")
          filesArray.sort((a, b) => b.name.localeCompare(a.name));
      }
      updatePreview();
      renderFileList();
    }),
);

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
  document.getElementById("orderSelect").value = "none";
  document.getElementById("streetInput").value = "";
  document.getElementById("wardInput").value = "";
  document.getElementById("sheetCodeStatus").innerText = "";
  updatePreview();
  renderFileList();
  updateBase64Code();
}

function showShortcutList() {
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  const ctrlLabel = isMac ? "⌘" : "Ctrl";
  const altLabel = isMac ? "Option" : "Alt";
  const listHtml = `<div class="shortcut-list-modal">
            <div><kbd>${altLabel}</kbd> + <kbd>Space</kbd> : ${t.scSelect}</div>
            <div><kbd>${altLabel}</kbd> + <kbd>C</kbd> : ${t.scConnect}</div>
            <div><kbd>${altLabel}</kbd> + <kbd>Backspace</kbd> : ${t.scReset}</div>
            <div><kbd>${ctrlLabel}</kbd> + <kbd>${altLabel}</kbd> + <kbd>Backspace</kbd> : ${t.scClearAll}</div>
            <div><kbd>${ctrlLabel}</kbd> + <kbd>Backspace</kbd> : ${t.scClearConfig}</div>
            <div><kbd>${ctrlLabel}</kbd> + <kbd>${altLabel}</kbd> + <kbd>O</kbd> : ${t.scOpenPicker}</div>
            <div><kbd>${ctrlLabel}</kbd> + <kbd>Enter</kbd> : ${t.scUpload}</div>
            <hr style="margin:10px 0; border:0; border-top:1px solid var(--border-color)">
            <div><kbd>${altLabel}</kbd> + <kbd>H</kbd> : ${t.scShowThis}</div>
            <div><kbd>Esc</kbd> : ${t.scCloseEsc}</div>
        </div>`;
  showModal(listHtml);
  document.getElementById("modalTitle").innerText = t.scTitle;
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const modal = document.getElementById("customModal");
    if (window.getComputedStyle(modal).display !== "none") {
      const modalTitle = document.getElementById("modalTitle").innerText;
      modal.style.display = "none";
      const lang = localStorage.getItem("app-lang") || "vi";
      const t = translations[lang] || translations["en"];
      if (modalTitle === t.uploadSuccess) {
        filesArray = [];
        renderFileList();
      }
    }
  }
});

document.addEventListener("keydown", function (e) {
  const modal = document.getElementById("customModal");
  if (window.getComputedStyle(modal).display !== "none") {
    const navButtons = Array.from(modal.querySelectorAll(".modal-btn-nav"));
    if (navButtons.length === 0) return;
    let currentIndex = navButtons.indexOf(document.activeElement);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      navButtons[(currentIndex + 1) % navButtons.length].focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      navButtons[
        (currentIndex - 1 + navButtons.length) % navButtons.length
      ].focus();
    }
    return;
  }
  if (e.altKey && e.code === "KeyH") {
    e.preventDefault();
    showShortcutList();
    return;
  }
  if (
    (e.metaKey || e.ctrlKey) &&
    e.altKey &&
    (e.key === "Backspace" || e.code === "Backspace")
  ) {
    e.preventDefault();
    confirmClearAll();
    return;
  }
  if (e.altKey && e.code === "Space") {
    e.preventDefault();
    document.getElementById("fileInput").click();
  }
  if (e.altKey && e.code === "KeyC") {
    e.preventDefault();
    handleAuthClick();
  }
  if (e.altKey && e.code === "Backspace") {
    e.preventDefault();
    resetNamingConfig();
  }
  if ((e.metaKey || e.ctrlKey) && e.key === "Backspace") {
    e.preventDefault();
    clearInput("clientId");
    clearInput("apiKey");
    clearInput("folderId");
    clearInput("sheetId");
  }
  if ((e.metaKey || e.ctrlKey) && e.altKey && e.code === "KeyO") {
    e.preventDefault();
    showPicker();
  }
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    const btnUpload = document.getElementById("btnUploadDrive");
    if (
      window.getComputedStyle(btnUpload).display !== "none" &&
      !btnUpload.disabled
    ) {
      e.preventDefault();
      uploadAllToDrive();
    }
  }
});
