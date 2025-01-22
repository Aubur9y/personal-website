import Link from 'next/link';
import { blogPosts } from '../data/blogPosts';

export default function PostNavigation({ currentSlug }) {
  const currentIndex = blogPosts.findIndex(post => post.slug === currentSlug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  return (
    <div className="flex justify-between items-center py-8 border-t border-gray-200">
      {prevPost ? (
        <Link
          href={`/blog/${prevPost.slug}`}
          className="group flex flex-col items-start"
        >
          <span className="text-sm text-gray-500">上一篇</span>
          <span className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {prevPost.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {nextPost ? (
        <Link
          href={`/blog/${nextPost.slug}`}
          className="group flex flex-col items-end text-right"
        >
          <span className="text-sm text-gray-500">下一篇</span>
          <span className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {nextPost.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
} 