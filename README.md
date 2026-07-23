# 📖 Dự án Lưu giữ Kỷ niệm Gia đình (Family Memory System)

Hệ thống lưu giữ, số hóa và tương tác với kỷ niệm gia đình bằng AI (Hình ảnh, Video, Thư tay OCR, Ghi âm Speech-to-Text, Cây gia phả, Timeline & AI Chatbot).

---

## 📁 Cấu trúc Thư mục Dự án

```text
Dự án 1/
├── client/              # Frontend Web App (React / Vite + Vanilla CSS / UI Kit)
├── server/              # Backend RESTful API (Node.js + Express)
├── ai-services/         # Dịch vụ AI Offline (VietOCR, PhoWhisper, Ollama + RAG)
├── docs/                # Kiến trúc hệ thống, Database ERD & API Docs
├── .env.example         # File mẫu biến môi trường ở Root
├── .gitignore           # Cấu hình bỏ qua file trên Git
└── README.md            # Hướng dẫn dự án
```

---

## 🛠️ Hướng dẫn cho 2 Lập trình viên (VS Code & Git)

### 1. Khởi tạo Git Local & Đẩy lên Repo chung (Thực hiện 1 lần)
```bash
# Mở Terminal trong VS Code ở thư mục gốc Dự án 1
git init
git add .
git commit -m "feat: init project structure & task breakdown"
git branch -M main
git remote add origin <LINK_GITHUB_HOAC_GITLAB_CUA_BAN>
git push -u origin main
```

### 2. Quy trình 2 người cùng làm (Branching Strategy)
Để không bị ghi đè code của nhau:
- Người A làm Backend/AI: tạo nhánh `feature/backend-auth` hoặc `feature/ai-ocr`.
- Người B làm Frontend: tạo nhánh `feature/frontend-auth` hoặc `feature/ui-profile`.

**Lệnh tạo và làm việc trên nhánh mới:**
```bash
# Cập nhật code mới nhất từ main
git checkout main
git pull origin main

# Tạo nhánh tính năng mới
git checkout -b feature/ten-tinh-nang

# Sau khi sửa code xong:
git add .
git commit -m "feat: mô tả công việc đã làm"
git push origin feature/ten-tinh-nang
```

---

## ⚡ Các Lệnh Chạy Môi trường Phát triển (Local Dev)

### 1. Frontend (`client`)
```bash
cd client
npm install
npm run dev
```

### 2. Backend (`server`)
```bash
cd server
npm install
npm run dev
```

---

## 📋 Danh sách Task & Tiến độ MVP 30 Ngày

- [x] **Module 1: Khởi tạo Project & Setup Git** (STT 1-8)
- [ ] **Module 2: Authentication & Phân quyền** (STT 9-18)
- [ ] **Module 3: User Profile & Cài đặt** (STT 19-25)
- [ ] **Module 4: Upload Memory & Cloud Storage** (STT 26-41)
- [ ] **Module 5: AI OCR (Đọc thư tay offline)** (STT 42-50)
- [ ] **Module 6: Speech To Text (PhoWhisper offline)** (STT 51-57)
- [ ] **Module 7: Family Tree (Cây gia phả)** (STT 58-64)
- [ ] **Module 8: Timeline & Memory Map** (STT 65-75)
- [ ] **Module 9: AI Chatbot RAG (Ollama + Vector DB)** (STT 76-84)
- [ ] **Module 10: Admin Dashboard** (STT 85-92)
- [ ] **Module 11: AI Story Generation** (STT 93-97)
- [ ] **Module 12: Testing & Write Docs** (STT 98-102)
