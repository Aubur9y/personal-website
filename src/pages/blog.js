import { useState, useMemo, useEffect } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import BlogCard from '../components/BlogCard'
import SearchBar from '../components/SearchBar'
import CategoryFilter from '../components/CategoryFilter'
import SortSelector from '../components/SortSelector'
import TagFilter from '../components/TagFilter'
import { blogPosts } from '../data/blogPosts'
import { isAdmin } from '../lib/auth'

export default function Blog() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const [isAdminUser, setIsAdminUser] = useState(false);

  // 获取所有分类
  const categories = useMemo(() => {
    const cats = ['全部', ...new Set(blogPosts.map(post => post.category))];
    return cats;
  }, [blogPosts]);

  // 获取所有标签
  const allTags = useMemo(() => {
    const tags = new Set();
    blogPosts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [blogPosts]);

  // 筛选和搜索文章
  const filteredPosts = useMemo(() => {
    const filtered = blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === '全部' || post.category === selectedCategory;
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => post.tags.includes(tag));
      
      return matchesSearch && matchesCategory && matchesTags;
    });
    
    // 排序
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'readTime':
          return a.readTime - b.readTime;
        case 'newest':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
  }, [blogPosts, searchQuery, selectedCategory, selectedTags, sortBy]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  // 检查管理员状态
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        setIsAdminUser(data.isAdmin);
      } catch (error) {
        console.error('检查管理员状态失败:', error);
      }
    };
    checkAdmin();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>博客 | 我的个人网站</title>
        <meta name="description" content="我的博客文章" />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold">博客文章</h1>
            {isAdminUser && (
              <Link
                href="/admin/posts"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                管理文章
              </Link>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <SearchBar 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
              <SortSelector value={sortBy} onChange={setSortBy} />
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onChange={setSelectedCategory}
              />
              <TagFilter
                tags={allTags}
                selectedTags={selectedTags}
                onChange={setSelectedTags}
              />
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        {currentPosts.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentPosts.map((post) => (
                <BlogCard 
                  key={post.slug} 
                  post={post} 
                  isAdmin={isAdminUser}
                />
              ))}
            </div>

            {/* 分页控件 */}
            <div className="mt-8 flex justify-center">
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              没有找到匹配的文章
            </p>
          </div>
        )}
      </main>
    </div>
  )
} 