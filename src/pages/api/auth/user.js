import { getAuthUser } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const user = getAuthUser(req);
    
    if (!user) {
      return res.status(200).json({
        authenticated: false,
        user: null
      });
    }

    res.status(200).json({
      authenticated: true,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(200).json({
      authenticated: false,
      user: null,
      error: '认证检查失败'
    });
  }
} 