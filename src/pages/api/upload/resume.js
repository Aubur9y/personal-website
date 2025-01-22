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
  // 添加 CORS 头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 检查管理员权限
    const adminStatus = isAdmin(req);
    console.log('Admin status:', adminStatus);
    
    if (!adminStatus) {
      return res.status(401).json({ error: '需要管理员权限' });
    }

    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('创建目录失败:', err);
    }

    const form = new formidable.IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('解析表单错误:', err);
        return res.status(500).json({ error: '文件上传失败' });
      }

      const file = files.file?.[0];
      if (!file) {
        return res.status(400).json({ error: '没有找到文件' });
      }

      try {
        const fileName = `resume.pdf`;
        const newPath = path.join(uploadDir, fileName);

        // 如果文件已存在，先删除
        try {
          await fs.promises.unlink(newPath);
        } catch (err) {
          // 忽略文件不存在的错误
        }

        // 移动文件
        await fs.promises.rename(file.filepath, newPath);

        // 更新数据库
        const { db } = await connectToDatabase();
        await db.collection('settings').updateOne(
          { key: 'resume' },
          {
            $set: {
              path: `/uploads/${fileName}`,
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
        console.error('文件处理错误:', error);
        res.status(500).json({ error: '文件处理失败' });
      }
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ error: '上传失败' });
  }
} 