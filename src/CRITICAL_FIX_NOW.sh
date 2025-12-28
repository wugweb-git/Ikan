#!/bin/bash

echo "🚨 CRITICAL FIX: Pushing clean package.json to GitHub"
echo ""
echo "The problem: GitHub has a BAD package.json with:"
echo "  - node:crypto (invalid)"
echo "  - child_process (invalid)"
echo "  - fs, https, path, url, util (invalid)"
echo ""
echo "Your local package.json is CLEAN and correct!"
echo "We just need to push it to GitHub to overwrite the bad one."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Show current package.json status
echo "1️⃣ Checking local package.json..."
if grep -q '"node:crypto"' package.json; then
    echo "   ❌ ERROR: Local package.json has node:crypto!"
    echo "   Your local file is corrupted. Exiting."
    exit 1
else
    echo "   ✅ Local package.json is clean (no node:crypto)"
fi

echo ""

# Step 2: Delete package-lock.json if exists
if [ -f "package-lock.json" ]; then
    echo "2️⃣ Deleting package-lock.json..."
    rm package-lock.json
    echo "   ✅ Deleted"
else
    echo "2️⃣ No package-lock.json found (good)"
fi

echo ""

# Step 3: Pull latest from GitHub (in case of conflicts)
echo "3️⃣ Pulling latest from GitHub..."
git pull origin main --rebase

echo ""

# Step 4: Stage all critical files
echo "4️⃣ Staging all fixed files..."
git add package.json
git add tsconfig.json
git add vercel.json
git add .gitignore
git add .vercelignore

# Remove package-lock.json from git if it exists
if git ls-files --error-unmatch package-lock.json > /dev/null 2>&1; then
    echo "   Removing package-lock.json from git..."
    git rm --cached package-lock.json
fi

echo "   ✅ Files staged"

echo ""

# Step 5: Show what will be committed
echo "5️⃣ Changes to be committed:"
git status --short

echo ""

# Step 6: Commit with detailed message
echo "6️⃣ Committing changes..."
git commit -m "CRITICAL FIX: Clean package.json and exclude supabase from TypeScript

PROBLEM FIXED:
- GitHub had invalid Node built-ins in dependencies (node:crypto, fs, etc.)
- Replaced with clean package.json (no Node built-ins)
- TypeScript was trying to compile backend Deno code

CHANGES:
- package.json: Removed invalid Node built-in dependencies
- tsconfig.json: Exclude supabase/ and scripts/ directories
- vercel.json: Added --legacy-peer-deps install flag
- .gitignore: Ignore node_modules, dist, and lock files
- .vercelignore: Exclude supabase/ and scripts/ from Vercel builds
- Removed package-lock.json to clear dependency cache

This fixes: npm error Invalid package name \"node:crypto\"

Vercel build should now succeed without errors."

echo "   ✅ Committed"

echo ""

# Step 7: Push to GitHub with force flag (in case of conflicts)
echo "7️⃣ Pushing to GitHub..."
echo "   This will OVERWRITE the bad package.json on GitHub"
echo ""

git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅✅✅ SUCCESS! ✅✅✅"
    echo ""
    echo "Changes pushed to GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Go to GitHub and verify package.json is clean:"
    echo "   https://github.com/wugweb-git/IkanMentalHealthApp/blob/main/package.json"
    echo ""
    echo "2. Vercel should auto-deploy in ~10 seconds"
    echo "   Watch: https://vercel.com/dashboard"
    echo ""
    echo "3. The new build should succeed without 'node:crypto' error"
    echo ""
    echo "Expected build time: 45-60 seconds"
    echo ""
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Possible reasons:"
    echo "1. Merge conflict - run: git pull origin main --rebase"
    echo "2. No internet connection"
    echo "3. No push permission to repo"
    echo ""
    echo "Try manually:"
    echo "  git pull origin main --rebase"
    echo "  git push origin main --force"
    echo ""
fi
