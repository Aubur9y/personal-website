import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Blog() {
  const { translations, lang } = useLanguage();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取文章列表
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (!res.ok) throw new Error('获取文章失败');
      const data = await res.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Fetch posts error:', error);
      toast.error(lang === 'zh' ? '获取文章失败' : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  // 删除文章
  const handleDelete = async (slug) => {
    if (!confirm(lang === 'zh' ? '确定要删除这篇文章吗？' : 'Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('删除文章失败');
      
      toast.success(lang === 'zh' ? '文章已删除' : 'Post deleted');
      fetchPosts(); // 重新获取文章列表
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error(lang === 'zh' ? '删除失败' : 'Failed to delete');
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{translations.blog.title}</title>
        <meta name="description" content={translations.blog.description} />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* 标题和新建按钮 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {translations.blog.title}
          </h1>
          {isAdmin && (
            <Link
              href="/blog/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              {lang === 'zh' ? '新建文章' : 'New Post'}
            </Link>
          )}
        </div>

        {/* 文章列表 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* 文章封面图 */}
              {post.coverImage && (
                <div className="relative h-48">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* 文章内容 */}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                {/* 文章信息 */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{post.category}</span>
                  {post.readTime && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{post.readTime} min read</span>
                    </>
                  )}
                </div>

                {/* 标签 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 管理按钮 */}
                {isAdmin && (
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/blog/edit/${post.slug}`}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 空状态 */}
        {posts.length === 0 && (
          <div className="text-center text-gray-600 py-12">
            {lang === 'zh' ? '暂无文章' : 'No posts yet'}
          </div>
        )}
      </main>
    </div>
  );
} 