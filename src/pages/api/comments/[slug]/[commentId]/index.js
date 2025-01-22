import { connectToDatabase } from '../../../../../lib/db';
import { ObjectId } from 'mongodb';
import { isAdmin } from '../../../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 检查是否是管理员
  if (!isAdmin(req)) {
    return res.status(403).json({ error: '没有权限执行此操作' });
  }

  const { slug, commentId } = req.query;
  const { db } = await connectToDatabase();

  try {
    const result = await db.collection('comments').deleteOne({
      _id: new ObjectId(commentId),
      postSlug: slug
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: '评论不存在' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
} 