import { connectToDatabase } from '../../../lib/db';
import { isAdmin } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允许 POST 请求' });
  }

  try {
    // 验证管理员权限
    if (!isAdmin(req)) {
      return res.status(401).json({ message: '未授权' });
    }

    const post = req.body;
    if (!post.title || !post.content) {
      return res.status(400).json({ message: '标题和内容不能为空' });
    }

    const { db } = await connectToDatabase();
    
    // 检查 slug 是否已存在
    const existingPost = await db.collection('posts').findOne({ slug: post.slug });
    if (existingPost) {
      return res.status(400).json({ message: '该 slug 已存在' });
    }

    // 添加创建时间和更新时间
    const newPost = {
      ...post,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.collection('posts').insertOne(newPost);
    res.status(201).json({ ...newPost, _id: result.insertedId });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: '创建文章失败' });
  }
} 