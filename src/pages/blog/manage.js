import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ManagePosts({ posts: initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const router = useRouter();
  const { translations } = useLanguage();

  const handleDelete = async (id) => {
    if (!window.confirm(translations.blog.deleteConfirm)) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '删除失败');
      }

      // 从列表中移除已删除的文章
      setPosts(posts.filter(post => post.slug !== id));
      toast.success(translations.blog.deleteSuccess);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || translations.blog.deleteError);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                {translations.blog.manage}
              </h1>
              <button
                onClick={() => router.push('/blog/new')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {translations.blog.newPost}
              </button>
            </div>

            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.slug}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{post.title}</h2>
                    <p className="text-gray-600 text-sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/blog/edit/${post.slug}`)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title={translations.common.edit}
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title={translations.blog.delete}
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 