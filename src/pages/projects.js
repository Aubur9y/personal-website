import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaStar, FaCodeBranch, FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { useLanguage } from '../contexts/LanguageContext';

// 动画配置
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Projects() {
  const { lang, translations } = useLanguage();
  const [repos, setRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch('/api/github/repos');
        if (!response.ok) throw new Error('获取项目失败');
        const data = await response.json();
        setRepos(data.repos);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepos();
  }, []);

  // 语言标签的颜色映射
  const languageColors = {
    JavaScript: 'bg-yellow-100 text-yellow-800',
    TypeScript: 'bg-blue-100 text-blue-800',
    Python: 'bg-green-100 text-green-800',
    Java: 'bg-red-100 text-red-800',
    'C++': 'bg-purple-100 text-purple-800',
    Go: 'bg-cyan-100 text-cyan-800',
    Rust: 'bg-orange-100 text-orange-800',
    default: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{translations?.projects?.title || '项目'}</title>
        <meta 
          name="description" 
          content={translations?.projects?.description || '我的开源项目展示'} 
        />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {translations?.projects?.title || '我的项目'}
          </h1>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              {error}
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {repos.map((repo) => (
                <motion.div
                  key={repo.id}
                  variants={item}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {repo.name}
                      </h2>
                      <div className="flex items-center space-x-4">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <FaGithub size={20} />
                        </a>
                        {repo.homepage && (
                          <a
                            href={repo.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <FaExternalLinkAlt size={18} />
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 h-12 line-clamp-2">
                      {repo.description || (lang === 'zh' ? '暂无描述' : 'No description available')}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {repo.language && (
                        <span className={`px-2 py-1 rounded-full text-sm ${languageColors[repo.language] || languageColors.default}`}>
                          {repo.language}
                        </span>
                      )}
                      {repo.topics?.slice(0, 3).map(topic => (
                        <span key={topic} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaStar className="mr-1 text-yellow-400" />
                        <span>{repo.stars}</span>
                      </div>
                      <div className="flex items-center">
                        <FaCodeBranch className="mr-1" />
                        <span>{repo.forks}</span>
                      </div>
                      <div className="text-gray-500">
                        {new Date(repo.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
} 