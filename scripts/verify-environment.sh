#!/usr/bin/env bash
# AI-Native Test Automation Engineering - environment validator (macOS / Linux).
# Read-only: checks tools, Git identity, and connectivity. Changes nothing.
# Usage: bash scripts/verify-environment.sh

set -u

PASS=0
WARN=0
FAIL=0

if [ -t 1 ]; then
  C_OK=$'\033[32m'; C_WARN=$'\033[33m'; C_FAIL=$'\033[31m'; C_OFF=$'\033[0m'
else
  C_OK=""; C_WARN=""; C_FAIL=""; C_OFF=""
fi

ok()   { PASS=$((PASS + 1)); printf '  %s[ OK ]%s %s\n' "$C_OK" "$C_OFF" "$1"; }
warn() { WARN=$((WARN + 1)); printf '  %s[WARN]%s %s\n' "$C_WARN" "$C_OFF" "$1"; }
fail() { FAIL=$((FAIL + 1)); printf '  %s[FAIL]%s %s\n' "$C_FAIL" "$C_OFF" "$1"; }
section() { printf '\n%s\n' "$1"; }

have() { command -v "$1" >/dev/null 2>&1; }

check_url() {
  local name="$1" url="$2" required="$3" code
  if ! have curl; then
    warn "$name: curl not available, check $url in a browser"
    return
  fi
  code=$(curl -sS -o /dev/null -L --max-time 15 -w '%{http_code}' "$url" 2>/dev/null) || code="000"
  if [ "$code" != "000" ] && [ "$code" -lt 500 ]; then
    ok "$name reachable ($url, HTTP $code)"
  elif [ "$required" = "required" ]; then
    fail "$name unreachable ($url). Check VPN/proxy/firewall - see docs/troubleshooting.md"
  else
    warn "$name unreachable ($url). Check VPN/proxy/firewall - see docs/troubleshooting.md"
  fi
}

printf 'AI-Native Test Automation Engineering - Environment Check\n'
printf 'Platform: %s\n' "$(uname -s) $(uname -m)"

section "1. Software"
if have node; then
  NODE_VERSION=$(node -v 2>/dev/null)
  NODE_MAJOR=${NODE_VERSION#v}; NODE_MAJOR=${NODE_MAJOR%%.*}
  if [ "$NODE_MAJOR" -ge 20 ] 2>/dev/null && [ $((NODE_MAJOR % 2)) -eq 0 ]; then
    ok "Node.js $NODE_VERSION"
  else
    warn "Node.js $NODE_VERSION - install an LTS release (even major version, 20 or newer)"
  fi
else
  fail "Node.js not found - see docs/troubleshooting.md#node-command-not-found"
fi

if have npm; then
  ok "npm $(npm -v 2>/dev/null)"
else
  fail "npm not found - see docs/troubleshooting.md#npm-command-not-found"
fi

if have npx; then
  ok "npx available"
else
  fail "npx not found - reinstall Node.js LTS"
fi

if have git; then
  ok "$(git --version 2>/dev/null)"
else
  fail "Git not found - see docs/troubleshooting.md#git-command-not-found"
fi

section "2. Git identity"
if have git; then
  GIT_NAME=$(git config --global user.name 2>/dev/null || true)
  GIT_EMAIL=$(git config --global user.email 2>/dev/null || true)
  if [ -n "$GIT_NAME" ]; then ok "user.name is set ($GIT_NAME)"; else warn "user.name not set - run: git config --global user.name \"Your Name\""; fi
  if [ -n "$GIT_EMAIL" ]; then ok "user.email is set ($GIT_EMAIL)"; else warn "user.email not set - run: git config --global user.email \"you@example.com\""; fi
else
  warn "Skipped - Git not installed"
fi

section "3. npm registry"
if have npm; then
  if npm ping >/dev/null 2>&1; then
    ok "npm ping succeeded ($(npm config get registry 2>/dev/null))"
  else
    fail "npm ping failed - see docs/troubleshooting.md#npm-ping-fails"
  fi
else
  warn "Skipped - npm not installed"
fi

section "4. Connectivity"
check_url "GitHub"              "https://github.com"              required
check_url "npm registry"        "https://registry.npmjs.org"      required
check_url "Playwright docs"     "https://playwright.dev"          required
check_url "Playwright browsers" "https://cdn.playwright.dev"      optional
check_url "SauceDemo"           "https://www.saucedemo.com"       required
check_url "DummyJSON"           "https://dummyjson.com/products/1" required
check_url "ReqRes"              "https://reqres.in"               optional

section "Summary"
printf '  Passed: %d  Warnings: %d  Failed: %d\n\n' "$PASS" "$WARN" "$FAIL"

if [ "$FAIL" -gt 0 ]; then
  printf '%sNOT READY%s - fix the failed checks. See docs/troubleshooting.md\n' "$C_FAIL" "$C_OFF"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  printf '%sREADY WITH WARNING%s - review the warnings before Lab 0.\n' "$C_WARN" "$C_OFF"
  exit 0
else
  printf '%sREADY%s - your environment is prepared for Lab 0.\n' "$C_OK" "$C_OFF"
  exit 0
fi
