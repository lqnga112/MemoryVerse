# 🗄️ Database Schema Specification (ERD & Table Structures)

Dưới đây là sơ đồ cấu trúc dữ liệu cho toàn bộ các bảng trong dự án.

---

## 1. Danh sách Các Bảng Dữ liệu (Tables)

### Bảng `users` (Quản lý tài khoản)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | UUID / INT (PK) | Khóa chính |
| `email` | VARCHAR(255) | Email đăng nhập (Unique) |
| `password_hash` | VARCHAR(255) | Mật khẩu đã mã hóa (bcrypt) |
| `full_name` | VARCHAR(100) | Họ và tên |
| `avatar_url` | VARCHAR(500) | Link ảnh đại diện |
| `role` | ENUM | `'admin'`, `'moderator'`, `'user'` |
| `is_verified` | BOOLEAN | Trạng thái xác thực email OTP |
| `created_at` | TIMESTAMP | Ngày tạo tài khoản |

### Bảng `memories` (Kỷ niệm: Ảnh, Video, Ghi âm, Thư tay)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Khóa chính kỷ niệm |
| `user_id` | UUID (FK) | Người upload |
| `type` | ENUM | `'image'`, `'video'`, `'audio'`, `'handwritten_letter'` |
| `file_url` | VARCHAR(500) | Đường dẫn file gốc |
| `thumbnail_url` | VARCHAR(500) | Đường dẫn ảnh thu nhỏ |
| `ocr_text` | TEXT | Văn bản trích xuất từ AI OCR (Thư tay) |
| `stt_text` | TEXT | Transcript từ AI Speech-To-Text (Ghi âm) |
| `taken_date` | DATE | Ngày chụp/ghi âm kỷ niệm |
| `location_name`| VARCHAR(255) | Địa điểm (Geo-tag) |
| `latitude` | DECIMAL(9,6) | Tọa độ vĩ độ |
| `longitude` | DECIMAL(9,6) | Tọa độ kinh độ |
| `created_at` | TIMESTAMP | Thời gian tải lên hệ thống |

### Bảng `family_members` (Cây gia phả)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Khóa chính thành viên |
| `user_id` | UUID (FK) | Tài khoản sở hữu gia phả |
| `full_name` | VARCHAR(100) | Tên người trong gia đình |
| `relationship` | VARCHAR(50) | Cha, Mẹ, Con, Vợ, Chồng, Anh/Chị/Em |
| `birth_date` | DATE | Ngày sinh |
| `avatar_url` | VARCHAR(500) | Ảnh đại diện trong cây gia phả |

### Bảng `timeline_events` (Dòng thời gian sự kiện)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Khóa chính sự kiện |
| `title` | VARCHAR(255) | Tiêu đề sự kiện |
| `description` | TEXT | Mô tả chi tiết sự kiện |
| `event_date` | DATE | Ngày diễn ra (Auto-sort) |
| `memory_ids` | JSON / ARRAY | Danh sách ID các kỷ niệm liên quan |
| `member_ids` | JSON / ARRAY | Danh sách ID thành viên liên quan |

### Bảng `chat_history` (Lịch sử hỏi đáp AI Chatbot RAG)
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Khóa chính hội thoại |
| `user_id` | UUID (FK) | Người hỏi |
| `question` | TEXT | Câu hỏi của người dùng |
| `answer` | TEXT | Câu trả lời của AI |
| `created_at` | TIMESTAMP | Thời gian hỏi |
