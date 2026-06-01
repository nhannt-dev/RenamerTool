// --- 10. LOGIC UPLOAD FILE LÊN GOOGLE DRIVE & QUẢN LÝ TIẾN TRÌNH ---

document
  .getElementById("btnUploadDrive")
  ?.addEventListener("click", async function () {
    if (selectedFiles.length === 0) return;

    const currentLang =
      localStorage.getItem("lang") ||
      document.getElementById("langSelector")?.value ||
      "vi";

    // Danh sách các ID của ô nhập liệu bắt buộc phải kiểm tra
    const requiredInputIds = [
      "clientId",
      "apiKey",
      "sheetId",
      "folderId",
      "prefix",
      "codeInput",
      "streetInput",
      "wardInput",
    ];

    let hasEmptyInput = false;

    // Quét qua từng ô nhập liệu bắt buộc
    for (const id of requiredInputIds) {
      const inputEl = document.getElementById(id);
      if (!inputEl || inputEl.value.trim() === "" || inputEl.value === "None") {
        hasEmptyInput = true;
        break; // Phát hiện ô trống đầu tiên lập tức dừng vòng lặp
      }
    }

    if (hasEmptyInput) {
      let alertKey = "errorInputRequired";
      if (!translations[currentLang] || !translations[currentLang][alertKey]) {
        const fallbackMessages = {
          vi: "⚠️ Vui lòng điền đầy đủ tất cả các thông tin bắt buộc trước khi tải lên!",
          en: "⚠️ Please fill in all required fields before uploading!",
          fr: "⚠️ Veuillez remplir tous les champs obligatoires avant de télécharger !",
          ja: "⚠️ アップロードする前に、すべての必須項目を入力してください。",
          th: "⚠️ กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนก่อนอัปโหลด!",
        };
        alertKey = fallbackMessages[currentLang] || fallbackMessages["vi"];
      }
      showCustomAlert(alertKey, "error");
      return;
    }

    // 2. KIỂM TRA TÍNH HỢP LỆ CỦA MÃ (CODE) 6 KÝ TỰ (Yêu cầu phải có tích xanh ✅)
    const sheetCodeStatus = document.getElementById("sheetCodeStatus");
    // Kiểm tra xem phần tử status có tồn tại hoặc ruột innerHTML/innerText của nó có chứa dấu tích xanh hay không
    if (!sheetCodeStatus || !sheetCodeStatus.innerHTML.includes("✅")) {
      // Gọi hàm Alert với key dịch thuật 'invalidCode' đã có sẵn trong translations của bạn
      showCustomAlert("invalidCode", "error");
      return; // Ngừng ngay tiến trình upload tại đây, giữ nguyên trạng thái nút và các input
    }

    const textUploading =
      (typeof translations !== "undefined" &&
        translations[currentLang]?.uploading) ||
      "Đang tải lên...";
    const textFolderResult =
      currentLang === "vi"
        ? "📁 Thư mục (Đã chứa toàn bộ ảnh)"
        : "📁 Folder (Contains all images)";

    // 1. Tự động cuộn xuống danh sách file
    const fileListEl = document.getElementById("fileList");
    fileListEl?.scrollIntoView({ behavior: "smooth", block: "start" });

    // 2. Thêm hiệu ứng loading vào nút upload
    const btnUploadDrive = document.getElementById("btnUploadDrive");
    const btnUploadText =
      document.getElementById("btnUploadText") ||
      btnUploadDrive?.querySelector("span");
    if (btnUploadDrive) {
      btnUploadDrive.disabled = true;
      btnUploadDrive.classList.add("opacity-75", "pointer-events-none");
    }
    // LỖI #3: KHÓA TOÀN BỘ TƯƠNG TÁC (Input, Button, Dropzone, Nút Remove)
    const elementsToDisable = [
      "clientId",
      "apiKey",
      "sheetId",
      "folderId",
      "prefix",
      "codeInput",
      "orderSelect",
      "streetInput",
      "wardInput",
      "btnClearAll",
      "btnResetNaming",
      "btn-open-picker",
      "btn-connect-drive",
    ];

    elementsToDisable.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.disabled = true;
        el.classList.add(
          "opacity-50",
          "pointer-events-none",
          "blur-[0.5px]",
          "transition-all",
        );
      }
    });

    // Khóa vùng kéo thả Dropzone
    const dropzone = document.getElementById("dropzone");
    if (dropzone) dropzone.classList.add("pointer-events-none", "opacity-50");

    // Khóa tất cả các nút Xóa (Remove) của từng file
    const removeButtons = fileListEl?.querySelectorAll("button");
    removeButtons?.forEach((btn) => {
      btn.disabled = true;
      btn.classList.add("opacity-50", "cursor-not-allowed");
    });

    // Tham số cấu hình Drive
    const folderId =
      document.getElementById("folderId")?.value.trim() || "root";
    const prefixValue = document.getElementById("prefix")?.value || "None";

    const accessToken =
      (typeof gapi !== "undefined" && gapi.client?.getToken()?.access_token) ||
      window.gDriveAccessToken;
    if (!accessToken) {
      alert("Vui lòng đăng nhập Google Drive trước khi upload!");
      resetUploadButtonState();
      return;
    }

    const uploadResults = [];
    const filesToUpload = [...selectedFiles];
    let completedCount = 0;

    // Lặp qua từng file để Upload
    filesToUpload.forEach((file) => {
      const itemEl = Array.from(fileListEl.children).find(
        (li) =>
          li.getAttribute("data-original-name") === file.name &&
          parseInt(li.getAttribute("data-size"), 10) === file.size,
      );

      // Tạo thanh tiến trình cho thẻ LI (Đã sửa lỗi không đều nhau)
      let progressBarContainer = itemEl?.querySelector(
        ".upload-progress-container",
      );
      if (itemEl && !progressBarContainer) {
        progressBarContainer = document.createElement("div");
        // Thêm w-full (100%) và block để ép thanh tiến trình xuống hàng riêng và trải dài đều nhau
        progressBarContainer.className =
          "upload-progress-container w-full bg-gray-100 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden block clearfix";
        progressBarContainer.innerHTML = `<div class="upload-progress-bar bg-sky-500 h-full transition-all duration-150 rounded-full" style="width: 0%"></div>`;

        // Đẩy thanh tiến trình vào khối chứa thông tin file
        // Ưu tiên tìm thẻ wrapper chính bên trong thẻ LI để append vào cuối, giúp nó chiếm trọn 100% chiều ngang
        const contentContainer =
          itemEl.querySelector(".truncate.flex.flex-col") || itemEl;
        contentContainer.appendChild(progressBarContainer);
      }
      const progressBar = progressBarContainer?.querySelector(
        ".upload-progress-bar",
      );

      const metadata = {
        name: file.newName || file.name,
        parents: [folderId],
      };

      const boundary = "___file_upload_boundary___";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      );
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.setRequestHeader(
        "Content-Type",
        `multipart/related; boundary=${boundary}`,
      );

      // Update Progress Bar
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && progressBar) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          progressBar.style.width = `${percentComplete}%`;
        }
      });

      // Xử lý khi Upload 1 file hoàn tất
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          completedCount++;

          if (xhr.status === 200 || xhr.status === 201) {
            const response = JSON.parse(xhr.responseText);

            // LỖI #1: Nếu KHÁC 'P', mới thêm link từng file vào mảng Result
            if (prefixValue.toUpperCase() !== "P") {
              uploadResults.push({
                fileName: file.newName || file.name,
                link: `https://drive.google.com/open?id=${response.id}`,
              });
            }

            // Xóa mượt mà item trên giao diện
            if (itemEl) {
              itemEl.classList.remove("animate__fadeInUp");
              itemEl.classList.add("animate__fadeOutDown");

              setTimeout(() => {
                itemEl.remove();
                // Xóa file khỏi selectedFiles
                const indexInSelected = selectedFiles.findIndex(
                  (f) => f.name === file.name && f.size === file.size,
                );
                if (indexInSelected > -1) {
                  selectedFiles.splice(indexInSelected, 1);
                  const fileCountDisplay =
                    document.getElementById("fileCountDisplay");
                  if (fileCountDisplay)
                    fileCountDisplay.textContent = selectedFiles.length;
                }
              }, 300);
            }
          } else {
            console.error(`Lỗi tải lên file ${file.name}:`, xhr.responseText);
          }

          // KIỂM TRA ĐÃ UPLOAD XONG TẤT CẢ CHƯA
          if (completedCount === filesToUpload.length) {
            // LỖI #2: Delay 350ms để đợi animation xóa file (300ms) chạy xong hoàn toàn rồi mới hiện Modal
            setTimeout(() => {
              resetUploadButtonState();

              // LỖI #1: Nếu là 'P', chỉ push DUY NHẤT 1 link Folder vào kết quả cuối cùng
              if (prefixValue.toUpperCase() === "P") {
                uploadResults.length = 0; // Đảm bảo mảng rỗng
                uploadResults.push({
                  fileName: textFolderResult,
                  link: `https://drive.google.com/drive/folders/${folderId}`,
                });
              }

              // Hiện Modal kết quả
              if (uploadResults.length > 0) {
                showUploadResultsModal(uploadResults);
              }
            }, 350);
          }
        }
      };

      // Gửi dữ liệu
      const reader = new FileReader();
      reader.onload = function (e) {
        const contentType = file.type || "application/octet-stream";
        const base64Data = btoa(
          new Uint8Array(e.target.result).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            "",
          ),
        );

        const multipartBody =
          `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}` +
          `${delimiter}Content-Type: ${contentType}\r\nContent-Transfer-Encoding: base64\r\n\r\n${base64Data}` +
          `${closeDelimiter}`;

        xhr.send(multipartBody);
      };
      reader.readAsArrayBuffer(file);
    });

    // Hàm khôi phục lại toàn bộ UI sau khi upload xong
    function resetUploadButtonState() {
      if (btnUploadDrive) {
        btnUploadDrive.disabled = false;
        btnUploadDrive.classList.remove("opacity-75", "pointer-events-none");
      }

      // Mở khóa toàn bộ input và button
      elementsToDisable.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.disabled = false;
          el.classList.remove(
            "opacity-50",
            "pointer-events-none",
            "blur-[0.5px]",
          );
        }
      });

      if (dropzone)
        dropzone.classList.remove("pointer-events-none", "opacity-50");

      // Render lại giao diện (sẽ tự động ẩn nút upload và khóa các nút chức năng nếu danh sách file rỗng)
      if (typeof renderFileList === "function") renderFileList();
    }
  });

// =========================================================================
// --- CÁC HÀM BỔ TRỢ GIAO DIỆN KẾT QUẢ UPLOAD (HỢP NHẤT VÀO UPLOAD.JS) ---
// =========================================================================

window.copyAllLinks = function () {
  if (window.currentLinksToCopy) {
    copyToClipboard(window.currentLinksToCopy);
  }
};

window.copyToClipboard = function (text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToastNotification();
      })
      .catch(() => {
        fallbackCopyText(text);
      });
  } else {
    fallbackCopyText(text);
  }
};

function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    showToastNotification();
  } catch (err) {
    console.error("Không thể copy: ", err);
  }
  document.body.removeChild(textArea);
}

function showToastNotification() {
  let toast = document.getElementById("uploadToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "uploadToast";
    toast.className =
      "fixed bottom-5 right-5 z- bg-zinc-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 transform translate-y-10 opacity-0 transition-all duration-300 pointer-events-none border border-zinc-800";
    document.body.appendChild(toast);
  }

  const currentLang =
    localStorage.getItem("lang") ||
    document.getElementById("langSelector")?.value ||
    "vi";
  const successMessage =
    (typeof translations !== "undefined" &&
      translations[currentLang]?.copySuccess) ||
    "Đã copy thành công!";

  toast.innerHTML = `
    <svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
    </svg>
    <span>${successMessage}</span>
  `;

  toast.classList.remove("translate-y-10", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-10", "opacity-0");
  }, 2500);
}
