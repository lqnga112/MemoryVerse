const { MongoMemoryServer } = require('mongodb-memory-server');

async function runMockMongo() {
  try {
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        ip: '127.0.0.1',
      }
    });
    console.log(`✅ [Mock DB] Máy chủ MongoDB đang chạy giả lập tại: ${mongoServer.getUri()}`);
  } catch (err) {
    console.error('❌ [Mock DB] Lỗi khởi tạo:', err);
  }
}

runMockMongo();
