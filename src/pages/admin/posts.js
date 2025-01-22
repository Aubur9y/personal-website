import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { blogPosts } from '../../data/blogPosts';
import Navbar from '../../components/Navbar';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

export default function PostsManagement() {
  const router = useRouter();
  const [posts, setPosts] = useState(blogPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 过滤文章
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 编辑文章
  const handleEdit = (post) => {
    router.push(`/admin/posts/edit/${post.slug}`);
  };

  // 删除文章
  const handleDelete = async (post) => {
    if (!window.confirm(`确定要删除文章"${post.title}"吗？此操作不可恢复！`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/posts/${post.slug}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '删除失败');
      }

      setPosts(posts.filter(p => p.slug !== post.slug));
      toast.success('文章删除成功');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || '删除失败');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>文章管理 | 我的个人网站</title>
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {/* 标题和搜索栏 */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">文章管理</h1>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Link
                href="/admin/posts/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FaPlus /> 新建文章
              </Link>
            </div>
          </div>

          {/* 文章列表 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发布日期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标签</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.slug} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="编辑文章"
                        >
                          <FaEdit />
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          disabled={isDeleting}
                          className={`text-red-600 hover:text-red-900 flex items-center gap-1 ${
                            isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="删除文章"
                        >
                          <FaTrash />
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 空状态 */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">没有找到匹配的文章</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 