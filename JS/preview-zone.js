// =========================================================================
// --- TÍNH NĂNG: TỰ ĐỘNG CẬP NHẬT PREVIEW KHI NHẬP LIỆU ---
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Danh sách ID của các ô nhập liệu thành phần tên file
  const namingInputs = [
    "prefix",
    "codeInput",
    "orderSelect",
    "streetInput",
    "wardInput",
  ];

  // Lắng nghe sự kiện thay đổi trên từng ô để cập nhật Preview lập tức
  namingInputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      // Dùng 'input' cho cả select và input text để bắt sự kiện nhanh nhất
      el.addEventListener("input", updateNamingPreview);
    }
  });
});

/**
 * Hàm xử lý chính gom các giá trị lại và tạo chuỗi Preview
 */
function updateNamingPreview() {
  const prefix = document.getElementById("prefix").value;
  const code = document.getElementById("codeInput").value.trim();
  const order = document.getElementById("orderSelect").value;
  const street = document.getElementById("streetInput").value.trim();
  const ward = document.getElementById("wardInput").value.trim();

  // =========================================================================
  // LOGIC 1: XỬ LÝ PREVIEW TÊN FILE (Giữ nguyên cấu trúc đầy đủ)
  // =========================================================================
  const parts = [];

  // 1. Tiền tố (Prefix)
  if (prefix && prefix !== "None" && prefix !== "none") {
    parts.push(prefix.toUpperCase());
  }

  // 2. Mã (Code)
  if (code) {
    parts.push(code.toUpperCase().slice(-6));
  }

  // 3. Thứ tự (Order)
  if (order && order !== "none") {
    parts.push("1"); // Hiển thị số thứ tự theo giao diện mẫu
  }

  // 4. Đường (Street)
  if (street) {
    parts.push(street.toUpperCase());
  }

  // 5. Phường (Ward)
  if (ward) {
    parts.push(ward.toUpperCase());
  }

  // Ghép các phần lại bằng dấu chấm và hiển thị lên #namePreview
  const previewResult = parts.join(".");
  const namePreviewEl = document.getElementById("namePreview");
  if (namePreviewEl) {
    namePreviewEl.innerText = previewResult;
  }

  // --- ĐOẠN CODE THÊM MỚI: TỰ ĐỘNG HIỆN/ẨN NÚT RESET ---
  const btnResetNaming = document.getElementById("btnResetNaming");
  if (btnResetNaming) {
    if (previewResult.length > 0) {
      btnResetNaming.classList.remove("hidden");
    } else {
      btnResetNaming.classList.add("hidden");
    }
  }

  // =========================================================================
  // LOGIC 2: XỬ LÝ MÃ HÓA BASE64 (Chỉ chạy và mã hóa khi CODE có đủ 6 ký tự)
  // =========================================================================
  const base64DisplayEl = document.getElementById("base64Display");
  if (base64DisplayEl) {
    if (code.length === 6) {
      // Chỉ lấy chuỗi code chuyển sang chữ hoa để mã hóa Base64
      const codeUpper = code.toUpperCase();
      const base64Str = btoa(unescape(encodeURIComponent(codeUpper)));

      base64DisplayEl.innerText = `${base64Str}`;
      base64DisplayEl.setAttribute("title", `Click to copy: ${base64Str}`);
    } else if (code.length > 6) {
      const codeUpper = code.toUpperCase().slice(-6);
      const base64Str = btoa(unescape(encodeURIComponent(codeUpper)));

      base64DisplayEl.innerText = `${base64Str}`;
      base64DisplayEl.setAttribute("title", `Click to copy: ${base64Str}`);
    } else {
      // Nếu chưa đủ 6 ký tự thì ẩn/xóa trắng chuỗi Base64
      base64DisplayEl.innerText = "";
      base64DisplayEl.removeAttribute("title");
    }
  }
}

/**
 * Hàm xử lý khi bấm nút Reset tên cấu hình (Nút ↺ Reset trên giao diện)
 */
function resetNamingConfig() {
  if (document.getElementById("prefix"))
    document.getElementById("prefix").value = "None";
  if (document.getElementById("codeInput"))
    document.getElementById("codeInput").value = "";
  if (document.getElementById("orderSelect"))
    document.getElementById("orderSelect").value = "none";
  if (document.getElementById("streetInput"))
    document.getElementById("streetInput").value = "";
  if (document.getElementById("wardInput"))
    document.getElementById("wardInput").value = "";

  // Gọi lại hàm cập nhật để xóa trắng Preview về trạng thái ban đầu
  updateNamingPreview();
}

// Thêm sự kiện click để copy nhanh chuỗi Base64 khi người dùng nhấp vào text B64
// Thêm sự kiện click để copy nhanh chuỗi Base64 khi người dùng nhấp vào text B64
document
  .getElementById("base64Display")
  ?.addEventListener("click", function () {
    const text = this.innerText.replace("B64: ", "");
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById("copyToast");
        if (toast) {
          // 1. Lấy ngôn ngữ hiện tại đang được lưu (mặc định là 'vi' nếu chưa có)
          const currentLang = localStorage.getItem("preferredLanguage") || "vi";

          // 2. Tìm câu thông báo tương ứng trong file translations.js
          const t = translations[currentLang] || translations["vi"];

          // 3. Gán chuỗi dịch (ưu tiên key 'copySuccess', nếu thiếu sẽ fallback về câu mặc định)
          toast.innerText = t.copySuccess || "✅ Đã copy vào bộ nhớ tạm!";

          // 4. Hiển thị Toast thông báo lên màn hình
          toast.classList.remove("translate-y-20", "opacity-0");
          setTimeout(() => {
            toast.classList.add("translate-y-20", "opacity-0");
          }, 2000);
        }
      });
    }
  });

function resetNamingConfig() {
  // 1. Reset các ô input text về rỗng
  const codeInput = document.getElementById("codeInput");
  const streetInput = document.getElementById("streetInput");
  const wardInput = document.getElementById("wardInput");

  if (codeInput) codeInput.value = "";
  if (streetInput) streetInput.value = "";
  if (wardInput) wardInput.value = "";

  // 2. Reset các ô select về giá trị mặc định (None / none)
  const prefixSelect = document.getElementById("prefix");
  const orderSelect = document.getElementById("orderSelect");

  if (prefixSelect) prefixSelect.value = "None"; 
  if (orderSelect) orderSelect.value = "none";   

  // =========================================================================
  // BỔ SUNG: Xóa icon tích xanh và thông báo lỗi của ô CODE khi reset
  // =========================================================================
  const sheetCodeStatus = document.getElementById("sheetCodeStatus");
  if (sheetCodeStatus) {
    sheetCodeStatus.innerHTML = ""; // Xóa sạch icon tích xanh bên trong span
  }

  const sheetCodeErrorMessage = document.getElementById("sheetCodeErrorMessage");
  if (sheetCodeErrorMessage) {
    sheetCodeErrorMessage.innerText = ""; // Xóa tin nhắn lỗi
    sheetCodeErrorMessage.classList.add("hidden"); // Ẩn vùng chứa lỗi đi
  }
  // =========================================================================

  // 3. Cập nhật lại giao diện hiển thị Preview và chuỗi Base64
  if (typeof updateNamingPreview === "function") {
    updateNamingPreview();
  }
}