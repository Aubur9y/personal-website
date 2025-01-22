import { serialize } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // 清除 cookie
  res.setHeader(
    'Set-Cookie',
    serialize('auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: -1
    })
  );

  res.status(200).json({ success: true });
} 