// Lấy các phần tử DOM dựa trên ID trong file HTML của bạn
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const loader = document.getElementById("loader");
const txtDrop = document.getElementById("txt-drop");
const fileList = document.getElementById("fileList");
const fileCountDisplay = document.getElementById("fileCountDisplay");

// Mảng lưu trữ danh sách các file đang được chọn
let selectedFiles = [];

// --- 1. SỰ KIỆN KHÍ CLICK VÀO DROPZONE ---
dropzone.addEventListener("click", () => {
  fileInput.click(); // Kích hoạt sự kiện click ẩn của input file
});

// Khi người dùng chọn file bằng hộp thoại truyền thống
fileInput.addEventListener("change", (e) => {
  handleFiles(e.target.files);
});

// --- 2. SỰ KIỆN KÉO THẢ (DRAG & DROP) ---
// Ngăn chặn hành vi mặc định của trình duyệt (mở file trực tiếp)
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Thêm hiệu ứng visual khi kéo file đè lên vùng dropzone
["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(
    eventName,
    () => {
      dropzone.classList.add(
        "border-primaryBlue",
        "bg-gray-50",
        "dark:bg-panelBg/80",
      );
    },
    false,
  );
});

// Xóa hiệu ứng visual khi kéo file ra ngoài vùng dropzone
["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(
    eventName,
    () => {
      dropzone.classList.remove(
        "border-primaryBlue",
        "bg-gray-50",
        "dark:bg-panelBg/80",
      );
    },
    false,
  );
});

// Xử lý sự kiện thả file (Drop)
dropzone.addEventListener("drop", (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
});

// --- 3. XỬ LÝ FILE & TẠO HIỆU ỨNG ANIMATION LOADER ---
function handleFiles(files) {
  if (files.length === 0) return; //

  const btnClearAll = document.getElementById("btnClearAll");
  const btnUploadDrive = document.getElementById("btnUploadDrive");

  // TẠM THỜI KHÓA/ẨN KHI ĐANG ĐỌC DỮ LIỆU FILE
  if (btnClearAll) {
    btnClearAll.disabled = true;
    btnClearAll.classList.add("opacity-50", "cursor-not-allowed");
  }
  btnUploadDrive?.classList.add("hidden");

  loader.classList.remove("hidden"); //
  txtDrop.classList.add("opacity-40"); //

  const imageFiles = Array.from(files).filter(
    (file) => file.type.startsWith("image/"), //
  );

  const readers = imageFiles.map((file) => {
    //
    return new Promise((resolve) => {
      //
      const isDuplicate = selectedFiles.some(
        //
        (f) => f.name === file.name && f.size === file.size, //
      );

      if (!isDuplicate) {
        //
        const reader = new FileReader(); //
        reader.onload = function (e) {
          //
          file.thumbnailData = e.target.result; //
          selectedFiles.push(file); //
          resolve(); //
        };
        reader.readAsDataURL(file); //
      } else {
        resolve(); //
      }
    });
  });

  Promise.all(readers).then(() => {
    //
    renderFileList(); // Gọi hàm này xong, logic tự động ẩn/hiện ở Bước 1 sẽ quyết định trạng thái nút

    loader.classList.add("hidden"); //
    txtDrop.classList.remove("opacity-40"); //
    fileInput.value = ""; //
  });
}

// --- 4. RENDER GIAO DIỆN DANH SÁCH FILE + NÚT REMOVE ĐA NGÔN NGỮ ---
function renderFileList() {
  if (!fileList) return;

  // Xóa trắng danh sách cũ trước khi render lại
  fileList.innerHTML = "";

  const prefix = document.getElementById("prefix")?.value || "None";
  const code = document.getElementById("codeInput")?.value.trim() || "";
  const order = document.getElementById("orderSelect")?.value || "none";
  const street = document.getElementById("streetInput")?.value.trim() || "";
  const ward = document.getElementById("wardInput")?.value.trim() || "";

  const currentLang = document.getElementById("langSelector")?.value || "vi";
  const textRemove =
    typeof translations !== "undefined" && translations[currentLang]?.remove
      ? translations[currentLang].remove
      : "Xóa";

  const totalFiles = selectedFiles.length;

  selectedFiles.forEach((file, index) => {
    const parts = [];

    if (prefix && prefix !== "None" && prefix !== "none")
      parts.push(prefix.toUpperCase());
    if (code) parts.push(code.toUpperCase().slice(-6));

    if (order === "asc") {
      parts.push(index + 1);
    } else if (order === "desc") {
      parts.push(totalFiles - index);
    }

    if (street) parts.push(street.toUpperCase());
    if (ward) parts.push(ward.toUpperCase());

    const fileExtension = file.name.substring(file.name.lastIndexOf("."));
    const newFileName =
      parts.length > 0 ? parts.join(".") + fileExtension : file.name;

    file.newName = newFileName;

    const li = document.createElement("li");
    li.className =
      "flex items-center justify-between p-3 bg-white dark:bg-panelBg/40 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm animate__animated animate__fadeInUp";
    li.style.animationDuration = "0.3s";

    // LƯU THÊM THÔNG TIN GỐC VÀO ĐÂY ĐỂ ĐỠ BỊ LỖI LỆCH INDEX KHI KÉO THẢ
    li.setAttribute("data-original-name", file.name);
    li.setAttribute("data-size", file.size);

    const thumbnailUrl = file.thumbnailData || "";

    li.innerHTML = `
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <img 
          src="${thumbnailUrl}" 
          onclick="openImagePreview('${thumbnailUrl}')"
          class="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" 
          alt="preview" 
        />
        <div class="truncate flex flex-col">
          <span class="text-sm font-semibold text-sky-500 dark:text-primaryBlue hover:underline cursor-pointer truncate" onclick="openImagePreview('${thumbnailUrl}')" title="${newFileName}">
            ${newFileName}
          </span>
          <span class="text-xs text-gray-400 dark:text-gray-500 truncate sub-text">
            ${file.name} (${(file.size / 1024).toFixed(1)} KB)
          </span>
        </div>
      </div>
      <button 
        onclick="removeFile(${index})" 
        data-i18n="remove"
        class="bg-dangerRed hover:bg-red-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow transition flex-shrink-0 ml-4"
      >
        ${textRemove}
      </button>
    `;

    fileList.appendChild(li);
  });

  if (fileCountDisplay) {
    fileCountDisplay.textContent = totalFiles;
  }

  const btnUploadDrive = document.getElementById("btnUploadDrive");
  const btnClearAll = document.getElementById("btnClearAll");

  if (totalFiles > 0) {
    if (btnUploadDrive)
      btnUploadDrive.style.setProperty("display", "flex", "important");
    if (btnClearAll) {
      btnClearAll.disabled = false;
      btnClearAll.classList.remove(
        "opacity-50",
        "cursor-not-allowed",
        "pointer-events-none",
      );
      btnClearAll.classList.add("bg-dangerRed", "hover:bg-red-700");
    }
    // Kích hoạt kéo thả Sortable
    initSortableFileList();
  } else {
    if (btnUploadDrive)
      btnUploadDrive.style.setProperty("display", "none", "important");
    if (btnClearAll) {
      btnClearAll.disabled = true;
      btnClearAll.classList.remove("hover:bg-red-700");
      btnClearAll.classList.add("opacity-50", "cursor-not-allowed");
    }
  }
}

// --- 5. HÀM XÓA FILE KHI CLICK NÚT REMOVE ---
window.removeFile = function (index) {
  // Lấy phần tử DOM của dòng chuẩn bị xóa để tạo hiệu ứng biến mất trước khi xóa khỏi mảng
  const item = fileList.children[index];
  if (item) {
    item.classList.remove("animate__fadeInUp");
    item.classList.add("animate__fadeOutDown"); // Hiệu ứng thu nhỏ rơi xuống khi xóa

    // Đợi hiệu ứng chạy xong (200ms) rồi mới tiến hành xóa dữ liệu thực tế
    setTimeout(() => {
      selectedFiles.splice(index, 1);
      renderFileList();
    }, 200);
  }
};

// --- 6. SỰ KIỆN ĐỒNG BỘ: KHI ĐỔI NGÔN NGỮ TRÊN SELECTOR, TỰ ĐỘNG ĐỔI CHỮ NÚT XÓA ---
document.getElementById("langSelector")?.addEventListener("change", () => {
  if (selectedFiles.length > 0) {
    renderFileList();
  }
});

// --- 7. HÀM CHO NÚT "TOUT EFFACER" (CLEAR ALL) TẠI GIAO DIỆN CỦA BẠN ---
window.confirmClearAll = async function () {
  if (selectedFiles.length === 0) return;

  const isConfirmed = await showCustomConfirm("confirmClear", "warning");
  if (isConfirmed) {
    // Hiển thị hộp thoại xác nhận xóa danh sách tùy thuộc vào file alert.js / modal của bạn
    selectedFiles = [];
    renderFileList();
  }
};

// --- 8. KHỞI TẠO SORTABLEJS ĐỂ KÉO THẢ SẮP XẾP FILE ---
// --- 8. KHỞI TẠO SORTABLEJS ĐỂ KÉO THẢ SẮP XẾP FILE ---
function initSortableFileList() {
  const fileListEl = document.getElementById("fileList");
  if (!fileListEl || fileListEl.classList.contains("sortable-initialized"))
    return;

  Sortable.create(fileListEl, {
    animation: 250,
    ghostClass: "sortable-ghost",
    onEnd: function () {
      // Sau khi kéo thả xong, tiến hành cập nhật lại toàn bộ tên và mảng dữ liệu
      updateNamesAfterSort();
    },
  });

  // Đánh dấu để tránh khởi tạo trùng lặp nhiều lần
  fileListEl.classList.add("sortable-initialized");
}

function updateNamesAfterSort() {
  const fileList = document.getElementById("fileList");
  if (!fileList) return;

  const prefix = document.getElementById("prefix")?.value || "None";
  const code = document.getElementById("codeInput")?.value.trim() || "";
  const order = document.getElementById("orderSelect")?.value || "none";
  const street = document.getElementById("streetInput")?.value.trim() || "";
  const ward = document.getElementById("wardInput")?.value.trim() || "";

  const totalFiles = fileList.children.length;
  const newSortedFiles = [];

  // Duyệt qua thứ tự thực tế của các thẻ LI đang hiển thị trên màn hình
  Array.from(fileList.children).forEach((li, index) => {
    const originalName = li.getAttribute("data-original-name");
    const size = parseInt(li.getAttribute("data-size") || "0", 10);
    if (!originalName) return;

    // 1. Tính toán lại tên mới dựa trên vị trí hiển thị hiện tại
    const parts = [];
    if (prefix && prefix !== "None" && prefix !== "none")
      parts.push(prefix.toUpperCase());
    if (code) parts.push(code.toUpperCase().slice(-6));

    if (order === "asc") {
      parts.push(index + 1);
    } else if (order === "desc") {
      parts.push(totalFiles - index);
    }

    if (street) parts.push(street.toUpperCase());
    if (ward) parts.push(ward.toUpperCase());

    const fileExtension = originalName.substring(originalName.lastIndexOf("."));
    const newFileName =
      parts.length > 0 ? parts.join(".") + fileExtension : originalName;

    // 2. Cập nhật Text hiển thị tên mới trên giao diện UI
    const nameSpan = li.querySelector("span.text-sky-500");
    if (nameSpan) {
      nameSpan.textContent = newFileName;
      nameSpan.setAttribute("title", newFileName);
    }

    // 3. Cập nhật lại nút xóa ứng với index mới
    const removeBtn = li.querySelector("button[onclick^='removeFile']");
    if (removeBtn) {
      removeBtn.setAttribute("onclick", `removeFile(${index})`);
    }

    // 4. Tìm và đồng bộ lại Object File trong mảng dữ liệu selectedFiles cũ sang mảng tạm mới
    const matchedFile = selectedFiles.find(
      (f) => f.name === originalName && f.size === size,
    );
    if (matchedFile) {
      matchedFile.newName = newFileName;
      newSortedFiles.push(matchedFile);
    }
  });

  // 5. Gán lại mảng selectedFiles chính bằng mảng đã được đồng bộ thứ tự kéo thả mới thành công
  selectedFiles = newSortedFiles;
}

// Lắng nghe sự kiện thay đổi cấu hình đặt tên để cập nhật Realtime
["prefix", "codeInput", "orderSelect", "streetInput", "wardInput"].forEach(
  (id) => {
    const el = document.getElementById(id);
    if (el) {
      const eventType = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(eventType, () => {
        if (selectedFiles.length > 0) updateNamesAfterSort();
      });
    }
  },
);

// Gọi lần đầu tiên khi tải trang để đưa giao diện về trạng thái chuẩn (ẩn upload, khóa clear all)
document.addEventListener("DOMContentLoaded", () => {
  renderFileList();
  initSortableFileList();
});

// --- 9. TÍNH NĂNG PHÓNG TO ẢNH (IMAGE LIGHTBOX PREVIEW) ---

/**
 * Mở modal phóng to ảnh
 * @param {string} src - Đường dẫn dữ liệu dạng Base64 hoặc URL của ảnh
 */
window.openImagePreview = function (src) {
  const modal = document.getElementById("imagePreviewModal");
  const modalImg = document.getElementById("modalPreviewImage");
  const innerContainer = modalImg?.parentElement;

  if (!modal || !modalImg) return;

  // Gán nguồn ảnh
  modalImg.src = src;

  // Hiển thị Modal với hiệu ứng mượt mà giống customModal của bạn
  modal.classList.remove("hidden");

  // Thực hiện ép trình duyệt render lại (reflow) để nhận biết thuộc tính ẩn/hiện trước khi thêm class animation transition
  void modal.offsetWidth;

  modal.classList.add("opacity-100");

  if (innerContainer) {
    innerContainer.classList.remove("animate__zoomOut");
    innerContainer.classList.add("animate__zoomIn");
  }

  // Khóa cuộn trang của body khi đang xem ảnh phóng to
  document.body.classList.add("overflow-hidden");
};

/**
 * Đóng modal phóng to ảnh
 */
window.closeImagePreview = function () {
  const modal = document.getElementById("imagePreviewModal");
  const modalImg = document.getElementById("modalPreviewImage");
  const innerContainer = modalImg?.parentElement;

  if (!modal) return;

  modal.classList.remove("opacity-100");
  if (innerContainer) {
    innerContainer.classList.remove("animate__zoomIn");
    innerContainer.classList.add("animate__zoomOut");
  }

  // Đợi hiệu ứng tắt mượt mà chạy xong (300ms) rồi mới ẩn hẳn phần tử DOM
  setTimeout(() => {
    modal.classList.add("hidden");
    if (modalImg) modalImg.src = ""; // Xóa dữ liệu nguồn ảnh để giải phóng bộ nhớ
    document.body.classList.remove("overflow-hidden");
  }, 300);
};

// Lắng nghe sự kiện phím Esc trên bàn phím để tắt nhanh ảnh đang phóng to
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("imagePreviewModal");
    if (modal && !modal.classList.contains("hidden")) {
      closeImagePreview();
    }
  }
});

// =========================================================================
// PHÍM TẮT TOÀN CỤC: Cmd + Backspace (Mac) hoặc Ctrl + Backspace (Win/Linux)
// =========================================================================
document.addEventListener("keydown", async (event) => {
  // Kiểm tra Ctrl (Windows/Linux) hoặc Meta/Cmd (Mac) đi kèm phím Backspace
  if ((event.ctrlKey || event.metaKey) && event.key === "Backspace") {
    // Ngăn chặn hành vi mặc định của trình duyệt
    event.preventDefault();

    // Chỉ thực hiện khi danh sách file hiện tại có phần tử để xóa
    if (typeof selectedFiles !== "undefined" && selectedFiles.length > 0) {
      
      // Gọi modal xác nhận tùy chỉnh từ modal.js
      const confirmed = await showCustomConfirm("confirmClearAll");
      
      if (confirmed) {
        // Thực hiện xóa sạch danh sách file (Đồng bộ với logic nút Clear All của bạn)
        selectedFiles = [];
        
        if (typeof renderFileList === "function") {
          renderFileList();
        }
        if (typeof updateFileCountDisplay === "function") {
          updateFileCountDisplay();
        }
        
        // Trả lại trạng thái trống cho dropzone nếu có
        const dropzone = document.getElementById("dropzone");
        if (dropzone) {
          // Bạn có thể tùy biến thêm class/giao diện ẩn hiện tại đây nếu cần
        }
      }
    }
  }
});

// =========================================================================
// PHÍM TẮT TOÀN CỤC: Option + Space (Mac) hoặc Alt + Space (Win/Linux)
// =========================================================================
document.addEventListener("keydown", (event) => {
  // Kiểm tra nếu phím được nhấn là Space (Khoảng trắng) và đi kèm phím Alt/Option
  if (event.altKey && (event.key === " " || event.code === "Space")) {
    
    // Ngăn chặn hành vi mặc định của trình duyệt/hệ điều hành (nếu có thể)
    event.preventDefault();

    // Lấy phần tử input file (đã được định nghĩa ở đầu file của bạn)
    const fileInput = document.getElementById("fileInput");
    
    if (fileInput) {
      // Kích hoạt hộp thoại chọn file
      fileInput.click();
    }
  }
});