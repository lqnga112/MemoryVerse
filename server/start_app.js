const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

function cleanStaleLocks(dbDir) {
  try {
    const lockFiles = ['mongod.lock', 'WiredTiger.lock', 'WiredTiger.turtle.set'];
    lockFiles.forEach(file => {
      const filePath = path.join(dbDir, file);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`🧹 Đã dọn dẹp file lock cũ: ${file}`);
        } catch(e) {}
      }
    });

    const tmpSpill = path.join(dbDir, '_tmp');
    if (fs.existsSync(tmpSpill)) {
      try {
        fs.rmSync(tmpSpill, { recursive: true, force: true });
      } catch(e) {}
    }
  } catch (err) {
    console.warn('Lưu ý dọn file lock:', err.message);
  }
}

async function main() {
  const dbDir = path.join(__dirname, 'db_data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Dọn dẹp lock file cũ nếu có
  cleanStaleLocks(dbDir);

  let mongoServer;
  try {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        ip: '127.0.0.1',
        dbPath: dbDir,
        storageEngine: 'wiredTiger'
      }
    });
    console.log(`✅ [MongoDB Persistent] Máy chủ MongoDB đang chạy và lưu cố định tại: ${dbDir}`);
  } catch (err) {
    console.warn('⚠️ Không thể khởi động MongoDB WiredTiger đĩa, đang chuyển sang MongoDB In-Memory...');
    try {
      mongoServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          ip: '127.0.0.1'
        }
      });
      console.log(`✅ [MongoDB In-Memory] Máy chủ MongoDB đang chạy tại: mongodb://127.0.0.1:27017`);
    } catch(err2) {
      console.log('ℹ️ Kết nối tới MongoDB cục bộ có sẵn...');
    }
  }

  // Khởi động Express API Server
  require('./src/server.js');

  // Kiểm tra và tự động nạp lại tài khoản & album demo nếu CSDL trống
  setTimeout(async () => {
    try {
      const User = require('./src/models/user.model');
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 CSDL đang trống, hệ thống tự động nạp tài khoản & 2 Album demo...');
        require('./seed_10_memories.js');
      } else {
        console.log(`✅ CSDL đã sẵn sàng với ${userCount} tài khoản.`);
      }
    } catch(e) {
      console.warn('Lưu ý kiểm tra Auto Seed:', e.message);
    }
  }, 1500);
}

main();
