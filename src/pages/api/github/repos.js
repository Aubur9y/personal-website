import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_ACCESS_TOKEN
    });

    // 获取用户所有仓库
    const { data: repos } = await octokit.repos.listForUser({
      username: process.env.GITHUB_USERNAME,
      sort: 'updated',
      per_page: 100, // 获取最多100个仓库
      type: 'owner' // 只获取用户拥有的仓库
    });

    // 过滤掉 fork 的仓库，并按 stars 数量降序排序
    const filteredRepos = repos
      .filter(repo => !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .map(repo => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        url: repo.html_url,
        homepage: repo.homepage,
        topics: repo.topics || [],
        updatedAt: repo.updated_at,
        createdAt: repo.created_at
      }));

    return res.status(200).json({
      success: true,
      repos: filteredRepos
    });
  } catch (error) {
    console.error('获取 GitHub 仓库失败:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '获取仓库信息失败'
    });
  }
} 