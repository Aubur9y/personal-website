import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { marked } from 'marked';
import Navbar from '../components/Navbar';
import { FaFileDownload, FaGithub, FaLinkedin, FaEnvelope, FaEdit, FaSave } from 'react-icons/fa';
import { connectToDatabase } from '../lib/db';
import { isAdmin } from '../lib/auth';

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

export default function About({ about, resumePath, isAdmin: isAdminUser, lastUpdated }) {
  console.log('Admin status:', isAdminUser);

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(about?.content || defaultAbout);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('上传失败');

      const data = await response.json();
      toast.success('简历上传成功');
      window.location.reload();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('简历上传失败');
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('保存失败');

      toast.success('保存成功');
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('保存失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>关于我 | 我的个人网站</title>
        <meta name="description" content="了解更多关于我的信息" />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          {/* 管理按钮组 */}
          {isAdminUser && (
            <div className="mb-8 flex justify-end space-x-4">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaSave className="mr-2" />
                  保存
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  编辑
                </button>
              )}
            </div>
          )}

          {/* 简历按钮组 */}
          {resumePath && (
            <div className="mb-8 flex justify-end space-x-4">
              <Link
                href="/resume"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaFileDownload className="mr-2" />
                查看简历
              </Link>
              <Link
                href={resumePath}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFileDownload className="mr-2" />
                下载简历
              </Link>
              {isAdminUser && (
                <label className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                  <FaFileDownload className="mr-2" />
                  上传简历
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                  />
                </label>
              )}
            </div>
          )}

          {/* 内容区域 */}
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[600px] p-4 border rounded font-mono"
            />
          ) : (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: marked(content, { breaks: true }) 
              }} 
            />
          )}

          {/* 最后更新时间 */}
          {lastUpdated && (
            <div className="mt-8 text-sm text-gray-500">
              最后更新：{lastUpdated}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const { db } = await connectToDatabase();
    if (!db) {
      console.error('Database connection failed');
      return {
        props: {
          about: { content: defaultAbout },
          resumePath: null,
          lastUpdated: null,
          isAdmin: false
        },
        revalidate: 60
      };
    }

    // 获取数据
    const about = await db.collection('about').findOne({});
    const resumeInfo = await db.collection('settings').findOne({ key: 'resume' });
    
    return {
      props: {
        about: about ? JSON.parse(JSON.stringify(about)) : { content: defaultAbout },
        resumePath: resumeInfo?.path || null,
        lastUpdated: about?.updatedAt ? new Date(about.updatedAt).toLocaleDateString() : null,
        isAdmin: true
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        about: { content: defaultAbout },
        resumePath: null,
        lastUpdated: null,
        isAdmin: false
      },
      revalidate: 60
    };
  }
} 