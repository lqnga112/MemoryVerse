# 🏗️ System Architecture Specification - Family Memory System

## 1. Tổng quan Kiến trúc Kỹ thuật

Hệ thống được thiết kế theo mô hình **Decoupled Architecture** (Frontend - Backend - AI Inference Engine tách biệt):

```text
┌─────────────────────────────────────────────────────────┐
│              Client (Frontend Web App)                  │
│       React / Vite + Glassmorphism UI Kit               │
└───────────────────────────┬─────────────────────────────┘
                            │ REST API / HTTPS / JWT
┌───────────────────────────▼─────────────────────────────┐
│                 Node.js / Express Server                │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│ │ Auth & Role │ │ Memory CRUD │ │ Upload Handler      │ │
│ └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────┬───────────────────────────┬───────────────┘
              │                           │
┌─────────────▼─────────────┐   ┌─────────▼───────────────┐
│ Primary Database          │   │ AI Inference Server     │
│ PostgreSQL / MongoDB      │   │ (Python FastAPI / Local)│
│ (User, Profile, Events)   │   │ - VietOCR / Tesseract   │
└───────────────────────────┘   │ - PhoWhisper (Audio)   │
                                │ - Ollama (Vistral/LLM)  │
                                │ - FAISS (Vector DB)     │
                                └─────────────────────────┘
```

---

## 2. Các Thành phần Kỹ thuật Chính

### A. Frontend (Client)
- **Framework**: React / Vite (giao diện siêu nhanh, HMR tức thì trên VS Code).
- **Styling**: Vanilla CSS Modules / CSS Variables thiết kế theo phong cách hiện đại (Dark Mode, Glassmorphism, Micro-animations).
- **State Management**: React Context API / Zustand.

### B. Backend (Server)
- **Framework**: Node.js + Express.js.
- **Xác thực**: JWT (JSON Web Token) + Refresh Token + OTP Email.
- **Upload File**: Middleware `multer` + nén media (Sharp cho ảnh, Fluent-FFmpeg cho video) + Lưu trữ Storage.

### C. AI Services (Offline Server - No External API)
- **OCR Thư tay**: VietOCR / Tesseract model fine-tuned tiếng Việt.
- **Speech-to-Text**: PhoWhisper (Whisper fine-tuned tiếng Việt) chạy local.
- **RAG Chatbot**: Ollama + Vistral 7B / PhoGPT + Vector DB (FAISS / ChromaDB).

---

## 3. Chiến lược Bảo mật & Phân quyền
- **Role-Based Access Control (RBAC)**: User (Thành viên gia đình), Moderator, Admin.
- **Data Privacy**: Toàn bộ AI Model chạy offline trên server riêng, không gửi dữ liệu kỷ niệm cá nhân ra các API bên ngoài.
