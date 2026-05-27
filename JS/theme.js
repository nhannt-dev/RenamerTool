const themeSelector = document.getElementById("themeSelector");
const htmlEl = document.documentElement;

if (themeSelector) {
  themeSelector.addEventListener("change", (e) => {
    localStorage.setItem("app-theme", e.target.value);
    initTheme();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const splashScreen = document.getElementById("splash-screen");
  const splashBar = document.getElementById("splash-bar");
  const mainApp = document.getElementById("main-app");

  // --- CẤU HÌNH DELAY TẠI ĐÂY ---
  const DELAY_AFTER_LOAD = 2500; // Thời gian chờ (miligiây) sau khi đạt 100% rồi mới ẩn Splash
  const PROGRESS_SPEED = 10; // Số càng nhỏ, thanh tiến trình chạy giả lập càng chậm lúc đầu
  // ------------------------------

  let progress = 0;
  const progressInterval = setInterval(() => {
    if (progress < 85) {
      progress += Math.random() * PROGRESS_SPEED;
      if (progress > 85) progress = 85;
      if (splashBar) splashBar.style.width = `${progress}%`;
    }
  }, 120);

  window.addEventListener("load", () => {
    clearInterval(progressInterval);
    if (splashBar) splashBar.style.width = "100%";

    setTimeout(() => {
      if (splashScreen && mainApp) {
        splashScreen.classList.add("opacity-0", "pointer-events-none");
        mainApp.classList.remove("opacity-0");
        mainApp.classList.add("opacity-100");

        setTimeout(() => {
          splashScreen.remove();
        }, 500);
      }
    }, DELAY_AFTER_LOAD);
  });
});

function applyTheme(theme) {
  if (theme === "dark") {
    htmlEl.classList.add("dark");
    htmlEl.setAttribute("data-theme", "dark");
    htmlEl.style.colorScheme = "dark";
  } else {
    htmlEl.classList.remove("dark");
    htmlEl.setAttribute("data-theme", "light");
    htmlEl.style.colorScheme = "light";
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("app-theme") || "device";

  if (themeSelector && themeSelector.value !== savedTheme) {
    themeSelector.value = savedTheme;
  }

  if (savedTheme === "device") {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    applyTheme(systemPrefersDark ? "dark" : "light");
  } else {
    applyTheme(savedTheme);
  }
}

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    const savedTheme = localStorage.getItem("app-theme") || "device";
    if (savedTheme === "device") {
      initTheme();
    }
  });

initTheme();