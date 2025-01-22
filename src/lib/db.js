import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

// 只在服务器端检查环境变量
if (typeof window === 'undefined') {
  if (!MONGODB_URI) {
    throw new Error('请在环境变量中定义 MONGODB_URI');
  }

  if (!MONGODB_DB) {
    throw new Error('请在环境变量中定义 MONGODB_DB');
  }
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  try {
    // 客户端不需要连接数据库
    if (typeof window !== 'undefined') {
      return { client: null, db: null };
    }

    if (cachedClient && cachedDb) {
      return { client: cachedClient, db: cachedDb };
    }

    if (!MONGODB_URI) {
      throw new Error('MongoDB URI is undefined');
    }

    // 移除已弃用的选项
    const client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 1
    });

    const db = client.db(MONGODB_DB);

    // 验证连接并初始化数据
    await db.command({ ping: 1 });
    console.log("Successfully connected to MongoDB.");

    // 初始化 about 集合的默认数据
    const aboutCollection = db.collection('about');
    const existingAbout = await aboutCollection.findOne({});
    
    if (!existingAbout) {
      await aboutCollection.insertOne({
        content: defaultAbout,
        updatedAt: new Date().toISOString()
      });
      console.log("Initialized default about content");
    }

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// 默认的关于内容
const defaultAbout = `
# 你好，我是相祺 👋

我是一名热爱技术的全栈开发者，专注于机器学习和数据工程，具备丰富的项目经验和实习经历。

## 技术栈
### 编程语言: Python, Java, JavaScript, TypeScript

### 数据科学与机器学习: PyTorch, Scikit-learn, Pandas, NumPy

### 数据工程与大数据: Apache Airflow, MySQL, MongoDB, Spark

### 工具与框架: Docker, Git, Kubernetes, Jenkins

## 工作经历
- Zilliz | 市场营销实习生（研究方向）
- MCM CHINA | 信息技术实习生
- 思杰系统解决方案 | 软件开发实习生

## 教育背景
### 帝国理工学院（QS 2）
2024年09月 - 2025年11月
环境数据科学与机器学习 硕士

### 曼彻斯特大学（QS 34）
2021年09月 - 2024年07月
计算机科学 本科
荣誉：一等奖等学位 (GPA: 3.7/4.0)

## 联系方式
欢迎通过以下方式联系我：

- Email: qixiang.aubury@gmail.com
- GitHub: Aubur9y
- 领英: qixiang1
`; 