// Middleware kiểm tra quyền Quản trị viên (Admin)
module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: '🚫 TỪ CHỐI TRUY CẬP: Bạn không có quyền Quản trị viên (Admin) để thực hiện thao tác này!' 
    });
  }
  next();
};
