import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { verifyToken } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Parse form error:', err);
        return res.status(500).json({ error: '文件上传失败' });
      }

      try {
        const file = files.file[0];  // 获取上传的文件
        const language = fields.language[0];  // 获取语言参数

        // 验证文件类型
        if (file.mimetype !== 'application/pdf') {
          return res.status(400).json({ error: '只支持 PDF 文件' });
        }

        // 创建上传目录
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
        await fs.mkdir(uploadDir, { recursive: true });

        // 生成文件名
        const fileName = `resume_${language}.pdf`;
        const filePath = path.join(uploadDir, fileName);

        // 保存文件
        await fs.copyFile(file.filepath, filePath);

        // 更新数据库中的简历路径
        const { db } = await connectToDatabase();
        await db.collection('settings').updateOne(
          { key: 'resumes' },
          {
            $set: {
              [language]: `/uploads/resumes/${fileName}`,
              updatedAt: new Date().toISOString()
            }
          },
          { upsert: true }
        );

        return res.status(200).json({
          success: true,
          message: '简历上传成功',
          path: `/uploads/resumes/${fileName}`
        });
      } catch (error) {
        console.error('File processing error:', error);
        return res.status(500).json({ error: '文件处理失败' });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: '上传失败' });
  }
} 