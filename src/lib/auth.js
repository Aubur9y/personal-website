import jwt from 'jsonwebtoken';
import Cookies from 'js-cookie';
import { connectToDatabase } from './db';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

export async function createUser({ email, password, name }) {
  const { db } = await connectToDatabase();
  
  // 检查是否是管理员用户名
  if (email === process.env.DEFAULT_ADMIN_EMAIL) {
    throw new Error('此用户名已被保留');
  }
  
  // 检查邮箱和用户名是否已存在
  const existingUser = await db.collection('users').findOne({
    $or: [
      { email },
      { name }
    ]
  });

  if (existingUser) {
    throw new Error('邮箱或用户名已被注册');
  }

  // 密码加密
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // 创建用户
  const result = await db.collection('users').insertOne({
    email,
    password: hashedPassword,
    name,
    role: ROLES.USER,
    createdAt: new Date(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`, // 默认头像
    bio: ''
  });

  return result;
}

export async function validateUser(emailOrUsername, password) {
  const { db } = await connectToDatabase();
  
  console.log('Validating user:', { emailOrUsername }); // 添加日志
  console.log('Admin email:', process.env.DEFAULT_ADMIN_EMAIL); // 添加日志
  
  // 先尝试使用管理员用户名登录
  if (emailOrUsername === process.env.DEFAULT_ADMIN_EMAIL && 
      password === process.env.DEFAULT_ADMIN_PASSWORD) {
    console.log('Admin login successful'); // 添加日志
    return {
      _id: 'admin',
      email: process.env.DEFAULT_ADMIN_EMAIL,
      name: 'Admin',
      role: ROLES.ADMIN,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`,
      bio: '网站管理员'
    };
  }

  // 如果不是管理员，则检查普通用户
  const user = await db.collection('users').findOne({
    $or: [
      { email: emailOrUsername },
      { name: emailOrUsername }
    ]
  });

  console.log('Found user:', user ? 'yes' : 'no'); // 添加日志

  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  console.log('Password valid:', isValid); // 添加日志

  if (!isValid) return null;

  // 不返回密码
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export function generateToken(user) {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(req) {
  try {
    if (!req?.headers?.cookie) {
      return null;
    }

    const cookies = cookie.parse(req.headers.cookie);
    const token = cookies.auth;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function getAuthUser(req) {
  try {
    if (!req?.headers?.cookie) {
      return null;
    }
    const user = verifyToken(req);
    return user;
  } catch (error) {
    console.error('Get auth user error:', error);
    return null;
  }
}

export function isAdmin(req) {
  const user = getAuthUser(req);
  return user?.role === ROLES.ADMIN;
}

export function isAuthenticated(req) {
  return getAuthUser(req) !== null;
}

// 修改 cookie 设置函数
export function setAuthCookie(token) {
  Cookies.set('auth', token, { 
    expires: 7, // 改为7天以匹配 token 过期时间
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/'
  });
}

export function removeAuthCookie() {
  Cookies.remove('auth', { path: '/' });
}

// 添加初始化函数
export async function initializeAdmin() {
  // 只在服务器端运行
  if (typeof window !== 'undefined') {
    return;
  }

  try {
    const { db } = await connectToDatabase();
    if (!db) {
      console.log('数据库连接失败，跳过管理员初始化');
      return;
    }

    const adminExists = await db.collection('users').findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 10);
      await db.collection('users').insertOne({
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
      });
      console.log('管理员账号已初始化');
    }
  } catch (error) {
    console.error('初始化管理员失败:', error);
  }
} 