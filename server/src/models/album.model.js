const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverImage: {
    type: String, // Có thể lấy ngẫu nhiên 1 ảnh trong album làm cover
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Album', albumSchema);
