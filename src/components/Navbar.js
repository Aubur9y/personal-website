import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { isAdmin } from '../lib/auth';

export default function Navbar() {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      setIsAdminUser(data.isAdmin);
    };
    checkAdmin();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('登出失败');
      
      toast.success('已登出');
      setIsAdminUser(false);
      router.push('/');
    } catch (error) {
      toast.error('登出失败');
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              MyBlog
            </Link>
          </div>

          {/* 导航链接 */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              首页
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              博客
            </Link>
            <Link href="/projects" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              项目
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              关于
            </Link>
          </div>

          {/* 用户操作 */}
          <div className="flex items-center">
            {isAdminUser ? (
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                登出
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                登录/注册
              </Link>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden flex items-center">
            <button className="mobile-menu-button p-2 rounded-md hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      <div className="md:hidden hidden">
        <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">首页</Link>
        <Link href="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">博客</Link>
        <Link href="/projects" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">项目</Link>
        <Link href="/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">关于</Link>
      </div>
    </nav>
  );
} 