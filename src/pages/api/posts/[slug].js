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
      const { content } = req.body;
      await db.collection('posts').updateOne(
        { slug },
        { 
          $set: { 
            content,
            updatedAt: new Date().toISOString()
          } 
        }
      );
      return res.status(200).json({ message: '更新成功' });
    }

    if (req.method === 'DELETE') {
      await db.collection('posts').deleteOne({ slug });
      return res.status(200).json({ message: '删除成功' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
} 