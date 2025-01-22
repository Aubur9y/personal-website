import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import Navbar from '../../../../components/Navbar';
import { blogPosts } from '../../../../data/blogPosts';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { FaSave, FaEye, FaArrowLeft } from 'react-icons/fa';

export default function EditPost() {
  const router = useRouter();
  const { slug } = router.query;
  const { translations } = useLanguage();
  const [post, setPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      const currentPost = blogPosts.find(p => p.slug === slug);
      if (!currentPost) {
        router.push('/404');
        return;
      }
      setPost(currentPost);
      setFormData({
        title: currentPost.title,
        excerpt: currentPost.excerpt,
        content: currentPost.content,
        category: currentPost.category,
        tags: currentPost.tags,
      });
    }
  }, [slug, router]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('保存失败');

      toast.success('保存成功');
      router.push(`/blog/${slug}`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Head>
          <title>加载中... | 编辑文章</title>
        </Head>
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl text-gray-600">
              {translations.common.loading}
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>编辑文章 | 我的个人网站</title>
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
                <h1 className="text-3xl font-bold">编辑文章</h1>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 