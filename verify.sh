#!/bin/bash
# verify.sh: Full Pipeline Verification
# Chạy trước khi declare bất kỳ feature nào done.
# Exit 0 = tất cả gates pass. Exit 1 = có gate fail.

set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

PASS=0; FAIL_COUNT=0
START_TIME=$(date +%s)

gate_pass() { echo -e "${GREEN}✓${NC} $1"; PASS=$((PASS + 1)); }
gate_fail() { echo -e "${RED}✗${NC} $1"; FAIL_COUNT=$((FAIL_COUNT + 1)); }
section() { echo ""; echo "── $1 ─────────────────────────────────"; }

echo "══════════════════════════════════════"
echo "  FULL PIPELINE VERIFICATION"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "══════════════════════════════════════"

# GATE 1: Static Analysis
section "Gate 1: Static Analysis"
npm run lint --silent 2>&1 && gate_pass "Lint (0 errors)" || gate_fail "Lint FAILED"
npm run type-check --silent 2>&1 && gate_pass "TypeScript (0 errors)" || gate_fail "TypeScript FAILED"

# GATE 2: Unit Tests
section "Gate 2: Unit Tests"
RESULT=$(npm test --silent 2>&1)
echo "$RESULT" | grep -q "× \|failing\|FAIL" && gate_fail "Unit Tests FAILED" || gate_pass "Unit Tests (all pass)"

# GATE 3: Build
section "Gate 3: Build"
npm run build --silent 2>&1 && gate_pass "Build (success)" || gate_fail "Build FAILED"

# GATE 4: Smoke Tests
section "Gate 4: Smoke Tests"
npm run test:smoke --silent 2>&1 && gate_pass "Smoke Tests" || gate_fail "Smoke Tests FAILED"

# GATE 5: E2E Tests
section "Gate 5: E2E Tests"
npm run test:e2e --silent 2>&1 && gate_pass "E2E Tests" || gate_fail "E2E Tests FAILED"

# SUMMARY VÀ QUYẾT ĐỊNH EXIT CODE
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "══════════════════════════════════════"
if [[ $FAIL_COUNT -eq 0 ]]; then
    echo -e "${GREEN}✓ ALL GATES PASSED ($PASS checks in ${DURATION}s)${NC}"
    echo "Safe to: mark features done, commit code"
    exit 0
else
    echo -e "${RED}✗ $FAIL_COUNT GATE(S) FAILED${NC}"
    echo "Do NOT mark features done or commit until fixed"
    exit 1
fi
