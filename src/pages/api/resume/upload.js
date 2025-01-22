import { connectToDatabase } from '../../../lib/db';
import { isAdmin } from '../../../lib/auth';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // 检查管理员权限
  if (!isAdmin(req)) {
    return res.status(401).json({ error: '需要管理员权限' });
  }

  try {
    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Parse error:', err);
          reject(err);
          return;
        }
        resolve([fields, files]);
      });
    });

    console.log('Files received:', files); // 调试日志

    const file = files.resume?.[0]; // formidable v3 返回数组
    if (!file) {
      return res.status(400).json({ error: '没有找到文件' });
    }

    // 重命名文件
    const newPath = path.join(uploadDir, 'resume.pdf');
    try {
      if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath); // 如果文件已存在，先删除
      }
      fs.renameSync(file.filepath, newPath);
    } catch (error) {
      console.error('File operation error:', error);
      return res.status(500).json({ error: '文件处理失败' });
    }

    // 更新数据库中的简历信息
    const { db } = await connectToDatabase();
    await db.collection('settings').updateOne(
      { key: 'resume' },
      {
        $set: {
          key: 'resume',
          path: '/uploads/resume.pdf',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.status(200).json({ success: true, path: '/uploads/resume.pdf' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: `上传失败: ${error.message}` });
  }
} 