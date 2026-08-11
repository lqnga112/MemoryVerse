const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

async function runMockMongo() {
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
    console.log(`✅ [Mock DB Persistent] Máy chủ MongoDB đang chạy và LƯU DỮ LIỆU CỐ ĐỊNH tại: ${dbDir}`);
  } catch (err) {
    console.error('❌ [Mock DB] Lỗi khởi tạo:', err);
  }
}

runMockMongo();
