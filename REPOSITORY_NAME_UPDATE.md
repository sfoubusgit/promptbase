# Repository Name Update

The repository name has been changed from `sd_prompt_generator_v3.2` to `SDPromptGenerator3.2`.

## ✅ What Was Updated

### Configuration Files
- **`vite.config.ts`**: Base path updated to `/SDPromptGenerator3.2/` for production builds
- **`package.json`**: Build script updated to use production mode

### Documentation Files
- **`README.md`**: Updated repository name
- **`HOW_TO_PUSH_WORKFLOW.md`**: Updated GitHub URLs
- **`STEP_BY_STEP_PUSH.md`**: Updated GitHub URLs
- **`GITHUB_PAGES_SETUP.md`**: Updated GitHub URLs
- **`QUICK_FIX.md`**: Updated GitHub URLs

## 🔄 Next Steps

### 1. Rebuild the Project
You need to rebuild the project so the `dist` folder has the correct base path:

```powershell
npm run build
```

This will regenerate `dist/index.html` with the correct asset paths using `/SDPromptGenerator3.2/` as the base path.

### 2. Update GitHub Pages Settings
1. Go to: `https://github.com/sfoubusgit/SDPromptGenerator3.2/settings/pages`
2. Make sure **Source** is set to **"GitHub Actions"**
3. Click **Save**

### 3. Push the Changes
```powershell
git add .
git commit -m "Update repository name to SDPromptGenerator3.2"
git push
```

### 4. Run the Workflow
1. Go to: `https://github.com/sfoubusgit/SDPromptGenerator3.2/actions`
2. Click **"Deploy to GitHub Pages"**
3. Click **"Run workflow"**
4. Select **"main"** branch and click **"Run workflow"**

## 📍 New URLs

- **Repository**: `https://github.com/sfoubusgit/SDPromptGenerator3.2`
- **GitHub Pages**: `https://sfoubusgit.github.io/SDPromptGenerator3.2/`
- **Settings**: `https://github.com/sfoubusgit/SDPromptGenerator3.2/settings/pages`

## ⚠️ Important

After rebuilding, the `dist/index.html` file will have asset paths like:
- `/SDPromptGenerator3.2/assets/index-xxx.js`
- `/SDPromptGenerator3.2/assets/index-xxx.css`

Make sure to commit and push the updated `dist` folder after rebuilding!




