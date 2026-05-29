/**
 * Hàm thực hiện Upload file lên Google Drive
 * LẤY TÊN THEO ĐÚNG CÁC Ô NHẬP LIỆU (PREFIX, CODE, ORDER, STREET, WARD)
 * Viết hoa toàn bộ chữ, tự động tăng tiến ô Order dạng số nguyên chính xác.
 */
async function uploadFilesToDrive() {
  // 1. Kiểm tra trạng thái kết nối Google Drive Token
  const token =
    typeof gapi !== "undefined" && gapi.client ? gapi.client.getToken() : null;
  if (!token) {
    if (typeof showCustomAlert === "function") {
      showCustomAlert("needConnect", "error");
    } else {
      alert("⚠️ Hãy nhấn Kết nối Drive trước");
    }
    return;
  }

  // 2. Kiểm tra mảng file được chọn từ máy tính
  if (!selectedFiles || selectedFiles.length === 0) {
    const currentLang = localStorage.getItem("preferredLanguage") || "vi";
    const msgEmpty =
      translations &&
      translations[currentLang] &&
      translations[currentLang].exEmpty
        ? translations[currentLang].exEmpty
        : "Chưa có file nào được chọn để tải lên!";

    if (typeof showCustomAlert === "function") {
      showCustomAlert(msgEmpty, "warning");
    } else {
      alert(msgEmpty);
    }
    return;
  }

  // 3. Lấy ID thư mục đích từ ô input
  const folderIdInput = document.getElementById("folderId");
  let targetFolderId = folderIdInput ? folderIdInput.value.trim() : "";

  if (targetFolderId.includes("drive.google.com")) {
    const match = targetFolderId.match(/folders\/([a-zA-Z0-9-_]+)/);
    if (match && match) {
      targetFolderId = match;
    }
  }

  if (!targetFolderId) {
    if (typeof showCustomAlert === "function") {
      showCustomAlert(
        "Chưa có ID hoặc cấu hình thư mục Google Drive hợp lệ!",
        "warning",
      );
    } else {
      alert("⚠️ Chưa có ID hoặc cấu hình thư mục Google Drive hợp lệ!");
    }
    return;
  }

  // 4. Đổi trạng thái hiển thị của nút bấm sang "Đang tải lên..."
  const currentLang = localStorage.getItem("preferredLanguage") || "vi";
  const t =
    translations && translations[currentLang] ? translations[currentLang] : {};
  const btnUpload = document.getElementById("btnUploadText");
  const originalBtnText = btnUpload ? btnUpload.innerText : "";

  if (btnUpload) {
    btnUpload.innerText = t.uploading || "Đang tải lên...";
    btnUpload.disabled = true;
    btnUpload.style.opacity = "0.7";
  }

  // LẤY GIÁ TRỊ TỪ CÁC INPUT CHUẨN THEO FILE INDEX.TXT CỦA BẠN
  const prefix = document.getElementById("prefix").value;
  const code = document.getElementById("codeInput").value.trim();
  const street = document.getElementById("streetInput").value.trim();
  const ward = document.getElementById("wardInput").value.trim();

  // Đọc giá trị ô Order từ đúng ID "orderInput" làm số nguyên (Mặc định là 1 nếu trống)
  const orderInputValue = document.getElementById("orderInput")
    ? document.getElementById("orderInput").value
    : "";
  let baseOrder = parseInt(orderInputValue, 10);
  if (isNaN(baseOrder)) {
    baseOrder = 1;
  }

  let successCount = 0;

  try {
    // 5. Duyệt qua từng file trong mảng selectedFiles để tiến hành upload
    for (let i = 0; i < selectedFiles.length; i++) {
      const fileObj = selectedFiles[i];

      // Lấy phần mở rộng đuôi file gốc (.png, .jpg) từ máy tính và CHUYỂN THÀNH VIẾT HOA (.PNG, .JPEG)
      const fileExtension = fileObj.name
        .substring(fileObj.name.lastIndexOf("."))
        .toUpperCase();

      // Tự động tăng số thứ tự chính xác cho từng file theo vòng lặp (Không bị NaN)
      const currentOrder = baseOrder + i;

      // Xây dựng mảng các thành phần cấu tạo tên file
      const nameParts = [];

      // 1. Tiền tố (Prefix) -> Ép viết hoa
      if (prefix && prefix !== "None") {
        nameParts.push(prefix.toUpperCase());
      }
      // 2. Mã (Code) -> Ép viết hoa
      if (code) {
        nameParts.push(code.toUpperCase());
      }
      // 3. Thứ tự (Order hiện tại)
      nameParts.push(currentOrder);

      // 4. Đường (Street) -> Ép viết hoa
      if (street) {
        nameParts.push(street.toUpperCase());
      }
      // 5. Phường (Ward) -> Ép viết hoa
      if (ward) {
        nameParts.push(ward.toUpperCase());
      }

      // Ghép các phần lại bằng dấu chấm "." và nối với đuôi mở rộng viết hoa
      const finalFileName = nameParts.join(".") + fileExtension;

      // Đọc luồng dữ liệu nhị phân từ file gốc trên máy tính
      const fileData = await readFileAsArrayBuffer(fileObj);

      // Cấu hình Metadata đẩy lên Drive
      const metadata = {
        name: finalFileName,
        parents: [targetFolderId],
      };

      // Đóng gói dữ liệu dạng Multipart Request
      const boundary = "xxxxxxxx_multipart_boundary_xxxxxxxx";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metadataPart =
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata);
      const mediaPartHeader = `Content-Type: ${fileObj.type}\r\nContent-Transfer-Encoding: base64\r\n\r\n`;
      const base64Data = arrayBufferToBase64(fileData);

      const multipartRequestBody =
        delimiter +
        metadataPart +
        delimiter +
        mediaPartHeader +
        base64Data +
        closeDelimiter;

      // Thực hiện gửi Request lên Google Drive API v3
      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        },
      );

      if (response.ok) {
        successCount++;
      } else {
        console.error(`Lỗi khi tải file thứ ${i + 1}:`, await response.text());
      }
    }

    // 6. Thông báo kết quả sau khi kết thúc
    if (successCount === selectedFiles.length) {
      if (typeof showCustomAlert === "function") {
        await showCustomAlert("uploadSuccess", "success");
      } else {
        alert("🎉 Tải lên thành công!");
      }

      // Gọi hàm xóa danh sách hàng hiển thị sau khi up xong (có sẵn trong file-action.js)
      if (typeof clearAllFiles === "function") {
        clearAllFiles();
      }
    } else if (successCount > 0) {
      alert(
        `Đã tải lên thành công ${successCount}/${selectedFiles.length} file.`,
      );
    } else {
      alert("❌ Tải lên thất bại. Hãy kiểm tra lại cấu hình Drive!");
    }
  } catch (error) {
    console.error("Lỗi hệ thống trong quá trình upload:", error);
    alert("⚠️ Đã xảy ra lỗi kết nối mạng!");
  } finally {
    // Phục hồi lại trạng thái ban đầu của nút bấm
    if (btnUpload) {
      btnUpload.innerText =
        originalBtnText || t.uploadButton || "🚀 Tải lên Google Drive";
      btnUpload.disabled = false;
      btnUpload.style.opacity = "1";
    }
  }
}

/**
 * Hàm đọc File nhị phân sang ArrayBuffer
 */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Hàm mã hóa ArrayBuffer sang Base64 chuỗi an toàn
 */
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
