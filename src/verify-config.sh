#!/bin/bash

# Verification Script for Vercel Build Fix
# Run this to verify all changes are correct before pushing

echo "🔍 Verifying Vercel Build Configuration..."
echo ""

# Check tsconfig.json
echo "1️⃣ Checking tsconfig.json..."
if grep -q '"supabase"' tsconfig.json; then
    echo "   ✅ tsconfig.json excludes 'supabase'"
else
    echo "   ❌ tsconfig.json does NOT exclude 'supabase'"
    echo "   ACTION REQUIRED: Add 'supabase' to exclude array"
fi

if grep -q '"scripts"' tsconfig.json; then
    echo "   ✅ tsconfig.json excludes 'scripts'"
else
    echo "   ❌ tsconfig.json does NOT exclude 'scripts'"
    echo "   ACTION REQUIRED: Add 'scripts' to exclude array"
fi

echo ""

# Check vercel.json
echo "2️⃣ Checking vercel.json..."
if grep -q 'installCommand' vercel.json; then
    echo "   ✅ vercel.json has installCommand"
    if grep -q 'legacy-peer-deps' vercel.json; then
        echo "   ✅ vercel.json uses --legacy-peer-deps"
    else
        echo "   ❌ vercel.json missing --legacy-peer-deps flag"
    fi
else
    echo "   ❌ vercel.json missing installCommand"
    echo "   ACTION REQUIRED: Add 'installCommand': 'npm install --legacy-peer-deps'"
fi

echo ""

# Check for package-lock.json
echo "3️⃣ Checking for package-lock.json..."
if [ -f "package-lock.json" ]; then
    echo "   ⚠️  package-lock.json exists"
    echo "   RECOMMENDATION: Delete it (git rm package-lock.json)"
else
    echo "   ✅ No package-lock.json (good)"
fi

echo ""

# Check .vercelignore
echo "4️⃣ Checking .vercelignore..."
if [ -f ".vercelignore" ]; then
    if grep -q 'supabase' .vercelignore; then
        echo "   ✅ .vercelignore excludes supabase/"
    else
        echo "   ❌ .vercelignore does NOT exclude supabase/"
        echo "   ACTION REQUIRED: Add 'supabase/' to .vercelignore"
    fi
else
    echo "   ❌ .vercelignore does not exist"
    echo "   ACTION REQUIRED: Create .vercelignore with 'supabase/'"
fi

echo ""

# Check .gitignore
echo "5️⃣ Checking .gitignore..."
if [ -f ".gitignore" ]; then
    echo "   ✅ .gitignore exists"
    if grep -q 'node_modules' .gitignore; then
        echo "   ✅ .gitignore excludes node_modules"
    fi
else
    echo "   ⚠️  .gitignore does not exist"
    echo "   RECOMMENDATION: Create .gitignore"
fi

echo ""

# Check git status
echo "6️⃣ Checking git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    CHANGED_FILES=$(git status --porcelain | wc -l)
    if [ "$CHANGED_FILES" -gt 0 ]; then
        echo "   ⚠️  You have $CHANGED_FILES uncommitted file(s)"
        echo "   Modified files:"
        git status --short
        echo ""
        echo "   ACTION REQUIRED: Commit and push changes"
    else
        echo "   ✅ All changes committed"
    fi
else
    echo "   ⚠️  Not a git repository"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
echo "📋 SUMMARY"
echo ""
echo "To fix the Vercel build error, you must:"
echo ""
echo "1. Ensure tsconfig.json excludes: supabase, scripts"
echo "2. Ensure vercel.json has: installCommand with --legacy-peer-deps"
echo "3. Delete package-lock.json if it exists"
echo "4. Ensure .vercelignore includes: supabase/"
echo "5. Commit all changes to Git"
echo "6. Push to GitHub"
echo ""

# Check if ready to deploy
READY=true

if ! grep -q '"supabase"' tsconfig.json; then
    READY=false
fi

if ! grep -q '"scripts"' tsconfig.json; then
    READY=false
fi

if ! grep -q 'installCommand' vercel.json; then
    READY=false
fi

if [ "$READY" = true ]; then
    echo "✅ Configuration looks good!"
    echo ""
    echo "Next steps:"
    echo "  git add tsconfig.json vercel.json"
    echo "  git commit -m 'fix: exclude supabase from TypeScript compilation'"
    echo "  git push origin main"
else
    echo "❌ Configuration needs fixes (see above)"
fi

echo ""
