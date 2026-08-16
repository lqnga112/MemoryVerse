const mongoose = require('mongoose');
const User = require('./src/models/user.model');

const targetEmail = process.argv[2];

if (!targetEmail) {
  console.log('❌ Vui lòng cung cấp Email cần cấp quyền Admin!');
  console.log('📌 Ví dụ: node promote_user_admin.js admin@gmail.com');
  process.exit(1);
}

async function promoteAdmin() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/family_memory_db');
    const user = await User.findOneAndUpdate(
      { email: targetEmail.toLowerCase().trim() },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`🎉 THÀNH CÔNG: Tài khoản [${user.full_name} - ${user.email}] đã được cấp quyền Quản trị viên (ADMIN)!`);
    } else {
      console.log(`❌ KHÔNG TÌM THẤY: Không tìm thấy tài khoản với email "${targetEmail}" trong CSDL.`);
    }
  } catch (err) {
    console.error('❌ Lỗi cấp quyền:', err);
  } finally {
    mongoose.disconnect();
  }
}

promoteAdmin();
