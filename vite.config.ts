import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Base path for GitHub Pages deployment
  // For GitHub Pages: repository name is part of the URL
  // Example: if your repo is 'my-app', the URL will be https://username.github.io/my-app/
  // Set BASE_PATH environment variable when building for GitHub Pages
  // Default to '/' for local development and root domain deployments
  // For production builds, default to GitHub Pages base path
  const basePath = process.env.BASE_PATH || (mode === 'production' ? '/SDPromptGenerator3.2/' : '/')
  
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

