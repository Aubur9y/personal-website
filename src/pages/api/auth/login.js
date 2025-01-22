import { validateUser, generateToken } from '../../../lib/auth';
import cookie from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { emailOrUsername, password } = req.body;
    console.log('Login attempt:', { emailOrUsername });

    const user = await validateUser(emailOrUsername, password);
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = generateToken(user);
    console.log('Generated token for user:', user.email || user.username);

    // 设置 cookie
    res.setHeader('Set-Cookie', cookie.serialize('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    }));

    // 返回用户信息（不包含敏感数据）
    const safeUser = {
      id: user._id,
      username: user.username || user.email,
      email: user.email,
      role: user.role,
      name: user.name || user.username || user.email,
      avatar: user.avatar || null
    };

    console.log('Login successful, returning user:', safeUser);
    return res.status(200).json({
      success: true,
      message: '登录成功',
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || '登录失败' 
    });
  }
} 