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
let pickerApiLoaded = false;

gapi.load("picker", () => {
  pickerApiLoaded = true;
});

function showPicker() {
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  if (!accessToken) {
    showModal(t.needConnect);
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
    const doc = data.docs[0]; // Sửa lấy phần tử đầu tiên
    document.getElementById("folderId").value = doc.id;
    fetchFolderName();
  }
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
  document.getElementById("codeInput").addEventListener("input", (e) => {
    if (e.target.value.length > 6) e.target.value = e.target.value.slice(-6);
    updatePreview();
    renderFileList();
  });
  renderFileList();
};

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
}

function clearInput(id) {
  document.getElementById(id).value = "";
  let key = "drive-" + id.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
  localStorage.removeItem(key);
  if (id === "folderId")
    document.getElementById("folderNameDisplay").innerText = "";
}

function setLang(lang) {
  localStorage.setItem("app-lang", lang);
  const t = translations[lang] || translations["en"];
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

  document.getElementById("clientId").placeholder = t.placeholderClientId;
  document.getElementById("apiKey").placeholder = t.placeholderApiKey;
  document.getElementById("folderId").placeholder = t.placeholderFolder;
  document.getElementById("btnUploadText").innerText = t.uploadButton;

  document.getElementById("opt-light").innerText = t.themeLight;
  document.getElementById("opt-dark").innerText = t.themeDark;
  document.getElementById("opt-device").innerText = t.themeDevice;

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
  // Kiểm tra xem là link hay ID thuần
  const match = input.match(/(?:folders\/|id=)([a-zA-Z0-9-_]{25,})/);
  return match ? match[1] : input.trim(); // Trả về match[1] thay vì toàn bộ mảng match
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
  if (fId.length < 20) return;
  display.innerText = t.fetching;
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fId}?fields=name`,
      { headers: { Authorization: "Bearer " + accessToken } },
    );
    if (res.ok) {
      const data = await res.json();
      display.innerText = "📁 " + data.name;
      display.style.color = "var(--success-color)";
      localStorage.setItem("drive-folder-id", input);
    } else {
      display.innerText = t.notFound;
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
      "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly",
    callback: (res) => {
      if (res.access_token) {
        accessToken = res.access_token;
        document
          .getElementById("driveStatus")
          .classList.add("status-connected");
        setLang(lang);
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
    const newName = generateFileName(i, file.name);
    li.innerHTML = `
            <img src="${URL.createObjectURL(file)}" class="file-thumb">
            <div class="file-info"><span class="new-name">${newName || file.name}</span><span class="old-name">${file.name}</span></div>
            <button class="btn-primary" style="background:var(--danger-color); padding:5px;" onclick="removeFile(${i})">${t.remove}</button>
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

async function uploadAllToDrive() {
  const fId = extractFolderId(document.getElementById("folderId").value);
  const btn = document.getElementById("btnUploadDrive");
  const btnText = document.getElementById("btnUploadText");
  const lang = localStorage.getItem("app-lang") || "vi";
  const t = translations[lang] || translations["en"];
  const currentPrefix = document.getElementById("prefix").value.toUpperCase();

  btn.disabled = true;
  btnText.innerText = t.uploading;
  document.getElementById("uploadLoader").style.display = "block";

  let links = [];
  try {
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const meta = {
        name: generateFileName(i, file.name),
        parents: [fId],
      };
      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(meta)], { type: "application/json" }),
      );
      form.append("file", file);

      const res = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=webViewLink",
        {
          method: "POST",
          headers: { Authorization: "Bearer " + accessToken },
          body: form,
        },
      );
      const data = await res.json();
      if (currentPrefix === "P") {
        let fLink = `https://drive.google.com/drive/u/0/folders/${fId}`;
        if (!links.includes(fLink)) links.push(fLink);
      } else links.push(data.webViewLink);
    }
    showResultModal(links);
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
  updatePreview();
  renderFileList();
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const modal = document.getElementById("customModal");
    if (window.getComputedStyle(modal).display !== "none") {
      const modalTitle = document.getElementById("modalTitle").innerText;
      const lang = localStorage.getItem("app-lang") || "vi";
      const t = translations[lang] || translations["en"];
      modal.style.display = "none";
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
      let nextIndex = (currentIndex + 1) % navButtons.length;
      navButtons[nextIndex].focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      let prevIndex =
        (currentIndex - 1 + navButtons.length) % navButtons.length;
      navButtons[prevIndex].focus();
    } else if ((e.key === "Enter" || e.key === " ") && currentIndex === -1) {
      e.preventDefault();
      navButtons.click();
    }
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
