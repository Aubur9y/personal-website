import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function LanguageSwitch() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState('zh');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'zh';
    setCurrentLang(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('language', newLang);
    setCurrentLang(newLang);
    router.reload(); // 刷新页面以应用新语言
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
    >
      {currentLang === 'zh' ? 'EN' : '中文'}
    </button>
  );
} 