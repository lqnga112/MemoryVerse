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

exports.extractTextFromAudio = async (req, res) => {
  try {
    const { memoryId } = req.params;
    
    const memory = await Memory.findOne({ _id: memoryId, ownerId: req.user.userId });
    if (!memory) return res.status(404).json({ message: 'Không tìm thấy kỷ niệm' });
    
    if (memory.fileType !== 'audio') return res.status(400).json({ message: 'Tính năng này chỉ hỗ trợ âm thanh' });

    const filePath = path.join(__dirname, '../../', memory.fileUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File không tồn tại trên máy' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = 'audio/mp3';
    if (ext === '.wav') mimeType = 'audio/wav';
    else if (ext === '.m4a') mimeType = 'audio/mp4';
    else if (ext === '.ogg') mimeType = 'audio/ogg';
    else if (ext === '.webm') mimeType = 'audio/webm';

    const audioPart = fileToGenerativePart(filePath, mimeType);
    const prompt = "Hãy nghe và chuyển đổi đoạn ghi âm tiếng Việt này thành văn bản chính xác nhất có thể. Trả về ĐÚNG nội dung đã nghe được, KHÔNG thêm lời chào hỏi hay giải thích.";
    
    const result = await model.generateContent([prompt, audioPart]);
    const response = await result.response;
    const extractedText = response.text();
    
    res.json({ text: extractedText });

  } catch (error) {
    console.error('Gemini STT Error:', error);
    res.status(500).json({ message: 'Lỗi khi gọi AI bóc băng ghi âm' });
  }
};

exports.generateStory = async (req, res) => {
  try {
    const { albumId } = req.params;
    const memories = await Memory.find({ albumId, ownerId: req.user.userId }).sort({ memoryDate: 1 });
    
    if (memories.length === 0) {
      return res.status(400).json({ message: 'Hành trình chưa có kỷ niệm nào để kể chuyện.' });
    }

    // Build context
    let context = 'Dưới đây là các mốc thời gian và kỷ niệm của một đời người:\n\n';
    memories.forEach(m => {
      const date = m.memoryDate ? new Date(m.memoryDate).toLocaleDateString('vi-VN') : 'Không rõ ngày';
      const loc = m.location ? `(Tại: ${m.location})` : '';
      context += `- Thời gian: ${date} ${loc}\n`;
      context += `  Sự kiện: ${m.title || 'Một kỷ niệm'}\n`;
      if (m.extractedText) {
        context += `  Nội dung trích xuất/Ghi chú: ${m.extractedText}\n`;
      }
      context += '\n';
    });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const prompt = `Bạn là một nhà văn viết hồi ký đầy cảm xúc và tinh tế. Dựa vào chuỗi các sự kiện và kỷ niệm dưới đây, hãy viết một câu chuyện tóm tắt lại cuộc đời của nhân vật này. 
Hãy chia câu chuyện thành các chương (Ví dụ: Chương 1: Tuổi thơ, Chương 2: Trưởng thành...).
Giọng văn: Sâu lắng, hoài niệm, trân trọng những giá trị gia đình.
Format: Trả về bằng ngôn ngữ Markdown (HTML tags không được dùng).
    
    Dữ liệu cuộc đời:
    ${context}
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const story = response.text();
    
    res.json({ story });

  } catch (error) {
    console.error('Gemini Story Error:', error);
    res.status(500).json({ message: 'Lỗi khi gọi AI viết truyện' });
  }
};

exports.chatWithAI = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { question } = req.body;
    
    if (!question) return res.status(400).json({ message: 'Vui lòng nhập câu hỏi' });

    const memories = await Memory.find({ albumId, ownerId: req.user.userId }).sort({ memoryDate: 1 });
    
    let context = 'Dữ liệu hồi ký:\n';
    memories.forEach(m => {
      const date = m.memoryDate ? new Date(m.memoryDate).toLocaleDateString('vi-VN') : 'Không rõ ngày';
      context += `- [${date}] ${m.title || 'Kỷ niệm'}. Nội dung/Ghi chú: ${m.extractedText || 'Không có'}\n`;
    });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const prompt = `Bạn là một trợ lý thông minh trong Bảo tàng Kỷ niệm. Người dùng đang hỏi về cuộc đời của một người dựa trên những kỷ niệm đã được tải lên.
    Dưới đây là các dữ liệu mà bạn biết:
    ${context}
    
    Câu hỏi của người dùng: "${question}"
    
    Yêu cầu:
    - Trả lời thân thiện, lịch sự.
    - CHỈ dựa vào dữ liệu trên để trả lời. Nếu không có thông tin trong dữ liệu, hãy nói "Tôi chưa có dữ liệu về phần này trong hành trình".
    - Không bịaa chuyện.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();
    
    res.json({ answer });

  } catch (error) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({ message: 'Lỗi khi hỏi đáp AI' });
  }
};
