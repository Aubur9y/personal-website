import { getAuthUser } from '../../../lib/auth';

export default function handler(req, res) {
  const user = getAuthUser(req);
  res.status(200).json({ user });
} 