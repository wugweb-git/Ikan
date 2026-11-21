#!/usr/bin/env bash
# Production deploy for iKAN Health WordPress Theme & Assets
#
#   bash scripts/deploy-prod.sh
#
# Deploys theme files and assets to Hostinger production server behind deploy guard,
# purges LiteSpeed & CDN caches, and verifies live HTTP responses.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1

HOSTINGER_USER="u544169507"
HOSTINGER_HOST="46.28.45.135"
HOSTINGER_PORT="65002"
HOSTINGER_KEY="$HOME/.ssh/hostinger_aw"
REMOTE_PATH="/home/u544169507/domains/ikanhealth.in/public_html"
THEME_DEST="$REMOTE_PATH/wp-content/themes/demo/"

echo "==> iKAN Health Production Deployment"

# Verify build passes
echo "→ Building Vite project..."
npm run build >/dev/null 2>&1 || { echo "✗ local build failed" >&2; exit 1; }
echo "✓ Local build successful"

# Verify Composer dependencies for Theme
if [ -f "src/product/site/themes/demo/composer.json" ] && [ ! -f "src/product/site/themes/demo/vendor/autoload.php" ]; then
  echo "→ Installing theme Composer dependencies..."
  (cd src/product/site/themes/demo && composer install --no-dev --optimize-autoloader) || { echo "✗ composer install failed" >&2; exit 1; }
fi

# Sync Theme & Data to Hostinger
echo "→ Rsyncing theme files to Hostinger ($HOSTINGER_HOST)..."
rsync -avz --delete \
  --exclude '.git*' \
  --exclude '.DS_Store' \
  -e "ssh -p $HOSTINGER_PORT -i $HOSTINGER_KEY" \
  src/product/site/themes/demo/ "$HOSTINGER_USER@$HOSTINGER_HOST:$THEME_DEST" || {
    echo "✗ Failed to rsync theme files to Hostinger" >&2
    exit 1
  }
echo "✓ Theme files synced successfully"

# Ensure Storybook symlink is active
ssh -p "$HOSTINGER_PORT" -i "$HOSTINGER_KEY" "$HOSTINGER_USER@$HOSTINGER_HOST" \
  "ln -sfn $THEME_DEST/assets/storybook $REMOTE_PATH/storybook" >/dev/null 2>&1

# Purge LiteSpeed & CDN Caches
echo "→ Purging LiteSpeed and CDN caches on server..."
ssh -p "$HOSTINGER_PORT" -i "$HOSTINGER_KEY" "$HOSTINGER_USER@$HOSTINGER_HOST" \
  "cd $REMOTE_PATH && wp litespeed-purge all" || {
    echo "⚠ Warning: LiteSpeed purge command encountered an issue" >&2
  }

# Smoke test live production endpoints
echo "→ Running live production smoke tests..."
URLS=(
  "https://ikanhealth.in/"
  "https://ikanhealth.in/login/"
  "https://ikanhealth.in/consultation/"
  "https://ikanhealth.in/assessments/"
  "https://ikanhealth.in/equip-programs/"
  "https://ikanhealth.in/join/partner/"
  "https://ikanhealth.in/burnout-cost-calculator/"
  "https://ikanhealth.in/storybook/"
)

FAILED=0
for url in "${URLS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$STATUS" = "200" ]; then
    echo "  ✓ [200] $url"
  else
    echo "  ✗ [$STATUS] $url"
    FAILED=1
  fi
done

if [ "$FAILED" -eq 1 ]; then
  echo "✗ Production smoke test failed" >&2
  exit 1
fi

echo "==> Deployment Complete & Verified Live!"
