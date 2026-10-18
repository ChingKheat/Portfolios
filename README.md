# GitHub Projects Showcase Hub

A modern, high-performance web dashboard to showcase GitHub software projects, applications, and developer utilities with an access-gated project curation portal.

---

## 🌟 Key Features

- **Public Dashboard (`index.html`)**:
  - Live project cards with GitHub repository links, version tags, tech stacks, and metrics.
  - Interactive search and category filtering (Web Applications, Mobile Apps, AI, Backend, DevOps).
  - Grid View and List View switcher.
  - Project architecture detail modal.
  - Engineering milestones and release timeline.
  - Dark and Light mode toggle with local persistence.

- **Access-Protected Curator Portal (`admin.html`)**:
  - Gated by a secret passkey (Default: `admin2026`).
  - Toggle switch for each project to show or hide from public visitors.
  - "Apply Live Now" for instant local preview.
  - "Download projects-data.js" to permanently commit updates to GitHub Pages.
  - "Copy Curated Link" to share customized views (`index.html?p=...`).

---

## 📂 File Structure

```text
portfolios/
├── index.html            # Public showcase dashboard
├── admin.html            # Access-protected project curator portal
├── css/
│   ├── styles.css        # Dashboard styling, theme tokens, card layouts
│   └── admin.css         # Curator portal and access gate styling
├── js/
│   ├── app.js            # Public showcase rendering, filters, search, modals
│   └── admin.js          # Curator authentication, toggles, export, and link generator
├── data/
│   └── projects-data.js  # Source catalog and project definitions
└── README.md             # Project documentation
```

---

## ⚡ Hosting Live on GitHub Pages

This project is built with standard HTML5, CSS3, and JavaScript — no backend server or database setup required. You can host it for free with **GitHub Pages**:

1. Commit and push this project to your repository:
   ```bash
   git add .
   git commit -m "feat: complete public dashboard and access curator portal"
   git push -u origin main
   ```

2. Go to your repository on GitHub:
   `https://github.com/ChingKheat/portfolios`

3. Click **Settings** (top navigation tab).

4. In the left sidebar, click **Pages** (under the "Code and automation" section).

5. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`
   - **Branch**: Select `main` and folder `/(root)`
   - Click **Save**

6. Within 1–2 minutes, GitHub will publish your live website at:
   `https://ChingKheat.github.io/portfolios/`
   
   - **Public Dashboard:** `https://ChingKheat.github.io/portfolios/`
   - **Curator Portal:** `https://ChingKheat.github.io/portfolios/admin.html`
