/**
 * Project Hub Dashboard - Application Logic
 * Dynamically loads repositories and user profile live from GitHub API.
 * Zero hardcoded projects.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    username: localStorage.getItem('gh_username') || (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.defaultGithubUsername : 'ChingKheat'),
    profile: null,
    projects: [],
    filteredProjects: [],
    milestones: [],
    activeCategory: 'All',
    searchQuery: '',
    statusFilter: 'all',
    sortBy: 'featured',
    viewMode: localStorage.getItem('proj_hub_view') || 'grid',
    theme: localStorage.getItem('proj_hub_theme') || 'dark',
    isLoading: false,
    selectedProjectId: null
  };

  // Zero-dependency SVG Icons Library
  const ICONS = {
    grid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    list: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
    star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    fork: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="6" r="3"></circle><path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"></path><path d="M12 12v3"></path></svg>`,
    external: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
    github: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
    info: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    sync: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`,
    user: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
  };

  // DOM Elements cache
  const DOM = {
    html: document.documentElement,
    projectsContainer: document.getElementById('projectsContainer'),
    projectCountBadge: document.getElementById('projectCountBadge'),
    categoryTabsContainer: document.getElementById('categoryTabsContainer'),
    searchInput: document.getElementById('searchInput'),
    statusSelect: document.getElementById('statusSelect'),
    sortSelect: document.getElementById('sortSelect'),
    viewGridBtn: document.getElementById('viewGridBtn'),
    viewListBtn: document.getElementById('viewListBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    syncDataBtn: document.getElementById('syncDataBtn'),
    switchUserBtn: document.getElementById('switchUserBtn'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalBox: document.getElementById('modalBox'),
    contactModal: document.getElementById('contactModal'),
    userModal: document.getElementById('userModal'),
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    sidebar: document.getElementById('sidebar'),
    sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
    toastContainer: document.getElementById('toastContainer'),
    // KPI Stat elements
    statTotalProjects: document.getElementById('statTotalProjects'),
    statFeaturedProjects: document.getElementById('statFeaturedProjects'),
    statTotalStars: document.getElementById('statTotalStars'),
    statTotalTech: document.getElementById('statTotalTech'),
    skillsContainer: document.getElementById('skillsContainer'),
    milestonesContainer: document.getElementById('milestonesContainer'),
    // Profile elements
    profileAvatar: document.getElementById('profileAvatar'),
    profileName: document.getElementById('profileName'),
    profileHandle: document.getElementById('profileHandle'),
    profileStatus: document.getElementById('profileStatus'),
    heroUserTag: document.getElementById('heroUserTag'),
    heroDescription: document.getElementById('heroDescription'),
    sidebarProjectCount: document.getElementById('sidebarProjectCount')
  };

  // Initialize App
  function init() {
    applyTheme(state.theme);
    setupEventListeners();
    loadLiveGitHubData(false);
  }

  // Load Live Data from GitHub API
  async function loadLiveGitHubData(forceRefresh = false) {
    state.isLoading = true;
    renderSkeletonLoaders();

    if (DOM.syncDataBtn) {
      DOM.syncDataBtn.classList.add('spinning');
    }

    try {
      const result = await GitHubService.fetchGitHubData(state.username, forceRefresh);
      
      state.profile = result.profile;
      state.projects = result.projects || [];
      state.milestones = result.milestones || [];
      state.activeCategory = 'All';

      // Update UI components with real data
      renderProfileUI();
      renderKPIStats();
      buildCategoryTabs();
      renderSkillsAnalytics();
      renderMilestones();
      filterAndRenderProjects();

      const sourceLabel = result.isCached ? 'Cached' : (result.isFallback ? 'Local Fallback' : 'Live GitHub API');
      showToast(`Loaded ${state.projects.length} repos for @${state.username} (${sourceLabel})`);

    } catch (err) {
      console.error('Failed to load GitHub data:', err);
      renderErrorState(err.message);
    } finally {
      state.isLoading = false;
      if (DOM.syncDataBtn) {
        DOM.syncDataBtn.classList.remove('spinning');
      }
    }
  }

  // Render Shimmer Skeletons during data fetching
  function renderSkeletonLoaders() {
    if (!DOM.projectsContainer) return;
    const isGrid = state.viewMode === 'grid';
    DOM.projectsContainer.className = isGrid ? 'projects-grid' : 'projects-list';

    const skeletonCards = Array(6).fill(0).map(() => `
      <div class="skeleton-card">
        <div class="skeleton-banner"></div>
        <div class="skeleton-body">
          <div class="skeleton-line h-20 w-75"></div>
          <div class="skeleton-line w-50"></div>
          <div class="skeleton-line w-90"></div>
          <div class="skeleton-line w-75"></div>
          <div style="margin-top: auto; display: flex; gap: 8px;">
            <div class="skeleton-line w-40"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      </div>
    `).join('');

    DOM.projectsContainer.innerHTML = skeletonCards;
  }

  // Render Error State if GitHub Rate Limits or User is Not Found
  function renderErrorState(errorMessage) {
    if (!DOM.projectsContainer) return;
    DOM.projectsContainer.className = 'projects-grid';
    DOM.projectsContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">${ICONS.info}</div>
        <h3 class="empty-title">Could not load repositories</h3>
        <p class="empty-desc" style="color: #ef4444; margin-bottom: 16px;">${errorMessage}</p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="action-btn primary" id="retryFetchBtn">
            ${ICONS.sync} Retry Connection
          </button>
          <button class="action-btn secondary" id="errorSwitchUserBtn">
            ${ICONS.user} Change Username
          </button>
        </div>
      </div>
    `;

    document.getElementById('retryFetchBtn')?.addEventListener('click', () => loadLiveGitHubData(true));
    document.getElementById('errorSwitchUserBtn')?.addEventListener('click', openUserModal);
  }

  // Render Real Profile Details
  function renderProfileUI() {
    if (!state.profile) return;
    const p = state.profile;

    if (DOM.profileName) DOM.profileName.textContent = p.name;
    if (DOM.profileHandle) DOM.profileHandle.textContent = p.handle;

    if (DOM.profileAvatar) {
      if (p.avatar) {
        DOM.profileAvatar.innerHTML = `<img src="${p.avatar}" alt="${p.name}" onerror="this.parentElement.textContent='${p.login.slice(0,2).toUpperCase()}'">`;
      } else {
        DOM.profileAvatar.textContent = p.login.slice(0, 2).toUpperCase();
      }
    }

    if (DOM.profileStatus) {
      DOM.profileStatus.innerHTML = `<span class="pulse-dot"></span> ${p.status}`;
    }

    if (DOM.heroUserTag) {
      DOM.heroUserTag.textContent = `@${p.login} • GitHub Portfolio`;
    }

    if (DOM.heroDescription) {
      DOM.heroDescription.textContent = `${p.bio} Showing all public repositories live via the GitHub REST API.`;
    }

    // Update GitHub link in sidebar footer & contact
    const ghLink = document.getElementById('sidebarGithubLink');
    if (ghLink) ghLink.href = p.githubUrl;

    const modalGhLink = document.getElementById('modalContactGh');
    if (modalGhLink) modalGhLink.href = p.githubUrl;
  }

  // Render Dynamic KPI Metrics from Real Repos
  function renderKPIStats() {
    const totalRepos = state.projects.length;
    const featuredRepos = state.projects.filter(p => p.featured).length;
    const totalStars = state.projects.reduce((acc, p) => acc + (p.stars || 0), 0);

    const langSet = new Set();
    state.projects.forEach(p => {
      p.techStack.forEach(t => langSet.add(t));
    });

    if (DOM.sidebarProjectCount) DOM.sidebarProjectCount.textContent = `${totalRepos}`;
    if (DOM.statTotalProjects) DOM.statTotalProjects.textContent = `${totalRepos}`;
    if (DOM.statFeaturedProjects) DOM.statFeaturedProjects.textContent = `${featuredRepos}`;
    if (DOM.statTotalStars) DOM.statTotalStars.textContent = `${totalStars.toLocaleString()}`;
    if (DOM.statTotalTech) DOM.statTotalTech.textContent = `${langSet.size}`;
  }

  // Build Dynamic Category Filter Tabs based on Actual Present Categories
  function buildCategoryTabs() {
    if (!DOM.categoryTabsContainer) return;

    const categories = ['All'];
    state.projects.forEach(p => {
      if (p.category && !categories.includes(p.category)) {
        categories.push(p.category);
      }
    });

    DOM.categoryTabsContainer.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `tab-btn ${cat === state.activeCategory ? 'active' : ''}`;
      btn.textContent = cat;
      btn.dataset.category = cat;
      btn.addEventListener('click', () => {
        state.activeCategory = cat;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterAndRenderProjects();
      });
      DOM.categoryTabsContainer.appendChild(btn);
    });
  }

  // Filter & Sort Engine
  function filterAndRenderProjects() {
    let result = [...state.projects];

    // Filter by Category
    if (state.activeCategory !== 'All') {
      result = result.filter(p => p.category === state.activeCategory);
    }

    // Filter by Status
    if (state.statusFilter !== 'all') {
      if (state.statusFilter === 'featured') {
        result = result.filter(p => p.featured);
      } else {
        result = result.filter(p => p.status.toLowerCase().replace(/\s+/g, '-') === state.statusFilter);
      }
    }

    // Filter by Search Query
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.rawName.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.techStack.some(t => t.toLowerCase().includes(q))
        );
      });
    }

    // Sort Projects
    result.sort((a, b) => {
      if (state.sortBy === 'featured') {
        if (a.featured === b.featured) {
          return (b.stars || 0) - (a.stars || 0);
        }
        return a.featured ? -1 : 1;
      }
      if (state.sortBy === 'stars') {
        return (b.stars || 0) - (a.stars || 0);
      }
      if (state.sortBy === 'newest') {
        return new Date(b.pushedAt || b.updatedAt) - new Date(a.pushedAt || a.updatedAt);
      }
      if (state.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    state.filteredProjects = result;
    renderProjectsDOM();
  }

  // Render Projects Cards / List
  function renderProjectsDOM() {
    if (!DOM.projectsContainer) return;

    if (DOM.projectCountBadge) {
      DOM.projectCountBadge.textContent = `${state.filteredProjects.length} ${state.filteredProjects.length === 1 ? 'repository' : 'repositories'}`;
    }

    if (state.filteredProjects.length === 0) {
      DOM.projectsContainer.className = 'projects-grid';
      DOM.projectsContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">${ICONS.info}</div>
          <h3 class="empty-title">No matching repositories found</h3>
          <p class="empty-desc">Try clearing your search query or switching categories to view other repositories.</p>
          <button class="action-btn primary" id="resetFiltersBtn">Reset Filters</button>
        </div>
      `;
      document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
        state.activeCategory = 'All';
        state.searchQuery = '';
        state.statusFilter = 'all';
        if (DOM.searchInput) DOM.searchInput.value = '';
        if (DOM.statusSelect) DOM.statusSelect.value = 'all';
        buildCategoryTabs();
        filterAndRenderProjects();
      });
      return;
    }

    const isGrid = state.viewMode === 'grid';
    DOM.projectsContainer.className = isGrid ? 'projects-grid' : 'projects-list';

    DOM.projectsContainer.innerHTML = state.filteredProjects.map(project => {
      const statusSlug = project.status.toLowerCase().replace(/\s+/g, '-');
      const techTagsHtml = project.techStack.slice(0, 4).map(tech => `
        <span class="tech-tag">${tech}</span>
      `).join('');

      const moreCount = project.techStack.length > 4 ? `<span class="tech-tag">+${project.techStack.length - 4}</span>` : '';

      return `
        <article class="project-card" data-id="${project.id}">
          <div class="card-banner" style="background: ${project.bannerGradient};">
            <div class="banner-badge-group">
              <span class="category-chip">${project.category}</span>
              ${project.featured ? `<span class="featured-chip">${ICONS.star} Featured</span>` : ''}
            </div>
            <span class="status-chip status-${statusSlug}">
              <span class="pulse-dot" style="background: currentColor;"></span>
              ${project.status}
            </span>
          </div>

          <div class="card-body">
            <div class="card-title">
              <span>${project.title}</span>
              <span class="card-stars">${ICONS.star} ${project.stars}</span>
            </div>
            <div class="card-tagline">${project.tagline}</div>
            <p class="card-summary">${project.summary}</p>
            
            <div class="card-metrics-highlight">
              <span>⚡</span> ${project.metrics}
            </div>

            <div class="tech-tag-list">
              ${techTagsHtml}
              ${moreCount}
            </div>

            <div class="card-actions">
              <button class="card-btn primary btn-view-details" data-id="${project.id}">
                ${ICONS.info} Details
              </button>
              ${project.demoUrl ? `
                <a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="card-btn secondary">
                  ${ICONS.external} Demo
                </a>
              ` : ''}
              ${project.githubUrl ? `
                <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="card-btn secondary">
                  ${ICONS.github} GitHub
                </a>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click listeners to cards
    DOM.projectsContainer.querySelectorAll('.btn-view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openProjectModal(btn.dataset.id);
      });
    });

    DOM.projectsContainer.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        openProjectModal(card.dataset.id);
      });
    });
  }

  // Open Real Project Details Modal
  function openProjectModal(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project || !DOM.modalOverlay) return;

    state.selectedProjectId = projectId;
    const statusSlug = project.status.toLowerCase().replace(/\s+/g, '-');

    const keyFeaturesHtml = project.keyFeatures.map(feat => `
      <li>
        <span class="feature-check-icon">${ICONS.check}</span>
        <span>${feat}</span>
      </li>
    `).join('');

    const fullTechTags = project.techStack.map(tech => `
      <span class="tech-tag" style="padding: 4px 10px; font-size: 0.8rem;">${tech}</span>
    `).join('');

    DOM.modalBox.innerHTML = `
      <div class="modal-banner" style="background: ${project.bannerGradient};">
        <button class="modal-close-btn" id="modalCloseBtn" aria-label="Close modal">
          ✕
        </button>
        <div class="modal-banner-content">
          <div class="banner-badge-group">
            <span class="category-chip">${project.category}</span>
            <span class="status-chip status-${statusSlug}">
              <span class="pulse-dot" style="background: currentColor;"></span>
              ${project.status}
            </span>
          </div>
        </div>
      </div>

      <div class="modal-body">
        <div class="modal-heading-group">
          <h2 id="modalProjectTitle">${project.title}</h2>
          <p>${project.tagline}</p>
        </div>

        <div class="card-metrics-highlight" style="font-size: 0.9rem; padding: 10px 14px;">
          <span>⚡ <strong>Repository Stats:</strong> ⭐ ${project.stars} Stars • 🍴 ${project.forks} Forks • Updated ${project.relativeUpdate}</span>
        </div>

        <div>
          <h4 class="modal-section-title">Repository Overview</h4>
          <p class="modal-desc-text">${project.fullDescription}</p>
        </div>

        ${project.cloneUrl ? `
          <div>
            <h4 class="modal-section-title">Git Clone Command</h4>
            <div style="background: var(--bg-primary); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-family: monospace; font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between;">
              <code style="color: var(--accent-secondary);">git clone ${project.cloneUrl}</code>
              <button class="action-btn secondary" id="copyCloneBtn" style="padding: 4px 10px; font-size: 0.75rem;">Copy</button>
            </div>
          </div>
        ` : ''}

        <div>
          <h4 class="modal-section-title">Repository Metadata</h4>
          <ul class="modal-features-list">
            ${keyFeaturesHtml}
          </ul>
        </div>

        <div>
          <h4 class="modal-section-title">Detected Technologies & Topics</h4>
          <div class="tech-tag-list" style="margin-bottom: 0;">
            ${fullTechTags}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <span style="margin-right: auto; font-size: 0.85rem; color: var(--text-muted);">
          Created: ${project.year} • License: ${project.license}
        </span>
        ${project.githubUrl ? `
          <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="action-btn secondary">
            ${ICONS.github} Open GitHub Repo
          </a>
        ` : ''}
        ${project.demoUrl ? `
          <a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="action-btn primary">
            ${ICONS.external} Visit Live App
          </a>
        ` : ''}
      </div>
    `;

    DOM.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    document.getElementById('modalCloseBtn')?.addEventListener('click', closeProjectModal);

    const copyCloneBtn = document.getElementById('copyCloneBtn');
    if (copyCloneBtn && project.cloneUrl) {
      copyCloneBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(`git clone ${project.cloneUrl}`).then(() => {
          showToast('Git clone command copied!');
        });
      });
    }
  }

  function closeProjectModal() {
    if (!DOM.modalOverlay) return;
    DOM.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    state.selectedProjectId = null;
  }

  // Contact Modal
  function openContactModal() {
    if (!DOM.contactModal) return;
    DOM.contactModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeContactModal() {
    if (!DOM.contactModal) return;
    DOM.contactModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Switch User Modal
  function openUserModal() {
    if (!DOM.userModal) return;
    const userInput = document.getElementById('newUsernameInput');
    if (userInput) userInput.value = state.username;
    DOM.userModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => userInput?.focus(), 100);
  }

  function closeUserModal() {
    if (!DOM.userModal) return;
    DOM.userModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Render Real Languages Distribution Bars
  function renderSkillsAnalytics() {
    if (!DOM.skillsContainer) return;

    const counts = {};
    state.projects.forEach(p => {
      p.techStack.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });

    const sortedSkills = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const maxCount = sortedSkills[0] ? sortedSkills[0][1] : 1;

    DOM.skillsContainer.innerHTML = sortedSkills.map(([skill, count]) => {
      const percentage = Math.round((count / maxCount) * 100);
      return `
        <div class="skill-row">
          <div class="skill-info">
            <span>${skill}</span>
            <span style="color: var(--text-muted);">${count} ${count === 1 ? 'repository' : 'repositories'}</span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="width: ${percentage}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Real Milestones / Recent Push Activity
  function renderMilestones() {
    if (!DOM.milestonesContainer) return;

    if (state.milestones.length === 0) {
      DOM.milestonesContainer.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem;">No recent repository events recorded.</div>`;
      return;
    }

    DOM.milestonesContainer.innerHTML = state.milestones.map(m => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-date">${m.date}</div>
        <div class="timeline-item-title">${m.title}</div>
        <div class="timeline-item-desc">${m.desc}</div>
      </div>
    `).join('');
  }

  // Toast Notification
  function showToast(message) {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `${ICONS.check} <span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  // Theme Management
  function applyTheme(theme) {
    state.theme = theme;
    DOM.html.setAttribute('data-theme', theme);
    localStorage.setItem('proj_hub_theme', theme);
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
      DOM.themeToggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
    }
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Search input
    DOM.searchInput?.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      filterAndRenderProjects();
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== DOM.searchInput) {
        e.preventDefault();
        DOM.searchInput?.focus();
      }
      if (e.key === 'Escape') {
        closeProjectModal();
        closeContactModal();
        closeUserModal();
      }
    });

    // Status filter
    DOM.statusSelect?.addEventListener('change', (e) => {
      state.statusFilter = e.target.value;
      filterAndRenderProjects();
    });

    // Sort filter
    DOM.sortSelect?.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      filterAndRenderProjects();
    });

    // View toggles
    DOM.viewGridBtn?.addEventListener('click', () => {
      state.viewMode = 'grid';
      localStorage.setItem('proj_hub_view', 'grid');
      DOM.viewGridBtn.classList.add('active');
      DOM.viewListBtn.classList.remove('active');
      renderProjectsDOM();
    });

    DOM.viewListBtn?.addEventListener('click', () => {
      state.viewMode = 'list';
      localStorage.setItem('proj_hub_view', 'list');
      DOM.viewListBtn.classList.add('active');
      DOM.viewGridBtn.classList.remove('active');
      renderProjectsDOM();
    });

    if (state.viewMode === 'list') {
      DOM.viewListBtn?.classList.add('active');
      DOM.viewGridBtn?.classList.remove('active');
    }

    // Theme toggle
    DOM.themeToggleBtn?.addEventListener('click', toggleTheme);

    // Sync GitHub data button (forces cache refresh)
    DOM.syncDataBtn?.addEventListener('click', () => {
      loadLiveGitHubData(true);
    });

    // Switch user buttons
    document.querySelectorAll('.btn-switch-user').forEach(btn => {
      btn.addEventListener('click', openUserModal);
    });

    // Submit switch user form
    const userForm = document.getElementById('userSwitchForm');
    userForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('newUsernameInput');
      const newUsername = input ? input.value.trim() : '';
      if (newUsername && newUsername !== state.username) {
        state.username = newUsername;
        localStorage.setItem('gh_username', newUsername);
        closeUserModal();
        loadLiveGitHubData(true);
      } else {
        closeUserModal();
      }
    });

    // Mobile sidebar
    DOM.mobileMenuToggle?.addEventListener('click', () => {
      DOM.sidebar?.classList.toggle('open');
    });

    DOM.sidebarCloseBtn?.addEventListener('click', () => {
      DOM.sidebar?.classList.remove('open');
    });

    // Sidebar nav clicks
    document.querySelectorAll('.sidebar .nav-item a').forEach(link => {
      link.addEventListener('click', () => {
        document.querySelectorAll('.sidebar .nav-item').forEach(item => item.classList.remove('active'));
        link.closest('.nav-item').classList.add('active');
        DOM.sidebar?.classList.remove('open');
      });
    });

    // Modals backdrop clicks
    DOM.modalOverlay?.addEventListener('click', (e) => {
      if (e.target === DOM.modalOverlay) closeProjectModal();
    });

    DOM.contactModal?.addEventListener('click', (e) => {
      if (e.target === DOM.contactModal) closeContactModal();
    });

    document.getElementById('contactCloseBtn')?.addEventListener('click', closeContactModal);

    DOM.userModal?.addEventListener('click', (e) => {
      if (e.target === DOM.userModal) closeUserModal();
    });

    document.getElementById('userModalCloseBtn')?.addEventListener('click', closeUserModal);

    // Contact modal opener buttons
    document.querySelectorAll('.btn-open-contact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openContactModal();
      });
    });

    // Copy email button
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    copyEmailBtn?.addEventListener('click', () => {
      const email = 'chingkheat@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Email copied: ${email}`);
      }).catch(() => {
        showToast('Failed to copy email');
      });
    });
  }

  // Bootstrap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
