const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

async function main() {
  try {
    const dbDir = path.join(__dirname, 'db_data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        ip: '127.0.0.1',
        dbPath: dbDir,
        storageEngine: 'wiredTiger'
      }
    });
    console.log(`✅ [MongoDB Persistent] Máy chủ MongoDB đang chạy và lưu cố định tại: ${dbDir}`);

    // Sau khi MongoDB khởi động xong, require và nạp Express server
    require('./src/server.js');
  } catch (err) {
    console.error('❌ Lỗi khởi động server:', err);
  }
}

main();
