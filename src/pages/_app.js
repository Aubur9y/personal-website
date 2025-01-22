import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';
import { useEffect } from 'react';
import { initializeAdmin } from '../lib/auth';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    console.log('Environment check:', {
      MONGODB_URI: process.env.MONGODB_URI ? '存在' : '不存在',
      MONGODB_DB: process.env.MONGODB_DB ? '存在' : '不存在',
      NODE_ENV: process.env.NODE_ENV
    });
    
    initializeAdmin().catch(console.error);
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export function getServerSideProps({ req, res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  );
  
  return {
    props: {},
  };
} 