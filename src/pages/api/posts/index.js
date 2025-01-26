import { connectToDatabase } from '../../../lib/db';
import { isAdmin } from '../../../lib/auth';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const { db } = await connectToDatabase();

    // GET 请求：获取文章列表
    if (method === 'GET') {
      const posts = await db.collection('posts')
        .find({})
        .sort({ date: -1 })
        .toArray();

      return res.status(200).json({ posts });
    }

    // POST 请求：创建新文章（需要管理员权限）
    if (method === 'POST') {
      if (!isAdmin(req)) {
        return res.status(401).json({ message: '未授权' });
      }

      const post = req.body;
      if (!post.title || !post.content) {
        return res.status(400).json({ message: '标题和内容不能为空' });
      }

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
      return res.status(201).json({ ...newPost, _id: result.insertedId });
    }

    // 其他请求方法
    return res.status(405).json({ message: '方法不允许' });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
} 