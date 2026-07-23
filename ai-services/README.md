# 🤖 AI Services Offline Engine (Family Memory AI)

Thư mục này chứa cấu hình và hướng dẫn cài đặt dịch vụ AI chạy hoàn toàn **Offline / Local Server** (Không phụ thuộc API bên ngoài).

---

## 1. Thành phần AI Model & Công nghệ

| AI Task | Model mã nguồn mở đề xuất | Ghi chú |
| :--- | :--- | :--- |
| **Thư tay OCR** | VietOCR / Tesseract fine-tuned | Chạy offline qua Python PyTorch/ONNX |
| **Ghi âm Speech-to-Text**| PhoWhisper (Faster-Whisper) | Tối ưu nhận diện tiếng Việt cực chính xác |
| **AI Chatbot (RAG)** | Ollama + Vistral 7B / PhoGPT | Khởi tạo server LLM nội bộ qua port `11434` |
| **Vector Database** | FAISS / ChromaDB | Lưu embeddings kỷ niệm gia đình trên server |

---

## 2. Hướng dẫn Setup Server AI Local

### A. Cài đặt Ollama (LLM & Chatbot)
1. Tải và cài đặt Ollama từ [ollama.com](https://ollama.com).
2. Chạy lệnh tải model tiếng Việt:
   ```bash
   ollama run vistral
   ```

### B. Môi trường Python AI Services (FastAPI Server)
```bash
# Tạo môi trường ảo Python
python -m venv venv

# Kích hoạt venv (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Cài đặt thư viện AI cơ bản
pip install fastapi uvicorn vietocr pandas torch faiss-cpu
```
