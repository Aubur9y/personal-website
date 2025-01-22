import { validateUser, generateToken } from '../../../lib/auth';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { emailOrUsername, password } = req.body;
    const user = await validateUser(emailOrUsername, password);

    if (!user) {
      return res.status(401).json({ error: '用户名/邮箱或密码错误' });
    }

    const token = generateToken(user);

    res.setHeader(
      'Set-Cookie',
      serialize('auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
} 