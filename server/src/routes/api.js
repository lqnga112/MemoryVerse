const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// --- Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// --- Protected Route Example ---
router.get('/auth/me', authMiddleware, authController.getUserProfile);

const albumController = require('../controllers/album.controller');
const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ file bằng Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Thư mục lưu file
  },
  filename: function (req, file, cb) {
    // Đặt tên file là timestamp + tên gốc để chống trùng lặp
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- Album & Memory Routes ---
router.post('/albums', authMiddleware, albumController.createAlbum);
router.get('/albums', authMiddleware, albumController.getAlbums);
router.get('/albums/:albumId/memories', authMiddleware, albumController.getMemories);
router.post('/albums/:albumId/memories', authMiddleware, upload.single('file'), albumController.uploadMemory);

const aiController = require('../controllers/ai.controller');

// --- Edit & Delete Routes ---
router.put('/albums/:albumId', authMiddleware, albumController.updateAlbum);
router.delete('/albums/:albumId', authMiddleware, albumController.deleteAlbum);
router.put('/memories/:memoryId', authMiddleware, albumController.updateMemory);
router.delete('/memories/:memoryId', authMiddleware, albumController.deleteMemory);

// --- AI Routes ---
router.post('/ai/ocr/:memoryId', authMiddleware, aiController.extractTextFromImage);

module.exports = router;
