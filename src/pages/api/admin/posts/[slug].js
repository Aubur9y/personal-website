import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  // 验证管理员身份
  try {
    const user = await verifyToken(req);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: '未授权访问' });
    }
  } catch (error) {
    return res.status(401).json({ message: '未授权访问' });
  }

  const { slug } = req.query;

  // 只处理DELETE请求
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // 删除文章
    const result = await db.collection('posts').deleteOne({ slug });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: '文章不存在' });
    }

    res.status(200).json({ message: '文章删除成功' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
} 