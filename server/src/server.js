const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded images/videos
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/family_memory_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ [Database] Kết nối MongoDB thành công!'))
  .catch((err) => console.error('❌ [Database] Lỗi kết nối MongoDB:', err));

// Root URL Welcome Status Page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>MemoryVerse API Server</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #F3ECE0; color: #4E342E; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .card { background: #FFFFFF; padding: 40px; border-radius: 16px; boxShadow: 0 10px 30px rgba(78,52,46,0.15); text-align: center; border: 2px double #A88B77; max-width: 480px; }
          h1 { color: #8D6E63; margin-bottom: 12px; font-size: 26px; }
          p { color: #5D4037; font-size: 15px; margin-bottom: 24px; line-height: 1.6; }
          .status { display: inline-block; padding: 8px 16px; background: #E8F5E9; color: #2E7D32; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 20px; }
          a { display: inline-block; padding: 12px 24px; background: #8D6E63; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; transition: background 0.2s; }
          a:hover { background: #6D4C41; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🏛️ MemoryVerse API Server</h1>
          <div class="status">🟢 Máy chủ đang hoạt động bình thường (Port 5000)</div>
          <p>Hệ thống Backend Express API và kết nối CSDL MongoDB đã sẵn sàng phục vụ ứng dụng.</p>
          <a href="http://localhost:3000">🚀 Chuyển sang Giao diện Ứng dụng (Port 3000)</a>
        </div>
      </body>
    </html>
  `);
});

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend Express Server is running smoothly!',
    timestamp: new Date().toISOString()
  });
});

// Import API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 [Server] Family Memory API running on http://localhost:${PORT}`);
});
