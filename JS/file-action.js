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
  if (files.length === 0) return;

  // Kích hoạt hiệu ứng Loader (Hiện loader xoay, ẩn bớt text chỉ dẫn)
  loader.classList.remove("hidden");
  txtDrop.classList.add("opacity-40");

  // Giả lập hiệu ứng tải/xử lý file mượt mà (300ms) để người dùng thấy animation chuyển động
  setTimeout(() => {
    // Chỉ lọc lấy các file là hình ảnh theo đúng thuộc tính accept="image/*"
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    imageFiles.forEach((file) => {
      // Tránh trùng lặp file có cùng tên và cùng dung lượng
      const isDuplicate = selectedFiles.some(
        (f) => f.name === file.name && f.size === file.size,
      );
      if (!isDuplicate) {
        selectedFiles.push(file);
      }
    });

    // Cập nhật lại giao diện hiển thị danh sách
    renderFileList();

    // Tắt hiệu ứng loader sau khi xử lý xong
    loader.classList.add("hidden");
    txtDrop.classList.remove("opacity-40");

    // Reset lại value của input để có thể chọn lại chính file vừa xóa nếu muốn
    fileInput.value = "";
  }, 400);
}

// --- 4. RENDER GIAO DIỆN DANH SÁCH FILE + NÚT REMOVE ĐA NGÔN NGỮ ---
function renderFileList() {
  if (!fileList) return;

  // Xóa trắng danh sách cũ trước khi render lại
  fileList.innerHTML = "";

  // 1. Tìm ngôn ngữ hiện tại đang được chọn ở LangSelector
  const currentLang = document.getElementById("langSelector")?.value || "vi";

  // 2. Lấy từ khóa dịch "remove" tương ứng từ file translations.js
  // Nếu hệ thống dịch chưa sẵn sàng, từ khóa mặc định sẽ trả về là "Xóa"
  const textRemove =
    typeof translations !== "undefined" && translations[currentLang]?.remove
      ? translations[currentLang].remove
      : "Xóa";

  selectedFiles.forEach((file, index) => {
    // Tạo phần tử <li> với class Tailwind và animation mượt mà từ animate.css
    const li = document.createElement("li");
    li.className =
      "flex items-center justify-between p-3 bg-white dark:bg-panelBg/40 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm animate__animated animate__fadeInUp";
    li.style.animationDuration = "0.3s";

    // Tạo Object URL để làm ảnh Preview thu nhỏ (Thumbnail)
    const thumbnailUrl = URL.createObjectURL(file);

    li.innerHTML = `
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <img src="${thumbnailUrl}" class="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner flex-shrink-0" alt="preview" />
        
        <div class="truncate flex flex-col">
          <span class="text-sm font-semibold text-sky-500 dark:text-primaryBlue hover:underline cursor-pointer truncate">
            ${file.name}
          </span>
          <span class="text-xs text-gray-400 dark:text-gray-500 truncate">
            ${(file.size / 1024).toFixed(1)} KB
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

  // Cập nhật số lượng file hiển thị lên giao diện (id="fileCountDisplay")
  if (fileCountDisplay) {
    fileCountDisplay.textContent = selectedFiles.length;
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
window.confirmClearAll = function () {
  if (selectedFiles.length === 0) return;

  // Hiển thị hộp thoại xác nhận xóa danh sách tùy thuộc vào file alert.js / modal của bạn
  selectedFiles = [];
  renderFileList();
};
