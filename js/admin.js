/**
 * Showcase Curator Portal Script
 * Handles authentication gate, project selection, visibility persistence, file export, and shareable links.
 */

(function () {
  'use strict';

  const DEFAULT_PASSKEY = 'admin2026';
  const STORAGE_KEY_PASSKEY = 'curator_passkey';
  const STORAGE_KEY_AUTH = 'curator_auth_session';
  const STORAGE_KEY_CURATED_IDS = 'curated_project_ids';
  const STORAGE_KEY_THEME = 'hub_theme';

  // --- State ---
  const state = {
    isAuthenticated: false,
    projects: [],
    selectedIds: new Set(),
    activeFilter: 'all', // 'all' | 'visible' | 'hidden'
    searchQuery: '',
    theme: localStorage.getItem(STORAGE_KEY_THEME) || 'dark'
  };

  // --- DOM Elements ---
  const elements = {
    // Auth & Gate
    accessGate: document.getElementById('access-gate'),
    curatorDashboard: document.getElementById('curator-dashboard'),
    gateForm: document.getElementById('gate-form'),
    passkeyInput: document.getElementById('passkey-input'),
    togglePasskeyBtn: document.getElementById('toggle-passkey-visibility'),
    gateError: document.getElementById('gate-error'),
    unlockBtn: document.getElementById('unlock-btn'),
    logoutBtn: document.getElementById('logout-btn'),

    // Passkey Modal
    changePasskeyBtn: document.getElementById('change-passkey-btn'),
    passkeyModal: document.getElementById('passkey-modal'),
    closePasskeyModal: document.getElementById('close-passkey-modal'),
    cancelPasskeyBtn: document.getElementById('cancel-passkey-btn'),
    changePasskeyForm: document.getElementById('change-passkey-form'),
    newPasskeyInput: document.getElementById('new-passkey'),
    passkeyFeedback: document.getElementById('passkey-change-feedback'),

    // KPI & Toolbar
    kpiSelected: document.getElementById('kpi-selected-count'),
    kpiHidden: document.getElementById('kpi-hidden-count'),
    kpiTotal: document.getElementById('kpi-total-count'),
    curatorSearch: document.getElementById('curator-search'),
    filterTabs: document.getElementById('curator-filter-tabs'),
    selectAllBtn: document.getElementById('select-all-btn'),
    deselectAllBtn: document.getElementById('deselect-all-btn'),
    curatorGrid: document.getElementById('curator-grid'),

    // Dock & Actions
    dockSummary: document.getElementById('dock-summary'),
    saveLocalBtn: document.getElementById('save-local-btn'),
    exportFileBtn: document.getElementById('export-file-btn'),
    copyLinkBtn: document.getElementById('copy-link-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toast-msg')
  };

  // --- Initialization ---
  function init() {
    applyTheme(state.theme);
    checkAuthStatus();
    setupEventListeners();
  }

  // --- Authentication Handling ---
  function getStoredPasskey() {
    return localStorage.getItem(STORAGE_KEY_PASSKEY) || DEFAULT_PASSKEY;
  }

  function checkAuthStatus() {
    const isSessionActive = sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    if (isSessionActive) {
      grantAccess();
    } else {
      lockAccess();
    }
  }

  function attemptUnlock() {
    const entered = elements.passkeyInput.value.trim();
    const correct = getStoredPasskey();

    if (entered === correct) {
      sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
      elements.gateError.style.display = 'none';
      grantAccess();
      showToast('Access granted! Welcome to Curator Portal.');
    } else {
      elements.gateError.style.display = 'block';
      elements.passkeyInput.focus();
      elements.passkeyInput.select();
    }
  }

  function grantAccess() {
    state.isAuthenticated = true;
    elements.accessGate.classList.add('hidden');
    elements.curatorDashboard.classList.remove('hidden');
    elements.logoutBtn.classList.remove('hidden');
    loadProjectsData();
  }

  function lockAccess() {
    state.isAuthenticated = false;
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    elements.accessGate.classList.remove('hidden');
    elements.curatorDashboard.classList.add('hidden');
    elements.logoutBtn.classList.add('hidden');
    elements.passkeyInput.value = '';
    elements.gateError.style.display = 'none';
  }

  // --- Load Data Source & Selection ---
  function loadProjectsData() {
    const data = window.PROJECTS_DATA;
    if (!data || !Array.isArray(data.projects)) {
      showToast('Failed to load project data. Please verify data/projects-data.js', true);
      return;
    }

    state.projects = data.projects;

    // Load saved selection from localStorage or data defaults
    const savedJson = localStorage.getItem(STORAGE_KEY_CURATED_IDS);
    if (savedJson) {
      try {
        const parsed = JSON.parse(savedJson);
        if (Array.isArray(parsed)) {
          state.selectedIds = new Set(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved curated IDs', e);
      }
    }

    // Fallback to showcase.displayedProjectIds or p.visible !== false
    if (state.selectedIds.size === 0) {
      if (data.showcase && Array.isArray(data.showcase.displayedProjectIds)) {
        state.selectedIds = new Set(data.showcase.displayedProjectIds);
      } else {
        state.projects.forEach(p => {
          if (p.visible !== false) {
            state.selectedIds.add(p.id);
          }
        });
      }
    }

    updateKPIs();
    renderCuratorGrid();
  }

  // --- Update KPI Counters ---
  function updateKPIs() {
    const total = state.projects.length;
    const selected = state.selectedIds.size;
    const hidden = total - selected;

    if (elements.kpiTotal) elements.kpiTotal.textContent = total;
    if (elements.kpiSelected) elements.kpiSelected.textContent = selected;
    if (elements.kpiHidden) elements.kpiHidden.textContent = hidden;

    if (elements.dockSummary) {
      elements.dockSummary.textContent = `${selected} of ${total} projects selected for display`;
    }
  }

  // --- Render Projects Grid in Curator ---
  function renderCuratorGrid() {
    if (!elements.curatorGrid) return;

    elements.curatorGrid.innerHTML = '';
    const q = state.searchQuery.toLowerCase().trim();

    const filtered = state.projects.filter(project => {
      const isSelected = state.selectedIds.has(project.id);

      // Tab filter
      if (state.activeFilter === 'visible' && !isSelected) return false;
      if (state.activeFilter === 'hidden' && isSelected) return false;

      // Search filter
      if (q) {
        const title = (project.title || '').toLowerCase();
        const id = (project.id || '').toLowerCase();
        const stack = (project.techStack || []).join(' ').toLowerCase();
        const cat = (project.category || '').toLowerCase();

        return title.includes(q) || id.includes(q) || stack.includes(q) || cat.includes(q);
      }

      return true;
    });

    if (filtered.length === 0) {
      elements.curatorGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; font-weight: 600;">No matching projects found.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(project => {
      const isSelected = state.selectedIds.has(project.id);
      const card = document.createElement('div');
      card.className = `curator-card ${isSelected ? 'is-visible' : 'is-hidden'}`;
      card.dataset.id = project.id;

      card.innerHTML = `
        <div class="curator-card-top">
          <label class="switch-wrapper" title="Click to toggle display status">
            <input type="checkbox" class="switch-input project-toggle" data-id="${escapeHtml(project.id)}" ${isSelected ? 'checked' : ''}>
            <span class="switch-slider"></span>
            <span class="switch-status-label">${isSelected ? 'Displayed' : 'Hidden'}</span>
          </label>
          <span class="curator-category-chip">${escapeHtml(project.category || 'General')}</span>
        </div>

        <div>
          <h3 class="curator-project-title">${escapeHtml(project.title)}</h3>
          <p class="curator-project-tagline">${escapeHtml(project.tagline || project.summary || '')}</p>
        </div>

        <div class="curator-card-footer">
          <span style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--text-muted);">${escapeHtml(project.id)}</span>
          ${project.githubUrl ? `
            <a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer" class="footer-link" style="font-size: 0.8rem; display: flex; align-items: center; gap: 4px;">
              <span>Repo</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          ` : ''}
        </div>
      `;

      elements.curatorGrid.appendChild(card);
    });
  }

  // --- Toggle Project Visibility ---
  function toggleProject(projectId, makeVisible) {
    if (makeVisible) {
      state.selectedIds.add(projectId);
    } else {
      state.selectedIds.delete(projectId);
    }

    // Update Card UI
    const card = elements.curatorGrid.querySelector(`.curator-card[data-id="${projectId}"]`);
    if (card) {
      card.classList.toggle('is-visible', makeVisible);
      card.classList.toggle('is-hidden', !makeVisible);
      const label = card.querySelector('.switch-status-label');
      if (label) label.textContent = makeVisible ? 'Displayed' : 'Hidden';
    }

    updateKPIs();
  }

  // --- Batch Select / Deselect ---
  function selectAll() {
    state.projects.forEach(p => state.selectedIds.add(p.id));
    renderCuratorGrid();
    updateKPIs();
    showToast('All projects selected for display.');
  }

  function deselectAll() {
    state.selectedIds.clear();
    renderCuratorGrid();
    updateKPIs();
    showToast('All projects deselected (hidden).');
  }

  // --- Save Locally ---
  function saveToLocalStorage() {
    const idsArray = Array.from(state.selectedIds);
    localStorage.setItem(STORAGE_KEY_CURATED_IDS, JSON.stringify(idsArray));
    showToast(`✓ Saved! Public dashboard will now display these ${idsArray.length} projects.`);
  }

  // --- Export Updated projects-data.js File ---
  function exportUpdatedDataFile() {
    const rawData = window.PROJECTS_DATA;
    if (!rawData) {
      showToast('Error: Source data not found.', true);
      return;
    }

    // Clone and update
    const updatedData = JSON.parse(JSON.stringify(rawData));
    
    // Update visible property on each project
    if (Array.isArray(updatedData.projects)) {
      updatedData.projects.forEach(p => {
        p.visible = state.selectedIds.has(p.id);
      });
    }

    // Update showcase.displayedProjectIds
    if (!updatedData.showcase) updatedData.showcase = {};
    updatedData.showcase.displayedProjectIds = Array.from(state.selectedIds);

    // Format JS file content
    const fileContent = `/**\n * Project Catalog Data Source\n * Curated via Showcase Curator Portal\n */\nwindow.PROJECTS_DATA = ${JSON.stringify(updatedData, null, 2)};\n`;

    // Download trigger
    const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'projects-data.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also persist locally
    saveToLocalStorage();

    showToast('✓ File downloaded! Place in data/ folder & push to GitHub for permanent visitor sync.');
  }

  // --- Copy Shareable Curated Link ---
  function copyCuratedLink() {
    const idsArray = Array.from(state.selectedIds);
    const baseUrl = window.location.href.replace(/admin\.html.*$/, 'index.html');
    const shareUrl = `${baseUrl}?p=${encodeURIComponent(idsArray.join(','))}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('✓ Shareable curated link copied to clipboard!');
    }).catch(() => {
      prompt('Copy this shareable link:', shareUrl);
    });
  }

  // --- Toast Feedback ---
  function showToast(message, isError = false) {
    if (!elements.toast || !elements.toastMsg) return;
    elements.toastMsg.textContent = message;
    elements.toast.classList.toggle('toast-error', isError);
    elements.toast.classList.add('show');
    clearTimeout(elements.toast._timer);
    elements.toast._timer = setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 4000);
  }

  // --- Theme Handling ---
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }

  function toggleTheme() {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Passkey input form submit
    if (elements.gateForm) {
      elements.gateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        attemptUnlock();
      });
    }

    if (elements.unlockBtn) {
      elements.unlockBtn.addEventListener('click', attemptUnlock);
    }

    // Toggle Passkey text visibility
    if (elements.togglePasskeyBtn) {
      elements.togglePasskeyBtn.addEventListener('click', () => {
        const isPass = elements.passkeyInput.type === 'password';
        elements.passkeyInput.type = isPass ? 'text' : 'password';
      });
    }

    // Logout
    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener('click', () => {
        lockAccess();
        showToast('Curator session locked.');
      });
    }

    // Toggle change inside grid delegator
    if (elements.curatorGrid) {
      elements.curatorGrid.addEventListener('change', (e) => {
        const toggle = e.target.closest('.project-toggle');
        if (toggle) {
          const id = toggle.dataset.id;
          toggleProject(id, toggle.checked);
        }
      });
    }

    // Batch buttons
    if (elements.selectAllBtn) elements.selectAllBtn.addEventListener('click', selectAll);
    if (elements.deselectAllBtn) elements.deselectAllBtn.addEventListener('click', deselectAll);

    // Search filter
    if (elements.curatorSearch) {
      elements.curatorSearch.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderCuratorGrid();
      });
    }

    // Filter tabs
    if (elements.filterTabs) {
      elements.filterTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab-chip');
        if (!tab) return;
        state.activeFilter = tab.dataset.filter;
        elements.filterTabs.querySelectorAll('.tab-chip').forEach(t => {
          t.classList.toggle('active', t === tab);
        });
        renderCuratorGrid();
      });
    }

    // Actions dock
    if (elements.saveLocalBtn) elements.saveLocalBtn.addEventListener('click', saveToLocalStorage);
    if (elements.exportFileBtn) elements.exportFileBtn.addEventListener('click', exportUpdatedDataFile);
    if (elements.copyLinkBtn) elements.copyLinkBtn.addEventListener('click', copyCuratedLink);

    // Theme Toggle
    if (elements.themeToggle) elements.themeToggle.addEventListener('click', toggleTheme);

    // Passkey Modal
    if (elements.changePasskeyBtn) {
      elements.changePasskeyBtn.addEventListener('click', () => {
        elements.newPasskeyInput.value = '';
        elements.passkeyFeedback.style.display = 'none';
        elements.passkeyModal.classList.remove('hidden');
      });
    }

    if (elements.closePasskeyModal) {
      elements.closePasskeyModal.addEventListener('click', () => {
        elements.passkeyModal.classList.add('hidden');
      });
    }

    if (elements.cancelPasskeyBtn) {
      elements.cancelPasskeyBtn.addEventListener('click', () => {
        elements.passkeyModal.classList.add('hidden');
      });
    }

    if (elements.changePasskeyForm) {
      elements.changePasskeyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newKey = elements.newPasskeyInput.value.trim();
        if (newKey.length < 4) {
          elements.passkeyFeedback.textContent = 'Passkey must be at least 4 characters long.';
          elements.passkeyFeedback.style.display = 'block';
          return;
        }

        localStorage.setItem(STORAGE_KEY_PASSKEY, newKey);
        elements.passkeyModal.classList.add('hidden');
        showToast('✓ Access passkey updated successfully!');
      });
    }
  }

  // Escape HTML helper
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
