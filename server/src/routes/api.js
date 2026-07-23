const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// --- Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// --- Protected Route Example ---
router.get('/auth/me', authMiddleware, (req, res) => {
  res.json({ message: 'Đây là dữ liệu cá nhân', user: req.user });
});

// --- Placeholder for Memory routes (Module 4) ---
router.get('/memories', authMiddleware, (req, res) => {
  res.json({ memories: [] });
});

module.exports = router;
