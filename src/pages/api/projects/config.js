import { getProjectConfig, updateProjectConfig } from '../../../models/ProjectConfig';
import { isAdmin } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const config = await getProjectConfig();
      return res.status(200).json(config);
    } catch (error) {
      console.error('Error getting project config:', error);
      return res.status(500).json({ message: '获取项目配置失败' });
    }
  }

  if (req.method === 'PUT') {
    if (!isAdmin(req)) {
      return res.status(401).json({ message: '未授权' });
    }

    try {
      const { selectedProjects, order } = req.body;
      const config = await updateProjectConfig(selectedProjects, order);
      return res.status(200).json(config);
    } catch (error) {
      console.error('Error updating project config:', error);
      return res.status(500).json({ message: '更新项目配置失败' });
    }
  }

  return res.status(405).json({ message: '方法不允许' });
} 