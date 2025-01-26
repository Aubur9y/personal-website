import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 检查认证状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      await checkAuth();
    };
    checkAuthStatus();
  }, [router.pathname]); // 当路由变化时重新检查认证状态

  const checkAuth = async () => {
    try {
      console.log('Checking auth status...');
      const res = await fetch('/api/auth/user', {
        credentials: 'include', // 确保发送 cookies
        headers: {
          'Cache-Control': 'no-cache', // 禁用缓存
          'Pragma': 'no-cache'
        }
      });
      const data = await res.json();
      
      console.log('Auth check response:', data);
      
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

  // 更新用户状态并等待更新完成
  const updateUserState = useCallback((newUser) => {
    return new Promise(resolve => {
      setUser(newUser);
      // 使用 requestAnimationFrame 确保状态已更新
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  }, []);

  // 登录
  const login = async (emailOrUsername, password) => {
    try {
      console.log('Attempting login with:', emailOrUsername);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // 禁用缓存
          'Pragma': 'no-cache'
        },
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
        await updateUserState(data.user);
        // 登录成功后立即检查认证状态
        await checkAuth();
        return { success: true, user: data.user };
      }
      
      throw new Error(data.message || '登录响应格式错误');
    } catch (error) {
      console.error('Login failed:', error);
      await updateUserState(null);
      throw error;
    }
  };

  // 登出
  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache', // 禁用缓存
          'Pragma': 'no-cache'
        }
      });

      if (!res.ok) {
        throw new Error('登出失败');
      }

      await updateUserState(null);
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