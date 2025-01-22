import { isAdmin } from '../../../lib/auth';

export default function handler(req, res) {
  res.status(200).json({ isAdmin: isAdmin(req) });
} 