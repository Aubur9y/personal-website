import { MongoClient } from 'mongodb';

// 只在服务器端检查环境变量
if (typeof window === 'undefined') {
  if (!process.env.MONGODB_URI) {
    throw new Error('请在环境变量中定义 MONGODB_URI');
  }
  if (!process.env.MONGODB_DB) {
    throw new Error('请在环境变量中定义 MONGODB_DB');
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // 如果已经有缓存的连接，直接返回
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // 客户端不需要连接数据库
  if (typeof window !== 'undefined') {
    return { client: null, db: null };
  }

  try {
    // 创建新的连接
    const client = await MongoClient.connect(MONGODB_URI, {
      maxPoolSize: 10
    });

    const db = client.db(MONGODB_DB);

    // 缓存连接
    cachedClient = client;
    cachedDb = db;

    console.log('Successfully connected to MongoDB.');
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('无法连接到数据库');
  }
}

// 添加关闭连接的函数
export async function closeConnection() {
  try {
    if (cachedClient) {
      await cachedClient.close();
      cachedClient = null;
      cachedDb = null;
      console.log('Database connection closed.');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
}

// 添加健康检查函数
export async function checkConnection() {
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// 默认的关于内容
const defaultAbout = `
# 👋 你好，我是相祺

我是一名热爱技术的全栈开发者，专注于机器学习和数据工程，具备丰富的项目经验和实习经历。

## 技术栈

### 编程语言
- **Python**: 熟练掌握，主要用于数据分析和机器学习
- **JavaScript/TypeScript**: 前端开发和 Node.js 服务端开发
- **Java**: 企业级应用开发

### 数据科学与机器学习
- **框架**: PyTorch, Scikit-learn, TensorFlow
- **工具**: Pandas, NumPy, Matplotlib
- **领域**: 计算机视觉, 自然语言处理

### 数据工程与大数据
- **工作流**: Apache Airflow
- **数据库**: MySQL, MongoDB, Redis
- **大数据**: Spark, Hadoop

### 开发工具与框架
- **容器化**: Docker, Kubernetes
- **版本控制**: Git, GitHub
- **CI/CD**: Jenkins, GitHub Actions

## 工作经历

### Zilliz | 市场营销实习生（研究方向）
- 负责向量数据库性能测试和优化
- 编写技术文档和最佳实践指南
- 参与开源社区维护和技术支持

### MCM CHINA | 信息技术实习生
- 开发和维护内部管理系统
- 实现数据可视化和报表功能
- 优化系统性能和用户体验

### 思杰系统解决方案 | 软件开发实习生
- 参与企业级应用开发
- 实现前端界面和后端接口
- 编写单元测试和集成测试

## 教育背景

### 帝国理工学院（QS 2）
- 2024年09月 - 2025年11月
- 环境数据科学与机器学习 硕士
- 主要课程：高级机器学习、深度学习、数据工程

### 曼彻斯特大学（QS 34）
- 2021年09月 - 2024年07月
- 计算机科学 本科
- 成绩：一等荣誉学位 (GPA: 3.7/4.0)
- 主要课程：算法与数据结构、人工智能、软件工程

## 联系方式

欢迎通过以下方式联系我：

- **Email**: [qixiang.aubury@gmail.com](mailto:qixiang.aubury@gmail.com)
- **GitHub**: [Aubur9y](https://github.com/Aubur9y)
- **领英**: [qixiang1](https://linkedin.com/in/qixiang1)
`; 