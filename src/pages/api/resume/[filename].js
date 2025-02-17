import { connectToDatabase } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { filename } = req.query;
    const language = filename.includes('_zh') ? 'zh' : 'en';
    
    const { db } = await connectToDatabase();
    const resume = await db.collection('settings').findOne({ key: 'resumes' });

    if (!resume || !resume[`content_${language}`]) {
      return res.status(404).json({ error: '简历不存在' });
    }

    // 将 Base64 转换回二进制
    const buffer = Buffer.from(resume[`content_${language}`], 'base64');

    // 获取原始文件名并进行 URL 编码
    const originalFilename = resume[`filename_${language}`] || `resume_${language}.pdf`;
    const encodedFilename = encodeURIComponent(originalFilename);

    // 设置响应头
    res.setHeader('Content-Type', resume[`mimetype_${language}`] || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (error) {
    console.error('获取简历失败:', error);
    res.status(500).json({ error: '获取简历失败' });
  }
} 