import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { initializeAdmin } from '../lib/auth';
import { LanguageProvider } from '../contexts/LanguageContext';

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
    <LanguageProvider>
      <Component {...pageProps} />
      <Toaster />
    </LanguageProvider>
  );
}

export default MyApp;

export function getServerSideProps({ req, res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  );
  
  return {
    props: {},
  };
} 