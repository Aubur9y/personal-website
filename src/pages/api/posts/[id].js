import { connectToDatabase } from '../../../lib/db';
import { isAdmin } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    try {
      // 检查管理员权限
      if (!isAdmin(req)) {
        return res.status(401).json({ error: '需要管理员权限' });
      }

      const { id } = req.query;
      const { db } = await connectToDatabase();

      // 删除文章
      const result = await db.collection('posts').deleteOne({
        _id: new ObjectId(id)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: '文章不存在' });
      }

      res.status(200).json({ message: '文章删除成功' });
    } catch (error) {
      console.error('删除文章失败:', error);
      res.status(500).json({ error: '删除文章失败' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 