/**
 * Project Showcase Hub - Dashboard Engine
 * Dynamically loads project data from an external JSON file (no hardcoded data).
 * Designed for public visitors, clients, and teams to explore projects with zero user setup.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    dataSource: new URLSearchParams(window.location.search).get('data') || 'data/projects.json',
    hubInfo: {},
    projects: [],
    filteredProjects: [],
    milestones: [],
    activeCategory: 'All',
    searchQuery: '',
    statusFilter: 'all',
    sortBy: 'featured',
    viewMode: localStorage.getItem('hub_view_mode') || 'grid',
    theme: localStorage.getItem('hub_theme') || 'dark',
    selectedProjectId: null,
    isLoading: true
  };

  // SVG Icons Library for zero-dependency crisp rendering
  const ICONS = {
    grid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    list: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
    star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    external: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
    code: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    github: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
    info: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    share: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`,
    reload: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`
  };

  // DOM Elements
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
    modalOverlay: document.getElementById('modalOverlay'),
    modalBox: document.getElementById('modalBox'),
    contactModal: document.getElementById('contactModal'),
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    sidebar: document.getElementById('sidebar'),
    sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
    toastContainer: document.getElementById('toastContainer'),
    // KPI Stat elements
    statTotalProjects: document.getElementById('statTotalProjects'),
    statFeaturedProjects: document.getElementById('statFeaturedProjects'),
    statTotalTech: document.getElementById('statTotalTech'),
    statTotalCodebases: document.getElementById('statTotalCodebases'),
    skillsContainer: document.getElementById('skillsContainer'),
    milestonesContainer: document.getElementById('milestonesContainer'),
    // Hub header text elements
    hubTitle: document.getElementById('hubTitle'),
    hubSubtitle: document.getElementById('hubSubtitle'),
    hubDescription: document.getElementById('hubDescription'),
    hubBadge: document.getElementById('hubBadge'),
    sidebarProjectCount: document.getElementById('sidebarProjectCount')
  };

  // Initializer
  function init() {
    applyTheme(state.theme);
    setupEventListeners();
    loadProjectsData();
  }

  function applyLoadedData(data) {
    state.hubInfo = data.hub || {};
    state.projects = data.projects || [];
    state.milestones = data.milestones || [];

    // Update Hub Title & Details
    renderHubInfo();

    // Render Dashboard Metrics
    renderKPIStats();

    // Build Dynamic Category Filter Tabs based on loaded projects
    buildCategoryTabs();

    // Render Analytics & Milestones
    renderSkillsAnalytics();
    renderMilestones();

    // Filter and render project cards
    filterAndRenderProjects();

    // Check URL parameters for direct project deep-link (e.g. ?project=banana-dashboard)
    const directProjectId = new URLSearchParams(window.location.search).get('project');
    if (directProjectId) {
      const target = state.projects.find(p => p.id === directProjectId);
      if (target) {
        openProjectModal(directProjectId);
      }
    }
  }

  // Load Projects from external data file (works on both file:// and http://)
  async function loadProjectsData() {
    state.isLoading = true;

    // 1. If custom ?data= URL parameter was provided, attempt to fetch it
    const urlParam = new URLSearchParams(window.location.search).get('data');
    if (urlParam) {
      renderSkeletonLoaders();
      try {
        const response = await fetch(urlParam);
        if (response.ok) {
          const data = await response.json();
          applyLoadedData(data);
          state.isLoading = false;
          return;
        }
      } catch (e) {
        console.warn('Failed to fetch custom data parameter:', e);
      }
    }

    // 2. If window.PROJECTS_DATA is loaded via <script src="data/projects-data.js">, use it instantly (works 100% on file:// protocol!)
    if (typeof window !== 'undefined' && window.PROJECTS_DATA && window.PROJECTS_DATA.projects) {
      applyLoadedData(window.PROJECTS_DATA);
      state.isLoading = false;
      return;
    }

    // 3. Otherwise try fetch() for environments running under http:// or https://
    renderSkeletonLoaders();
    try {
      const response = await fetch(state.dataSource, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Failed to load projects: HTTP ${response.status}`);
      }
      const data = await response.json();
      applyLoadedData(data);
    } catch (err) {
      console.error('Data loading error:', err);
      renderErrorState(err.message);
    } finally {
      state.isLoading = false;
    }
  }

  // Render Shimmer Skeletons during loading
  function renderSkeletonLoaders() {
    if (!DOM.projectsContainer) return;
    const isGrid = state.viewMode === 'grid';
    DOM.projectsContainer.className = isGrid ? 'projects-grid' : 'projects-list';

    const cards = Array(6).fill(0).map(() => `
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

    DOM.projectsContainer.innerHTML = cards;
  }

  // Render Error State
  function renderErrorState(message) {
    if (!DOM.projectsContainer) return;
    DOM.projectsContainer.className = 'projects-grid';
    DOM.projectsContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">${ICONS.info}</div>
        <h3 class="empty-title">Unable to load project catalog</h3>
        <p class="empty-desc" style="color: #ef4444; margin-bottom: 16px;">${message}</p>
        <button class="action-btn primary" id="reloadCatalogBtn">
          ${ICONS.reload} Retry Loading
        </button>
      </div>
    `;
    document.getElementById('reloadCatalogBtn')?.addEventListener('click', loadProjectsData);
  }

  // Render Hub Information from JSON
  function renderHubInfo() {
    if (state.hubInfo.title && DOM.hubTitle) {
      DOM.hubTitle.textContent = state.hubInfo.title;
    }
    if (state.hubInfo.subtitle && DOM.hubSubtitle) {
      DOM.hubSubtitle.textContent = state.hubInfo.subtitle;
    }
    if (state.hubInfo.description && DOM.hubDescription) {
      DOM.hubDescription.textContent = state.hubInfo.description;
    }
    if (state.hubInfo.badge && DOM.hubBadge) {
      DOM.hubBadge.textContent = state.hubInfo.badge;
    }

    // Update contact email/links if present in hub configuration
    if (state.hubInfo.contact) {
      const ghLink = document.getElementById('hubGithubLink');
      if (ghLink && state.hubInfo.contact.github) {
        ghLink.href = state.hubInfo.contact.github;
      }
    }
  }

  // Render KPI Metrics dynamically
  function renderKPIStats() {
    const total = state.projects.length;
    const featured = state.projects.filter(p => p.featured || p.status.toLowerCase() === 'production').length;
    
    // Count distinct technologies
    const techSet = new Set();
    state.projects.forEach(p => {
      (p.techStack || []).forEach(t => techSet.add(t));
    });

    const codebases = state.projects.filter(p => !!p.githubUrl).length;

    if (DOM.sidebarProjectCount) DOM.sidebarProjectCount.textContent = `${total}`;
    if (DOM.statTotalProjects) DOM.statTotalProjects.textContent = `${total}`;
    if (DOM.statFeaturedProjects) DOM.statFeaturedProjects.textContent = `${featured}`;
    if (DOM.statTotalTech) DOM.statTotalTech.textContent = `${techSet.size}`;
    if (DOM.statTotalCodebases) DOM.statTotalCodebases.textContent = `${codebases}`;
  }

  // Build Dynamic Category Filter Tabs from loaded project categories
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

  // Filter & Sort Pipeline
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
        result = result.filter(p => (p.status || '').toLowerCase().replace(/\s+/g, '-') === state.statusFilter);
      }
    }

    // Filter by Search Query
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        return (
          (p.title || '').toLowerCase().includes(q) ||
          (p.tagline || '').toLowerCase().includes(q) ||
          (p.summary || '').toLowerCase().includes(q) ||
          (p.fullDescription || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.techStack || []).some(t => t.toLowerCase().includes(q))
        );
      });
    }

    // Sort Projects
    result.sort((a, b) => {
      if (state.sortBy === 'featured') {
        if (a.featured === b.featured) {
          return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
        }
        return a.featured ? -1 : 1;
      }
      if (state.sortBy === 'newest') {
        return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
      }
      if (state.sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (state.sortBy === 'category') {
        return (a.category || '').localeCompare(b.category || '');
      }
      return 0;
    });

    state.filteredProjects = result;
    renderProjectsDOM();
  }

  // Render Projects Cards (Grid or List View)
  function renderProjectsDOM() {
    if (!DOM.projectsContainer) return;

    if (DOM.projectCountBadge) {
      DOM.projectCountBadge.textContent = `${state.filteredProjects.length} ${state.filteredProjects.length === 1 ? 'project' : 'projects'}`;
    }

    if (state.filteredProjects.length === 0) {
      DOM.projectsContainer.className = 'projects-grid';
      DOM.projectsContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">${ICONS.info}</div>
          <h3 class="empty-title">No matching projects found</h3>
          <p class="empty-desc">Try clearing your search query or choosing a different category.</p>
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
      const statusSlug = (project.status || 'Active').toLowerCase().replace(/\s+/g, '-');
      const techTagsHtml = (project.techStack || []).slice(0, 4).map(tech => `
        <span class="tech-tag">${tech}</span>
      `).join('');

      const moreCount = (project.techStack || []).length > 4 ? `<span class="tech-tag">+${project.techStack.length - 4}</span>` : '';

      return `
        <article class="project-card" data-id="${project.id}">
          <div class="card-banner" style="background: ${project.bannerGradient || 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)'};">
            <div class="banner-badge-group">
              <span class="category-chip">${project.category || 'General'}</span>
              ${project.featured ? `<span class="featured-chip">${ICONS.star} Featured</span>` : ''}
            </div>
            <span class="status-chip status-${statusSlug}">
              <span class="pulse-dot" style="background: currentColor;"></span>
              ${project.status || 'Active'}
            </span>
          </div>

          <div class="card-body">
            <div class="card-title">
              <span>${project.title}</span>
              ${project.version ? `<span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">${project.version}</span>` : ''}
            </div>
            <div class="card-tagline">${project.tagline || ''}</div>
            <p class="card-summary">${project.summary || ''}</p>
            
            ${project.metrics ? `
              <div class="card-metrics-highlight">
                <span>⚡</span> ${project.metrics}
              </div>
            ` : ''}

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
                  ${ICONS.github} Code
                </a>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click listeners to cards and quick buttons
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

  // Open Deep-Dive Project Modal
  function openProjectModal(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project || !DOM.modalOverlay) return;

    state.selectedProjectId = projectId;
    const statusSlug = (project.status || 'Active').toLowerCase().replace(/\s+/g, '-');

    const keyFeaturesHtml = (project.keyFeatures || []).map(feat => `
      <li>
        <span class="feature-check-icon">${ICONS.check}</span>
        <span>${feat}</span>
      </li>
    `).join('');

    const fullTechTags = (project.techStack || []).map(tech => `
      <span class="tech-tag" style="padding: 4px 10px; font-size: 0.8rem;">${tech}</span>
    `).join('');

    // Update browser URL without reload so visitors can share the direct link
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('project', project.id);
    window.history.replaceState({}, '', newUrl);

    DOM.modalBox.innerHTML = `
      <div class="modal-banner" style="background: ${project.bannerGradient || 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)'};">
        <button class="modal-close-btn" id="modalCloseBtn" aria-label="Close modal">✕</button>
        <div class="modal-banner-content">
          <div class="banner-badge-group">
            <span class="category-chip">${project.category || 'General'}</span>
            <span class="status-chip status-${statusSlug}">
              <span class="pulse-dot" style="background: currentColor;"></span>
              ${project.status || 'Active'}
            </span>
          </div>
        </div>
      </div>

      <div class="modal-body">
        <div class="modal-heading-group">
          <h2 id="modalProjectTitle">${project.title}</h2>
          <p>${project.tagline || ''}</p>
        </div>

        ${project.metrics ? `
          <div class="card-metrics-highlight" style="font-size: 0.9rem; padding: 10px 14px;">
            <span>⚡ <strong>Highlight:</strong> ${project.metrics}</span>
          </div>
        ` : ''}

        <div>
          <h4 class="modal-section-title">Overview & Architecture</h4>
          <p class="modal-desc-text">${project.fullDescription || project.summary || ''}</p>
        </div>

        ${project.keyFeatures && project.keyFeatures.length > 0 ? `
          <div>
            <h4 class="modal-section-title">Key Capabilities & Features</h4>
            <ul class="modal-features-list">
              ${keyFeaturesHtml}
            </ul>
          </div>
        ` : ''}

        <div>
          <h4 class="modal-section-title">Technologies & Architecture Stack</h4>
          <div class="tech-tag-list" style="margin-bottom: 0;">
            ${fullTechTags}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <span style="margin-right: auto; font-size: 0.85rem; color: var(--text-muted);">
          ${project.version ? `Version: ${project.version}` : ''} ${project.lastUpdated ? `• Updated: ${project.lastUpdated}` : ''}
        </span>

        <button class="action-btn secondary" id="modalShareBtn" title="Copy link to this project">
          ${ICONS.share} Share
        </button>

        ${project.githubUrl ? `
          <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="action-btn secondary">
            ${ICONS.github} Source Code
          </a>
        ` : ''}

        ${project.demoUrl ? `
          <a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="action-btn primary">
            ${ICONS.external} Launch Live Demo
          </a>
        ` : ''}
      </div>
    `;

    DOM.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Hook up modal buttons
    document.getElementById('modalCloseBtn')?.addEventListener('click', closeProjectModal);

    document.getElementById('modalShareBtn')?.addEventListener('click', () => {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Link to project copied to clipboard!');
      }).catch(() => {
        showToast('Unable to copy link');
      });
    });
  }

  function closeProjectModal() {
    if (!DOM.modalOverlay) return;
    DOM.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    state.selectedProjectId = null;

    // Remove project parameter from URL without page reload
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('project');
    window.history.replaceState({}, '', newUrl);
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

  // Render Technology Distribution Breakdown
  function renderSkillsAnalytics() {
    if (!DOM.skillsContainer) return;

    const counts = {};
    state.projects.forEach(p => {
      (p.techStack || []).forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });

    const sortedSkills = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const maxCount = sortedSkills[0] ? sortedSkills[0][1] : 1;

    DOM.skillsContainer.innerHTML = sortedSkills.map(([skill, count]) => {
      const percentage = Math.round((count / maxCount) * 100);
      return `
        <div class="skill-row">
          <div class="skill-info">
            <span>${skill}</span>
            <span style="color: var(--text-muted);">${count} ${count === 1 ? 'project' : 'projects'}</span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="width: ${percentage}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Milestones Roadmap
  function renderMilestones() {
    if (!DOM.milestonesContainer) return;

    if (state.milestones.length === 0) {
      DOM.milestonesContainer.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem;">No recent milestone events recorded.</div>`;
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
    }, 2800);
  }

  // Theme Management
  function applyTheme(theme) {
    state.theme = theme;
    DOM.html.setAttribute('data-theme', theme);
    localStorage.setItem('hub_theme', theme);
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
      DOM.themeToggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
    }
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // Setup Event Listeners
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
      localStorage.setItem('hub_view_mode', 'grid');
      DOM.viewGridBtn.classList.add('active');
      DOM.viewListBtn.classList.remove('active');
      renderProjectsDOM();
    });

    DOM.viewListBtn?.addEventListener('click', () => {
      state.viewMode = 'list';
      localStorage.setItem('hub_view_mode', 'list');
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

    // Mobile sidebar
    DOM.mobileMenuToggle?.addEventListener('click', () => {
      DOM.sidebar?.classList.toggle('open');
    });

    DOM.sidebarCloseBtn?.addEventListener('click', () => {
      DOM.sidebar?.classList.remove('open');
    });

    // Sidebar navigation clicks
    document.querySelectorAll('.sidebar .nav-item a').forEach(link => {
      link.addEventListener('click', () => {
        document.querySelectorAll('.sidebar .nav-item').forEach(item => item.classList.remove('active'));
        link.closest('.nav-item').classList.add('active');
        DOM.sidebar?.classList.remove('open');
      });
    });

    // Modal overlay backdrop clicks
    DOM.modalOverlay?.addEventListener('click', (e) => {
      if (e.target === DOM.modalOverlay) closeProjectModal();
    });

    DOM.contactModal?.addEventListener('click', (e) => {
      if (e.target === DOM.contactModal) closeContactModal();
    });

    document.getElementById('contactCloseBtn')?.addEventListener('click', closeContactModal);

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
      const email = state.hubInfo.contact?.email || 'chingkheat@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Email copied: ${email}`);
      }).catch(() => {
        showToast('Failed to copy email');
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
