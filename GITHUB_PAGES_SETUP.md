# GitHub Pages Setup - Fixing "Get Pages site failed" Error

This error occurs when GitHub Pages is not enabled or not configured to use GitHub Actions. Follow these steps to fix it:

## Step 1: Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository: `https://github.com/sfoubusgit/SDPromptGenerator3.2`
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - **Source**: `GitHub Actions` (NOT "Deploy from a branch")
5. Click **Save**

**Note**: The workflow file now includes `enablement: true` which should automatically enable Pages if it's not already enabled. However, you may still need to manually set the source to "GitHub Actions" the first time.

## Step 2: Verify Workflow File

Make sure the `.github/workflows/deploy.yml` file exists in your repository with the correct configuration.

## Step 3: Run the Workflow

1. Go to the **Actions** tab in your repository
2. You should see the "Deploy to GitHub Pages" workflow
3. If it failed, click on it and then click **Re-run all jobs**

## Alternative: Manual Enablement (If Step 1 doesn't work)

If you can't find the "GitHub Actions" option in the Pages settings, you may need to:

1. First, manually enable Pages with a branch:
   - Go to Settings → Pages
   - Source: Select `gh-pages` branch
   - Folder: `/ (root)`
   - Click Save
   - Wait for it to deploy once

2. Then switch to GitHub Actions:
   - Go back to Settings → Pages
   - Change Source to `GitHub Actions`
   - Click Save

## Troubleshooting

### Error: "Not Found"
- Make sure GitHub Pages is enabled in repository settings
- Verify you have write permissions to the repository
- Check that the repository is public (or you have GitHub Pro/Team for private repos)

### Error: "Workflow not found"
- Make sure `.github/workflows/deploy.yml` exists in your repository
- Verify the file is committed and pushed to the `main` or `master` branch

### Error: "Permission denied"
- Go to Settings → Actions → General
- Under "Workflow permissions", select "Read and write permissions"
- Check "Allow GitHub Actions to create and approve pull requests"
- Click Save

## Quick Fix Summary

1. **Settings** → **Pages** → **Source**: Select `GitHub Actions`
2. **Settings** → **Actions** → **General** → **Workflow permissions**: `Read and write permissions`
3. Push the workflow file to your repository
4. Go to **Actions** tab and run the workflow

After completing these steps, your deployment should work!

