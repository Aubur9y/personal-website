import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  const toggleLanguage = () => {
    const newLang = lang === 'zh' ? 'en' : 'zh';
    setLang(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
    >
      {lang === 'zh' ? 'EN' : '中文'}
    </button>
  );
} 