/**
 * Showcase Curator Portal Script
 * Handles authentication gate, project selection, visibility persistence,
 * 1-click automatic GitHub synchronization, file export, and shareable links.
 */

(function () {
  'use strict';

  const DEFAULT_PASSKEY = 'admin2026';
  const STORAGE_KEY_PASSKEY = 'curator_passkey';
  const STORAGE_KEY_AUTH = 'curator_auth_session';
  const STORAGE_KEY_CURATED_IDS = 'curated_project_ids';
  const STORAGE_KEY_THEME = 'hub_theme';
  const STORAGE_KEY_GH_TOKEN = 'curator_gh_token';

  const GITHUB_REPO = 'ChingKheat/Portfolios';
  const GITHUB_BRANCH = 'main';
  const GITHUB_FILE_PATH = 'data/projects-data.js';

  // --- State ---
  const state = {
    isAuthenticated: false,
    projects: [],
    selectedIds: new Set(),
    activeFilter: 'all', // 'all' | 'visible' | 'hidden'
    searchQuery: '',
    theme: localStorage.getItem(STORAGE_KEY_THEME) || 'dark',
    isSyncing: false
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

    // GitHub Token Modal
    openTokenModalBtn: document.getElementById('open-token-modal-btn'),
    tokenStatusText: document.getElementById('token-status-text'),
    tokenModal: document.getElementById('token-modal'),
    closeTokenModal: document.getElementById('close-token-modal'),
    cancelTokenBtn: document.getElementById('cancel-token-btn'),
    saveTokenBtn: document.getElementById('save-token-btn'),
    ghTokenInput: document.getElementById('gh-token-input'),
    tokenFeedback: document.getElementById('token-feedback'),

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
    autoPublishBtn: document.getElementById('auto-publish-btn'),
    autoPublishText: document.getElementById('auto-publish-text'),
    exportFileBtn: document.getElementById('export-file-btn'),
    copyLinkBtn: document.getElementById('copy-link-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toast-msg')
  };

  // --- Initialization ---
  function init() {
    applyTheme(state.theme);
    updateTokenStatusUI();
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

  // --- GitHub Token Status ---
  function updateTokenStatusUI() {
    const token = localStorage.getItem(STORAGE_KEY_GH_TOKEN);
    if (elements.tokenStatusText) {
      elements.tokenStatusText.textContent = token ? '✓ Token Connected' : 'Connect Token';
    }
    if (elements.openTokenModalBtn) {
      elements.openTokenModalBtn.classList.toggle('token-connected', !!token);
    }
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

  // --- Generate Updated Code String ---
  function generateUpdatedDataContent() {
    const rawData = window.PROJECTS_DATA;
    if (!rawData) return null;

    const updated = JSON.parse(JSON.stringify(rawData));
    
    // Set visible property on all projects
    if (Array.isArray(updated.projects)) {
      updated.projects.forEach(p => {
        p.visible = state.selectedIds.has(p.id);
      });
    }

    // Update showcase.displayedProjectIds
    if (!updated.showcase) updated.showcase = {};
    updated.showcase.displayedProjectIds = Array.from(state.selectedIds);

    const jsCode = `/**\n * Project Catalog Data Source\n * Curated via Showcase Curator Portal\n */\nwindow.PROJECTS_DATA = ${JSON.stringify(updated, null, 2)};\n`;

    return { updated, jsCode };
  }

  // --- UTF-8 Base64 Encoder ---
  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // --- Automatic 1-Click Sync to GitHub ---
  async function autoPublishToGitHub() {
    if (state.isSyncing) return;

    const token = localStorage.getItem(STORAGE_KEY_GH_TOKEN);
    if (!token) {
      // Prompt user to enter their GitHub token
      elements.tokenFeedback.style.display = 'none';
      elements.ghTokenInput.value = '';
      elements.tokenModal.classList.remove('hidden');
      return;
    }

    const dataPackage = generateUpdatedDataContent();
    if (!dataPackage) {
      showToast('Error: Unable to generate project data.', true);
      return;
    }

    state.isSyncing = true;
    const originalText = elements.autoPublishText.textContent;
    elements.autoPublishText.textContent = 'Syncing to GitHub...';
    elements.autoPublishBtn.disabled = true;

    // Save locally immediately
    localStorage.setItem(STORAGE_KEY_CURATED_IDS, JSON.stringify(Array.from(state.selectedIds)));

    try {
      const authHeader = token.startsWith('Bearer ') || token.startsWith('token ')
        ? token
        : (token.startsWith('github_pat_') ? `Bearer ${token}` : `token ${token}`);

      const fileUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;

      // 1. Fetch current file SHA
      let currentSha = null;
      try {
        const checkRes = await fetch(fileUrl, {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (checkRes.status === 401) {
          throw new Error('UNAUTHORIZED');
        }

        if (checkRes.ok) {
          const fileMeta = await checkRes.json();
          currentSha = fileMeta.sha;
        }
      } catch (err) {
        if (err.message === 'UNAUTHORIZED') throw err;
        console.warn('Could not fetch existing SHA, attempting direct create/update:', err);
      }

      // 2. Send PUT commit to GitHub API
      const commitBody = {
        message: `chore: update displayed projects showcase (${state.selectedIds.size} visible)`,
        content: utf8ToBase64(dataPackage.jsCode),
        branch: GITHUB_BRANCH
      };
      if (currentSha) {
        commitBody.sha = currentSha;
      }

      const putRes = await fetch(fileUrl, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commitBody)
      });

      if (putRes.status === 401) {
        throw new Error('UNAUTHORIZED');
      }

      if (!putRes.ok) {
        const errorJson = await putRes.json().catch(() => ({}));
        throw new Error(errorJson.message || `HTTP ${putRes.status}`);
      }

      showToast(`🎉 Success! Published to GitHub. Live for all visitors in ~30 seconds!`);

    } catch (err) {
      console.error('GitHub Sync Error:', err);
      if (err.message === 'UNAUTHORIZED') {
        elements.tokenFeedback.textContent = 'GitHub Token is invalid or expired. Please re-enter a valid token.';
        elements.tokenFeedback.style.display = 'block';
        elements.tokenModal.classList.remove('hidden');
      } else {
        showToast(`Sync failed: ${err.message}`, true);
      }
    } finally {
      state.isSyncing = false;
      elements.autoPublishText.textContent = originalText;
      elements.autoPublishBtn.disabled = false;
    }
  }

  // --- Manual Export Fallback ---
  function exportUpdatedDataFile() {
    const dataPackage = generateUpdatedDataContent();
    if (!dataPackage) return;

    const blob = new Blob([dataPackage.jsCode], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'projects-data.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    localStorage.setItem(STORAGE_KEY_CURATED_IDS, JSON.stringify(Array.from(state.selectedIds)));
    showToast('✓ File downloaded! You can push it to GitHub manually.');
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
    }, 4500);
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

    // Auto-Publish Live to Public button
    if (elements.autoPublishBtn) {
      elements.autoPublishBtn.addEventListener('click', autoPublishToGitHub);
    }

    // Fallback file export & share link
    if (elements.exportFileBtn) elements.exportFileBtn.addEventListener('click', exportUpdatedDataFile);
    if (elements.copyLinkBtn) elements.copyLinkBtn.addEventListener('click', copyCuratedLink);

    // Theme Toggle
    if (elements.themeToggle) elements.themeToggle.addEventListener('click', toggleTheme);

    // GitHub Token Modal Handlers
    if (elements.openTokenModalBtn) {
      elements.openTokenModalBtn.addEventListener('click', () => {
        elements.ghTokenInput.value = localStorage.getItem(STORAGE_KEY_GH_TOKEN) || '';
        elements.tokenFeedback.style.display = 'none';
        elements.tokenModal.classList.remove('hidden');
      });
    }

    if (elements.closeTokenModal) {
      elements.closeTokenModal.addEventListener('click', () => {
        elements.tokenModal.classList.add('hidden');
      });
    }

    if (elements.cancelTokenBtn) {
      elements.cancelTokenBtn.addEventListener('click', () => {
        elements.tokenModal.classList.add('hidden');
      });
    }

    if (elements.saveTokenBtn) {
      elements.saveTokenBtn.addEventListener('click', () => {
        const token = elements.ghTokenInput.value.trim();
        if (!token) {
          elements.tokenFeedback.textContent = 'Please paste a valid GitHub token.';
          elements.tokenFeedback.style.display = 'block';
          return;
        }

        localStorage.setItem(STORAGE_KEY_GH_TOKEN, token);
        elements.tokenModal.classList.add('hidden');
        updateTokenStatusUI();
        showToast('✓ GitHub Token connected! Auto-sync is ready.');
      });
    }

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
