import { connectToDatabase } from '../../lib/db';
import { isAdmin } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允许 POST 请求' });
  }

  try {
    // 验证管理员权限
    if (!isAdmin(req)) {
      return res.status(401).json({ message: '未授权' });
    }

    const { contentZh, contentEn } = req.body;
    if (!contentZh || !contentEn) {
      return res.status(400).json({ message: '内容不能为空' });
    }

    const { db } = await connectToDatabase();
    
    // 更新或插入内容
    await db.collection('about').updateOne(
      {},  // 空条件表示更新第一个文档
      { 
        $set: { 
          contentZh,
          contentEn,
          updatedAt: new Date().toISOString()
        } 
      },
      { upsert: true }  // 如果不存在则创建
    );

    res.status(200).json({ message: '保存成功' });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ message: '保存失败' });
  }
} 