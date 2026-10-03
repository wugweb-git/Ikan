#!/usr/bin/env bash
# Deploy guard — refuses a production deploy from the wrong place.
#
# Sourced by scripts/deploy-prod.sh and scripts/deploy-edge.sh. Both deploy
# tools ship the WORKING TREE, not a branch:
#
#   - `vercel deploy --prod` uploads whatever is checked out.
#   - `supabase functions deploy` uploads whatever is in the staging copy.
#
# Neither checks the branch, and a stale branch still builds, passes every
# ratchet and reports "● Ready". On 2026-09-15 a session opened on
# `page-manager-remove-admin` — already merged, 19 commits behind production —
# and deploying it would have rolled back the brand-mark unification, the mobile
# onboarding screens, the Hero Banner removal and two merged PRs with every
# check green.
#
# Checks, in order: on the production branch; no tracked uncommitted changes in
# the paths being shipped; exactly level with origin; CI green on this commit.
#
# Override (loud, for a genuine emergency only): DEPLOY_GUARD_SKIP_CI=1 skips
# the CI check. There is no override for being on the wrong branch or behind.

PROD_BRANCH="main"

deploy_guard() {
  local scope_paths=("$@")   # paths whose uncommitted changes would ship
  local fail=0

  cd "$(git rev-parse --show-toplevel)" || return 1

  local branch
  branch=$(git rev-parse --abbrev-ref HEAD)
  if [ "$branch" != "$PROD_BRANCH" ]; then
    echo "✗ on '$branch', not '$PROD_BRANCH'. Production deploys only from $PROD_BRANCH." >&2
    fail=1
  fi

  local dirty
  dirty=$(git status --porcelain --untracked-files=no -- "${scope_paths[@]}")
  if [ -n "$dirty" ]; then
    echo "✗ uncommitted changes would ship with this deploy:" >&2
    echo "$dirty" | sed 's/^/    /' >&2
    echo "  They may belong to another session. Commit or scoped-stash first (see SESSIONS.md)." >&2
    fail=1
  fi

  if ! git fetch origin "$PROD_BRANCH" --quiet; then
    echo "✗ could not fetch origin/$PROD_BRANCH — cannot confirm you are current." >&2
    fail=1
  else
    local behind ahead
    behind=$(git rev-list --count "HEAD..origin/$PROD_BRANCH")
    ahead=$(git rev-list --count "origin/$PROD_BRANCH..HEAD")
    if [ "$behind" != "0" ]; then
      echo "✗ $behind commit(s) BEHIND origin/$PROD_BRANCH. Deploying would roll production back. git pull first." >&2
      fail=1
    fi
    if [ "$ahead" != "0" ]; then
      echo "✗ $ahead commit(s) not on origin/$PROD_BRANCH. Push (and let CI run) before deploying." >&2
      fail=1
    fi
  fi

  if [ "$fail" = "0" ]; then
    if [ "${DEPLOY_GUARD_SKIP_CI:-0}" = "1" ]; then
      echo "⚠ DEPLOY_GUARD_SKIP_CI=1 — CI status NOT checked for $(git rev-parse --short HEAD)." >&2
    elif ! command -v gh >/dev/null 2>&1; then
      echo "✗ gh CLI not found — cannot confirm CI. Install gh or set DEPLOY_GUARD_SKIP_CI=1." >&2
      fail=1
    else
      local sha conclusion status
      sha=$(git rev-parse HEAD)
      status=$(gh run list --commit "$sha" --workflow CI --limit 1 --json status -q '.[0].status' 2>/dev/null)
      conclusion=$(gh run list --commit "$sha" --workflow CI --limit 1 --json conclusion -q '.[0].conclusion' 2>/dev/null)
      if [ -z "$status" ]; then
        echo "✗ no CI run found for $(git rev-parse --short HEAD). A local pass is not the check." >&2
        fail=1
      elif [ "$status" != "completed" ]; then
        echo "✗ CI for $(git rev-parse --short HEAD) is still $status. Wait for it: gh run watch" >&2
        fail=1
      elif [ "$conclusion" != "success" ]; then
        echo "✗ CI for $(git rev-parse --short HEAD) concluded '$conclusion'." >&2
        fail=1
      fi
    fi
  fi

  if [ "$fail" != "0" ]; then
    echo "Deploy refused." >&2
    return 1
  fi
  echo "✓ deploy guard: $PROD_BRANCH @ $(git rev-parse --short HEAD), level with origin, CI green."
}
