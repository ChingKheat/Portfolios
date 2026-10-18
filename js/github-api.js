/**
 * GitHub API Service & Dynamic Data Normalizer
 * Dynamically fetches live repositories and profile data without hardcoded values.
 */

const GitHubService = (function () {
  'use strict';

  // Language to category & gradient mapping
  const LANGUAGE_METADATA = {
    'Dart': { category: 'Mobile Apps', gradient: 'linear-gradient(135deg, #02569B 0%, #0175C2 50%, #13B9FD 100%)' },
    'Flutter': { category: 'Mobile Apps', gradient: 'linear-gradient(135deg, #02569B 0%, #0175C2 50%, #13B9FD 100%)' },
    'Kotlin': { category: 'Mobile Apps', gradient: 'linear-gradient(135deg, #7F52FF 0%, #C711E1 100%)' },
    'Swift': { category: 'Mobile Apps', gradient: 'linear-gradient(135deg, #F05138 0%, #EA7600 100%)' },
    'Vue': { category: 'Web & Full-Stack', gradient: 'linear-gradient(135deg, #42b883 0%, #35495e 100%)' },
    'JavaScript': { category: 'Web & Full-Stack', gradient: 'linear-gradient(135deg, #f7df1e 0%, #d49a00 100%)' },
    'TypeScript': { category: 'Web & Full-Stack', gradient: 'linear-gradient(135deg, #3178c6 0%, #235a97 100%)' },
    'HTML': { category: 'Web & Full-Stack', gradient: 'linear-gradient(135deg, #e34f26 0%, #f06529 100%)' },
    'CSS': { category: 'Web & Full-Stack', gradient: 'linear-gradient(135deg, #264de4 0%, #2965f1 100%)' },
    'Python': { category: 'AI & Data Science', gradient: 'linear-gradient(135deg, #3776ab 0%, #ffd438 100%)' },
    'Jupyter Notebook': { category: 'AI & Data Science', gradient: 'linear-gradient(135deg, #f37626 0%, #da5b0b 100%)' },
    'Java': { category: 'Backend & Systems', gradient: 'linear-gradient(135deg, #5382a1 0%, #e76f00 100%)' },
    'C++': { category: 'Backend & Systems', gradient: 'linear-gradient(135deg, #00599c 0%, #004482 100%)' },
    'C#': { category: 'Backend & Systems', gradient: 'linear-gradient(135deg, #239120 0%, #177114 100%)' },
    'Go': { category: 'Backend & Systems', gradient: 'linear-gradient(135deg, #00add8 0%, #007d9c 100%)' },
    'Rust': { category: 'Backend & Systems', gradient: 'linear-gradient(135deg, #dea584 0%, #b7410e 100%)' },
    'PHP': { category: 'Backend & Systems', gradient: 'linear-gradient(135deg, #777bb4 0%, #4f5b93 100%)' },
    'Shell': { category: 'DevOps & Tools', gradient: 'linear-gradient(135deg, #89e051 0%, #43841a 100%)' }
  };

  // Fallback gradient generator based on string hash
  function generateGradient(seed) {
    const gradients = [
      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
      'linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #4f46e5 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 50%, #831843 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #4c1d95 100%)'
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  }

  // Format repository name for display (e.g. "SmashDash_CourtBooking" -> "SmashDash CourtBooking")
  function formatTitle(name) {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();
  }

  // Calculate relative time from ISO date string
  function getRelativeTime(isoString) {
    if (!isoString) return 'recently';
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffSeconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  }

  // Check cache validity
  function getCache(key) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      if (Date.now() < parsed.expiry) {
        return parsed.data;
      }
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Cache read error:', e);
    }
    return null;
  }

  function setCache(key, data, minutes) {
    try {
      const item = {
        data: data,
        expiry: Date.now() + minutes * 60 * 1000
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.warn('Cache write error:', e);
    }
  }

  /**
   * Fetch Live GitHub Profile and Public Repositories
   */
  async function fetchGitHubData(username, forceRefresh = false) {
    const user = username || APP_CONFIG.defaultGithubUsername;
    const cacheKey = `gh_cache_${user.toLowerCase()}`;

    if (!forceRefresh) {
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        return { ...cachedData, isCached: true };
      }
    }

    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };

    if (APP_CONFIG.githubToken) {
      headers['Authorization'] = `token ${APP_CONFIG.githubToken}`;
    }

    try {
      // 1. Fetch User Profile
      const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}`, { headers });
      if (!userRes.ok) {
        if (userRes.status === 404) {
          throw new Error(`GitHub user "${user}" not found.`);
        }
        if (userRes.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please wait a few minutes or add a token in config.js.');
        }
        throw new Error(`GitHub API error: HTTP ${userRes.status}`);
      }
      const rawUser = await userRes.json();

      // 2. Fetch Repositories
      const reposRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=${APP_CONFIG.defaultSort}&type=owner`,
        { headers }
      );
      if (!reposRes.ok) {
        throw new Error(`GitHub Repos API error: HTTP ${reposRes.status}`);
      }
      const rawRepos = await reposRes.json();

      // Normalize User Profile
      const profile = {
        login: rawUser.login,
        name: rawUser.name || rawUser.login,
        handle: `@${rawUser.login}`,
        avatar: rawUser.avatar_url,
        bio: rawUser.bio || `Software engineer and open-source contributor on GitHub.`,
        location: rawUser.location || 'Global / Remote',
        status: rawUser.hireable ? 'Available for hire & collaboration' : 'Active Open Source Developer',
        publicRepos: rawUser.public_repos,
        followers: rawUser.followers,
        following: rawUser.following,
        githubUrl: rawUser.html_url,
        blog: rawUser.blog || null,
        twitter: rawUser.twitter_username ? `https://twitter.com/${rawUser.twitter_username}` : null
      };

      // Normalize Repositories
      const projects = rawRepos.map(repo => {
        const primaryLang = repo.language || 'Code';
        const langMeta = LANGUAGE_METADATA[primaryLang] || {
          category: 'Software & Tools',
          gradient: generateGradient(repo.name)
        };

        // Determine category based on topics and language
        let category = langMeta.category;
        const topics = repo.topics || [];
        if (topics.some(t => ['ai', 'ml', 'machine-learning', 'nlp', 'llm', 'deep-learning'].includes(t.toLowerCase()))) {
          category = 'AI & Machine Learning';
        } else if (topics.some(t => ['mobile', 'android', 'ios', 'flutter', 'react-native'].includes(t.toLowerCase()))) {
          category = 'Mobile Apps';
        } else if (topics.some(t => ['web', 'frontend', 'fullstack', 'backend', 'api'].includes(t.toLowerCase()))) {
          category = 'Web & Full-Stack';
        }

        // Build tech stack list
        const techStack = [];
        if (repo.language) techStack.push(repo.language);
        if (topics.length > 0) {
          topics.forEach(t => {
            if (!techStack.includes(t)) techStack.push(t);
          });
        }
        if (techStack.length === 0) techStack.push('General');

        // Status determination
        let status = 'Active';
        if (repo.archived) {
          status = 'Archived';
        } else if (repo.homepage) {
          status = 'Live';
        } else if (repo.stargazers_count > 0) {
          status = 'Featured';
        }

        // Clean description
        const summary = repo.description || `Open-source ${primaryLang} project hosted on GitHub under @${rawUser.login}.`;

        return {
          id: repo.name,
          rawName: repo.name,
          title: formatTitle(repo.name),
          tagline: repo.description ? repo.description : `${primaryLang} project with ${repo.stargazers_count} stars`,
          category: category,
          status: status,
          featured: repo.stargazers_count > 0 || !!repo.homepage || repo.forks_count > 0,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          watchers: repo.watchers_count,
          openIssues: repo.open_issues_count,
          year: new Date(repo.created_at).getFullYear().toString(),
          updatedAt: repo.updated_at,
          pushedAt: repo.pushed_at,
          relativeUpdate: getRelativeTime(repo.pushed_at || repo.updated_at),
          metrics: `⭐ ${repo.stargazers_count} stars • 🍴 ${repo.forks_count} forks • Updated ${getRelativeTime(repo.pushed_at || repo.updated_at)}`,
          bannerGradient: langMeta.gradient || generateGradient(repo.name),
          icon: 'code',
          summary: summary,
          fullDescription: repo.description 
            ? `${repo.description} This repository is actively maintained on GitHub with continuous updates, version tracking, and full issue management.`
            : `This project is written primarily in ${primaryLang}. Source code, issues, branches, and commit histories are public on GitHub.`,
          challenges: `Maintained repository architecture with ${repo.default_branch} default branch and automated git workflows.`,
          keyFeatures: [
            `Primary technology: ${primaryLang}`,
            `Source repository hosted on GitHub with ${repo.default_branch} branch`,
            repo.license ? `Distributed under the ${repo.license.name || repo.license.spdx_id} license` : `Open-source codebase with public commit history`,
            `Total stargazers: ${repo.stargazers_count} • Forks: ${repo.forks_count}`,
            repo.homepage ? `Live deployment configured at ${repo.homepage}` : `Cloneable via git: ${repo.clone_url}`
          ],
          techStack: techStack,
          demoUrl: repo.homepage || null,
          githubUrl: repo.html_url,
          cloneUrl: repo.clone_url,
          defaultBranch: repo.default_branch,
          license: repo.license ? (repo.license.name || repo.license.spdx_id) : 'Open Source'
        };
      });

      // Compute dynamic milestones based on real repository pushes
      const sortedByPush = [...projects].sort((a, b) => new Date(b.pushedAt) - new Date(a.pushedAt));
      const milestones = sortedByPush.slice(0, 4).map(p => ({
        date: new Date(p.pushedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        title: `Updated ${p.title}`,
        desc: `Pushed latest changes to ${p.rawName} (${p.category}) on branch ${p.defaultBranch}.`
      }));

      const finalData = {
        profile: profile,
        projects: projects,
        milestones: milestones
      };

      // Store in client-side cache
      setCache(cacheKey, finalData, APP_CONFIG.cacheDurationMinutes);

      return { ...finalData, isCached: false };

    } catch (error) {
      console.error('Error fetching live GitHub data:', error);
      
      // Fallback: try loading local fallback JSON if available
      try {
        console.warn('Attempting to load fallback JSON:', APP_CONFIG.fallbackJsonUrl);
        const fbRes = await fetch(APP_CONFIG.fallbackJsonUrl);
        if (fbRes.ok) {
          const fallbackData = await fbRes.json();
          return { ...fallbackData, isFallback: true, errorMessage: error.message };
        }
      } catch (fbErr) {
        console.warn('Fallback JSON failed too:', fbErr);
      }

      throw error;
    }
  }

  return {
    fetchGitHubData,
    clearCache: function (username) {
      const user = username || APP_CONFIG.defaultGithubUsername;
      localStorage.removeItem(`gh_cache_${user.toLowerCase()}`);
    }
  };
})();
