const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at', mongoUri);
    return;
  }

  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  await mongoose.connect(uri);
  console.log('Connected to in-memory MongoDB at', uri);
}

async function disconnectDB() {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
  }
}

module.exports = { connectDB, disconnectDB };
