/**
 * Hàm phát âm thanh thông báo an toàn, tự động xử lý khi bị trình duyệt chặn Autoplay
 * @param {string} soundName - Tên file âm thanh cần phát lấy từ localStorage
 */
function playWelcomeSound(soundName) {
  if (soundName === "none" || !soundName) return;

  globalAudio.pause();
  globalAudio.src = `Sounds/${soundName}.mp3`;
  globalAudio.loop = false;

  // Thực hiện phát âm thanh bằng Promise
  globalAudio.play().catch((error) => {
    console.warn("Chính sách Autoplay của trình duyệt đã chặn âm thanh tự động. Sẽ phát bù ngay khi người dùng tương tác với ứng dụng.", error);

    // Thiết lập hàm phát bù khi người dùng tương tác (click chuột, chạm màn hình hoặc bấm phím)
    const playOnFirstInteraction = () => {
      // Chỉ phát nếu âm thanh đang dừng
      if (globalAudio.paused) {
        globalAudio.play().catch(e => console.error("Vẫn không thể phát âm thanh sau tương tác:", e));
      }
      // Hủy bỏ lắng nghe sự kiện ngay sau khi thực hiện xong để tránh phát lại ở các lần click sau
      document.removeEventListener("click", playOnFirstInteraction);
      document.removeEventListener("touchstart", playOnFirstInteraction);
      document.removeEventListener("keydown", playOnFirstInteraction);
    };

    // Đăng ký lắng nghe hành động đầu tiên của người dùng trên toàn bộ trang
    document.addEventListener("click", playOnFirstInteraction);
    document.addEventListener("touchstart", playOnFirstInteraction);
    document.addEventListener("keydown", playOnFirstInteraction);
  });
}