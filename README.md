# Project Hub - Engineering Portfolio & Showcase Dashboard

A modern, high-performance static dashboard webpage for showcasing software projects, technical case studies, and engineering metrics. Built with pure HTML5, modern CSS3 (with CSS custom properties, glassmorphism, responsive grid), and vanilla JavaScript.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-success.svg)
![Zero Dependencies](https://img.shields.io/badge/dependencies-0%20(vanilla)-orange.svg)

---

## 🚀 Key Features

- **Dashboard Layout & Design System**:
  - **Dark / Light Theme Toggle**: Seamless transition with local storage persistence.
  - **Sidebar Navigation**: User profile avatar, availability status with animated pulse dot, quick jump anchors, and social links.
  - **KPI Metric Stat Cards**: Dynamic project counter, featured projects, community stars, and unique technology count.
- **Interactive Project Showcase**:
  - **Category Tabs**: Filter instantaneously by *All*, *AI & Machine Learning*, *Full-Stack*, *Cloud & DevOps*, *Mobile Apps*, *Open Source & Tools*.
  - **Real-Time Live Search**: Searches titles, taglines, summaries, and tech stack tags on the fly (press `/` anywhere to focus search).
  - **Status & Sorting Controls**: Filter by *Featured Only*, *Live / Production*, *Beta*, *In Progress*, or sort by *Featured*, *Stars*, *Newest*, or *Alphabetical*.
  - **Grid & List View Switcher**: Switch between multi-column cards and detailed horizontal list views with local storage persistence.
- **Deep-Dive Modal Inspector**:
  - Clicking any card or the "Quick View" button opens an architecture breakdown modal with technical challenges, key capabilities list, and complete tech stack tags.
- **Analytics & Milestone Timeline**:
  - Automated tech stack distribution bars dynamically calculated from project repositories.
  - Release timeline & milestone roadmap widget.
- **Connect / Contact Modal**:
  - Quick-connect options for GitHub, LinkedIn, Twitter/X, and one-click copy email button with toast notification.
- **100% Zero Build Step**:
  - Works out of the box. No `npm install`, webpack, or bundler needed.

---

## 📂 File Structure

```text
portfolios/
├── index.html            # Main dashboard shell & markup
├── css/
│   └── styles.css        # Design system, CSS tokens, glassmorphism, responsive styles
├── js/
│   ├── projects.js       # Central data file for projects, profile, and milestones
│   └── app.js            # Reactive application logic (filters, views, modal, theme)
├── assets/               # Folder for custom images, avatars, or logos
└── README.md             # Documentation & deployment guide
```

---

## ⚡ Quick Start / Local Preview

### Option 1: Direct File Open
Simply double-click `index.html` in your file explorer to open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local Python Server (Recommended)
Run the following in the project directory:
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000` in your web browser.

---

## 🛠 Customization Guide

### 1. Update Profile & Social Links
Open `js/projects.js` and edit the `PROFILE_DATA` object:
```javascript
const PROFILE_DATA = {
  name: "Your Name",
  handle: "@yourhandle",
  title: "Your Professional Title",
  bio: "Your personal bio / summary",
  status: "Available for select opportunities",
  socials: {
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
    twitter: "https://twitter.com/yourusername",
    email: "your.email@example.com"
  }
};
```

### 2. Add or Edit Projects
Add your project objects to the `PROJECTS_DATA` array in `js/projects.js`:
```javascript
{
  id: "my-custom-project",
  title: "My Custom Project",
  tagline: "Short one-line impact tagline",
  category: "Full-Stack", // or "AI & Machine Learning", "Mobile Apps", etc.
  status: "Live",         // "Live", "Beta", "In Progress", or "Archived"
  featured: true,
  stars: 120,
  year: "2026",
  metrics: "99.9% uptime • 5k active users",
  bannerGradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
  summary: "Brief project summary displayed on the card.",
  fullDescription: "Detailed overview shown in the modal.",
  challenges: "Technical bottleneck or engineering challenge solved.",
  keyFeatures: [
    "Feature item 1",
    "Feature item 2"
  ],
  techStack: ["React", "TypeScript", "Node.js", "Docker"],
  demoUrl: "https://your-demo-url.com",
  githubUrl: "https://github.com/yourusername/repo"
}
```

---

## 🌐 Free Static Hosting & Deployment

### GitHub Pages
1. Initialize a git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio dashboard commit"
   ```
2. Push to your GitHub repository:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. In GitHub repo settings, navigate to **Pages** > **Source** > Select `main` branch `/ (root)` > Click **Save**.

### Vercel / Netlify
- Drag and drop this folder into [Netlify Drop](https://app.netlify.com/drop) or deploy directly with the [Vercel CLI](https://vercel.com). No build command required.
