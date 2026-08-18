const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');
const Album = require('./src/models/album.model');
const Memory = require('./src/models/memory.model');

async function seedData() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/family_memory_db');
    console.log('✅ Đã kết nối CSDL MongoDB để nạp lại dữ liệu hình ảnh chuẩn nội dung...');

    // 1. Tạo mật khẩu mã hóa Bcrypt mới
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const userPasswordHash = await bcrypt.hash('User@123', 10);
    
    // Xóa các tài khoản cũ để tạo tài khoản chuẩn mới
    await User.deleteMany({ email: { $in: ['admin@gmail.com', 'user@gmail.com', 'admin@memoryverse.com', 'demo_user@memoryverse.com'] } });

    const adminUser = await User.create({
      email: 'admin@memoryverse.com',
      password_hash: adminPasswordHash,
      full_name: 'Quản Trị Viên (Admin)',
      role: 'admin',
      bio: 'Tài khoản Quản trị hệ thống MemoryVerse'
    });

    const normalUser = await User.create({
      email: 'demo_user@memoryverse.com',
      password_hash: userPasswordHash,
      full_name: 'Ông Nguyễn Văn An',
      role: 'user',
      bio: 'Hành trình 80 năm hoài niệm cuộc đời'
    });

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
      coverImage: '/uploads/memory_reunion_2026.jpg'
    });

    // 3. Danh sách 10 Kỷ niệm chuẩn hình ảnh theo từng mốc nội dung
    const memoriesData = [
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Mùa thu Hà Nội 1956 - Lá thư tay niên thiếu',
        memoryDate: new Date('1956-09-15'),
        location: 'Hà Nội',
        fileType: 'letter',
        fileUrl: '/uploads/memory_letter_1956.jpg',
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
        fileUrl: '/uploads/memory_saigon_1975.jpg',
        extractedText: 'Khoảnh khắc lịch sử hòa bình độc lập thống nhất đất nước. Cả Sài Gòn rợp cờ hoa, nụ cười vỡ òa trên môi những người lính trở về.'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Lễ Đám Cưới tại Cố Đô Huế 1978',
        memoryDate: new Date('1978-03-12'),
        location: 'Thừa Thiên Huế',
        fileType: 'image',
        fileUrl: '/uploads/memory_wedding_hue_1978.jpg',
        extractedText: 'Đám cưới giản dị thời bao cấp tại Huế với người bạn đời Lê Thị Mai. Chiếc xe đạp mây và áo dài truyền thống đong đầy hạnh phúc.'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Đón con gái đầu lòng Nguyễn Thu Hà 1985',
        memoryDate: new Date('1985-05-18'),
        location: 'Quảng Nam',
        fileType: 'image',
        fileUrl: '/uploads/memory_baby_1985.jpg',
        extractedText: 'Bé Nguyễn Thu Hà cất tiếng khóc chào đời tại Quảng Nam. Niềm hạnh phúc lớn nhất của vợ chồng tôi khi trở thành cha mẹ.'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Khởi nghiệp xưởng mộc gia đình tại Đà Nẵng 1995',
        memoryDate: new Date('1995-10-10'),
        location: 'Đà Nẵng',
        fileType: 'image',
        fileUrl: '/uploads/memory_carpentry_1995.jpg',
        extractedText: 'Bước ngoặt tự tay mở xưởng chế tác đồ gỗ mỹ nghệ tại Đà Nẵng, tạo công ăn việc làm cho các anh em cựu chiến binh.'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Chuyến du lịch gia đình mừng thọ tại Đà Lạt 2005',
        memoryDate: new Date('2005-04-25'),
        location: 'Lâm Đồng',
        fileType: 'image',
        fileUrl: '/uploads/memory_dalat_2005.jpg',
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
        fileUrl: '/uploads/memory_sapa_2020.jpg',
        extractedText: 'Chuyến đi Sa Pa ngắm sương mù miền núi phía Bắc, gửi lại những câu chuyện truyền cảm hứng cho con cháu.'
      },
      {
        albumId: demoAlbum._id,
        ownerId: normalUser._id,
        title: 'Mừng đại thọ 80 tuổi & Sum vầy con cháu 2026',
        memoryDate: new Date('2026-08-15'),
        location: 'Hà Nội',
        fileType: 'image',
        fileUrl: '/uploads/memory_reunion_2026.jpg',
        extractedText: 'AI Gemini tổng hợp: "80 năm cuộc đời của ông Nguyễn Văn An là một thiên tiểu thuyết hoài niệm đẹp đẽ. Từ mái trường Bưởi Hà Nội, những năm tháng quân ngũ gian lao, cho đến tình yêu bền bỉ và mái ấm gia đình hạnh phúc 3 thế hệ ngày hôm nay."'
      }
    ];

    await Memory.insertMany(memoriesData);
    console.log(`🎉 NẠP THÀNH CÔNG DỮ LIỆU HÌNH ẢNH CHUẨN NỘI DUNG!`);
    console.log(`📌 User Email: demo_user@memoryverse.com / Pass: User@123`);
    console.log(`📌 Admin Email: admin@memoryverse.com / Pass: Admin@123`);
  } catch (err) {
    console.error('❌ Lỗi nạp dữ liệu demo:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedData();
