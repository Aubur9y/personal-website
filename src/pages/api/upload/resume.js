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
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file?.[0];
    const language = fields.language?.[0] || 'zh';

    if (!file) {
      return res.status(400).json({ error: '没有找到文件' });
    }

    // 根据语言选择文件名
    const fileName = `resume_${language}.pdf`;
    const newPath = path.join(uploadDir, fileName);

    // 如果文件已存在，先删除
    if (fs.existsSync(newPath)) {
      fs.unlinkSync(newPath);
    }

    // 移动文件到目标位置
    fs.renameSync(file.filepath, newPath);

    // 更新数据库中的简历路径
    const { db } = await connectToDatabase();
    await db.collection('settings').updateOne(
      { key: 'resumes' },
      {
        $set: {
          [language]: `/uploads/${fileName}`,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    res.status(200).json({ 
      success: true, 
      path: `/uploads/${fileName}` 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '上传失败' });
  }
} 