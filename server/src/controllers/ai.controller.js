const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const Memory = require('../models/memory.model');

// Hàm Helper để chuyển đổi file ảnh thành định dạng mà Gemini cần
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

exports.extractTextFromImage = async (req, res) => {
  try {
    const { memoryId } = req.params;
    
    // Tìm bức ảnh trong DB
    const memory = await Memory.findOne({ _id: memoryId, ownerId: req.user.userId });
    if (!memory) {
      return res.status(404).json({ message: 'Không tìm thấy kỷ niệm' });
    }
    
    if (memory.fileType !== 'image') {
      return res.status(400).json({ message: 'Tính năng này chỉ hỗ trợ hình ảnh' });
    }

    // Lấy đường dẫn thật của ảnh trên máy
    const filePath = path.join(__dirname, '../../', memory.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File ảnh không tồn tại trên máy' });
    }

    // Khởi tạo Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // Xác định MimeType (VD: image/jpeg, image/png)
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.heic') mimeType = 'image/heic';
    else if (ext === '.heif') mimeType = 'image/heif';

    const imagePart = fileToGenerativePart(filePath, mimeType);
    
    const prompt = "Hãy đọc và trích xuất mọi văn bản tiếng Việt xuất hiện trong bức ảnh này. Nếu là thư tay, hãy cố gắng đọc chữ viết tay đó một cách chính xác nhất có thể. Trả về cho tôi ĐÚNG nội dung văn bản bạn đọc được, KHÔNG thêm thắt bất kỳ lời chào hay giải thích nào khác.";
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const extractedText = response.text();
    
    res.json({ text: extractedText });

  } catch (error) {
    console.error('Gemini OCR Error:', error);
    res.status(500).json({ message: 'Lỗi khi gọi AI trích xuất chữ' });
  }
};
