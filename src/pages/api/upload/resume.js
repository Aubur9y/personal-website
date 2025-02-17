import { IncomingForm } from 'formidable';
import { connectToDatabase } from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// 生成安全的文件名
function getSafeFilename(originalFilename, language) {
  const timestamp = new Date().getTime();
  const safeFilename = `resume_${language}_${timestamp}.pdf`;
  return safeFilename;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 验证管理员身份
    const user = await verifyToken(req);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: '未授权访问' });
    }

    // 使用系统临时目录
    const tmpDir = os.tmpdir();
    const form = new IncomingForm({
      uploadDir: tmpDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    // 使用 Promise 包装 form.parse
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file[0];
    const language = fields.language[0];

    if (!file) {
      throw new Error('没有找到文件');
    }

    // 验证文件类型
    if (file.mimetype !== 'application/pdf') {
      throw new Error('只支持 PDF 文件');
    }

    // 生成安全的文件名
    const safeFilename = getSafeFilename(file.originalFilename, language);

    try {
      // 读取文件内容
      const fileContent = await fs.readFile(file.filepath);
      
      // 连接数据库
      const { db } = await connectToDatabase();
      if (!db) {
        throw new Error('数据库连接失败');
      }

      // 将文件内容存储到数据库
      await db.collection('settings').updateOne(
        { key: 'resumes' },
        {
          $set: {
            [`content_${language}`]: fileContent.toString('base64'),
            [`filename_${language}`]: safeFilename,
            [`original_filename_${language}`]: file.originalFilename,
            [`mimetype_${language}`]: file.mimetype,
            [`size_${language}`]: file.size,
            updatedAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );

      // 清理临时文件
      await fs.unlink(file.filepath).catch(console.error);

      return res.status(200).json({
        success: true,
        message: '简历上传成功',
        filename: safeFilename
      });
    } catch (error) {
      // 确保清理临时文件
      await fs.unlink(file.filepath).catch(console.error);
      throw error;
    }
  } catch (error) {
    console.error('上传错误:', error);
    return res.status(500).json({ 
      error: error.message || '上传失败',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 