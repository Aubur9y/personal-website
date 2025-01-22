import { connectToDatabase } from '../../lib/db';

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

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    
    // 插入默认内容
    await db.collection('about').updateOne(
      {},
      { 
        $set: { 
          content: defaultAbout,
          updatedAt: new Date().toISOString()
        } 
      },
      { upsert: true }
    );

    res.status(200).json({ message: '初始化成功' });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ message: '初始化失败' });
  }
} 