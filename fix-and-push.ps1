# PowerShell script to fix and push the dist folder changes

Write-Host "Checking git status..." -ForegroundColor Yellow
git status

Write-Host "`nAdding dist folder files..." -ForegroundColor Yellow
git add dist/index.html
git add dist/.nojekyll
git add dist/404.html

Write-Host "`nChecking what's staged..." -ForegroundColor Yellow
git status

Write-Host "`nCommitting changes..." -ForegroundColor Yellow
git commit -m "Fix base path: Update to SDPromptGenerator3.2 for GitHub Pages"

Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
git push

Write-Host "`nDone! Check your GitHub repository." -ForegroundColor Green
Write-Host "Then go to Actions tab and run the deployment workflow." -ForegroundColor Cyan




