import { connectToDatabase } from '../../../lib/db';

export default async function handler(req, res) {
  const { slug } = req.query;
  const { db } = await connectToDatabase();

  if (req.method === 'GET') {
    const { sort = 'newest', page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
      const query = { postSlug: slug, parentId: null };
      const sortOptions = {
        newest: { date: -1 },
        oldest: { date: 1 },
        mostLiked: { likes: -1, date: -1 }
      }[sort];

      const comments = await db
        .collection('comments')
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      // 获取每个评论的回复
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const replies = await db
            .collection('comments')
            .find({ parentId: comment._id.toString() })
            .sort({ date: 1 })
            .toArray();
          return { ...comment, replies };
        })
      );

      res.status(200).json(commentsWithReplies);
    } catch (error) {
      res.status(500).json({ error: '获取评论失败' });
    }
  } else if (req.method === 'POST') {
    try {
      const comment = {
        ...req.body,
        postSlug: slug,
        date: new Date().toISOString(),
        likes: 0
      };

      const result = await db.collection('comments').insertOne(comment);
      res.status(201).json({ ...comment, _id: result.insertedId });
    } catch (error) {
      res.status(500).json({ error: '添加评论失败' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 