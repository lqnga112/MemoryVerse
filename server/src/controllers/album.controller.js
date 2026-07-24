const Album = require('../models/album.model');
const Memory = require('../models/memory.model');

// --- Quản lý Album ---
exports.createAlbum = async (req, res) => {
  try {
    const { title, description } = req.body;
    const album = new Album({
      title,
      description,
      ownerId: req.user.userId
    });
    await album.save();
    res.status(201).json(album);
  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo album' });
  }
};

exports.getAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ ownerId: req.user.userId }).sort({ createdAt: -1 });
    res.json(albums);
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách album' });
  }
};

// --- Quản lý Memory (Ảnh/Video) ---
exports.uploadMemory = async (req, res) => {
  try {
    const { albumId } = req.params;
    
    // Kiểm tra file upload
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file để tải lên' });
    }

    // Kiểm tra album tồn tại và thuộc quyền sở hữu
    const album = await Album.findOne({ _id: albumId, ownerId: req.user.userId });
    if (!album) {
      return res.status(404).json({ message: 'Không tìm thấy album' });
    }

    // Xác định loại file
    const fileType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    
    // Tạo link truy cập file tĩnh
    const fileUrl = `/uploads/${req.file.filename}`;

    const memory = new Memory({
      albumId,
      ownerId: req.user.userId,
      fileUrl,
      fileType,
      title: req.file.originalname
    });

    await memory.save();

    // Nếu album chưa có ảnh cover, lấy ảnh này làm cover luôn (chỉ áp dụng cho ảnh)
    if (!album.coverImage && fileType === 'image') {
      album.coverImage = fileUrl;
      await album.save();
    }

    res.status(201).json(memory);
  } catch (error) {
    console.error('Upload memory error:', error);
    res.status(500).json({ message: 'Lỗi server khi tải lên kỷ niệm' });
  }
};

exports.getMemories = async (req, res) => {
  try {
    const { albumId } = req.params;
    
    // Kiểm tra quyền truy cập album
    const album = await Album.findOne({ _id: albumId, ownerId: req.user.userId });
    if (!album) {
      return res.status(404).json({ message: 'Không tìm thấy album' });
    }

    const memories = await Memory.find({ albumId }).sort({ createdAt: -1 });
    res.json({ album, memories });
  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách kỷ niệm' });
  }
};

// --- Update & Delete Album ---
exports.updateAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { title, description } = req.body;
    
    const album = await Album.findOneAndUpdate(
      { _id: albumId, ownerId: req.user.userId },
      { title, description },
      { new: true }
    );
    
    if (!album) return res.status(404).json({ message: 'Không tìm thấy album' });
    res.json(album);
  } catch (error) {
    console.error('Update album error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật album' });
  }
};

const fs = require('fs');
const path = require('path');

exports.deleteAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const album = await Album.findOneAndDelete({ _id: albumId, ownerId: req.user.userId });
    
    if (!album) return res.status(404).json({ message: 'Không tìm thấy album' });
    
    // Xóa tất cả ảnh trong album khỏi ổ cứng
    const memories = await Memory.find({ albumId });
    for (const memory of memories) {
      if (memory.fileUrl) {
        const filePath = path.join(__dirname, '../../', memory.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    
    // Xóa tất cả records trong database
    await Memory.deleteMany({ albumId });
    
    res.json({ message: 'Đã xóa album và toàn bộ kỷ niệm bên trong' });
  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa album' });
  }
};

// --- Update & Delete Memory ---
exports.updateMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const { title } = req.body;
    
    const memory = await Memory.findOneAndUpdate(
      { _id: memoryId, ownerId: req.user.userId },
      { title },
      { new: true }
    );
    
    if (!memory) return res.status(404).json({ message: 'Không tìm thấy kỷ niệm' });
    res.json(memory);
  } catch (error) {
    console.error('Update memory error:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật kỷ niệm' });
  }
};

exports.deleteMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const memory = await Memory.findOneAndDelete({ _id: memoryId, ownerId: req.user.userId });
    
    if (!memory) return res.status(404).json({ message: 'Không tìm thấy kỷ niệm' });
    
    // Xóa file cứng
    if (memory.fileUrl) {
      const filePath = path.join(__dirname, '../../', memory.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.json({ message: 'Đã xóa kỷ niệm' });
  } catch (error) {
    console.error('Delete memory error:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa kỷ niệm' });
  }
};
