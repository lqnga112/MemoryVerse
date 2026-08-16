const User = require('../models/user.model');
const Album = require('../models/album.model');
const Memory = require('../models/memory.model');

// Lấy thống kê hệ thống dành cho Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAlbums = await Album.countDocuments();
    const totalMemories = await Memory.countDocuments();
    
    // Thống kê số lượng OCR / Audio memories
    const ocrMemories = await Memory.countDocuments({ ocr_text: { $ne: '' } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAlbums,
        totalMemories,
        ocrMemories,
        systemStatus: 'Hoạt động tốt',
        databaseEngine: 'MongoDB Persistent (db_data)',
        storageUsed: 'Cố định trên ổ cứng'
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy thống kê hệ thống' });
  }
};

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password_hash').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách người dùng' });
  }
};

// Cập nhật vai trò (Role) của người dùng
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'user', 'moderator'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password_hash');

    res.json({ success: true, message: 'Cập nhật vai trò thành công', user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật vai trò' });
  }
};

// Tự động nâng cấp tài khoản hiện tại thành Admin (Phục vụ trải nghiệm nhanh)
exports.makeMeAdmin = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { role: 'admin' },
      { new: true }
    ).select('-password_hash');

    res.json({ success: true, message: 'Đã nâng cấp tài khoản thành Quản trị viên (Admin)!', user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi nâng cấp Admin' });
  }
};
