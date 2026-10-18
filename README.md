# Project Hub - Dynamic Live GitHub Project & Portfolio Dashboard

A modern, high-performance static dashboard webpage that **dynamically loads real repositories, live metrics, and user profiles directly from the GitHub REST API**.

**Zero hardcoded project data.** Every card, category, technology bar, and activity milestone is rendered live on the fly.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Data Source](https://img.shields.io/badge/data--source-GitHub%20REST%20API-success.svg)
![Zero Dependencies](https://img.shields.io/badge/dependencies-0%20(vanilla)-orange.svg)

---

## 🚀 Key Features

- **Dynamic GitHub REST API Integration**:
  - Automatically fetches live repositories via `https://api.github.com/users/{username}/repos`.
  - Automatically fetches the user's avatar, bio, location, and stats via `https://api.github.com/users/{username}`.
  - No build step or backend required; runs 100% in the browser.
- **In-App Account Switcher**:
  - Switch to any GitHub account (`ChingKheat`, `torvalds`, `vercel`, etc.) directly through the UI.
- **One-Click Live Sync**:
  - Top-navbar **Sync GitHub** button refreshes live data immediately with spinning feedback and toast notifications.
- **Intelligent Client-Side Caching**:
  - Caches GitHub API responses in `localStorage` with a 15-minute TTL to stay well within GitHub's unauthenticated 60 requests/hour rate limit.
- **Offline / Local Fallback (`data/projects.json`)**:
  - If GitHub's API is unreachable or rate limited, gracefully falls back to `data/projects.json`.
- **Dashboard Layout & Design System**:
  - Dark / Light mode toggle with persistent preferences.
  - Real-time search (`/` shortcut), category filters, status filters, and sorting.
  - Grid View & List View switcher.
  - Repository inspector modal with Git clone command copier, license, branch, and live links.
  - Dynamic language breakdown progress bars calculated directly from your repositories.
  - Dynamic milestone activity timeline derived from actual commit/push dates.

---

## 📂 File Structure

```text
portfolios/
├── index.html            # Main dashboard shell & markup
├── css/
│   └── styles.css        # Glassmorphic styles, responsive grid, skeletons, themes
├── js/
│   ├── config.js         # Configuration (default username, cache duration, token)
│   ├── github-api.js     # Live GitHub API client, caching & data normalizer
│   └── app.js            # UI state, filters, search, views, modal, theme
├── data/
│   └── projects.json     # Optional offline / fallback JSON data
└── README.md             # Documentation
```

---

## ⚡ Quick Start / Local Preview

### Option 1: Direct File Open
Simply double-click `index.html` in your file explorer to launch the dashboard in any browser.

### Option 2: Local Server (Recommended)
```bash
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Configuration (`js/config.js`)

You can change the default username and settings in [**`js/config.js`**](file:///c:/Users/ching/OneDrive/Dokumen/GitHub%20Projects/portfolios/js/config.js):

```javascript
const APP_CONFIG = {
  // Default GitHub username to fetch dynamically
  defaultGithubUsername: "ChingKheat",

  // Cache duration in minutes
  cacheDurationMinutes: 15,

  // Optional: GitHub Personal Access Token (for 5,000 req/hour limit)
  githubToken: "",

  // Fallback JSON path if GitHub API is offline
  fallbackJsonUrl: "data/projects.json",

  // Repository sort order ('updated', 'stars', 'pushed', 'full_name')
  defaultSort: "updated"
};
```

---

## 🌐 Free Static Hosting & Deployment

Deploy directly to **GitHub Pages**, **Vercel**, or **Netlify**:

```bash
git add .
git commit -m "feat: dynamic GitHub API project dashboard"
git push -u origin main
```
In your GitHub repository settings, enable **GitHub Pages** from the `main` branch.
