import { connectToDatabase } from '../../lib/db';
import { verifyToken } from '../../lib/auth';

export default async function handler(req, res) {
  // 只允许 POST 方法
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    // 验证管理员身份
    const user = await verifyToken(req);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: '未授权访问' });
    }

    const { contentZh, contentEn } = req.body;
    if (!contentZh || !contentEn) {
      return res.status(400).json({ message: '内容不能为空' });
    }

    const { db } = await connectToDatabase();
    
    // 更新或创建关于页面内容
    const result = await db.collection('about').updateOne(
      {},  // 空条件，因为只有一个文档
      {
        $set: {
          contentZh,
          contentEn,
          updatedAt: new Date().toISOString()
        }
      },
      { upsert: true }  // 如果不存在则创建
    );

    return res.status(200).json({
      success: true,
      message: '内容已更新'
    });
  } catch (error) {
    console.error('Update about error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '更新失败'
    });
  }
} 