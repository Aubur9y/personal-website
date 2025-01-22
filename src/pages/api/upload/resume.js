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

    // 使用 /tmp 目录作为临时存储
    const uploadDir = '/tmp';
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('解析表单错误:', err);
          res.status(500).json({ error: '文件上传失败' });
          return resolve();
        }

        const file = files.file?.[0];
        const language = fields.language?.[0] || 'zh';

        if (!file) {
          res.status(400).json({ error: '没有找到文件' });
          return resolve();
        }

        try {
          // 读取文件内容
          const fileContent = await fs.promises.readFile(file.filepath);

          // 更新数据库，存储文件内容为 Base64
          const { db } = await connectToDatabase();
          await db.collection('settings').updateOne(
            { key: 'resume' },
            {
              $set: {
                [`content_${language}`]: fileContent.toString('base64'),
                [`filename_${language}`]: `resume_${language}.pdf`,
                contentType: 'application/pdf',
                updatedAt: new Date()
              }
            },
            { upsert: true }
          );

          // 清理临时文件
          try {
            await fs.promises.unlink(file.filepath);
          } catch (err) {
            console.error('清理临时文件失败:', err);
          }

          res.status(200).json({ 
            success: true,
            message: '简历上传成功'
          });
          resolve();
        } catch (error) {
          console.error('文件处理错误:', error);
          res.status(500).json({ error: '文件处理失败' });
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ error: '上传失败' });
  }
} 