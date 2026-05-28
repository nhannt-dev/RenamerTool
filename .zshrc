# Hàm gộp 3 bước git thành 1 lệnh 'gpush'
gpush() {
    git add .
    local msg="${1:-update}" 
    git commit -m "$msg"
    git push
}
