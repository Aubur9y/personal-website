import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { marked } from 'marked';
import Navbar from '../components/Navbar';
import { FaFileDownload, FaGithub, FaLinkedin, FaEnvelope, FaEdit, FaSave } from 'react-icons/fa';
import { isAdmin } from '../lib/auth';
import { connectToDatabase } from '../lib/db';

export async function getServerSideProps({ req }) {
  const { db } = await connectToDatabase();
  
  // 获取简历路径和自我介绍
  const resumeInfo = await db.collection('settings').findOne({ key: 'resume' });
  const aboutInfo = await db.collection('settings').findOne({ key: 'about' });
  
  return {
    props: {
      isAdmin: isAdmin(req),
      resumePath: resumeInfo?.path || null,
      about: aboutInfo?.content || defaultAbout,
      lastUpdated: aboutInfo?.updatedAt ? new Date(aboutInfo.updatedAt).toLocaleDateString() : null,
    },
  };
}

const defaultAbout = `
# 你好，我是 Aubur9y 👋

我是一名热爱技术的全栈开发者，专注于 Web 开发和人工智能应用。

## 技术栈

- 前端：React, Next.js, TypeScript, Tailwind CSS
- 后端：Node.js, Python, Django
- 数据库：MongoDB, PostgreSQL
- 其他：Docker, Git, Linux

## 工作经历

- 2023 - 至今：某公司，全栈开发工程师
- 2021 - 2023：某公司，前端开发工程师

## 教育背景

- 2017 - 2021：某大学，计算机科学与技术专业

## 联系方式

欢迎通过以下方式联系我：
- Email: example@example.com
- GitHub: @Aubur9y
`;

export default function About({ isAdmin, resumePath, about, lastUpdated }) {
  const [showResume, setShowResume] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(about);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('请上传 PDF 格式的文件');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('上传失败');

      toast.success('简历上传成功');
      window.location.reload(); // 刷新页面以显示新简历
    } catch (error) {
      toast.error('上传失败：' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAbout = async () => {
    try {
      const res = await fetch('/api/about/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (!res.ok) throw new Error('更新失败');

      toast.success('更新成功');
      setIsEditing(false);
      window.location.reload(); // 刷新页面以显示新内容
    } catch (error) {
      toast.error('更新失败：' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>关于我 | 个人网站</title>
        <meta name="description" content="了解更多关于我的信息" />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {!showResume ? (
          // 显示"关于我"的内容
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* 头部信息 */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">关于我</h1>
                <div className="flex items-center gap-4">
                  {isAdmin && (
                    <>
                      {isEditing ? (
                        <button
                          onClick={handleSaveAbout}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          <FaSave />
                          保存
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <FaEdit />
                          编辑
                        </button>
                      )}
                      <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        上传简历
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleResumeUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </>
                  )}
                  {resumePath && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowResume(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        查看简历
                      </button>
                      <Link
                        href={resumePath}
                        download="resume.pdf"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <FaFileDownload className="w-5 h-5" />
                        下载简历
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* 自我介绍 */}
              <div className="prose max-w-none">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-[500px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="使用 Markdown 格式编写..."
                  />
                ) : (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: marked(about, { breaks: true }) 
                    }} 
                  />
                )}
              </div>

              {/* 最后更新时间 */}
              {lastUpdated && (
                <div className="mt-8 text-sm text-gray-500">
                  最后更新：{lastUpdated}
                </div>
              )}

              {/* 社交链接 */}
              <div className="mt-8 flex gap-4">
                <Link
                  href="https://github.com/Aubur9y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaGithub size={24} />
                </Link>
                <Link
                  href="mailto:example@example.com"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaEnvelope size={24} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // 显示简历预览
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-4">
              {/* 简历预览头部 */}
              <div className="flex justify-between items-center mb-4 bg-white sticky top-0 z-10 p-4 shadow-md">
                <h2 className="text-2xl font-bold">我的简历</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowResume(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    返回
                  </button>
                  <Link
                    href={resumePath}
                    download="resume.pdf"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FaFileDownload className="w-5 h-5" />
                    下载简历
                  </Link>
                </div>
              </div>

              {/* 简历预览 */}
              <div className="w-full bg-gray-100">
                <iframe
                  src={`${resumePath}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  className="w-full h-[calc(100vh-12rem)] border-0 rounded-lg bg-white shadow-md"
                  title="简历预览"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 