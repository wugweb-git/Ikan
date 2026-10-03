#!/usr/bin/env bash
# Lint ratchet — mirrors scripts/typecheck-ratchet.sh.
# Fails only when the problem count RISES above the recorded baseline.
# Lower the baseline whenever you clear problems; never raise it silently.
set -uo pipefail
cd "$(dirname "$0")/.."

BASELINE_FILE="scripts/baselines/lint"
BASELINE=$(cat "$BASELINE_FILE" 2>/dev/null || echo 999999)

REPORT=$(mktemp)
trap 'rm -f "$REPORT"' EXIT
npx eslint . --format json > "$REPORT" 2>/dev/null || true

COUNT=$(node -e '
  const fs = require("fs");
  let r = [];
  try { r = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); } catch { }
  console.log(r.reduce((n, f) => n + f.errorCount + f.warningCount, 0));
' "$REPORT")

echo "lint problems: $COUNT (baseline $BASELINE)"

if [ "$COUNT" -gt "$BASELINE" ]; then
  echo ""
  echo "FAIL: lint problems rose by $((COUNT - BASELINE)) above the baseline."
  echo "Fix them, or if the rise is deliberate, raise $BASELINE_FILE and say why."
  npx eslint . 2>&1 | tail -40
  exit 1
fi

if [ "$COUNT" -lt "$BASELINE" ]; then
  echo "Improved by $((BASELINE - COUNT)). Lower $BASELINE_FILE to $COUNT to lock it in."
fi
exit 0
