import { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en';
import zh from '../locales/zh';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('zh');
  const [translations, setTranslations] = useState(zh);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'zh';
    setLang(savedLang);
    setTranslations(savedLang === 'zh' ? zh : en);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
} 