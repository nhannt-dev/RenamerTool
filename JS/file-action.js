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

  // 1. Lấy thông tin cấu hình đặt tên hiện tại từ giao diện
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

  // Tổng số lượng file đang có
  const totalFiles = selectedFiles.length;

  selectedFiles.forEach((file, index) => {
    // 2. LOGIC TÍNH TOÁN ĐỔI TÊN FILE THEO PREVIEW-ZONE
    const parts = [];

    // Tiền tố
    if (prefix && prefix !== "None" && prefix !== "none") {
      parts.push(prefix.toUpperCase());
    }

    // Mã Code (Lấy 6 ký tự cuối)
    if (code) {
      parts.push(code.toUpperCase().slice(-6));
    }

    // XỬ LÝ RIÊNG CHO SỐ THỨ TỰ (ORDER)
    if (order === "asc") {
      // Tăng dần: File đầu tiên là 1, file tiếp theo là 2...
      parts.push(index + 1);
    } else if (order === "desc") {
      // Giảm dần: File đầu tiên lấy tổng số lượng file, giảm dần về 1
      parts.push(totalFiles - index);
    }
    // Nếu order === "none" -> Bỏ qua không push gì vào mảng parts

    // Đường
    if (street) {
      parts.push(street.toUpperCase());
    }

    // Phường
    if (ward) {
      parts.push(ward.toUpperCase());
    }

    // Lấy phần đuôi mở rộng gốc của file (ví dụ: .jpg, .jpeg, .png)
    const fileExtension = file.name.substring(file.name.lastIndexOf("."));

    // Ghép tên mới (Nếu cấu hình trống hết thì giữ tên gốc)
    const newFileName =
      parts.length > 0 ? parts.join(".") + fileExtension : file.name;

    // Lưu trữ tên mới trực tiếp vào một thuộc tính custom của đối tượng file để sử dụng khi upload lên Drive
    file.newName = newFileName;

    // 3. RENDER GIAO DIỆN MỚI
    const li = document.createElement("li");
    li.className =
      "flex items-center justify-between p-3 bg-white dark:bg-panelBg/40 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm animate__animated animate__fadeInUp";
    li.style.animationDuration = "0.3s";

    // const thumbnailUrl = URL.createObjectURL(file);
    const thumbnailUrl = file.thumbnailData || "";

    li.innerHTML = `
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <img src="${thumbnailUrl}" class="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner flex-shrink-0" alt="preview" />
        
        <div class="truncate flex flex-col">
          <span class="text-sm font-semibold text-sky-500 dark:text-primaryBlue hover:underline cursor-pointer truncate" title="${newFileName}">
            ${newFileName}
          </span>
          <span class="text-xs text-gray-400 dark:text-gray-500 truncate">
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

  // Cập nhật số lượng file hiển thị
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
  } else {
    if (btnUploadDrive)
      btnUploadDrive.style.setProperty("display", "none", "important");
    if (btnClearAll) {
      btnClearAll.disabled = true;
      btnClearAll.classList.remove("hover:bg-red-700");
      // Thêm làm mờ (opacity-50) và dấu chéo (cursor-not-allowed)
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

// Gọi lần đầu tiên khi tải trang để đưa giao diện về trạng thái chuẩn (ẩn upload, khóa clear all)
document.addEventListener("DOMContentLoaded", () => {
  renderFileList();
});
