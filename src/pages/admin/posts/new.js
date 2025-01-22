import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import Navbar from '../../../components/Navbar';
import { FaSave, FaEye, FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function NewPost() {
  const router = useRouter();
  const { translations } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    slug: '',
    date: new Date().toISOString().split('T')[0],
    readTime: 5,
  });

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('保存失败');

      const data = await response.json();
      toast.success('文章创建成功');
      router.push(`/blog/${data.slug}`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 改进 slug 生成函数
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[\s]+/g, '-')        // 将空格转换为连字符
      .replace(/[^\w\-]+/g, '')      // 移除非单词字符（保留连字符）
      .replace(/\-\-+/g, '-')        // 将多个连字符替换为单个连字符
      .replace(/^-+/, '')            // 去除开头的连字符
      .replace(/-+$/, '');           // 去除结尾的连字符
  };

  // 处理标题变化时自动生成 slug
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: generateSlug(newTitle)
    }));
  };

  // 添加预览功能
  const handlePreview = () => {
    // 在新窗口中打开预览
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
      <html>
        <head>
          <title>${formData.title || '预览文章'}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-50 p-8">
          <div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
            <h1 class="text-3xl font-bold mb-4">${formData.title}</h1>
            <div class="prose max-w-none">
              ${formData.content}
            </div>
          </div>
        </body>
      </html>
    `);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>新建文章 | 我的个人网站</title>
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                  <FaArrowLeft />
                  返回
                </button>
                <h1 className="text-3xl font-bold">新建文章</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <FaEye />
                  预览
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaSave />
                  {isLoading ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入文章标题..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  摘要
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full h-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入文章摘要..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full h-96 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分类
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    阅读时间（分钟）
                  </label>
                  <input
                    type="number"
                    value={formData.readTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 