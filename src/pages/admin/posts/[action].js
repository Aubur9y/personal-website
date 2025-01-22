import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import Navbar from '../../../components/Navbar';
import { blogPosts } from '../../../data/blogPosts';
import MarkdownContent from '../../../components/MarkdownContent';
import { FaEdit, FaEye } from 'react-icons/fa';

export default function PostEditor() {
  const router = useRouter();
  const { action, slug } = router.query;
  const isEdit = action === 'edit';

  const [post, setPost] = useState({
    title: '',
    excerpt: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    coverImage: '',
    slug: '',
    tags: [],
    readTime: 5,
    content: '',
    author: {
      name: '',
      avatar: '',
      bio: '',
      id: ''
    }
  });

  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  // 如果是编辑模式，加载文章数据
  useEffect(() => {
    if (isEdit && slug) {
      const existingPost = blogPosts.find(p => p.slug === slug);
      if (existingPost) {
        setPost(existingPost);
      }
    }
  }, [isEdit, slug]);

  // 生成文章对象字符串
  const generatePostObject = () => {
    const postObj = {
      ...post,
      tags: post.tags.map(tag => `"${tag}"`).join(', ')
    };

    return `{
  title: "${postObj.title}",
  excerpt: "${postObj.excerpt}",
  date: "${postObj.date}",
  category: "${postObj.category}",
  coverImage: "${postObj.coverImage}",
  slug: "${postObj.slug}",
  tags: [${postObj.tags}],
  readTime: ${postObj.readTime},
  content: \`
${postObj.content}
  \`
}`;
  };

  // 复制文章对象到剪贴板
  const handleCopy = () => {
    const postObject = generatePostObject();
    navigator.clipboard.writeText(postObject);
    toast.success('文章对象已复制到剪贴板');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{isEdit ? '编辑文章' : '新建文章'} | 我的个人网站</title>
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{isEdit ? '编辑文章' : '新建文章'}</h1>
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
                    <FaEdit /> 编辑模式
                  </>
                ) : (
                  <>
                    <FaEye /> 预览模式
                  </>
                )}
              </button>
              <button
                onClick={() => router.push('/admin/posts')}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                返回
              </button>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                复制文章对象
              </button>
            </div>
          </div>

          {isPreview ? (
            // 预览模式
            <div className="space-y-6">
              {/* 文章头部信息 */}
              <div className="border-b pb-6">
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                
                {/* 作者信息 */}
                <div className="flex items-center gap-4 mb-4">
                  {post.author?.avatar && (
                    <img
                      src={post.author.avatar}
                      alt={post.author?.name || '作者'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{post.author?.name || '匿名作者'}</div>
                    {post.author?.bio && (
                      <div className="text-sm text-gray-600">{post.author.bio}</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span>发布于 {post.date}</span>
                  <span>分类：{post.category}</span>
                  <span>预计阅读时间：{post.readTime} 分钟</span>
                </div>
              </div>

              {/* 文章封面图 */}
              {post.coverImage && (
                <div className="relative aspect-[21/9] w-full bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              {/* 文章内容 */}
              <div className="prose prose-lg max-w-none">
                {post.content}
              </div>

              {/* 标签 */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // 编辑模式 - 原有的表单内容
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">标题</label>
                <input
                  type="text"
                  value={post.title}
                  onChange={handleTitleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input
                  type="text"
                  value={post.slug}
                  onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">摘要</label>
                <textarea
                  rows="3"
                  value={post.excerpt}
                  onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">分类</label>
                  <input
                    type="text"
                    value={post.category}
                    onChange={(e) => setPost(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">发布日期</label>
                  <input
                    type="date"
                    value={post.date}
                    onChange={(e) => setPost(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">封面图片</label>
                <input
                  type="text"
                  value={post.coverImage}
                  onChange={(e) => setPost(prev => ({ ...prev, coverImage: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/images/blog/your-image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">标签</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入标签后按回车添加"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag(e);
                      }
                    }}
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    添加
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

              <div>
                <label className="block text-sm font-medium text-gray-700">阅读时间（分钟）</label>
                <input
                  type="number"
                  value={post.readTime}
                  onChange={(e) => setPost(prev => ({ ...prev, readTime: parseInt(e.target.value) || 0 }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">内容</label>
                <textarea
                  rows="20"
                  value={post.content}
                  onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>

              {/* 作者信息表单 */}
              <div className="border-t pt-6 mt-6">
                <h2 className="text-lg font-medium mb-4">作者信息</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">作者名称</label>
                    <input
                      type="text"
                      value={post.author?.name || ''}
                      onChange={(e) => setPost(prev => ({
                        ...prev,
                        author: { ...(prev.author || {}), name: e.target.value }
                      }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">头像链接</label>
                    <input
                      type="text"
                      value={post.author?.avatar || ''}
                      onChange={(e) => setPost(prev => ({
                        ...prev,
                        author: { ...(prev.author || {}), avatar: e.target.value }
                      }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="/images/avatars/your-avatar.jpg"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">作者简介</label>
                  <textarea
                    rows="2"
                    value={post.author?.bio || ''}
                    onChange={(e) => setPost(prev => ({
                      ...prev,
                      author: { ...(prev.author || {}), bio: e.target.value }
                    }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="简单介绍一下作者..."
                  />
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
} 