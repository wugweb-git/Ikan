#!/usr/bin/env bash
# C2 — typecheck ratchet.
#
# `npm run typecheck` reports a stable count of pre-existing errors. A stable
# number is one nobody notices rising, so a change that adds an error is
# invisible against it. This fails when the count goes UP, and tells you to
# lower the baseline when it goes down.
#
# Note tsconfig.json EXCLUDES `src/supabase`, so no edge-function code is
# typechecked at all. Lowering this baseline does not mean the server is clean.
set -euo pipefail
BASELINE_FILE="$(dirname "$0")/baselines/typecheck"
BASELINE=$(cat "$BASELINE_FILE" 2>/dev/null || echo 0)
COUNT=$(npm run typecheck 2>&1 | grep -c "error TS" || true)

if [ "$COUNT" -gt "$BASELINE" ]; then
  echo "✗ typecheck errors rose: $BASELINE -> $COUNT"
  npm run typecheck 2>&1 | grep "error TS" | tail -n "$((COUNT - BASELINE))"
  exit 1
fi
if [ "$COUNT" -lt "$BASELINE" ]; then
  echo "✓ typecheck errors fell: $BASELINE -> $COUNT — lower the baseline:"
  echo "  echo $COUNT > scripts/baselines/typecheck"
fi
echo "✓ typecheck at or below baseline ($COUNT / $BASELINE)"
