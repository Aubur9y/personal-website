import { connectToDatabase } from '../../../../../lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { slug, commentId } = req.query;
  const { db } = await connectToDatabase();

  try {
    const result = await db.collection('comments').findOneAndUpdate(
      { _id: new ObjectId(commentId), postSlug: slug },
      { $inc: { likes: 1 } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: '评论不存在' });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: '点赞失败' });
  }
} 