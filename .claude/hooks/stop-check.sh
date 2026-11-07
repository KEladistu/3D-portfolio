#!/usr/bin/env bash
# Claude Code Stop hook: enforce the definition of done.
# Runs `npm run check` when the working tree has changes; on failure, exit 2 so Claude keeps working.
cd "$(dirname "$0")/../.." || exit 0
input=$(cat)

# Nothing changed (e.g. a question-only turn) -> nothing to check.
if git diff --quiet HEAD -- . 2>/dev/null && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  exit 0
fi

log=$(mktemp)
if npm run check --silent >"$log" 2>&1; then
  rm -f "$log"
  exit 0
fi

# Already retried once after a block: report but don't loop forever.
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  echo "npm run check is still failing — tell the user what is broken instead of claiming done." >&2
  tail -n 40 "$log" >&2
  rm -f "$log"
  exit 2
fi

tail -n 40 "$log" >&2
echo "npm run check failed. Fix the errors above before finishing (definition of done in CLAUDE.md)." >&2
rm -f "$log"
exit 2
