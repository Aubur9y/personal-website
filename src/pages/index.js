import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { FaUser, FaCode, FaBook, FaArrowRight, FaEnvelope, FaGithub, FaLinkedin, FaWeixin } from 'react-icons/fa';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState(null);

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
      color: 'from-purple-500 via-blue-500 to-indigo-500',
    },
    {
      id: 'blog',
      title: '技术博客',
      description: '分享我的技术见解和学习心得',
      icon: FaBook,
      href: '/blog',
      color: 'from-blue-500 via-teal-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Head>
        <title>相祺的个人网站</title>
        <meta name="description" content="欢迎来到我的个人网站，这里展示了我的项目、博客和个人简介" />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Welcome to My Space
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            让我们一起探索技术的无限可能
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto perspective-1000">
          {cards.map((card, index) => (
            <Link key={card.id} href={card.href} className="block transform-gpu">
              <motion.div
                initial={{ opacity: 0, rotateX: -30 }}
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ 
                  rotateY: 5,
                  rotateX: 5,
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                className="cursor-pointer"
              >
                <div className={`
                  relative h-80 rounded-2xl p-8
                  bg-gradient-to-br ${card.color}
                  shadow-[0_0_15px_rgba(0,0,0,0.2)]
                  backdrop-blur-sm bg-opacity-90
                  border border-white/10
                  group
                `}>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" />
                  <div className="relative z-10 h-full flex flex-col text-white">
                    <card.icon className="w-12 h-12 mb-6 transform group-hover:scale-110 transition-transform duration-300" />
                    <h2 className="text-2xl font-bold mb-4">{card.title}</h2>
                    <p className="text-lg text-white/80">{card.description}</p>
                    <div className="mt-auto">
                      <span className="inline-flex items-center text-sm font-semibold group-hover:translate-x-1 transition-transform duration-300">
                        探索更多
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-20"
        >
          <div className="inline-flex items-center gap-6 px-8 py-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <span className="text-gray-400">联系我</span>
            <div className="flex items-center gap-4">
              <div className="group relative">
                <button className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors duration-300">
                  <FaWeixin className="w-5 h-5" />
                  <span className="text-sm">WeChat</span>
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
                <span className="text-sm">Email</span>
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                href="https://www.linkedin.com/in/qixiang1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors duration-300"
              >
                <FaLinkedin className="w-5 h-5" />
                <span className="text-sm">LinkedIn</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {}
  };
} 