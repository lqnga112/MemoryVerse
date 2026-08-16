const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');
const Album = require('./src/models/album.model');
const Memory = require('./src/models/memory.model');

async function seedData() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/family_memory_db');
    console.log('✅ Đã kết nối CSDL MongoDB để nạp 10 kỷ niệm demo...');

    // 1. Tạo hoặc nạp tài khoản Admin & User mẫu
    const passwordHash = await bcrypt.hash('123456', 10);
    
    let adminUser = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminUser) {
      adminUser = await User.create({
        email: 'admin@gmail.com',
        password_hash: passwordHash,
        full_name: 'Quản Trị Viên (Admin)',
        role: 'admin',
        bio: 'Tài khoản Quản trị hệ thống MemoryVerse'
      });
    }

    let normalUser = await User.findOne({ email: 'user@gmail.com' });
    if (!normalUser) {
      normalUser = await User.create({
        email: 'user@gmail.com',
        password_hash: passwordHash,
        full_name: 'Ông Nguyễn Văn An',
        role: 'user',
        bio: 'Hành trình 80 năm hoài niệm cuộc đời'
      });
    }

    // 2. Tạo Album "Hành Trình 80 Năm Cuộc Đời - Ông Nguyễn Văn An (1946 - 2026)"
    let demoAlbum = await Album.findOne({ title: 'Hành Trình 80 Năm Cuộc Đời - Ông Nguyễn Văn An (1946 - 2026)' });
    if (demoAlbum) {
      await Memory.deleteMany({ albumId: demoAlbum._id });
      await Album.deleteOne({ _id: demoAlbum._id });
    }

    demoAlbum = await Album.create({
      title: 'Hành Trình 80 Năm Cuộc Đời - Ông Nguyễn Văn An (1946 - 2026)',
      description: 'Tuyển tập 10 mốc kỷ niệm đáng nhớ nhất trong cuộc đời từ thời niên thiếu, quân ngũ, lập nghiệp cho đến khi gia đình sum vầy.',
      ownerId: normalUser._id,
      coverImage: '/uploads/1784825460232.jpg'
    });

    // 3. Danh sách 10 Kỷ niệm đầy đủ cho Album Demo
    const memoriesData = [
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Mùa thu Hà Nội 1956 - Lá thư tay niên thiếu',
        memoryDate: new Date('1956-09-15'),
        location: 'Hà Nội',
        fileType: 'letter',
        fileUrl: '/uploads/1784827594107.png',
        extractedText: 'Gửi thầy cô và cha mẹ kính yêu,\nCon vừa hoàn thành kỳ thi vào trường Bưởi (Hà Nội). Mùa thu Hà Nội năm nay lá vàng bay ngợp phố, con hứa sẽ học tập thật giỏi để không phụ lòng mong mỏi của gia đình.'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Nhật ký Quảng Trị 1968 - Thời kỳ Quân ngũ',
        memoryDate: new Date('1968-07-20'),
        location: 'Quảng Trị',
        fileType: 'audio',
        fileUrl: '/uploads/1784831757827.mp3',
        extractedText: 'Lời kể ghi âm: "Đêm mùa hè Quảng Trị 1968, tiếng súng đã ngớt. Tôi ngồi bên ngọn đèn dầu viết vội dòng thư gửi về miền Bắc cho mẹ, thương các đồng đội đã dũng cảm hy sinh vì độc lập dân tộc."'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Ngày Giải Phóng Sài Gòn 30/4/1975',
        memoryDate: new Date('1975-04-30'),
        location: 'TP. Hồ Chí Minh',
        fileType: 'image',
        fileUrl: '/uploads/1784825460232.jpg',
        extractedText: 'Khoảnh khắc lịch sử hòa bình độc lập thống nhất đất nước. Cả Sài Gòn rợp cờ hoa, nụ cười vỡ òa trên môi những người lính trở về.'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Lễ Đám Cưới tại Cố Đô Huế 1978',
        memoryDate: new Date('1978-03-12'),
        location: 'Thừa Thiên Huế',
        fileType: 'image',
        fileUrl: '/uploads/1784825857049.jpg',
        extractedText: 'Đám cưới giản dị thời bao cấp tại Huế với người bạn đời Lê Thị Mai. Chiếc xe đạp mây và áo dài truyền thống đong đầy hạnh phúc.'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Đón con gái đầu lòng Nguyễn Thu Hà 1985',
        memoryDate: new Date('1985-05-18'),
        location: 'Quảng Nam',
        fileType: 'image',
        fileUrl: '/uploads/1784826423584.jpg',
        extractedText: 'Bé Nguyễn Thu Hà cất tiếng khóc chào đời tại Quảng Nam. Niềm hạnh phúc lớn nhất của vợ chồng tôi khi trở thành cha mẹ.'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Khởi nghiệp xưởng mộc gia đình tại Đà Nẵng 1995',
        memoryDate: new Date('1995-10-10'),
        location: 'Đà Nẵng',
        fileType: 'image',
        fileUrl: '/uploads/1785757396618.jpg',
        extractedText: 'Bước ngoặt tự tay mở xưởng chế tác đồ gỗ mỹ nghệ tại Đà Nẵng, tạo công ăn việc làm cho các anh em cựu chiến binh.'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Chuyến du lịch gia đình mừng thọ tại Đà Lạt 2005',
        memoryDate: new Date('2005-04-25'),
        location: 'Lâm Đồng',
        fileType: 'image',
        fileUrl: '/uploads/1785757462489.jpg',
        extractedText: 'Cả gia đình 3 thế hệ cùng nhau du lịch hồ Xuân Hương - Đà Lạt (Lâm Đồng) kỷ niệm mừng thọ 60 tuổi của ông An.'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Đám cưới cháu ngoại Thu Trang 2015',
        memoryDate: new Date('2015-11-20'),
        location: 'Khánh Hòa',
        fileType: 'video',
        fileUrl: '/uploads/1784831594673.mp4',
        extractedText: 'Gia đình đại đoàn tụ mừng đám cưới cháu ngoại Thu Trang tại thành phố biển Nha Trang (Khánh Hòa).'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Hành trình thăm lại đỉnh Sa Pa 2020',
        memoryDate: new Date('2020-02-14'),
        location: 'Lào Cai',
        fileType: 'image',
        fileUrl: '/uploads/1785760150903.webp',
        extractedText: 'Chuyến đi Sa Pa ngắm sương mù miền núi phía Bắc, gửi lại những câu chuyện truyền cảm hứng cho con cháu.'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Mừng đại thọ 80 tuổi & Sum vầy con cháu 2026',
        memoryDate: new Date('2026-08-15'),
        location: 'Hà Nội',
        fileType: 'image',
        fileUrl: '/uploads/1786038508170.jpg',
        extractedText: 'AI Gemini tổng hợp: "80 năm cuộc đời của ông Nguyễn Văn An là một thiên tiểu thuyết hoài niệm đẹp đẽ. Từ mái trường Bưởi Hà Nội, những năm tháng quân ngũ gian lao, cho đến tình yêu bền bỉ và mái ấm gia đình hạnh phúc 3 thế hệ ngày hôm nay."'
      }
    ];

    await Memory.insertMany(memoriesData);
    console.log(`🎉 NẠP THÀNH CÔNG 10 KỶ NIỆM MẪU VÀO ALBUM!`);
    console.log(`📌 Tài khoản User: user@gmail.com / Pass: 123456`);
    console.log(`📌 Tài khoản Admin: admin@gmail.com / Pass: 123456`);
  } catch (err) {
    console.error('❌ Lỗi nạp dữ liệu demo:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedData();
