import { useState } from 'react';
import Head from 'next/head'
import Navbar from '../components/Navbar'
import { useLanguage } from '../contexts/LanguageContext'
import { motion } from 'framer-motion';

export default function Blog() {
  const { translations, lang } = useLanguage();

  const maintenanceText = {
    zh: {
      title: '🚧 博客正在维护中 🚧',
      description: '博客系统正在进行升级和优化',
      note: '请稍后再来访问，感谢您的理解和支持'
    },
    en: {
      title: '🚧 Blog Under Maintenance 🚧',
      description: 'The blog system is being upgraded and optimized',
      note: 'Please check back later. Thank you for your understanding and support'
    }
  };

  const content = maintenanceText[lang] || maintenanceText.zh;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>{`${translations?.blog?.title || (lang === 'en' ? 'Blog' : '博客')} - ${lang === 'en' ? 'Maintenance' : '维护中'}`}</title>
        <meta name="description" content={content.description} />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
              {content.title}
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            {content.description}
          </p>
          <p className="text-gray-400">
            {content.note}
          </p>
        </motion.div>
      </main>
    </div>
  );
} 