@echo off
echo 🔧 Fixing Vercel Build Configuration...
echo.

REM Step 1: Remove package-lock.json if it exists locally
if exist "package-lock.json" (
    echo 1️⃣ Removing local package-lock.json...
    del package-lock.json
    echo    ✅ Deleted
) else (
    echo 1️⃣ No local package-lock.json found (good)
)

echo.

REM Step 2: Check git status
echo 2️⃣ Checking git status...
git status --short

echo.

REM Step 3: Add all the fixed files
echo 3️⃣ Adding fixed files to git...
git add tsconfig.json
git add vercel.json
git add .gitignore
git add .vercelignore

REM If package-lock.json exists in git, remove it
git ls-files --error-unmatch package-lock.json >nul 2>&1
if %errorlevel% equ 0 (
    echo    Removing package-lock.json from git...
    git rm --cached package-lock.json
)

echo    ✅ Files staged
echo.

REM Step 4: Commit
echo 4️⃣ Committing changes...
git commit -m "fix: exclude supabase directory from TypeScript compilation and ignore lock files - Updated tsconfig.json to exclude supabase/ and scripts/ - Added --legacy-peer-deps flag to vercel.json - Created .gitignore to ignore node_modules and lock files - Created .vercelignore to exclude backend code from Vercel builds - Removed package-lock.json to prevent npm dependency caching issues"

echo    ✅ Committed
echo.

REM Step 5: Push to GitHub
echo 5️⃣ Pushing to GitHub...
git push origin main

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ DONE! Changes pushed to GitHub
echo.
echo Vercel should automatically start a new deployment with the fixes.
echo.
echo Monitor your deployment at:
echo https://vercel.com/wugweb-git/ikan-mental-health-app
echo.
echo The new commit should NOT be 2f6ba40
echo.
pause
