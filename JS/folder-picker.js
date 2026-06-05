/**
 * Hàm mở Modal Explorer (Gắn với nút id="btn-open-picker")
 */
async function showPicker() {
  const token = gapi.client.getToken();
  if (!token) {
    showCustomAlert("needConnect", "error");
    return;
  }

  const modal = document.getElementById("folderExplorerModal");
  if (modal) {
    // 1. Gỡ bỏ class ẩn và xóa sạch các class animation cũ (nếu có)
    modal.classList.remove("hidden");
    modal.classList.remove("animate__fadeOut", "animate__animated", "animate__faster");
    
    // 2. Thêm hiệu ứng xuất hiện (Fade In)
    modal.classList.add("animate__animated", "animate__fadeIn", "animate__faster");

    // BỔ SUNG: Lắng nghe sự kiện nhấn phím Esc khi modal mở ra
    document.addEventListener("keydown", handleEscKey);

    // Reset trạng thái ban đầu khi mở lên
    clearModalSearch();
    currentFolderId = "root";
    currentFolderName = "My Drive";
    folderHistory = [{ id: "root", name: "My Drive" }];

    await loadSubFolders(currentFolderId);

    setTimeout(() => {
      modal.onclick = (e) => {
        if (e.target === modal) {
          closeFolderExplorer();
        }
      };
    }, 0);

    // BỔ SUNG: Lắng nghe sự kiện click vào vùng nền tối để tự đóng modal
    // Xóa sự kiện cũ nếu có để tránh trùng lặp
    modal.onclick = null;
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeFolderExplorer();
      }
    };
  }
}

/**
 * Đóng Modal Explorer
 */
function closeFolderExplorer() {
  const modal = document.getElementById("folderExplorerModal");
  if (modal) {
    // BỔ SUNG: Lắng nghe sự kiện nhấn phím Esc khi modal mở ra
    document.addEventListener("keydown", handleEscKey);
    
    // 1. Gỡ hiệu ứng xuất hiện, thêm hiệu ứng biến mất
    modal.classList.remove("animate__fadeIn");
    modal.classList.add("animate__fadeOut");

    // 2. Chờ hiệu ứng Fade Out chạy xong (animate__faster thường tốn ~150ms-200ms) rồi mới ẩn hẳn
    // Cách 1: Dùng setTimeout (Đơn giản, dễ dùng)
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 200);
  };

}

/**
 * Tải danh sách các thư mục con theo cấu trúc thư mục hiện tại
 * @param {string} parentId - ID của thư mục cha
 */
async function loadSubFolders(parentId) {
  const loader = document.getElementById("modalLoader");
  const container = document.getElementById("folderListContainer");
  const emptyMsg = document.getElementById("emptyFolderMsg");

  if (!container || !loader || !emptyMsg) return;

  isSearchingMode = false;
  container.innerHTML = "";
  loader.classList.remove("hidden");
  emptyMsg.classList.add("hidden");

  const currentSelectedTxt = document.getElementById(
    "currentSelectedFolderName",
  );
  if (currentSelectedTxt) currentSelectedTxt.innerText = currentFolderName;

  renderModalBreadcrumb();

  try {
    const response = await gapi.client.drive.files.list({
      q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name)",
      orderBy: "name",
      pageSize: 150,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const folders = response.result.files || [];
    loader.classList.add("hidden");
    renderFoldersList(folders);
  } catch (err) {
    console.error("Lỗi khi tải cấu trúc thư mục con từ Google Drive API:", err);
    loader.classList.add("hidden");
    container.innerHTML = `<li class="text-center py-5 text-sm text-rose-500 font-medium">Không thể truy cập dữ liệu thư mục này hoặc phiên làm việc đã hết hạn.</li>`;
  }
}

/**
 * Hàm vẽ danh sách các thư mục ra giao diện Modal
 * @param {Array} folders - Danh sách mảng các thư mục cần vẽ
 */
function renderFoldersList(folders) {
  const container = document.getElementById("folderListContainer");
  const emptyMsg = document.getElementById("emptyFolderMsg");

  if (!container || !emptyMsg) return;
  container.innerHTML = "";

  if (folders.length === 0) {
    emptyMsg.classList.remove("hidden");
    return;
  }
  emptyMsg.classList.add("hidden");

  folders.forEach((folder) => {
    const li = document.createElement("li");
    li.className =
      "flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer rounded-lg group transition animate__animated animate__fadeIn animate__faster";

    // Khi bấm vào thư mục, đi sâu vào bên trong thư mục đó
    li.onclick = () => navigateToFolder(folder.id, folder.name);

    li.innerHTML = `
            <div class="flex items-center gap-3 truncate">
                <span class="text-xl">📁</span>
                <div class="flex flex-col truncate">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primaryBlue truncate">${folder.name}</span>
                    ${isSearchingMode ? `<span class="text-[10px] text-gray-400 italic">Tìm kiếm toàn cục trên Drive</span>` : ""}
                </div>
            </div>
            <span class="text-xs text-gray-400 group-hover:text-primaryBlue font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">➔</span>
        `;
    container.appendChild(li);
  });
}

/**
 * Hàm tiếp nhận ký tự từ thanh input và áp dụng Debounce hoãn gọi API
 */
function handleSearchInput(value) {
  const btnReset = document.getElementById("btnResetSearch");
  const keyword = value.trim();

  // Ẩn/Hiện dấu x xóa nhanh từ khóa
  if (keyword.length > 0) {
    if (btnReset) btnReset.classList.remove("hidden");
  } else {
    if (btnReset) btnReset.classList.add("hidden");
    // Nếu người dùng xóa hết chữ, trả về danh sách thư mục con bình thường
    loadSubFolders(currentFolderId);
    return;
  }

  // Xóa bộ đếm thời gian cũ nếu người dùng đang gõ dở dang
  clearTimeout(searchTimeout);

  // Người dùng dừng gõ 500ms mới bắt đầu kích hoạt quét toàn cục
  searchTimeout = setTimeout(() => {
    searchFoldersGlobal(keyword);
  }, 500);
}

/**
 * Gọi API Google Drive tìm kiếm thư mục TOÀN CỤC theo tên
 * @param {string} keyword - Từ khóa tìm kiếm
 */
async function searchFoldersGlobal(keyword) {
  const loader = document.getElementById("modalLoader");
  const container = document.getElementById("folderListContainer");
  const emptyMsg = document.getElementById("emptyFolderMsg");
  const bcContainer = document.getElementById("modalBreadcrumb");

  if (!container || !loader || !emptyMsg) return;

  isSearchingMode = true;
  container.innerHTML = "";
  loader.classList.remove("hidden");
  emptyMsg.classList.add("hidden");

  // Đổi hiển thị breadcrumb thành text báo trạng thái tìm kiếm
  if (bcContainer) {
    bcContainer.innerHTML = `<span class="text-gray-400 italic">Kết quả tìm kiếm toàn cục: "${keyword}"</span>`;
  }

  try {
    // Truy vấn q tìm tên chứa từ khóa trên toàn bộ các folder không nằm trong thùng rác
    const response = await gapi.client.drive.files.list({
      q: `mimeType = 'application/vnd.google-apps.folder' and name contains '${keyword.replace(/'/g, "\\'")}' and trashed = false`,
      fields: "files(id, name)",
      orderBy: "name",
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const globalFolders = response.result.files || [];
    loader.classList.add("hidden");
    renderFoldersList(globalFolders);
  } catch (err) {
    console.error("Lỗi khi tìm kiếm toàn cục:", err);
    loader.classList.add("hidden");
    container.innerHTML = `<li class="text-center py-5 text-sm text-rose-500 font-medium">Đã xảy ra lỗi trong quá trình quét dữ liệu Drive toàn cục.</li>`;
  }
}

/**
 * Xóa trắng từ khóa tìm kiếm và khôi phục trạng thái danh sách thường
 */
function clearModalSearch() {
  const searchInput = document.getElementById("modalSearchInput");
  const btnReset = document.getElementById("btnResetSearch");

  if (searchInput) searchInput.value = "";
  if (btnReset) btnReset.classList.add("hidden");

  if (isSearchingMode) {
    loadSubFolders(currentFolderId);
  }
}

/**
 * Hàm điều hướng cây thư mục
 */
function navigateToFolder(id, name) {
  currentFolderId = id;
  currentFolderName = name;

  // Nếu đang ở chế độ tìm kiếm toàn cục mà người dùng click chọn thư mục nào đó,
  // ta sẽ biến thư mục đó thành thư mục con hiện tại để họ duyệt sâu tiếp vào bên trong.
  if (isSearchingMode) {
    folderHistory = [
      { id: "root", name: "My Drive" },
      { id: id, name: name },
    ];
  } else {
    const index = folderHistory.findIndex((item) => item.id === id);
    if (index !== -1) {
      folderHistory = folderHistory.slice(0, index + 1);
    } else {
      folderHistory.push({ id, name });
    }
  }

  loadSubFolders(currentFolderId);
}

/**
 * Vẽ thanh Breadcrumb đường dẫn
 */
function renderModalBreadcrumb() {
  const bcContainer = document.getElementById("modalBreadcrumb");
  if (!bcContainer || isSearchingMode) return;
  bcContainer.innerHTML = "";

  folderHistory.forEach((item, idx) => {
    const span = document.createElement("span");
    span.className =
      "cursor-pointer font-medium hover:underline transition " +
      (idx === folderHistory.length - 1
        ? "text-gray-800 dark:text-gray-200 font-bold pointer-events-none"
        : "text-primaryBlue");
    span.innerText = item.name;
    span.onclick = (e) => {
      e.stopPropagation();
      navigateToFolder(item.id, item.name);
    };

    bcContainer.appendChild(span);

    if (idx < folderHistory.length - 1) {
      const separator = document.createElement("span");
      separator.className = "text-gray-400 px-1 select-none";
      separator.innerText = ">";
      bcContainer.appendChild(separator);
    }
  });
}

/**
 * Nút xác nhận: Đẩy Folder ID vào input và tắt modal
 */
function confirmSelectFolder() {
  const folderIdInput = document.getElementById("folderId");
  if (folderIdInput) {
    folderIdInput.value = currentFolderId;
    saveConfigToStorage();
    fetchAndDisplayFolderName();
    closeFolderExplorer();
  }
}

/**
 * Xử lý sự kiện nhấn phím Esc để đóng modal
 */
function handleEscKey(e) {
  if (e.key === "Escape" || e.keyCode === 27) {
    closeFolderExplorer();
  }
}