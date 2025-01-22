import { createUser, generateToken } from '../../../lib/auth';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { email, password, name } = req.body;
    
    const result = await createUser({ email, password, name });
    const token = generateToken(result);

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