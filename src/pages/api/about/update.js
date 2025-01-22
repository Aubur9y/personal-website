import { connectToDatabase } from '../../../lib/db';
import { isAdmin } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: '需要管理员权限' });
  }

  try {
    const { content } = req.body;
    const { db } = await connectToDatabase();

    await db.collection('settings').updateOne(
      { key: 'about' },
      {
        $set: {
          key: 'about',
          content,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: '更新失败' });
  }
} 