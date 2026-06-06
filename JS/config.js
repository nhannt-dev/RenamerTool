tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Bảng màu High Contrast (đã tối ưu độ tương phản cho nút Kết nối Drive)
        darkBg: "#0d0e15",
        panelBg: "#151726",
        inputBg: "#1e2238",
        primaryBlue: "#0284c7", // Tone xanh Sky đậm giúp text trắng cực kỳ rõ ràng
        dangerRed: "#f43f5e",
        darkFocus: "#fff",
      },
      // Cấu hình font Comfortaa làm mặc định cho class font-sans
      fontFamily: {
        sans: ["Comfortaa", "cursive", "sans-serif"],
      },
    },
  },
};
