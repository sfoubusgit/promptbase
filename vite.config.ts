import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Base path for GitHub Pages deployment
  // For GitHub Pages: repository name is part of the URL
  // Example: if your repo is 'my-app', the URL will be https://username.github.io/my-app/
  // Prefer BASE_PATH if set; otherwise use GITHUB_REPOSITORY when building in CI.
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const basePath =
    process.env.BASE_PATH ||
    (mode === 'production' && repoName ? `/${repoName}/` : '/')
  
  return {
    plugins: [react()],
    base: basePath,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Allow accessing files outside src for migration
    server: {
      fs: {
        allow: ['..'],
      },
    },
  }
})
