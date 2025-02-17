import { connectToDatabase } from '../../../lib/db';
import { isAdmin } from '../../../lib/auth';

export default async function handler(req, res) {
  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { db } = await connectToDatabase();
    const { slug } = req.query;

    if (req.method === 'GET') {
      const post = await db.collection('posts').findOne({ slug });
      if (!post) {
        return res.status(404).json({ message: '文章不存在' });
      }
      return res.status(200).json(post);
    }

    // 以下操作需要管理员权限
    if (!isAdmin(req)) {
      return res.status(401).json({ message: '未授权' });
    }

    if (req.method === 'PUT') {
      const updateData = req.body;
      const oldPost = await db.collection('posts').findOne({ slug });
      
      if (!oldPost) {
        return res.status(404).json({ message: '文章不存在' });
      }

      // 如果 slug 已更改，检查新 slug 是否已存在
      if (updateData.slug !== slug) {
        const existingPost = await db.collection('posts').findOne({ 
          slug: updateData.slug,
          _id: { $ne: oldPost._id }
        });
        
        if (existingPost) {
          return res.status(400).json({ message: '该链接已被使用' });
        }
      }

      // 从更新数据中移除 _id 字段
      const { _id, ...updateDataWithoutId } = updateData;

      // 更新所有字段
      await db.collection('posts').updateOne(
        { slug },
        { 
          $set: {
            ...updateDataWithoutId,
            updatedAt: new Date().toISOString()
          }
        }
      );

      return res.status(200).json({ message: '更新成功' });
    }

    if (req.method === 'DELETE') {
      const result = await db.collection('posts').deleteOne({ slug });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: '文章不存在' });
      }

      return res.status(200).json({ message: '文章删除成功' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
} 