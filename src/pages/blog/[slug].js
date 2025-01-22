import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaSave, FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import marked from 'marked';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import ImageWithFallback from '../../components/ImageWithFallback';
import ShareButtons from '../../components/ShareButtons';
import { blogPosts } from '../../data/blogPosts';
import TableOfContents from '../../components/TableOfContents';
import PostNavigation from '../../components/PostNavigation';
import ReadingProgress from '../../components/ReadingProgress';
import MarkdownContent from '../../components/MarkdownContent';
import Comments from '../../components/Comments';
import { connectToDatabase } from '../../lib/db';
import { isAdmin } from '../../lib/auth';

export default function BlogPost({ post, isAdmin: isAdminUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post?.content || '');
  const router = useRouter();

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/posts/${post.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('保存失败');

      toast.success('保存成功');
      setIsEditing(false);
      router.reload();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('保存失败');
    }
  };

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-gray-600 mb-8">文章不存在</p>
            <Link href="/blog" className="text-blue-600 hover:text-blue-800">
              返回博客列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReadingProgress />
      <Head>
        <title>{post.title} | 我的个人网站</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto lg:flex lg:gap-12">
          {/* 左侧文章内容 */}
          <div className="flex-1">
            {/* 文章头部 */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Link href="/blog" className="text-blue-600 hover:text-blue-800">
                  ← 返回博客列表
                </Link>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
              
              {/* 作者信息 */}
              <div className="flex items-center gap-4 mb-6">
                {post.author?.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
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

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <span>发布于 {post.date}</span>
                <span>分类：{post.category}</span>
                <span>预计阅读时间：{post.readTime} 分钟</span>
              </div>
            </div>

            {/* 文章封面图 */}
            <div className="relative aspect-[21/9] w-full bg-gray-100 rounded-lg overflow-hidden mb-8">
              <ImageWithFallback
                src={post.coverImage}
                fallbackSrc="/images/default-cover.jpg"
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>

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

            {/* 文章内容 */}
            {isEditing ? (
              <div className="mb-8">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[600px] p-4 border rounded font-mono"
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaSave className="mr-2" />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <MarkdownContent content={content} />
              </div>
            )}

            {/* 标签和分享 */}
            <div className="flex flex-wrap items-center justify-between py-6 border-t border-gray-200">
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
              <ShareButtons 
                title={post.title} 
                url={typeof window !== 'undefined' ? window.location.href : ''}
              />
            </div>

            {/* 添加评论系统 */}
            <Comments postSlug={post.slug} />

            {/* 添加上一篇/下一篇导航 */}
            <PostNavigation currentSlug={post.slug} />
          </div>

          {/* 右侧目录 */}
          <div className="w-64 flex-shrink-0">
            <TableOfContents />
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  try {
    const { db } = await connectToDatabase();
    const posts = await db.collection('posts').find({}).toArray();
    
    return {
      paths: posts.map(post => ({
        params: { slug: post.slug }
      })),
      fallback: true
    };
  } catch (error) {
    console.error('Error fetching paths:', error);
    return {
      paths: [],
      fallback: true
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    const { db } = await connectToDatabase();
    const post = await db.collection('posts').findOne({ slug: params.slug });

    if (!post) {
      return {
        notFound: true
      };
    }

    return {
      props: {
        post: JSON.parse(JSON.stringify(post)),
        isAdmin: true // 在开发环境中暂时设置为 true
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      notFound: true
    };
  }
} 