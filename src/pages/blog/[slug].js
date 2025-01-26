import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { connectToDatabase } from '../../lib/db';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  gfm: true,
  breaks: true
});

export default function BlogPost({ post }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const { isAdmin } = useAuth();

  // 如果页面正在加载，显示加载状态
  if (router.isFallback) {
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

  // 如果没有找到文章，显示404
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-gray-600">
            {lang === 'zh' ? '文章不存在' : 'Post not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮和编辑按钮 */}
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="mr-2" />
              {lang === 'zh' ? '返回博客' : 'Back to Blog'}
            </Link>
            {isAdmin && (
              <Link
                href={`/blog/edit/${post.slug}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaEdit className="mr-2" />
                {lang === 'zh' ? '编辑文章' : 'Edit Post'}
              </Link>
            )}
          </div>

          {/* 文章内容 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* 封面图片 */}
            {post.coverImage && (
              <div className="relative h-64 md:h-96">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* 文章标题 */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              {/* 文章元信息 */}
              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-8">
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
                <div className="flex flex-wrap gap-2 mb-8">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 文章内容 */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: marked(post.content) }}
              />
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { db } = await connectToDatabase();
    const post = await db.collection('posts').findOne({ slug: params.slug });

    if (!post) {
      return {
        notFound: true
      };
    }

    // 将 _id 转换为字符串，避免序列化错误
    post._id = post._id.toString();

    return {
      props: {
        post: JSON.parse(JSON.stringify(post)) // 确保数据可以序列化
      }
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      notFound: true
    };
  }
} 