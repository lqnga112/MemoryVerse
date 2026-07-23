const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Lấy token từ header
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Không có token, từ chối truy cập' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};
