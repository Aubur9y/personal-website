import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaSave, FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import marked from 'marked';

export default function BlogPost({ post, isAdmin }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(post?.content || '');
  const router = useRouter();

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}`, {
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

  return (
    <div>
      {/* 管理按钮组 */}
      {isAdmin && (
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

      {/* 内容区域 */}
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[600px] p-4 border rounded font-mono"
        />
      ) : (
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: marked(content) 
          }} 
        />
      )}
    </div>
  );
} 