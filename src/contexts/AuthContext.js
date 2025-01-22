import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/user');
      const data = await res.json();
      
      if (data.authenticated && data.user) {
        console.log('User authenticated:', data.user);
        setUser(data.user);
      } else {
        console.log('User not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = async (emailOrUsername, password) => {
    try {
      console.log('Attempting login with:', emailOrUsername);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
        credentials: 'include',
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (!res.ok) {
        throw new Error(data.message || '登录失败');
      }

      if (data.success && data.user) {
        console.log('Setting user state:', data.user);
        setUser(data.user);
        // 登录成功后立即检查认证状态
        await checkAuth();
        return { success: true, user: data.user };
      }
      
      throw new Error(data.message || '登录响应格式错误');
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      throw error;
    }
  };

  // 登出
  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // 确保包含 cookies
      });

      if (!res.ok) {
        throw new Error('登出失败');
      }

      setUser(null);
      router.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('登出失败');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 