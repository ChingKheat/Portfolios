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

## 🌐 Free Hosting & Deployment

Deploy directly to **GitHub Pages**, **Vercel**, or **Netlify**:

```bash
git add .
git commit -m "feat: public project showcase dashboard with curator"
git push -u origin main
```
In your GitHub repository settings, enable **GitHub Pages** from the `main` branch.
