const express = require('express');
const router = express.Router();

// Placeholder for Auth routes (Module 2)
router.post('/auth/register', (req, res) => {
  res.json({ message: 'Register API endpoint ready' });
});

router.post('/auth/login', (req, res) => {
  res.json({ message: 'Login API endpoint ready' });
});

// Placeholder for Memory routes (Module 4)
router.get('/memories', (req, res) => {
  res.json({ memories: [] });
});

module.exports = router;
