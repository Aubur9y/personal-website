import React, { useState, useEffect } from 'react';
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
import { useLanguage } from '../../contexts/LanguageContext';
import Image from 'next/image';

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const { translations, lang } = useLanguage();
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (slug) {
      const currentPost = blogPosts.find(p => p.slug === slug);
      if (!currentPost) {
        router.push('/404');
        return;
      }
      setPost(currentPost);
    }
  }, [slug, router]);

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post?.content || '');

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

  const maintenanceText = {
    zh: {
      title: '🚧 博客系统维护中 🚧',
      description: '您访问的文章暂时无法查看',
      note: '正在为您跳转到博客主页...'
    },
    en: {
      title: '🚧 Blog System Under Maintenance 🚧',
      description: 'The article you are trying to access is temporarily unavailable',
      note: 'Redirecting to blog homepage...'
    }
  };

  const contentText = maintenanceText[lang] || maintenanceText.zh;

  useEffect(() => {
    // 3秒后重定向到博客主页
    const timer = setTimeout(() => {
      router.push('/blog');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Head>
          <title>{lang === 'en' ? 'Blog Maintenance' : '博客维护中'}</title>
          <meta name="description" content={contentText.description} />
        </Head>

        <Navbar />

        <main className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
                {contentText.title}
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              {contentText.description}
            </p>
            <p className="text-gray-400">
              {contentText.note}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const pageTitle = `${post.title} | 博客`;

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-64 w-full bg-gray-200">
            <Image
              src={post.coverImage || '/images/default-cover.jpg'}
              alt={post.title}
              width={1200}
              height={630}
              priority
              className="object-cover"
            />
          </div>
          
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center text-gray-600 mb-8">
              <span>{new Date(post.date).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>{post.category}</span>
              {post.readTime && (
                <>
                  <span className="mx-2">•</span>
                  <span>{post.readTime} {translations.blog.readTime}</span>
                </>
              )}
            </div>
            
            <div className="prose prose-lg max-w-none">
              <MarkdownContent content={post.content} />
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const paths = blogPosts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 60,
  };
} 