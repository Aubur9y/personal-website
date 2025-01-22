import { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';
import ShareButtons from './ShareButtons';
import { useLanguage } from '../contexts/LanguageContext';

const DEFAULT_COVER = '/images/default-cover.jpg';

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default function BlogCard({ post, isAdmin }) {
  const { translations } = useLanguage();
  const [currentUserId, setCurrentUserId] = useState(null);

  // 获取当前用户信息
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const res = await fetch('/api/auth/user');
        const data = await res.json();
        if (data.user) {
          setCurrentUserId(data.user.id);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    getCurrentUser();
  }, []);

  // 添加安全检查
  if (!post) {
    return null;
  }

  const articleUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post?.slug || ''}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* 文章封面图 */}
      <div className="relative aspect-[16/9] w-full bg-gray-100">
        <ImageWithFallback
          src={post.coverImage || DEFAULT_COVER}
          fallbackSrc={DEFAULT_COVER}
          alt={post.title}
          fill
          className="object-cover transition-opacity duration-300"
          loading="lazy"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
          placeholder="blur"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-6">
        {/* 分类和日期 */}
        <div className="flex items-center mb-4 flex-wrap gap-2">
          <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {post.category}
          </span>
          <span className="text-sm text-gray-500">{post.date}</span>
          <span className="text-sm text-gray-500">· {post.readTime} {translations.blog.readTime}</span>
        </div>

        {/* 作者信息 */}
        <div className="flex items-center gap-3 mb-3">
          {post.author?.avatar && (
            <img
              src={post.author.avatar}
              alt={post.author.name || translations.blog.anonymous}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <span className="text-sm text-gray-600">
            {translations.blog.authorPrefix} {post.author?.name || translations.blog.anonymous}
          </span>
        </div>

        {/* 标题 */}
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
            {post.title}
          </Link>
        </h2>

        {/* 摘要 */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags?.map(tag => (
            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {translations.blog.tags[tag.toLowerCase()] || tag}
            </span>
          ))}
        </div>

        {/* 阅读时间和作者 */}
        <div className="text-sm text-gray-500 mb-4">
          <span>{post.readTime} {translations.blog.readTime}</span>
          <span className="mx-2">•</span>
          <span>
            {translations.blog.authorPrefix} {post.author?.name || translations.blog.anonymous}
          </span>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <ShareButtons title={post.title} url={articleUrl} />
          <div className="flex items-center gap-2">
            {/* 管理员可以编辑所有文章 */}
            {isAdmin && post?.slug && (
              <Link 
                href={`/admin/posts/edit/${post.slug}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {translations.blog.edit}
              </Link>
            )}
            {/* 作者可以编辑自己的文章 */}
            {!isAdmin && currentUserId && post.author?.id === currentUserId && (
              <Link
                href={`/blog/${post.slug}/edit`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {translations.blog.edit}
              </Link>
            )}
            <Link 
              href={`/blog/${post.slug}`} 
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              {translations.blog.readMore}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 