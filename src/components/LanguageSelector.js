import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Image from 'next/image';

export default function LanguageSelector() {
  const { setLang } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    // 检查是否需要显示语言选择器
    const shouldShowLanguageSelector = () => {
      try {
        // 获取上次选择语言的时间戳
        const lastSelectionTime = localStorage.getItem('languageSelectionTime');
        
        if (!lastSelectionTime) {
          // 从未选择过语言
          return true;
        }
        
        // 计算距离上次选择的时间（以毫秒为单位）
        const timeDiff = Date.now() - parseInt(lastSelectionTime);
        // 一小时的毫秒数 = 60 * 60 * 1000 = 3600000
        const oneHourMs = 60 * 60 * 1000;
        
        // 如果已经过了一小时，则显示选择器
        return timeDiff > oneHourMs;
      } catch (error) {
        console.error('Error checking language selection time:', error);
        return true; // 出错时默认显示选择器
      }
    };
    
    // 延迟检查，确保组件已完全挂载
    const timer = setTimeout(() => {
      if (shouldShowLanguageSelector()) {
        setShowModal(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const selectLanguage = (lang) => {
    setLang(lang);
    try {
      // 存储当前时间戳
      localStorage.setItem('languageSelectionTime', Date.now().toString());
      // 同时保存所选语言
      localStorage.setItem('selectedLanguage', lang);
    } catch (error) {
      console.error('Error saving language selection:', error);
    }
    setShowModal(false);
  };
  
  if (!showModal) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            请选择语言 / Please select language
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            选择您喜欢的语言以获得最佳浏览体验
            <br />
            Choose your preferred language for the best experience
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => selectLanguage('zh')}
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300"
          >
            <div className="w-12 h-8 mb-3 relative flex items-center justify-center">
              <span className="text-2xl">🇨🇳</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium">中文</span>
          </button>
          
          <button
            onClick={() => selectLanguage('en')}
            className="flex flex-col items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300"
          >
            <div className="w-12 h-8 mb-3 relative flex items-center justify-center">
              <span className="text-2xl">🇬🇧</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium">English</span>
          </button>
        </div>
      </div>
    </div>
  );
} 