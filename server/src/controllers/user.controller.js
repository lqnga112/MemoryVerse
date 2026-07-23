const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password_hash');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { full_name, bio },
      { new: true }
    ).select('-password_hash');
    
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh' });
    
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { avatar_url: avatarUrl },
      { new: true }
    ).select('-password_hash');
    
    res.json(user);
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    user.password_hash = newPasswordHash;
    await user.save();
    
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
