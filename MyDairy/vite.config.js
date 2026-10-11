import { defineConfig } from 'vite';

// GitHub Pages serves project repositories from /repository-name/.
// The deploy workflow sets REPO_NAME. For username.github.io repositories,
// the site lives at the domain root and needs no repository sub-path.
const repoName = process.env.REPO_NAME || '';
const base = process.env.GITHUB_PAGES === 'true'
  ? (repoName.endsWith('.github.io') ? '/' : `/${repoName}/`)
  : '/';

export default defineConfig({ base });
