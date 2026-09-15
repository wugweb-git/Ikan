#!/usr/bin/env bash
# Edge function production deploy, behind the deploy guard.
#
#   bash scripts/deploy-edge.sh
#
# The frontend and the edge function deploy separately and nothing ties them
# together. On 2026-09-15 the function was found five days stale: the Hero
# Banner and Page Manager had been removed and the frontend redeployed, but
# their backend routes were still live. Run this whenever a merge touches
# src/supabase/functions/server/.
#
# It: runs the guard; downloads the LIVE function first, so rollback restores
# exactly what was running (the live function need not match any commit);
# stages this commit; records a smoke baseline; deploys; re-smokes; and prints
# the rollback command if any smoke result changed.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1
source scripts/deploy-guard.sh

PROJECT_REF="jpfvoevxegnknxoqmwye"
FN="make-server-cc205da9"
SERVER_DIR="src/supabase/functions/server"

# A function deploy replaces the whole function, so another session's
# uncommitted server change would ship with it.
deploy_guard "$SERVER_DIR" || exit 1

WORK=$(mktemp -d /tmp/ikan-edge-XXXXXX)
ROLLBACK="$WORK/rollback"
STAGE="$WORK/stage"

write_config() {
  mkdir -p "$1/supabase/functions/$FN"
  cat > "$1/supabase/config.toml" <<EOF
[functions.$FN]
entrypoint = "./functions/$FN/index.tsx"
verify_jwt = true
EOF
}

echo "→ downloading the LIVE function for rollback"
write_config "$ROLLBACK"
( cd "$ROLLBACK" && npx supabase@latest functions download "$FN" --project-ref "$PROJECT_REF" --use-api >/dev/null 2>&1 )
if [ ! -f "$ROLLBACK/supabase/functions/$FN/index.tsx" ]; then
  echo "✗ could not download the live function — no rollback available, refusing to deploy." >&2
  exit 1
fi

echo "→ staging $(git rev-parse --short HEAD)"
write_config "$STAGE"
cp "$SERVER_DIR"/* "$STAGE/supabase/functions/$FN/"
for f in $(grep -rhoE "from '\./[^']+'" "$STAGE/supabase/functions/$FN"/*.ts* | sed "s/from '\.\///;s/'//" | sort -u); do
  if [ ! -e "$STAGE/supabase/functions/$FN/$f" ]; then
    echo "✗ import './$f' does not resolve in the flat staging copy." >&2
    exit 1
  fi
done

ANON=$(grep -oE 'publicAnonKey = "[^"]+"' src/utils/supabase/info.tsx | sed 's/.*"\(.*\)"/\1/')
BASE="https://$PROJECT_REF.supabase.co/functions/v1/$FN"
SMOKE=(/health /assessments /equip/programs /scales/moods)
smoke() {
  for p in "${SMOKE[@]}"; do
    printf '%s=%s ' "$p" "$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $ANON" "$BASE$p")"
  done
}

BEFORE=$(smoke)
echo "  smoke before: $BEFORE"

echo "→ deploying"
( cd "$STAGE" && npx supabase@latest functions deploy "$FN" --project-ref "$PROJECT_REF" --use-api 2>&1 | tail -1 )

AFTER=$(smoke)
echo "  smoke after : $AFTER"

if [ "$BEFORE" != "$AFTER" ]; then
  echo "✗ smoke results changed. Roll back with:" >&2
  echo "    cd $ROLLBACK && npx supabase@latest functions deploy $FN --project-ref $PROJECT_REF --use-api" >&2
  exit 1
fi

echo "✓ edge function deployed from $(git rev-parse --short HEAD); smoke unchanged."
echo "  Rollback copy of what was live before: $ROLLBACK"
