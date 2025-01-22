import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { translations } = useLanguage();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // 如果已经登录，重定向到目标页面
  useEffect(() => {
    if (isAuthenticated && !redirectAttempted) {
      setRedirectAttempted(true);
      const redirectTo = router.query.redirect || '/admin/posts';
      router.replace(redirectTo, undefined, { shallow: true });
    }
  }, [isAuthenticated, router, redirectAttempted]);

  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setRedirectAttempted(false);

    try {
      const result = await login(formData.emailOrUsername, formData.password);
      if (result.success) {
        toast.success('登录成功');
        // 等待一小段时间确保状态更新
        await new Promise(resolve => setTimeout(resolve, 100));
        const redirectTo = router.query.redirect || '/admin/posts';
        window.location.href = redirectTo;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || '登录失败');
      setIsLoading(false);
    }
  };

  // 如果已经登录，显示加载状态
  if (isAuthenticated && redirectAttempted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-xl font-semibold text-gray-700">正在跳转...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>登录 | 相棋的技术空间</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          登录
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700">
                用户名
              </label>
              <input
                id="emailOrUsername"
                type="text"
                required
                value={formData.emailOrUsername}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  emailOrUsername: e.target.value
                }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 