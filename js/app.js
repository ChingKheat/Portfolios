/**
 * Project Hub Dashboard - Application Logic
 * Handles interactive filtering, search, view modes, modal inspectors, and theme switching.
 */

(function () {
  'use strict';

  // State Management
  const state = {
    projects: [...PROJECTS_DATA],
    filteredProjects: [...PROJECTS_DATA],
    activeCategory: 'All',
    searchQuery: '',
    statusFilter: 'all',
    sortBy: 'featured',
    viewMode: localStorage.getItem('proj_hub_view') || 'grid',
    theme: localStorage.getItem('proj_hub_theme') || 'dark',
    selectedProjectId: null
  };

  // SVG Icons Library for zero-dependency crisp rendering
  const ICONS = {
    grid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    list: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
    star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    external: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
    github: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
    info: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    tag: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`,
    copy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
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
    statTotalStars: document.getElementById('statTotalStars'),
    statTotalTech: document.getElementById('statTotalTech'),
    skillsContainer: document.getElementById('skillsContainer'),
    milestonesContainer: document.getElementById('milestonesContainer')
  };

  // Initializer
  function init() {
    applyTheme(state.theme);
    renderProfileHeader();
    renderKPIStats();
    buildCategoryTabs();
    renderSkillsAnalytics();
    renderMilestones();
    setupEventListeners();
    filterAndRenderProjects();
  }

  // Set Profile Information
  function renderProfileHeader() {
    const profileNameEl = document.getElementById('profileName');
    const profileHandleEl = document.getElementById('profileHandle');
    const profileStatusEl = document.getElementById('profileStatus');

    if (profileNameEl) profileNameEl.textContent = PROFILE_DATA.name;
    if (profileHandleEl) profileHandleEl.textContent = PROFILE_DATA.handle;
    if (profileStatusEl) {
      profileStatusEl.innerHTML = `<span class="pulse-dot"></span> ${PROFILE_DATA.status}`;
    }
  }

  // Render KPI Metrics
  function renderKPIStats() {
    const totalProjects = state.projects.length;
    const featuredProjects = state.projects.filter(p => p.featured).length;
    const totalStars = state.projects.reduce((acc, p) => acc + (p.stars || 0), 0);

    // Compute distinct tech stack set
    const techSet = new Set();
    state.projects.forEach(p => {
      p.techStack.forEach(t => techSet.add(t));
    });

    const sidebarProjectCountEl = document.getElementById('sidebarProjectCount');
    if (sidebarProjectCountEl) sidebarProjectCountEl.textContent = `${totalProjects}`;

    if (DOM.statTotalProjects) DOM.statTotalProjects.textContent = `${totalProjects}`;
    if (DOM.statFeaturedProjects) DOM.statFeaturedProjects.textContent = `${featuredProjects}`;
    if (DOM.statTotalStars) DOM.statTotalStars.textContent = `${totalStars.toLocaleString()}`;
    if (DOM.statTotalTech) DOM.statTotalTech.textContent = `${techSet.size}+`;
  }

  // Build Dynamic Category Filter Tabs
  function buildCategoryTabs() {
    if (!DOM.categoryTabsContainer) return;

    const categories = ['All'];
    state.projects.forEach(p => {
      if (!categories.includes(p.category)) {
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
        result = result.filter(p => p.status.toLowerCase().replace(/\s+/g, '-') === state.statusFilter);
      }
    }

    // Filter by Search Query
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        return (
          p.title.toLowerCase().includes(q) ||
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
          return b.stars - a.stars;
        }
        return a.featured ? -1 : 1;
      }
      if (state.sortBy === 'stars') {
        return (b.stars || 0) - (a.stars || 0);
      }
      if (state.sortBy === 'newest') {
        return parseInt(b.year) - parseInt(a.year);
      }
      if (state.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    state.filteredProjects = result;
    renderProjectsDOM();
  }

  // Render Projects List/Grid
  function renderProjectsDOM() {
    if (!DOM.projectsContainer) return;

    if (DOM.projectCountBadge) {
      DOM.projectCountBadge.textContent = `${state.filteredProjects.length} ${state.filteredProjects.length === 1 ? 'project' : 'projects'}`;
    }

    if (state.filteredProjects.length === 0) {
      DOM.projectsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${ICONS.info}</div>
          <h3 class="empty-title">No matching projects found</h3>
          <p class="empty-desc">Try clearing your search query or switching categories to see other works.</p>
          <button class="action-btn primary" id="resetFiltersBtn">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state.activeCategory = 'All';
          state.searchQuery = '';
          state.statusFilter = 'all';
          if (DOM.searchInput) DOM.searchInput.value = '';
          if (DOM.statusSelect) DOM.statusSelect.value = 'all';
          buildCategoryTabs();
          filterAndRenderProjects();
        });
      }
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
                ${ICONS.info} Quick View
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

    // Attach click listeners to cards and buttons
    DOM.projectsContainer.querySelectorAll('.btn-view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openProjectModal(btn.dataset.id);
      });
    });

    DOM.projectsContainer.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent opening if user clicked a link
        if (e.target.closest('a')) return;
        openProjectModal(card.dataset.id);
      });
    });
  }

  // Open Project Details Modal
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

        ${project.metrics ? `
          <div class="card-metrics-highlight" style="font-size: 0.9rem; padding: 10px 14px;">
            <span>⚡ <strong>Performance Metric:</strong> ${project.metrics}</span>
          </div>
        ` : ''}

        <div>
          <h4 class="modal-section-title">Overview & Architecture</h4>
          <p class="modal-desc-text">${project.fullDescription}</p>
        </div>

        ${project.challenges ? `
          <div>
            <h4 class="modal-section-title">Technical Challenges Solved</h4>
            <p class="modal-desc-text" style="color: var(--accent-secondary); font-style: italic;">
              "${project.challenges}"
            </p>
          </div>
        ` : ''}

        <div>
          <h4 class="modal-section-title">Key Capabilities & Features</h4>
          <ul class="modal-features-list">
            ${keyFeaturesHtml}
          </ul>
        </div>

        <div>
          <h4 class="modal-section-title">Technology Stack</h4>
          <div class="tech-tag-list" style="margin-bottom: 0;">
            ${fullTechTags}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <span style="margin-right: auto; font-size: 0.85rem; color: var(--text-muted);">
          Released: ${project.year} • ⭐ ${project.stars} Stars
        </span>
        ${project.githubUrl ? `
          <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="action-btn secondary">
            ${ICONS.github} View Repository
          </a>
        ` : ''}
        ${project.demoUrl ? `
          <a href="${project.demoUrl}" target="_blank" rel="noopener noreferrer" class="action-btn primary">
            ${ICONS.external} Launch Live App
          </a>
        ` : ''}
      </div>
    `;

    DOM.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Hook up close button
    const closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeProjectModal);
    }
  }

  function closeProjectModal() {
    if (!DOM.modalOverlay) return;
    DOM.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    state.selectedProjectId = null;
  }

  // Open / Close Contact Modal
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

  // Render Tech Stack Usage Analytics
  function renderSkillsAnalytics() {
    if (!DOM.skillsContainer) return;

    // Calculate frequencies of technologies
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
            <span style="color: var(--text-muted);">${count} ${count === 1 ? 'project' : 'projects'}</span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="width: ${percentage}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Project Milestones / Roadmap
  function renderMilestones() {
    if (!DOM.milestonesContainer) return;

    DOM.milestonesContainer.innerHTML = MILESTONES_DATA.map(m => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-date">${m.date}</div>
        <div class="timeline-item-title">${m.title}</div>
        <div class="timeline-item-desc">${m.desc}</div>
      </div>
    `).join('');
  }

  // Toast Notification Trigger
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

  // Theme Toggling
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
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  // Event Listeners
  function setupEventListeners() {
    // Search input
    if (DOM.searchInput) {
      DOM.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        filterAndRenderProjects();
      });
    }

    // Keyboard shortcut '/' to search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== DOM.searchInput) {
        e.preventDefault();
        if (DOM.searchInput) DOM.searchInput.focus();
      }
      if (e.key === 'Escape') {
        closeProjectModal();
        closeContactModal();
      }
    });

    // Status filter
    if (DOM.statusSelect) {
      DOM.statusSelect.addEventListener('change', (e) => {
        state.statusFilter = e.target.value;
        filterAndRenderProjects();
      });
    }

    // Sort filter
    if (DOM.sortSelect) {
      DOM.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        filterAndRenderProjects();
      });
    }

    // View mode buttons
    if (DOM.viewGridBtn && DOM.viewListBtn) {
      DOM.viewGridBtn.addEventListener('click', () => {
        state.viewMode = 'grid';
        localStorage.setItem('proj_hub_view', 'grid');
        DOM.viewGridBtn.classList.add('active');
        DOM.viewListBtn.classList.remove('active');
        renderProjectsDOM();
      });

      DOM.viewListBtn.addEventListener('click', () => {
        state.viewMode = 'list';
        localStorage.setItem('proj_hub_view', 'list');
        DOM.viewListBtn.classList.add('active');
        DOM.viewGridBtn.classList.remove('active');
        renderProjectsDOM();
      });

      // Set initial view button state
      if (state.viewMode === 'list') {
        DOM.viewListBtn.classList.add('active');
        DOM.viewGridBtn.classList.remove('active');
      } else {
        DOM.viewGridBtn.classList.add('active');
        DOM.viewListBtn.classList.remove('active');
      }
    }

    // Theme toggle button
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Mobile sidebar toggle
    if (DOM.mobileMenuToggle && DOM.sidebar) {
      DOM.mobileMenuToggle.addEventListener('click', () => {
        DOM.sidebar.classList.toggle('open');
      });
    }

    if (DOM.sidebarCloseBtn && DOM.sidebar) {
      DOM.sidebarCloseBtn.addEventListener('click', () => {
        DOM.sidebar.classList.remove('open');
      });
    }

    // Close modal on backdrop click
    if (DOM.modalOverlay) {
      DOM.modalOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.modalOverlay) {
          closeProjectModal();
        }
      });
    }

    if (DOM.contactModal) {
      DOM.contactModal.addEventListener('click', (e) => {
        if (e.target === DOM.contactModal) {
          closeContactModal();
        }
      });

      const contactCloseBtn = document.getElementById('contactCloseBtn');
      if (contactCloseBtn) {
        contactCloseBtn.addEventListener('click', closeContactModal);
      }
    }

    // Sidebar nav link active toggle & mobile close
    document.querySelectorAll('.sidebar .nav-item a').forEach(link => {
      link.addEventListener('click', () => {
        document.querySelectorAll('.sidebar .nav-item').forEach(item => item.classList.remove('active'));
        link.closest('.nav-item').classList.add('active');
        if (DOM.sidebar && DOM.sidebar.classList.contains('open')) {
          DOM.sidebar.classList.remove('open');
        }
      });
    });

    // Contact modal opener buttons
    document.querySelectorAll('.btn-open-contact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openContactModal();
      });
    });

    // Copy email button
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(PROFILE_DATA.socials.email).then(() => {
          showToast(`Email copied: ${PROFILE_DATA.socials.email}`);
        }).catch(() => {
          showToast('Failed to copy email');
        });
      });
    }
  }

  // Bootstrap when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
