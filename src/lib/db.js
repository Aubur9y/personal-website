import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (typeof window === 'undefined' && !MONGODB_URI) {
  throw new Error('请在环境变量中定义 MONGODB_URI');
}

if (typeof window === 'undefined' && !MONGODB_DB) {
  throw new Error('请在环境变量中定义 MONGODB_DB');
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 1,
      // 禁用所有可选功能
      monitorCommands: false,
      autoEncryption: false,
      tls: false,
      directConnection: true,
    });

    const db = client.db(MONGODB_DB);
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return { client: null, db: null };
  }
} 