import { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en';
import zh from '../locales/zh';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      // 只在客户端执行
      if (typeof window !== 'undefined') {
        // 首先检查 localStorage
        const localLang = localStorage.getItem('language');
        if (localLang) {
          setLang(localLang);
        } else {
          // 如果 localStorage 中没有，再检查 sessionStorage
          const sessionLang = sessionStorage.getItem('language');
          if (sessionLang) {
            setLang(sessionLang);
            // 同步到 localStorage
            localStorage.setItem('language', sessionLang);
          } else {
            // 设置默认语言
            sessionStorage.setItem('language', 'en');
            localStorage.setItem('language', 'en');
          }
        }
      }
    } catch (error) {
      console.error('Error accessing storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const translations = lang === 'zh' ? zh : en;

  const changeLang = (newLang) => {
    try {
      setLang(newLang);
      if (typeof window !== 'undefined') {
        // 同时更新 localStorage 和 sessionStorage
        localStorage.setItem('language', newLang);
        sessionStorage.setItem('language', newLang);
      }
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  // 在服务器端渲染时返回基础布局
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // 在客户端加载时显示加载状态
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <LanguageContext.Provider 
      value={{ 
        lang, 
        setLang: changeLang, 
        translations,
        isLoading 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      setLang: () => {},
      translations: en,
      isLoading: true
    };
  }
  return context;
} 