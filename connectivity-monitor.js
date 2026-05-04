// connectivity-monitor.js
(function() {
    // 1. Tạo phần tử hiển thị thông báo
    const banner = document.createElement('div');
    banner.id = 'network-status-banner';
    Object.assign(banner.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        padding: '12px',
        textAlign: 'center',
        zIndex: '10000',
        fontWeight: 'bold',
        display: 'none',
        transition: 'all 0.4s ease',
        fontFamily: 'sans-serif'
    });
    document.body.appendChild(banner);

    // 2. Hàm lấy bản dịch dựa trên ngôn ngữ hiện tại
    function getMessage(type) {
        const lang = localStorage.getItem('app-lang') || 'vi';
        
        // Truy xuất từ đối tượng translations trong file chính
        if (typeof translations !== 'undefined' && translations[lang]) {
            return type === 'online' ? translations[lang].netOnline : translations[lang].netOffline;
        }
        
        const fallback = {
            vi: { online: "🌐 Đã khôi phục kết nối Internet!", offline: "⚠️ Mất kết nối Internet. Vui lòng kiểm tra đường truyền!" },
            en: { online: "🌐 Internet connection restored!", offline: "⚠️ No Internet connection. Please check your network!" }
        };
        return type === 'online' ? fallback[lang].online : fallback[lang].offline;
    }

    function updateStatus() {
        if (navigator.onLine) {
            banner.innerText = getMessage('online');
            banner.style.backgroundColor = "#28a745";
            banner.style.color = "white";
            banner.style.display = 'block';
            setTimeout(() => {
                banner.style.display = 'none';
            }, 3000);
        } else {
            banner.innerText = getMessage('offline');
            banner.style.backgroundColor = "#ff4d4d";
            banner.style.color = "white";
            banner.style.display = 'block';
        }
    }

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    if (!navigator.onLine) {
        updateStatus();
    }
})();