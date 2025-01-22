import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaThumbsUp, FaReply, FaTrash } from 'react-icons/fa';

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000; // 转换为秒

  if (diff < 60) {
    return '刚刚';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}分钟前`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}小时前`;
  } else if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return `${days}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export default function Comments({ postSlug }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'mostLiked'
  const [currentPage, setCurrentPage] = useState(1);
  const [replyTo, setReplyTo] = useState(null);
  const commentsPerPage = 10;
  const [isAdmin, setIsAdmin] = useState(false);

  // 获取评论（添加排序和分页）
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `/api/comments/${postSlug}?sort=${sortBy}&page=${currentPage}&limit=${commentsPerPage}`
        );
        if (!response.ok) throw new Error('获取评论失败');
        const data = await response.json();
        setComments(data);
      } catch (error) {
        toast.error('获取评论失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postSlug, sortBy, currentPage]);

  // 在组件加载时检查管理员状态
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('检查管理员状态失败:', error);
      }
    };

    checkAdminStatus();
  }, []);

  // 点赞评论
  const handleLike = async (commentId) => {
    try {
      const response = await fetch(`/api/comments/${postSlug}/${commentId}/like`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('点赞失败');
      
      const updatedComment = await response.json();
      setComments(comments.map(c => 
        c._id === commentId ? updatedComment : c
      ));
      toast.success('点赞成功！');
    } catch (error) {
      toast.error('点赞失败，请稍后重试');
    }
  };

  // 删除评论（需要管理员权限）
  const handleDelete = async (commentId) => {
    if (!window.confirm('确定要删除这条评论吗？')) return;

    try {
      const response = await fetch(`/api/comments/${postSlug}/${commentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('删除失败');
      
      setComments(comments.filter(c => c._id !== commentId));
      toast.success('删除成功！');
    } catch (error) {
      toast.error('删除失败，请稍后重试');
    }
  };

  // 提交评论或回复
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${postSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          content: newComment.trim(),
          parentId: replyTo?.id || null,
        }),
      });

      if (!response.ok) throw new Error('提交失败');

      const comment = await response.json();
      setComments([comment, ...comments]);
      setNewComment('');
      setReplyTo(null);
      localStorage.setItem('commenter-name', name);
      toast.success(replyTo ? '回复成功！' : '评论成功！');
    } catch (error) {
      toast.error('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染单个评论
  const renderComment = (comment) => (
    <div key={comment._id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{comment.name}</span>
          <span className="text-xs text-gray-500">
            {formatDate(comment.date)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLike(comment._id)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
          >
            <FaThumbsUp />
            <span>{comment.likes || 0}</span>
          </button>
          <button
            onClick={() => setReplyTo({ id: comment._id, name: comment.name })}
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            <FaReply />
          </button>
          {/* 只有管理员可见的删除按钮 */}
          {isAdmin && (
            <button
              onClick={() => handleDelete(comment._id)}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
      {/* 渲染回复 */}
      {comment.replies?.length > 0 && (
        <div className="mt-4 ml-4 space-y-4 border-l-2 border-gray-100 pl-4">
          {comment.replies.map(reply => renderComment(reply))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">评论 ({comments.length})</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">最新</option>
          <option value="oldest">最早</option>
          <option value="mostLiked">最多点赞</option>
        </select>
      </div>
      
      {/* 评论列表 */}
      <div className="space-y-6 mb-8">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-2 text-gray-500">加载评论中...</p>
          </div>
        ) : comments.length > 0 ? (
          <>
            {comments.map(comment => renderComment(comment))}
            {/* 分页控件 */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.ceil(comments.length / commentsPerPage) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            还没有评论，来说两句吧~
          </div>
        )}
      </div>

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        {replyTo && (
          <div className="mb-4 flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="text-sm text-gray-600">
              回复 @{replyTo.name}
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              取消回复
            </button>
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            昵称
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            评论内容
          </label>
          <textarea
            id="comment"
            rows="4"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="说点什么吧..."
            required
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? '提交中...' : '提交评论'}
        </button>
      </form>
    </div>
  );
} 