const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String, // 'image' hoặc 'video'
    default: 'image'
  },
  title: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Memory', memorySchema);
