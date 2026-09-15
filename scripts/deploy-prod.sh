#!/usr/bin/env bash
# Frontend production deploy, behind the deploy guard.
#
#   bash scripts/deploy-prod.sh
#
# Replaces running `npx vercel@latest deploy --prod --yes` by hand. The guard
# refuses a stale or wrong branch; the checks after the deploy refuse to call it
# done on the CLI's word, which prints a URL and exits 0 even for a failed build.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1
source scripts/deploy-guard.sh

# The whole tracked tree ships with a Vercel deploy.
deploy_guard . || exit 1

echo "→ building locally, to compare against what Vercel serves"
npm run build >/dev/null 2>&1 || { echo "✗ local build failed" >&2; exit 1; }
LOCAL_INDEX=$(grep -o 'assets/index-[A-Za-z0-9_-]*\.js' dist/index.html | head -1)

echo "→ deploying"
LOG=$(mktemp /tmp/ikan-vercel-deploy-XXXXXX.log)
npx vercel@latest deploy --prod --yes >"$LOG" 2>&1

# Track THIS deployment by its own URL, not "the newest in the list". The CLI
# can return while the build is still running, and with more than one session
# deploying, the newest row may belong to someone else.
DEPLOY_URL=$(grep -oE 'https://ikan-[a-z0-9]+-wugweb\.vercel\.app' "$LOG" | head -1)
if [ -z "$DEPLOY_URL" ]; then
  echo "✗ no deployment URL in the CLI output — see $LOG" >&2
  exit 1
fi
echo "  deployment: $DEPLOY_URL"

STATE=""
for _ in $(seq 1 36); do            # up to 6 minutes
  STATE=$(npx vercel@latest ls --prod 2>&1 | grep -F "$DEPLOY_URL" | grep -m1 -oE '● (Ready|Error|Building|Canceled|Queued|Initializing)')
  case "$STATE" in
    "● Ready") break ;;
    "● Error"|"● Canceled") echo "✗ $DEPLOY_URL ended '$STATE' — see $LOG" >&2; exit 1 ;;
  esac
  sleep 10
done
if [ "$STATE" != "● Ready" ]; then
  echo "✗ $DEPLOY_URL still '$STATE' after 6 minutes — see $LOG" >&2
  exit 1
fi

# The alias can lag the deployment by a few seconds.
LIVE_INDEX=""
for _ in $(seq 1 12); do
  LIVE_INDEX=$(curl -s https://ikanhealth.in/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js' | head -1)
  [ "$LIVE_INDEX" = "$LOCAL_INDEX" ] && break
  sleep 5
done
if [ "$LIVE_INDEX" != "$LOCAL_INDEX" ]; then
  echo "✗ live serves $LIVE_INDEX but this commit builds $LOCAL_INDEX." >&2
  echo "  Another deploy may have landed after this one — check before redeploying." >&2
  exit 1
fi

echo "✓ frontend live: $STATE, $LIVE_INDEX matches the local build of $(git rev-parse --short HEAD)."
echo "  Still grep a served chunk for a string your change must contain — a green deploy proves the build, not the feature."
