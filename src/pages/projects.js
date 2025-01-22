import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { FaGithub, FaStar, FaCodeBranch } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

// 添加本地项目数据
const localProjects = [
  {
    id: 1,
    name: "个人博客系统",
    description: "使用 Next.js、Tailwind CSS 和 MongoDB 构建的个人博客系统",
    url: "https://github.com/yourusername/blog",
    homepage: "https://your-blog.com",
    language: "JavaScript",
    stars: 0,
    forks: 0,
    topics: ["next.js", "react", "tailwind", "mongodb"],
    updatedAt: "2024-03-15"
  },
  // ... 可以添加更多项目
];

// 修改 getStaticProps
export async function getStaticProps() {
  try {
    // 如果有 GitHub token 就获取 GitHub 数据
    if (process.env.GITHUB_ACCESS_TOKEN) {
      const headers = {
        Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
        'User-Agent': 'Next.js',
      };

      const username = process.env.GITHUB_USERNAME;
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
        { headers }
      );
      
      // 添加错误检查
      if (!response.ok) {
        throw new Error('GitHub API request failed');
      }
      
      const repos = await response.json();
      
      // 确保 repos 是数组
      if (!Array.isArray(repos)) {
        console.error('GitHub API did not return an array');
        return {
          props: { projects: [] },
          revalidate: 3600,
        };
      }

      const projects = repos
        .filter(repo => !repo.fork && !repo.private)
        .map(repo => ({
          id: repo.id,
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          homepage: repo.homepage,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          topics: repo.topics || [],
          updatedAt: repo.updated_at,
        }));

      return {
        props: { projects },
        revalidate: 3600,
      };
    }
  } catch (error) {
    console.error('Error fetching GitHub projects:', error);
  }

  // 如果获取失败或没有 token，使用本地数据
  return {
    props: {
      projects: localProjects
    },
    revalidate: 3600,
  };
}

export default function Projects({ projects }) {
  const { translations } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  // 获取所有唯一的主题
  const allTopics = [...new Set(projects.flatMap(project => project.topics))];

  // 过滤项目
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTopic = !selectedTopic || project.topics.includes(selectedTopic);
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{translations.projects.title}</title>
        <meta name="description" content="我的开源项目展示" />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">
            {translations.projects.title}
          </h1>
          
          {/* 搜索和筛选 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder={translations.projects.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有主题</option>
              {allTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          {/* 项目列表 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">
                    <Link
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      {project.name}
                    </Link>
                  </h2>
                  
                  {project.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* 项目信息 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {project.language && (
                      <span className="flex items-center gap-1">
                        <span className={`w-3 h-3 rounded-full bg-${project.language.toLowerCase()}`} />
                        {project.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      {project.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCodeBranch className="text-gray-400" />
                      {project.forks}
                    </span>
                  </div>

                  {/* 主题标签 */}
                  {project.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.topics.map(topic => (
                        <span
                          key={topic}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 链接 */}
                  <div className="flex gap-4">
                    <Link
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <FaGithub />
                      {translations.projects.viewSource}
                    </Link>
                    {project.homepage && (
                      <Link
                        href={project.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {translations.projects.visitWebsite}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 空状态 */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {translations.projects.noResults}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 