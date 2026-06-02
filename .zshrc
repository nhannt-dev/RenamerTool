# Vi: Hàm gộp 3 bước git thành 1 lệnh 'gpush'
# En: Combine 3 Git steps into a single 'gpush' command
# Th: ฟังก์ชันรวม Git 3 ขั้นตอนเป็นคำสั่งเดียว 'gpush'
# Ja: Gitの3つのステップを1つの「gpush」コマンドにまとめる関数
# Zh: 将 Git 的 3 步操作合并为单个命令 'gpush' 的函数
# Fr: Une fonction pour combiner 3 étapes Git en une seule commande 'gpush'
gpush() {
    git add .
    local msg="${1:-update}" 
    git commit -m "$msg"
    git push
}

# => gpush "msg commit"

# Vi: Hàm hủy commit cuối và force push lên nhánh hiện tại
# En: Undo last commit and force-push to current branch
# Th: ฟังก์ชันยกเลิกคอมมิตล่าสุดและ force push ไปยังแบรนช์ปัจจุบัน
# Ja: 直近のコミットを取り消し、現在のブランチに強制プッシュする関数
# Zh: 撤销最后一次提交并强制推送至当前分支
# Fr: Supprimer le dernier commit et forcer le push sur la branche courante
gwipe() {
    local branch=$(git rev-parse --abbrev-ref HEAD)
    echo "⚠️ Đang xóa commit gần nhất và ép lên remote nhánh: $branch..."
    git reset --hard HEAD~1 && git push origin "$branch" -f
}

# => gwipe