import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { FaGithub, FaStar, FaCodeBranch } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

// 添加本地项目数据作为后备
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
  }
];

export default function Projects({ initialProjects = [] }) {
  const { translations, isLoading: isLangLoading } = useLanguage();
  const [projects, setProjects] = useState(initialProjects);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        // 如果没有初始项目数据，则使用本地数据
        if (initialProjects.length === 0) {
          setProjects(localProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(error.message);
        // 发生错误时使用本地数据
        setProjects(localProjects);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [initialProjects]);

  // 如果语言还在加载中，显示加载状态
  if (isLangLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{translations?.projects?.title || '项目'} | {translations?.common?.siteTitle || '个人网站'}</title>
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          {translations?.projects?.title || '我的项目'}
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
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
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {project.language && (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-gray-400"></span>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

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

      if (!response.ok) {
        throw new Error('GitHub API request failed');
      }

      const repos = await response.json();
      
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
        props: { initialProjects: projects },
        revalidate: 3600,
      };
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error);
  }

  // 如果获取失败或没有 token，返回空数组
  return {
    props: { initialProjects: [] },
    revalidate: 3600,
  };
} 