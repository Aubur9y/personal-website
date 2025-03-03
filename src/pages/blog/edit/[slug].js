import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import Navbar from '../../../components/Navbar';
import dynamic from 'next/dynamic';
import { FaEye, FaEdit } from 'react-icons/fa';

// 动态导入 Markdown 编辑器
const MarkdownEditor = dynamic(() => import('../../../components/MarkdownEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
});

export default function EditPost() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { slug } = router.query;
  const { lang } = useLanguage();
  const { isAdmin } = useAuth();
  const [isPreview, setIsPreview] = useState(false);
  const [post, setPost] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    coverImage: '',
    date: '',
    readTime: 5
  });
  const [tagInput, setTagInput] = useState('');

  // 使用 useCallback 包装 fetchPost 函数
  const fetchPost = useCallback(async () => {
    if (!slug) return;
    
    try {
      const response = await fetch(`/api/posts/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(lang === 'zh' ? '获取文章失败' : 'Failed to fetch post');
    } finally {
      setIsLoading(false);
    }
  }, [slug, lang]);

  // 客户端挂载检查
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 权限检查
  useEffect(() => {
    if (isClient && !isAdmin) {
      router.push('/blog');
    }
  }, [isClient, isAdmin, router]);

  // 获取文章数据
  useEffect(() => {
    if (isClient && slug) {
      fetchPost();
    }
  }, [isClient, slug, fetchPost]);

  // 如果在服务器端或者还未确认客户端状态，返回加载状态
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-gray-600">
            {lang === 'zh' ? '加载中...' : 'Loading...'}
          </div>
        </div>
      </div>
    );
  }

  // 如果不是管理员，不渲染内容
  if (!isAdmin) {
    return null;
  }

  // 生成 slug
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // 处理标题变化并自动生成 slug
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setPost(prev => ({
      ...prev,
      title: newTitle,
      slug: generateSlug(newTitle)
    }));
  };

  // 添加标签
  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // 移除标签
  const handleRemoveTag = (tagToRemove) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(post),
      });

      if (!response.ok) throw new Error('Failed to update post');
      
      toast.success(lang === 'zh' ? '文章更新成功' : 'Post updated successfully');
      router.push(`/blog/${post.slug}`);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(lang === 'zh' ? '更新失败' : 'Failed to update');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{lang === 'zh' ? '编辑文章' : 'Edit Post'}</title>
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {lang === 'zh' ? '编辑文章' : 'Edit Post'}
              </h1>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors ${
                    isPreview
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {isPreview ? (
                    <>
                      <FaEdit /> {lang === 'zh' ? '编辑模式' : 'Edit Mode'}
                    </>
                  ) : (
                    <>
                      <FaEye /> {lang === 'zh' ? '预览模式' : 'Preview Mode'}
                    </>
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {lang === 'zh' ? '标题' : 'Title'}
                </label>
                <input
                  type="text"
                  value={post.title}
                  onChange={handleTitleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 链接 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {lang === 'zh' ? '链接' : 'Slug'}
                </label>
                <input
                  type="text"
                  value={post.slug}
                  onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 摘要 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {lang === 'zh' ? '摘要' : 'Excerpt'}
                </label>
              <textarea
                  value={post.excerpt}
                  onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 分类和日期 */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {lang === 'zh' ? '分类' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={post.category}
                    onChange={(e) => setPost(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {lang === 'zh' ? '发布日期' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={post.date.split('T')[0]}
                    onChange={(e) => setPost(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 封面图片 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {lang === 'zh' ? '封面图片' : 'Cover Image'}
                </label>
                <input
                  type="text"
                  value={post.coverImage}
                  onChange={(e) => setPost(prev => ({ ...prev, coverImage: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/images/blog/cover.jpg"
                />
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {lang === 'zh' ? '标签' : 'Tags'}
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(e);
                      }
                    }}
                    className="block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={lang === 'zh' ? '输入标签后按回车添加' : 'Press Enter to add tags'}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    {lang === 'zh' ? '添加' : 'Add'}
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {lang === 'zh' ? '内容' : 'Content'}
                </label>
                <MarkdownEditor
                  value={post.content}
                  onChange={(value) => setPost(prev => ({ ...prev, content: value }))}
                  preview={isPreview}
              />
            </div>

              {/* 按钮组 */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                  onClick={() => router.push('/blog')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                  {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                  {lang === 'zh' ? '保存' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
      </main>
    </div>
  );
} 