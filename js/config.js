/**
 * Global Configuration for Project Showcase Dashboard
 * Configure your GitHub username or custom API endpoint.
 * No hardcoded projects here - everything is fetched live dynamically!
 */

const APP_CONFIG = {
  // Default GitHub username to fetch repositories and profile from
  defaultGithubUsername: "ChingKheat",

  // Enable client-side caching (in minutes) to prevent hitting GitHub 60 req/hr rate limits
  cacheDurationMinutes: 15,

  // Optional: Personal Access Token if needed for high-rate API requests (leave empty for public)
  githubToken: "",

  // Secondary/fallback data source if GitHub API is unreachable
  fallbackJsonUrl: "data/projects.json",

  // Sorting preference for GitHub repos: 'updated', 'stars', 'pushed', 'full_name'
  defaultSort: "updated"
};
