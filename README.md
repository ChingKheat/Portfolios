# Project Showcase Hub

A modern, high-performance static dashboard webpage for presenting software projects, applications, and technical architectures to visitors, clients, and teams.

**Zero hardcoded project data.** All project details, metrics, and categories are dynamically loaded from an external, easily editable [`data/projects.json`](data/projects.json) file.

---

## 🌟 Key Features

- **Select & Curate Projects to Display**:
  - Click **Select Projects** in the dashboard header to open the interactive **Project Curator** modal.
  - Check or uncheck projects on the fly using smooth toggle switches.
  - **Shareable Curated Links**: Click **Copy Link for Others** to generate a direct link (e.g. `index.html?show=banana-dashboard,nuxt-ai-chatbot`) that displays *only* the projects you selected!
  - Saved preferences automatically persist in `localStorage`.
- **Public-Ready Presentation**:
  - Designed as an open project portal for visitors, recruiters, and clients.
  - Zero login requirements, zero user accounts, and zero third-party API rate limits.
  - Works seamlessly offline via the local `file://` protocol (direct double-click) as well as hosted under `http://` / `https://`.
- **Project Deep-Linking & Sharing**:
  - Visitors can click **Share** on any individual project card to copy a direct link (e.g. `index.html?project=banana-dashboard`), which automatically opens that project's detail modal on load.
- **Interactive Filtering & Search**:
  - Real-time search across titles, summaries, descriptions, and tech stacks (press `/` anywhere to focus search).
  - Category filter pills dynamically generated from the visible projects.
  - Status filters (*Production*, *Active*, *Beta*, *Featured*).
  - Sort by *Featured*, *Recently Updated*, *Alphabetical*, or *Category*.
- **Grid & List Views**:
  - Switch between multi-column card grid and detailed horizontal list view with saved preference.
- **In-Depth Project Modal**:
  - Displays comprehensive architecture overview, key capabilities checklist, tech tags, release version, and direct links to live demos and source code.
- **Live Analytics Widgets**:
  - Visual technology stack distribution breakdown computed across all loaded projects.
  - Release timeline & milestone roadmap.
- **Dark / Light Mode**:
  - Built-in theme switcher with persistent local storage.

---

## 📂 File Structure

```text
portfolios/
├── index.html            # Main dashboard shell & markup
├── css/
│   └── styles.css        # Responsive design system, glassmorphism, switches, themes
├── js/
│   └── app.js            # Reactive application engine & project curator
├── data/
│   ├── projects-data.js  # External script data source (works on file:// and http://)
│   └── projects.json     # Clean JSON data source
├── assets/               # Folder for images, logos, or icons
└── README.md             # Documentation
```

---

## ⚡ Quick Start / Local Preview

### Option 1: Direct File Open
Double-click `index.html` in your file explorer to open it directly in your web browser.

### Option 2: Local Server (Recommended)
```bash
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 How to Add or Edit Projects

Open [`data/projects.json`](data/projects.json) (or `data/projects-data.js`) and add or modify project items inside the `"projects"` array:

```json
{
  "id": "my-new-app",
  "title": "My New App",
  "tagline": "One-line summary for the card header",
  "category": "Web Applications",
  "status": "Production",
  "featured": true,
  "version": "v1.0.0",
  "lastUpdated": "2026-10-15",
  "metrics": "⚡ Fast Rendering • 99.9% Uptime",
  "bannerGradient": "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
  "summary": "Brief summary displayed on the card.",
  "fullDescription": "Detailed overview and architecture shown in the modal.",
  "keyFeatures": [
    "Feature capability 1",
    "Feature capability 2"
  ],
  "techStack": ["React", "TypeScript", "Node.js"],
  "demoUrl": "https://example.com/demo",
  "githubUrl": "https://github.com/your-username/repo"
}
```

---

---

## 🎯 How to Select Projects to Show Visitors (GitHub Permanent Selection)

When you want future visitors to your website to see only specific projects:

### Method 1: 1-Click Push via GitHub API (Direct from Dashboard)
1. Open the dashboard in your browser and click the **"Select Projects"** button in the header.
2. Toggle ON the projects you want visitors to see (use *Select All*, *Deselect All*, or *Featured Only* for quick selection).
3. In the modal's **"Save to GitHub"** section under the **1-Click Push** tab:
   - Ensure the repository is set to `ChingKheat/portfolios` and branch to `main`.
   - Enter your [GitHub Personal Access Token](https://github.com/settings/tokens/new?scopes=repo&description=Project+Showcase+Dashboard) (needs `repo` scope).
   - Click **"Push to GitHub (Live for Next Visitors)"**.
4. The dashboard commits the updated `data/projects-data.js` and `data/projects.json` directly to your GitHub repository. GitHub Pages will immediately reflect the selected projects for all visitors worldwide!

### Method 2: Edit Directly on GitHub.com (No Token Needed)
1. In the **"Select Projects"** modal, select your projects and click the **"Edit on GitHub"** tab.
2. Click **"Copy Selected IDs"** to copy the selected project IDs array.
3. Click **"Edit on GitHub ↗"** to open [`data/projects-data.js`](data/projects-data.js) directly in GitHub's web editor.
4. Replace the `displayedProjectIds` array inside `showcase`:
   ```javascript
   "showcase": {
     "repository": "ChingKheat/portfolios",
     "branch": "main",
     "displayedProjectIds": [
       "banana-dashboard",
       "SmashDash_CourtBooking",
       "nuxt-ai-chatbot"
     ]
   }
   ```
5. Click **Commit changes**. All visitors will now see only those projects!

### Method 3: Edit Locally via Git
1. In your local repository, open [`data/projects-data.js`](data/projects-data.js) (or click **"Download projects-data.js"** in the modal).
2. Adjust `showcase.displayedProjectIds` to include only the project IDs you want to display.
3. Commit and push to GitHub:
   ```bash
   git add data/
   git commit -m "chore: update displayed projects showcase"
   git push origin main
   ```

---

## 🌐 Free Hosting & Deployment

Deploy directly to **GitHub Pages**:

```bash
git add .
git commit -m "feat: public project showcase dashboard with curator"
git push -u origin main
```
In your GitHub repository settings under **Pages**, select branch `main` / `root` and click **Save**. Your site will be live at `https://chingkheat.github.io/portfolios/`!
