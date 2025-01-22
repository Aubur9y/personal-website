import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

console.log('Environment variables:', {
  MONGODB_URI: process.env.MONGODB_URI ? '已设置' : '未设置',
  MONGODB_DB: process.env.MONGODB_DB ? '已设置' : '未设置'
});

if (!MONGODB_URI) {
  throw new Error('请在环境变量中定义 MONGODB_URI');
}

if (!MONGODB_DB) {
  throw new Error('请在环境变量中定义 MONGODB_DB');
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // 禁用可选功能
    monitorCommands: false,
    autoEncryption: false,
    maxPoolSize: 1,
  });

  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
} 