/**
 * GitHub Projects Dashboard Application
 * Handles data rendering, filtering, sorting, search, theme toggling, and modals.
 */

(function () {
  'use strict';

  // --- State ---
  const state = {
    projects: [],
    milestones: [],
    hub: {},
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'featured',
    viewMode: 'grid', // 'grid' | 'list'
    theme: localStorage.getItem('hub_theme') || 'dark'
  };

  // --- DOM Elements ---
  const elements = {
    // Header & Info
    hubTitle: document.getElementById('hub-title'),
    hubSubtitle: document.getElementById('hub-subtitle'),
    hubStatus: document.getElementById('hub-status'),
    githubProfileLink: document.getElementById('github-profile-link'),
    
    // Stats
    statTotal: document.getElementById('stat-total-projects'),
    statProduction: document.getElementById('stat-production-projects'),
    statCategories: document.getElementById('stat-categories-count'),
    statFeatured: document.getElementById('stat-featured-count'),

    // Search & Filters
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search'),
    categoryTabs: document.getElementById('category-tabs'),
    sortSelect: document.getElementById('sort-select'),
    resultsCount: document.getElementById('results-count'),
    resetFiltersBtn: document.getElementById('reset-filters'),
    
    // View & Theme
    viewGridBtn: document.getElementById('view-grid-btn'),
    viewListBtn: document.getElementById('view-list-btn'),
    themeToggle: document.getElementById('theme-toggle'),

    // Containers
    projectsContainer: document.getElementById('projects-container'),
    emptyState: document.getElementById('empty-state'),
    emptyResetBtn: document.getElementById('empty-reset-btn'),
    timelineList: document.getElementById('timeline-list'),

    // Modal
    modal: document.getElementById('project-modal'),
    modalBanner: document.getElementById('modal-banner'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalDismissBtn: document.getElementById('modal-dismiss-btn'),
    modalCategory: document.getElementById('modal-category'),
    modalTitle: document.getElementById('modal-title'),
    modalTagline: document.getElementById('modal-tagline'),
    modalStatus: document.getElementById('modal-status'),
    modalVersion: document.getElementById('modal-version'),
    modalUpdated: document.getElementById('modal-updated'),
    modalDescription: document.getElementById('modal-description'),
    modalFeaturesSection: document.getElementById('modal-features-section'),
    modalFeatures: document.getElementById('modal-features'),
    modalTags: document.getElementById('modal-tags'),
    modalGithubLink: document.getElementById('modal-github-link')
  };

  // --- Initialize Application ---
  function init() {
    applyTheme(state.theme);
    loadData();
    setupEventListeners();
  }

  // --- Load Data Source ---
  function loadData() {
    const data = window.PROJECTS_DATA;
    if (!data) {
      console.warn('PROJECTS_DATA not found. Please ensure data/projects-data.js is loaded.');
      return;
    }

    state.hub = data.hub || {};
    const rawProjects = Array.isArray(data.projects) ? data.projects : [];

    // Check URL parameters for curated selection: ?p=id1,id2
    const urlParams = new URLSearchParams(window.location.search);
    const urlCurated = urlParams.get('p');
    let allowedIds = null;

    if (urlCurated) {
      allowedIds = new Set(urlCurated.split(',').map(s => s.trim()).filter(Boolean));
    } else {
      // Check localStorage for curator selection on this browser
      const localCurated = localStorage.getItem('curated_project_ids');
      if (localCurated) {
        try {
          const parsed = JSON.parse(localCurated);
          if (Array.isArray(parsed)) {
            allowedIds = new Set(parsed);
          }
        } catch (e) {
          console.error('Error parsing curated IDs from localStorage', e);
        }
      }
    }

    // Fallback to data.showcase.displayedProjectIds
    if (!allowedIds && data.showcase && Array.isArray(data.showcase.displayedProjectIds)) {
      allowedIds = new Set(data.showcase.displayedProjectIds);
    }

    // Filter projects based on curation rules
    if (allowedIds) {
      state.projects = rawProjects.filter(p => allowedIds.has(p.id));
    } else {
      state.projects = rawProjects.filter(p => p.visible !== false);
    }

    state.milestones = Array.isArray(data.milestones) ? data.milestones : [];

    renderHubDetails();
    renderStats();
    buildCategoryTabs();
    renderTimeline();
    applyFilterAndRender();
  }

  // --- Header & Info Rendering ---
  function renderHubDetails() {
    if (state.hub.title && elements.hubTitle) elements.hubTitle.textContent = state.hub.title;
    if (state.hub.subtitle && elements.hubSubtitle) elements.hubSubtitle.textContent = state.hub.subtitle;
    if (state.hub.status && elements.hubStatus) elements.hubStatus.textContent = state.hub.status;
    if (state.hub.contact?.github && elements.githubProfileLink) {
      elements.githubProfileLink.href = state.hub.contact.github;
    }
  }

  // --- Statistics Overview ---
  function renderStats() {
    const total = state.projects.length;
    const production = state.projects.filter(p => (p.status || '').toLowerCase() === 'production').length;
    const uniqueCategories = new Set(state.projects.map(p => p.category).filter(Boolean)).size;
    const featured = state.projects.filter(p => p.featured === true).length;

    if (elements.statTotal) elements.statTotal.textContent = total;
    if (elements.statProduction) elements.statProduction.textContent = production;
    if (elements.statCategories) elements.statCategories.textContent = uniqueCategories;
    if (elements.statFeatured) elements.statFeatured.textContent = featured;
  }

  // --- Category Tabs Builder ---
  function buildCategoryTabs() {
    if (!elements.categoryTabs) return;

    // Count projects per category
    const categoryCounts = {};
    state.projects.forEach(p => {
      const cat = p.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Reset container with 'All' tab
    elements.categoryTabs.innerHTML = `
      <button class="tab-chip ${state.activeCategory === 'all' ? 'active' : ''}" data-category="all" role="tab" aria-selected="${state.activeCategory === 'all'}">
        All Projects
        <span class="chip-count">${state.projects.length}</span>
      </button>
    `;

    // Append individual categories
    Object.keys(categoryCounts).sort().forEach(category => {
      const button = document.createElement('button');
      button.className = `tab-chip ${state.activeCategory === category ? 'active' : ''}`;
      button.dataset.category = category;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', state.activeCategory === category);
      button.innerHTML = `
        ${escapeHtml(category)}
        <span class="chip-count">${categoryCounts[category]}</span>
      `;
      elements.categoryTabs.appendChild(button);
    });
  }

  // --- Filtering & Sorting ---
  function getFilteredProjects() {
    const q = state.searchQuery.trim().toLowerCase();

    return state.projects.filter(project => {
      // Category filter
      if (state.activeCategory !== 'all' && project.category !== state.activeCategory) {
        return false;
      }

      // Search filter
      if (q) {
        const title = (project.title || '').toLowerCase();
        const tagline = (project.tagline || '').toLowerCase();
        const summary = (project.summary || '').toLowerCase();
        const tech = (project.techStack || []).join(' ').toLowerCase();
        const features = (project.keyFeatures || []).join(' ').toLowerCase();

        return (
          title.includes(q) ||
          tagline.includes(q) ||
          summary.includes(q) ||
          tech.includes(q) ||
          features.includes(q)
        );
      }

      return true;
    }).sort((a, b) => {
      if (state.sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
      }
      if (state.sortBy === 'recent') {
        return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
      }
      if (state.sortBy === 'name') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
  }

  function applyFilterAndRender() {
    const filtered = getFilteredProjects();

    // Update Counter & Reset Button
    const isFiltered = state.activeCategory !== 'all' || state.searchQuery.trim() !== '';
    if (elements.resultsCount) {
      elements.resultsCount.textContent = `Showing ${filtered.length} of ${state.projects.length} projects`;
    }
    if (elements.resetFiltersBtn) {
      elements.resetFiltersBtn.classList.toggle('hidden', !isFiltered);
    }

    // Toggle Empty State vs Projects Grid
    if (filtered.length === 0) {
      if (elements.projectsContainer) elements.projectsContainer.innerHTML = '';
      if (elements.emptyState) elements.emptyState.classList.remove('hidden');
    } else {
      if (elements.emptyState) elements.emptyState.classList.add('hidden');
      renderProjects(filtered);
    }
  }

  // --- Render Projects Grid / List ---
  function renderProjects(projects) {
    if (!elements.projectsContainer) return;

    elements.projectsContainer.innerHTML = '';

    projects.forEach(project => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.dataset.id = project.id;

      // Banner Gradient
      const bannerBg = project.bannerGradient || 'linear-gradient(135deg, #1e293b 0%, #334155 100%)';
      const statusClass = (project.status || '').toLowerCase() === 'production' ? 'status-prod' : 'status-active';

      // Tech Stack Chips
      const tagsHtml = (project.techStack || [])
        .slice(0, 4)
        .map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`)
        .join('');

      card.innerHTML = `
        <div class="card-banner" style="background: ${bannerBg};">
          <span class="card-category-badge">${escapeHtml(project.category || 'General')}</span>
          <span class="card-status-badge ${statusClass}">
            ${project.featured ? '★ ' : ''}${escapeHtml(project.status || 'Active')}
          </span>
        </div>

        <div class="card-content">
          <div class="card-info-col">
            <div class="card-header-row">
              <h3 class="card-title">${escapeHtml(project.title)}</h3>
              ${project.version ? `<span class="card-version">${escapeHtml(project.version)}</span>` : ''}
            </div>

            <p class="card-tagline">${escapeHtml(project.tagline || '')}</p>
            <p class="card-summary">${escapeHtml(project.summary || '')}</p>

            ${project.metrics ? `<div class="card-metrics-pill">${escapeHtml(project.metrics)}</div>` : ''}

            <div class="card-tags">
              ${tagsHtml}
              ${(project.techStack || []).length > 4 ? `<span class="tech-tag">+${project.techStack.length - 4}</span>` : ''}
            </div>
          </div>

          <div class="card-actions">
            ${project.githubUrl ? `
              <a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" title="View Source Code on GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>
            ` : ''}
            <button type="button" class="btn btn-primary open-details-btn" data-id="${escapeHtml(project.id)}">
              <span>Details</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      `;

      elements.projectsContainer.appendChild(card);
    });
  }

  // --- Render Milestones Timeline ---
  function renderTimeline() {
    if (!elements.timelineList) return;

    if (!state.milestones || state.milestones.length === 0) {
      elements.timelineList.innerHTML = '<p class="text-secondary">No recorded milestones.</p>';
      return;
    }

    elements.timelineList.innerHTML = state.milestones.map(item => `
      <div class="timeline-item">
        <span class="timeline-dot"></span>
        <div class="timeline-header">
          <span class="timeline-date">${escapeHtml(item.date)}</span>
          <h4 class="timeline-title">${escapeHtml(item.title)}</h4>
        </div>
        <p class="timeline-desc">${escapeHtml(item.desc)}</p>
      </div>
    `).join('');
  }

  // --- Modal Logic ---
  function openModal(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project || !elements.modal) return;

    elements.modalBanner.style.background = project.bannerGradient || 'var(--brand-gradient)';
    elements.modalCategory.textContent = project.category || 'General';
    elements.modalTitle.textContent = project.title;
    elements.modalTagline.textContent = project.tagline || '';
    elements.modalStatus.textContent = project.status || 'Active';
    elements.modalVersion.textContent = project.version || 'v1.0.0';
    elements.modalUpdated.textContent = project.lastUpdated || 'Recently';
    elements.modalDescription.textContent = project.fullDescription || project.summary || 'No further description available.';

    // Key Features
    if (Array.isArray(project.keyFeatures) && project.keyFeatures.length > 0) {
      elements.modalFeaturesSection.classList.remove('hidden');
      elements.modalFeatures.innerHTML = project.keyFeatures
        .map(feat => `<li>${escapeHtml(feat)}</li>`)
        .join('');
    } else {
      elements.modalFeaturesSection.classList.add('hidden');
    }

    // Tech Tags
    if (Array.isArray(project.techStack)) {
      elements.modalTags.innerHTML = project.techStack
        .map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`)
        .join('');
    } else {
      elements.modalTags.innerHTML = '';
    }

    // GitHub Link
    if (project.githubUrl) {
      elements.modalGithubLink.href = project.githubUrl;
      elements.modalGithubLink.classList.remove('hidden');
    } else {
      elements.modalGithubLink.classList.add('hidden');
    }

    elements.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!elements.modal) return;
    elements.modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // --- Theme Toggle ---
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hub_theme', theme);
  }

  function toggleTheme() {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  // --- Layout View Toggle ---
  function setViewMode(mode) {
    state.viewMode = mode;
    if (mode === 'list') {
      elements.projectsContainer.classList.add('list-view');
      elements.viewListBtn.classList.add('active');
      elements.viewGridBtn.classList.remove('active');
    } else {
      elements.projectsContainer.classList.remove('list-view');
      elements.viewGridBtn.classList.add('active');
      elements.viewListBtn.classList.remove('active');
    }
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // Search input
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (elements.clearSearchBtn) {
          elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
        }
        applyFilterAndRender();
      });
    }

    // Clear search button
    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        state.searchQuery = '';
        elements.clearSearchBtn.style.display = 'none';
        applyFilterAndRender();
        elements.searchInput.focus();
      });
    }

    // Category Tabs click
    if (elements.categoryTabs) {
      elements.categoryTabs.addEventListener('click', (e) => {
        const targetTab = e.target.closest('.tab-chip');
        if (!targetTab) return;

        const category = targetTab.dataset.category;
        state.activeCategory = category;

        // Update active class
        elements.categoryTabs.querySelectorAll('.tab-chip').forEach(tab => {
          const isActive = tab.dataset.category === category;
          tab.classList.toggle('active', isActive);
          tab.setAttribute('aria-selected', isActive);
        });

        applyFilterAndRender();
      });
    }

    // Sort select
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        applyFilterAndRender();
      });
    }

    // Reset Filters link
    if (elements.resetFiltersBtn) {
      elements.resetFiltersBtn.addEventListener('click', () => {
        resetFilters();
      });
    }

    // Empty state reset button
    if (elements.emptyResetBtn) {
      elements.emptyResetBtn.addEventListener('click', () => {
        resetFilters();
      });
    }

    // View switchers
    if (elements.viewGridBtn) {
      elements.viewGridBtn.addEventListener('click', () => setViewMode('grid'));
    }
    if (elements.viewListBtn) {
      elements.viewListBtn.addEventListener('click', () => setViewMode('list'));
    }

    // Theme toggle button
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // Open Modal Delegator
    if (elements.projectsContainer) {
      elements.projectsContainer.addEventListener('click', (e) => {
        const detailBtn = e.target.closest('.open-details-btn');
        if (detailBtn) {
          const id = detailBtn.dataset.id;
          openModal(id);
        }
      });
    }

    // Close Modal buttons
    if (elements.modalCloseBtn) elements.modalCloseBtn.addEventListener('click', closeModal);
    if (elements.modalDismissBtn) elements.modalDismissBtn.addEventListener('click', closeModal);

    // Modal background click
    if (elements.modal) {
      elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
      });
    }

    // Keyboard ESC for modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.modal && !elements.modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  function resetFilters() {
    state.activeCategory = 'all';
    state.searchQuery = '';
    if (elements.searchInput) elements.searchInput.value = '';
    if (elements.clearSearchBtn) elements.clearSearchBtn.style.display = 'none';

    if (elements.categoryTabs) {
      elements.categoryTabs.querySelectorAll('.tab-chip').forEach(tab => {
        const isActive = tab.dataset.category === 'all';
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
      });
    }

    applyFilterAndRender();
  }

  // --- Utility ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
