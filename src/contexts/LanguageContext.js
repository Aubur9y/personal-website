import { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en';
import zh from '../locales/zh';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('zh');
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      // 只在客户端执行
      if (typeof window !== 'undefined') {
        const savedLang = localStorage.getItem('language') || 'zh';
        setLang(savedLang);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const translations = lang === 'zh' ? zh : en;

  const changeLang = (newLang) => {
    try {
      setLang(newLang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', newLang);
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
      lang: 'zh',
      setLang: () => {},
      translations: zh,
      isLoading: true
    };
  }
  return context;
} 