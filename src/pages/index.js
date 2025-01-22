import { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { FaUser, FaCode, FaBook, FaArrowRight, FaEnvelope, FaGithub, FaLinkedin, FaWeixin } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

// 定义动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  }
};

export default function Home() {
  const { translations } = useLanguage();
  
  const cards = [
    {
      id: 'about',
      title: '关于我',
      description: '了解我的技术栈、工作经历和教育背景',
      icon: FaUser,
      href: '/about',
      color: 'from-indigo-500 via-purple-500 to-pink-500',
    },
    {
      id: 'projects',
      title: '项目展示',
      description: '探索我的开源项目和技术实践',
      icon: FaCode,
      href: '/projects',
      color: 'from-blue-500 via-teal-500 to-emerald-500',
    },
    {
      id: 'blog',
      title: '技术博客',
      description: '分享我的技术见解和学习心得',
      icon: FaBook,
      href: '/blog',
      color: 'from-orange-500 via-red-500 to-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <Head>
        <title>{translations.common.siteTitle}</title>
        <meta name="description" content={translations.home.hero.description} />
      </Head>

      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-6xl font-bold mb-6"
            variants={itemVariants}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              {translations.home.hero.title}
            </span>
          </motion.h1>
          <motion.h2 
            className="text-2xl text-gray-300 mb-4"
            variants={itemVariants}
          >
            {translations.home.hero.subtitle}
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-400 mb-8"
            variants={itemVariants}
          >
            {translations.home.hero.description}
          </motion.p>
        </motion.div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="transform-gpu"
            >
              <Link href={card.href} className="block">
                <div className={`
                  relative h-80 rounded-2xl p-8
                  bg-gradient-to-br ${card.color}
                  shadow-[0_0_15px_rgba(0,0,0,0.2)]
                  backdrop-blur-sm bg-opacity-90
                  border border-white/10
                  group
                  hover:shadow-xl
                  transition-shadow
                `}>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" />
                  <div className="relative z-10 h-full flex flex-col text-white">
                    <card.icon className="w-12 h-12 mb-6 transform group-hover:scale-110 transition-transform duration-300" />
                    <h2 className="text-2xl font-bold mb-4">{translations.home.cards[card.id].title}</h2>
                    <p className="text-lg text-white/80">{translations.home.cards[card.id].description}</p>
                    <div className="mt-auto">
                      <span className="inline-flex items-center text-sm font-semibold group-hover:translate-x-1 transition-transform duration-300">
                        {translations.home.cards[card.id].action}
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Slogan Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {translations.home.cards.slogan}
          </h2>
        </motion.div>

        <div
          className="text-center mt-20"
        >
          <div className="inline-flex items-center gap-6 px-8 py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <span className="text-gray-400">{translations.home.contact.title}</span>
            <div className="flex items-center gap-4">
              <div className="group relative">
                <button className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors duration-300">
                  <FaWeixin className="w-5 h-5" />
                  <span className="text-sm">{translations.home.contact.wechat}</span>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 hidden group-hover:block z-50 w-max">
                  <div className="bg-white p-4 rounded-lg shadow-2xl">
                    <img 
                      src="/images/wechat-qr.jpg"
                      alt="WeChat QR Code" 
                      width={256}
                      height={256}
                      className="block"
                      style={{ 
                        imageRendering: 'pixelated',
                        backgroundColor: 'white'
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-lg"></div>
                </div>
              </div>
              <span className="text-gray-600">|</span>
              <Link
                href="mailto:qixiang.aubury@gmail.com"
                className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors duration-300"
              >
                <FaEnvelope className="w-5 h-5" />
                <span className="text-sm">{translations.home.contact.email}</span>
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                href="https://www.linkedin.com/in/qixiang1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors duration-300"
              >
                <FaLinkedin className="w-5 h-5" />
                <span className="text-sm">{translations.home.contact.linkedin}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {}
  };
} 