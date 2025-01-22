import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { marked } from 'marked';
import Navbar from '../components/Navbar';
import { 
  FaFileDownload, FaGithub, FaLinkedin, FaEnvelope, FaEdit, FaSave
} from 'react-icons/fa';
import { connectToDatabase } from '../lib/db';
import { isAdmin } from '../lib/auth';
import { useLanguage } from '../contexts/LanguageContext';

const defaultAbout = {
  zh: `
# 👋 你好，我是相祺

我是一名热爱技术的全栈开发者，专注于机器学习和数据工程，具备丰富的项目经验和实习经历。

## 教育背景

### 帝国理工学院（QS 2）
- 2024年09月 - 2025年11月
- 环境数据科学与机器学习 硕士

### 曼彻斯特大学（QS 34）
- 2021年09月 - 2024年07月
- 计算机科学 本科
- 成绩：一等荣誉学位 (GPA: 3.7/4.0)

## 技术栈

### 编程语言
- **Python**
- **JavaScript/TypeScript**
- **Java**

### 数据科学与机器学习
- **框架**: PyTorch, Scikit-learn, TensorFlow
- **工具**: Pandas, NumPy, Matplotlib
- **领域**: 计算机视觉, NLP

### 数据工程与大数据
- **工作流**: Apache Airflow
- **数据库**: MySQL, MongoDB, Redis
- **大数据**: Spark, Hadoop

### 开发工具与框架
- **容器化**: Docker, Kubernetes
- **版本控制**: Git, GitHub
- **CI/CD**: Jenkins

## 工作经历

### Zilliz
- 市场营销实习生（研究方向）

### MCM CHINA
- 信息技术实习生

### 思杰系统解决方案
- 软件开发实习生

## 联系方式

欢迎通过以下方式联系我：

- **Email**: [qixiang.aubury@gmail.com](mailto:qixiang.aubury@gmail.com)
- **GitHub**: [Aubur9y](https://github.com/Aubur9y)
- **领英**: [qixiang1](https://linkedin.com/in/qixiang1)
`,
  en: `
# 👋 Hi, I'm Xiangqi

I'm a passionate full-stack developer focused on machine learning and data engineering, with extensive project experience and internships.

## Education

### Imperial College London (QS 2)
- Sep 2024 - Nov 2025
- MSc in Environmental Data Science and Machine Learning

### University of Manchester (QS 34)
- Sep 2021 - Jul 2024
- BSc in Computer Science
- First Class Honours (GPA: 3.7/4.0)

## Tech Stack

### Programming Languages
- **Python**
- **JavaScript/TypeScript**
- **Java**

### Data Science & Machine Learning
- **Frameworks**: PyTorch, Scikit-learn, TensorFlow
- **Tools**: Pandas, NumPy, Matplotlib
- **Fields**: Computer Vision, NLP

### Data Engineering & Big Data
- **Workflow**: Apache Airflow
- **Databases**: MySQL, MongoDB, Redis
- **Big Data**: Spark, Hadoop

### Development Tools & Frameworks
- **Containerization**: Docker, Kubernetes
- **Version Control**: Git, GitHub
- **CI/CD**: Jenkins

## Work Experience

### Zilliz
- Marketing Intern (Research Direction)

### MCM CHINA
- IT Intern

### Citrix System Solutions
- Software Development Intern

## Contact

Feel free to reach out to me through:

- **Email**: [qixiang.aubury@gmail.com](mailto:qixiang.aubury@gmail.com)
- **GitHub**: [Aubur9y](https://github.com/Aubur9y)
- **LinkedIn**: [qixiang1](https://linkedin.com/in/qixiang1)
`
};

// 添加这个简单的配置
const markdownOptions = {
  breaks: true,
  gfm: true,
  headerIds: true,
  headerPrefix: 'heading-'
};

export default function About({ about, resumePaths, isAdmin: isAdminUser, lastUpdated }) {
  const { lang, translations } = useLanguage();
  console.log('Admin status:', isAdminUser);

  const [isEditing, setIsEditing] = useState(false);
  // 分别存储中英文内容
  const [contentZh, setContentZh] = useState(about?.contentZh || defaultAbout.zh);
  const [contentEn, setContentEn] = useState(about?.contentEn || defaultAbout.en);
  const [parsedContent, setParsedContent] = useState('');
  const [showResume, setShowResume] = useState(false);

  // 根据当前语言选择对应的简历路径
  const currentResumePath = resumePaths?.[lang];

  // 根据当前语言选择显示的内容
  const currentContent = lang === 'zh' ? contentZh : contentEn;

  useEffect(() => {
    if (!isEditing) {
      setContentZh(about?.contentZh || defaultAbout.zh);
      setContentEn(about?.contentEn || defaultAbout.en);
    }
  }, [lang, isEditing, about]);

  useEffect(() => {
    setParsedContent(marked(currentContent || '', markdownOptions));
  }, [currentContent]);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', lang);

    try {
      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('上传失败');

      toast.success(translations.about.resumeUploadSuccess);
      window.location.reload();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(translations.about.resumeUploadError);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentZh,
          contentEn,
          language: lang
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '保存失败');
      }

      // 保存成功后更新状态
      toast.success('保存成功');
      setIsEditing(false);

      // 更新 about 对象
      if (about) {
        about.contentZh = contentZh;
        about.contentEn = contentEn;
        about.updatedAt = new Date().toISOString();
      }

      // 根据当前语言更新显示的内容
      const newContent = lang === 'zh' ? contentZh : contentEn;
      setParsedContent(marked(newContent || '', markdownOptions));
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || '保存失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{translations.about.pageTitle}</title>
        <meta name="description" content={translations.about.pageDescription} />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* 个人资料卡片 */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* 左侧头像 */}
              <div className="md:flex-shrink-0">
                <Image
                  src="/images/avatar.jpg"
                  alt="个人头像"
                  width={200}
                  height={200}
                  className="h-48 w-full object-cover md:h-full md:w-48"
                  priority
                  sizes="(max-width: 768px) 100vw, 200px"
                />
              </div>
              
              {/* 右侧信息 */}
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {lang === 'zh' ? '相祺' : 'Xiangqi'}
                  </h1>
                  <div className="flex space-x-4">
                    <a href="https://github.com/Aubur9y" target="_blank" rel="noopener noreferrer" 
                       className="text-gray-600 hover:text-gray-900">
                      <FaGithub size={24} />
                    </a>
                    <a href="https://linkedin.com/in/qixiang1" target="_blank" rel="noopener noreferrer"
                       className="text-gray-600 hover:text-gray-900">
                      <FaLinkedin size={24} />
                    </a>
                    <a href="mailto:qixiang.aubury@gmail.com"
                       className="text-gray-600 hover:text-gray-900">
                      <FaEnvelope size={24} />
                    </a>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">
                  {translations.about.role}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Python
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    JavaScript
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {lang === 'zh' ? '机器学习' : 'Machine Learning'}
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {lang === 'zh' ? '数据工程' : 'Data Engineering'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* 管理按钮组 */}
            {isAdminUser && (
              <div className="mb-8 flex justify-end space-x-4">
                {isEditing ? (
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaSave className="mr-2" />
                    {translations.common.save}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaEdit className="mr-2" />
                    {translations.common.edit}
                  </button>
                )}
              </div>
            )}

            {/* 简历按钮组和预览 */}
            {currentResumePath && (
              <>
                <div className="mb-4 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowResume(!showResume)}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FaFileDownload className="mr-2" />
                    {showResume ? translations.about.hideResume : translations.about.viewResume}
                  </button>
                  <Link
                    href={currentResumePath}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFileDownload className="mr-2" />
                    {translations.about.downloadResume}
                  </Link>
                  {isAdminUser && (
                    <label className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                      <FaFileDownload className="mr-2" />
                      {translations.about.uploadResume}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleResumeUpload}
                      />
                    </label>
                  )}
                </div>

                {showResume && (
                  <div className="mb-8 bg-white rounded-lg shadow-lg overflow-hidden">
                    <iframe
                      src={`${currentResumePath}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-[800px]"
                      style={{ border: 'none' }}
                    />
                  </div>
                )}
              </>
            )}

            {/* 内容区域 */}
            {isEditing ? (
              <textarea
                value={lang === 'zh' ? contentZh : contentEn}
                onChange={(e) => {
                  if (lang === 'zh') {
                    setContentZh(e.target.value);
                  } else {
                    setContentEn(e.target.value);
                  }
                }}
                className="w-full h-[600px] p-4 border rounded font-mono"
              />
            ) : (
              <article className="prose prose-lg max-w-none">
                <div 
                  className="
                    prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-8 
                    prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-6 prose-h2:mt-8
                    prose-h3:text-xl prose-h3:font-bold prose-h3:mb-4 prose-h3:mt-6
                    prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
                    prose-ul:space-y-2 prose-ul:mb-6 prose-ul:list-none prose-ul:pl-0
                    prose-li:flex prose-li:items-start prose-li:gap-2
                    prose-strong:font-semibold prose-strong:text-gray-800
                    prose-a:text-blue-600 prose-a:hover:text-blue-800
                  "
                  dangerouslySetInnerHTML={{ 
                    __html: parsedContent 
                  }} 
                />
              </article>
            )}

            {/* 最后更新时间 */}
            {lastUpdated && (
              <div className="mt-8 text-sm text-gray-500">
                {translations.common.lastUpdated} {lastUpdated}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const { db } = await connectToDatabase();
    if (!db) {
      return {
        props: {
          about: { contentZh: defaultAbout.zh, contentEn: defaultAbout.en },
          resumePaths: {
            zh: process.env.RESUME_PATH_ZH,
            en: process.env.RESUME_PATH_EN
          },
          lastUpdated: null,
          isAdmin: false
        },
        revalidate: 60
      };
    }

    const about = await db.collection('about').findOne({});
    
    return {
      props: {
        about: about ? JSON.parse(JSON.stringify(about)) : { contentZh: defaultAbout.zh, contentEn: defaultAbout.en },
        resumePaths: {
          zh: process.env.RESUME_PATH_ZH,
          en: process.env.RESUME_PATH_EN
        },
        lastUpdated: about?.updatedAt ? new Date(about.updatedAt).toLocaleDateString() : null,
        isAdmin: true
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        about: { contentZh: defaultAbout.zh, contentEn: defaultAbout.en },
        resumePaths: {
          zh: process.env.RESUME_PATH_ZH,
          en: process.env.RESUME_PATH_EN
        },
        lastUpdated: null,
        isAdmin: false
      },
      revalidate: 60
    };
  }
} 