const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const Album = require('./src/models/album.model');
const Memory = require('./src/models/memory.model');

async function seedHoChiMinhJourney() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/family_memory_db');
    console.log('✅ Đã kết nối CSDL MongoDB để khởi tạo Album Hành trình Bác Hồ...');

    // 1. Tìm tài khoản demo_user@memoryverse.com
    const normalUser = await User.findOne({ email: 'demo_user@memoryverse.com' });
    if (!normalUser) {
      console.error('❌ Không tìm thấy tài khoản demo_user@memoryverse.com');
      process.exit(1);
    }

    // 2. Tạo hoặc reset Album "Hành Trình Cuộc Đời Chủ Tịch Hồ Chí Minh (1890 - 1969)"
    let hcmAlbum = await Album.findOne({ title: 'Hành Trình Cuộc Đời Chủ Tịch Hồ Chí Minh (1890 - 1969)', ownerId: normalUser._id });
    if (hcmAlbum) {
      await Memory.deleteMany({ albumId: hcmAlbum._id });
      await Album.deleteOne({ _id: hcmAlbum._id });
    }

    hcmAlbum = await Album.create({
      title: 'Hành Trình Cuộc Đời Chủ Tịch Hồ Chí Minh (1890 - 1969)',
      description: 'Tuyển tập 20 mốc kỷ niệm lịch sử vĩ đại trong cuộc đời Chủ tịch Hồ Chí Minh từ tuổi thơ tại Kim Liên, Nam Đàn đến hành trình tìm đường cứu nước, Lễ Tuyên ngôn Độc lập và di sản muôn đời.',
      ownerId: normalUser._id,
      coverImage: '/uploads/1784825460232.jpg'
    });

    // 3. Danh sách 20 Kỷ niệm Cuộc đời Chủ tịch Hồ Chí Minh
    const memoriesData = [
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '1. Mùa xuân 1890 - Cất tiếng khóc chào đời tại Kim Liên, Nam Đàn',
        memoryDate: new Date('1890-05-19'),
        location: 'Làng Hoàng Trù, Nam Đàn, Nghệ An',
        fileType: 'image',
        fileUrl: '/uploads/1784825460232.jpg',
        extractedText: 'Chủ tịch Hồ Chí Minh (tên khai sinh là Nguyễn Sinh Cung) cất tiếng khóc chào đời tại quê ngoại làng Hoàng Trù, xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An trong một gia đình nhà nho yêu nước.'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '2. Năm 1906 - Học tập tại Trường Quốc Học Huế',
        memoryDate: new Date('1906-09-01'),
        location: 'Trường Quốc Học Huế, Thừa Thiên Huế',
        fileType: 'image',
        fileUrl: '/uploads/1784825857049.jpg',
        extractedText: 'Nguyễn Sinh Cung theo cha vào Huế, học tại Trường Quốc Học Huế. Tại đây, Người tiếp thu tri thức văn hóa, tinh thần yêu nước và bắt đầu hình thành ý chí giải phóng dân tộc.'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '3. Ngày 5/6/1911 - Rời Bến Cảng Nhà Rồng ra đi tìm đường cứu nước',
        memoryDate: new Date('1911-06-05'),
        location: 'Bến Cảng Nhà Rồng, TP. Hồ Chí Minh',
        fileType: 'letter',
        fileUrl: '/uploads/1784827594107.png',
        extractedText: 'Bức thư kỷ niệm ra đi:\n"Tôi muốn ra nước ngoài, xem Pháp và các nước khác làm thế nào, tôi sẽ trở về giúp đồng bào chúng ta." - Người thanh niên Nguyễn Tất Thành bước lên tàu Amiral Latouche-Tréville mở đầu chuyến hành trình 30 năm bôn ba.'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '4. Năm 1919 - Gửi Bản Yêu sách 8 điểm tới Hội nghị Versailles (Pháp)',
        memoryDate: new Date('1919-06-18'),
        location: 'Paris, Pháp',
        fileType: 'letter',
        fileUrl: '/uploads/1784827594107.png',
        extractedText: 'Bản Yêu sách của Nhân dân An Nam gửi Hội nghị Versailles xưng tên Nguyễn Ái Quốc, đòi các quyền tự do, bình đẳng và tự quyết cho nhân dân Việt Nam.'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '5. Tháng 12/1920 - Dự Đại hội Tours & Tham gia thành lập Đảng Cộng sản Pháp',
        memoryDate: new Date('1920-12-25'),
        location: 'Tours, Pháp',
        fileType: 'image',
        fileUrl: '/uploads/1784826423584.jpg',
        extractedText: 'Nguyễn Ái Quốc bỏ phiếu tán thành gia nhập Quốc tế III và tham gia sáng lập Đảng Cộng sản Pháp, trở thành người cộng sản đầu tiên của dân tộc Việt Nam.'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '6. Năm 1925 - Thành lập Hội VN Cách mạng Thanh niên & Báo Thanh Niên',
        memoryDate: new Date('1925-06-21'),
        location: 'Quảng Châu, Trung Quốc',
        fileType: 'letter',
        fileUrl: '/uploads/1784827594107.png',
        extractedText: 'Trích cuốn Đường Kách Mệnh (1927):\n"Cách mệnh trước hết phải có Đảng cách mệnh để trong thì vận động và tổ chức dân chúng, ngoài thì liên lạc với dân tộc bị áp bức và vô sản giai cấp mọi nơi."'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '7. Ngày 3/2/1930 - Chủ trì Hội nghị hợp nhất thành lập Đảng Cộng sản Việt Nam',
        memoryDate: new Date('1930-02-03'),
        location: 'Bán Đảo Cửu Long, Hương Cảng (Hong Kong)',
        fileType: 'image',
        fileUrl: '/uploads/1784825460232.jpg',
        extractedText: 'Nguyễn Ái Quốc chủ trì Hội nghị hợp nhất các tổ chức cộng sản tại Hương Cảng, thông qua Chánh cương tắt, Sách lược tắt thành lập Đảng Cộng sản Việt Nam.'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '8. Ngày 28/1/1941 - Trở về Tổ quốc sau 30 năm bôn ba tại Hang Pác Bó',
        memoryDate: new Date('1941-01-28'),
        location: 'Pác Bó, Hà Quảng, Cao Bằng',
        fileType: 'image',
        fileUrl: '/uploads/1784825857049.jpg',
        extractedText: 'Sau 30 năm bôn ba khắp thế giới, Lãnh tụ Nguyễn Ái Quốc vượt qua cột mốc 108 trở về Tổ quốc, trực tiếp chỉ đạo phong trào cách mạng Việt Nam tại ngọn núi Kác Mác, suối Lê-nin.'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '9. Năm 1942 - Sáng tác tập thơ "Nhật ký trong tù" (Quảng Tây)',
        memoryDate: new Date('1942-08-29'),
        location: 'Quảng Tây, Trung Quốc',
        fileType: 'letter',
        fileUrl: '/uploads/1784827594107.png',
        extractedText: 'Trích thơ Nhật ký trong tù (Bản dịch):\n"Thân thể ở trong lao,\nTinh thần ở ngoài lao;\nMuốn làm nên sự nghiệp lớn,\nTinh thần phải càng cao."'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '10. Tháng 8/1945 - Đại hội Quốc dân Tân Trào & Tổng khởi nghĩa Tháng Tám',
        memoryDate: new Date('1945-08-16'),
        location: 'Tân Trào, Sơn Dương, Tuyên Quang',
        fileType: 'image',
        fileUrl: '/uploads/1784826423584.jpg',
        extractedText: 'Bác Hồ chủ trì Đại hội Quốc dân Tân Trào, quy định Quốc kỳ, Quốc ca và quyết định Tổng khởi nghĩa giành chính quyền trên toàn quốc: "Dù có phải đốt cháy cả dãy Trường Sơn cũng phải giành cho được độc lập!"'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '11. Ngày 2/9/1945 - Đọc Bảng Tuyên ngôn Độc lập tại Quảng trường Ba Đình',
        memoryDate: new Date('1945-09-02'),
        location: 'Quảng trường Ba Đình, Hà Nội',
        fileType: 'audio',
        fileUrl: '/uploads/1784831757827.mp3',
        extractedText: 'Băng ghi âm lịch sử Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập:\n"Tôi nói đồng bào nghe rõ không? ... Nước Việt Nam có quyền hưởng tự do và độc lập, và sự thật đã thành một nước tự do độc lập. Toàn thể dân tộc Việt Nam quyết đem tất cả tinh thần và lực lượng, tính mạng và của cải để giữ vững quyền tự do, độc lập ấy."'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '12. Ngày 19/12/1946 - Lời kêu gọi Toàn quốc kháng chiến',
        memoryDate: new Date('1946-12-19'),
        location: 'Làng Vạn Phúc, Hà Đông, Hà Nội',
        fileType: 'letter',
        fileUrl: '/uploads/1784827594107.png',
        extractedText: 'Lời kêu gọi Toàn quốc kháng chiến:\n"Chúng ta thà hy sinh tất cả, chứ nhất định không chịu mất nước, nhất định không chịu làm nô lệ. Hỡi đồng bào! Chúng ta phải đứng lên!"'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '13. Năm 1950 - Trực tiếp ra tiền tuyến chỉ đạo Chiến dịch Biên Giới',
        memoryDate: new Date('1950-09-16'),
        location: 'Đông Khê, Thạch An, Cao Bằng',
        fileType: 'image',
        fileUrl: '/uploads/1784825460232.jpg',
        extractedText: 'Hình ảnh Bác Hồ trên đỉnh núi quan sát mặt trận Đông Khê trong Chiến dịch Biên Giới thu đông 1950 - Biểu tượng bất tử của vị Lãnh tụ tận tụy vì sự nghiệp giải phóng.'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '14. Ngày 7/5/1954 - Lãnh đạo Chiến dịch Điện Biên Phủ lừng lẫy năm châu',
        memoryDate: new Date('1954-05-07'),
        location: 'Chiến trường Điện Biên Phủ',
        fileType: 'video',
        fileUrl: '/uploads/1784834470343.mp4',
        extractedText: 'Thước phim tư liệu lịch sử: Bác Hồ và Bộ Chính trị chỉ đạo Chiến dịch Điện Biên Phủ toàn thắng "Lừng lẫy năm châu, chấn động địa cầu", chấm dứt 9 năm kháng chiến chống thực dân Pháp.'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '15. Tháng 10/1954 - Trở về Thủ đô Hà Nội giải phóng',
        memoryDate: new Date('1954-10-10'),
        location: 'Thủ đô Hà Nội',
        fileType: 'image',
        fileUrl: '/uploads/1784825857049.jpg',
        extractedText: 'Bác Hồ cùng Trung ương Đảng trở về Hà Nội sau thắng lợi kháng chiến. Người tiếp tục sống giản dị trong căn nhà sàn gỗ ở Phủ Chủ tịch.'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '16. Tháng 9/1960 - Chủ trì Đại hội Đại biểu Toàn quốc lần thứ III của Đảng',
        memoryDate: new Date('1960-09-05'),
        location: 'Thủ đô Hà Nội',
        fileType: 'image',
        fileUrl: '/uploads/1784826423584.jpg',
        extractedText: 'Bác Hồ khai mạc Đại hội Đảng toàn quốc lần thứ III, đề ra hai nhiệm vụ chiến lược: Xây dựng XHCN ở miền Bắc và giải phóng miền Nam thống nhất đất nước.'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '17. Tháng 5/1965 - Bắt đầu khởi thảo bản "Di chúc" lịch sử',
        memoryDate: new Date('1965-05-10'),
        location: 'Nhà Sàn Phủ Chủ tịch, Hà Nội',
        fileType: 'letter',
        fileUrl: '/uploads/1784827594107.png',
        extractedText: 'Trích Di chúc Chủ tịch Hồ Chí Minh:\n"Cuộc chống Mỹ, cứu nước của nhân dân ta dù phải kinh qua gay go, gian khổ giàn giụa bao nhiêu, song nhất định thắng lợi hoàn toàn. Đó là một điều chắc chắn. Tôi có ý định đến ngày đó, tôi sẽ đi khắp hai miền Nam Bắc để chúc mừng đồng bào, đồng chí và chiến sĩ anh hùng..."'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '18. Ngày 17/7/1966 - Lời kêu gọi "Không có gì quý hơn độc lập, tự do!"',
        memoryDate: new Date('1966-07-17'),
        location: 'Thủ đô Hà Nội',
        fileType: 'audio',
        fileUrl: '/uploads/1784831757827.mp3',
        extractedText: 'Băng ghi âm phát biểu lịch sử của Bác trên Đài Tiếng nói Việt Nam:\n"Chấn động cả nước và thế giới - Chiến tranh có thể kéo dài 5 năm, 10 năm, 20 năm hoặc lâu hơn nữa. Hà Nội, Hải Phòng và một số thành phố, xí nghiệp có thể bị tàn phá, song nhân dân Việt Nam quyết không sợ! Không có gì quý hơn độc lập, tự do!"'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '19. Ngày 2/9/1969 - Chủ tịch Hồ Chí Minh đi xa - Quốc tang lịch sử',
        memoryDate: new Date('1969-09-02'),
        location: 'Quảng trường Ba Đình, Hà Nội',
        fileType: 'video',
        fileUrl: '/uploads/1784834470343.mp4',
        extractedText: 'Thước phim tư liệu Lễ Quốc tang Chủ tịch Hồ Chí Minh ngày 9/9/1969 tại Quảng trường Ba Đình. Hàng triệu con tim Việt Nam và bạn bè năm châu rơi lệ thương tiếc Người.'
      },
      {
        albumId: hcmAlbum._id,
        ownerId: normalUser._id,
        title: '20. Ngày 30/4/1975 - Trọn vẹn ước nguyện "Bắc Nam sum họp một nhà"',
        memoryDate: new Date('1975-04-30'),
        location: 'Thành phố Hồ Chí Minh',
        fileType: 'image',
        fileUrl: '/uploads/1784825460232.jpg',
        extractedText: 'Đại thắng Mùa Xuân 1975 giải phóng hoàn toàn miền Nam, thống nhất đất nước. Thành phố Sài Gòn chính thức mang tên Chủ tịch Hồ Chí Minh vĩ đại, thực hiện trọn vẹn di nguyện cao cả của Người.'
      }
    ];

    await Memory.insertMany(memoriesData);
    console.log(`🎉 NẠP THÀNH CÔNG ALBUM HÀNH TRÌNH BÁC HỒ VỚI 20 KỶ NIỆM VÀ 4 LOẠI TỆP CHO TÀI KHOẢN demo_user@memoryverse.com!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi nạp dữ liệu Hành trình Bác Hồ:', error);
    process.exit(1);
  }
}

seedHoChiMinhJourney();
