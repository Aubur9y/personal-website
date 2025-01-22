import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { initializeAdmin } from '../lib/auth';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';

// 只在服务器端初始化
if (typeof window === 'undefined') {
  console.log('Environment check:', {
    MONGODB_URI: process.env.MONGODB_URI ? '存在' : '不存在',
    MONGODB_DB: process.env.MONGODB_DB ? '存在' : '不存在',
    NODE_ENV: process.env.NODE_ENV
  });
}

// 只在服务器端初始化管理员
if (typeof window === 'undefined') {
  initializeAdmin().catch(console.error);
}

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Component {...pageProps} />
        <Toaster />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default MyApp; 