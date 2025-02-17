import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import dynamic from 'next/dynamic';
import { FaEye, FaEdit, FaAsterisk } from 'react-icons/fa';

// 动态导入 Markdown 编辑器
const MarkdownEditor = dynamic(() => import('../../components/MarkdownEditor'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
});

// 必填字段
const REQUIRED_FIELDS = ['title', 'content'];

export default function NewPost() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
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
    date: new Date().toISOString().split('T')[0],
    readTime: 5
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  // 客户端挂载检查
  useEffect(() => {
    setIsClient(true);
    setIsLoading(false);
  }, []);

  // 权限检查
  useEffect(() => {
    if (isClient && !isAdmin) {
      router.push('/blog');
    }
  }, [isClient, isAdmin, router]);

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
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: '' }));
    }
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

  // 验证表单
  const validateForm = () => {
    const newErrors = {};
    
    if (!post.title.trim()) {
      newErrors.title = lang === 'zh' ? '标题不能为空' : 'Title is required';
    }
    
    if (!post.content.trim()) {
      newErrors.content = lang === 'zh' ? '内容不能为空' : 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存文章
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(lang === 'zh' ? '请填写必填字段' : 'Please fill in required fields');
      return;
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(post),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || '创建失败');
      }

      toast.success(lang === 'zh' ? '文章创建成功' : 'Post created successfully');
      router.push('/blog');
    } catch (error) {
      console.error('Create post error:', error);
      toast.error(error.message || (lang === 'zh' ? '创建失败' : 'Failed to create post'));
    }
  };

  // 渲染表单标签
  const renderLabel = (fieldName, label) => (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {REQUIRED_FIELDS.includes(fieldName) && (
        <FaAsterisk className="inline-block ml-1 text-red-500 text-xs" />
      )}
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{lang === 'zh' ? '新建文章' : 'New Post'}</title>
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {lang === 'zh' ? '新建文章' : 'New Post'}
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
                {renderLabel('title', lang === 'zh' ? '标题' : 'Title')}
                <input
                  type="text"
                  value={post.title}
                  onChange={handleTitleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* 链接 */}
              <div>
                {renderLabel('slug', lang === 'zh' ? '链接' : 'Slug')}
                <input
                  type="text"
                  value={post.slug}
                  onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 摘要 */}
              <div>
                {renderLabel('excerpt', lang === 'zh' ? '摘要' : 'Excerpt')}
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
                  {renderLabel('category', lang === 'zh' ? '分类' : 'Category')}
                  <input
                    type="text"
                    value={post.category}
                    onChange={(e) => setPost(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  {renderLabel('date', lang === 'zh' ? '发布日期' : 'Date')}
                  <input
                    type="date"
                    value={post.date}
                    onChange={(e) => setPost(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 封面图片 */}
              <div>
                {renderLabel('coverImage', lang === 'zh' ? '封面图片' : 'Cover Image')}
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
                {renderLabel('tags', lang === 'zh' ? '标签' : 'Tags')}
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
                  {post.tags.map((tag, index) => (
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
                {renderLabel('content', lang === 'zh' ? '内容' : 'Content')}
                <div className="mt-1">
                  <MarkdownEditor
                    value={post.content}
                    onChange={(value) => {
                      setPost(prev => ({ ...prev, content: value }));
                      if (errors.content) {
                        setErrors(prev => ({ ...prev, content: '' }));
                      }
                    }}
                    preview={isPreview}
                  />
                </div>
                {errors.content && (
                  <p className="mt-1 text-sm text-red-500">{errors.content}</p>
                )}
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
                  {lang === 'zh' ? '发布' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 