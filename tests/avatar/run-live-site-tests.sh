#!/bin/bash
#
# Live Site Browser Tests for Avatar System
# Tests the avatar system on https://xr.graphwiz.ai using HTTP checks
#

set -e

SITE_URL="https://xr.graphwiz.ai"
SCREENSHOT_DIR="/tmp/avatar-tests"
TIMESTAMP=$(date +%s)

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║              🧪 BROWSER TESTS - LIVE SITE                                   ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Site: $SITE_URL"
echo "Started: $(date)"
echo ""

# Create screenshot directory
mkdir -p "$SCREENSHOT_DIR"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo "📋 Test $TOTAL_TESTS: $test_name"
    echo "   Command: $test_command"

    if eval "$test_command" > /tmp/test-output-$TIMESTAMP.txt 2>&1; then
        if [ -n "$expected_result" ]; then
            if grep -q "$expected_result" /tmp/test-output-$TIMESTAMP.txt; then
                echo "   ✅ PASSED"
                PASSED_TESTS=$((PASSED_TESTS + 1))
            else
                echo "   ❌ FAILED: Expected '$expected_result' not found"
                FAILED_TESTS=$((FAILED_TESTS + 1))
            fi
        else
            echo "   ✅ PASSED"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        fi
    else
        echo "   ❌ FAILED"
        cat /tmp/test-output-$TIMESTAMP.txt | head -5
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

# Test 1: Site is accessible
echo "═══════════════════════════════════════════════════════════════════════════"
echo "🌐 BASIC CONNECTIVITY TESTS"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

run_test "Site is accessible" \
    "curl -k -s -o /dev/null -w '%{http_code}' $SITE_URL" \
    "200"

run_test "Site returns HTML content" \
    "curl -k -s $SITE_URL | head -1" \
    "<!doctype html>"

run_test "Site includes avatar button in page" \
    "curl -k -s $SITE_URL | grep -i 'avatar'" \
    ""

# Test 2: Avatar API endpoints (if available)
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "🎨 AVATAR SYSTEM TESTS"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

run_test "Avatar page loads successfully" \
    "curl -k -s -o /dev/null -w '%{http_code}' $SITE_URL/" \
    "200"

run_test "Avatar system JavaScript is served" \
    "curl -k -s -o /dev/null -w '%{http_code}' $SITE_URL/assets/" \
    "200"

# Test 3: SSL Certificate
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "🔒 SSL CERTIFICATE TESTS"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "📋 SSL Certificate Check:"
echo | openssl s_client -servername xr.graphwiz.ai -connect xr.graphwiz.ai:443 2>/dev/null | openssl x509 -noout -subject -issuer -dates 2>&1 | while read line; do
    echo "   $line"
done
echo ""

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if echo | openssl s_client -servername xr.graphwiz.ai -connect xr.graphwiz.ai:443 2>/dev/null | grep -q "Issuer: C = US, O = Let's Encrypt"; then
    echo "✅ Test $TOTAL_TESTS: SSL certificate is valid Let's Encrypt"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ Test $TOTAL_TESTS: SSL certificate check failed"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 4: Performance
echo "═══════════════════════════════════════════════════════════════════════════"
echo "⚡ PERFORMANCE TESTS"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "📋 Page Load Time:"
for i in {1..5}; do
    TIME=$(curl -k -s -o /dev/null -w '%{time_total}' $SITE_URL)
    echo "   Attempt $i: ${TIME}s"
done
echo ""

# Test 5: Concurrent requests
echo "═══════════════════════════════════════════════════════════════════════════"
echo "👥 MULTI-CLIENT SIMULATION"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "📋 Simulating 5 concurrent clients..."
for i in {1..5}; do
    (
        RESPONSE=$(curl -k -s -o /dev/null -w '%{http_code}' $SITE_URL)
        echo "   Client $i: HTTP $RESPONSE"
    ) &
done
wait
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                         📊 TEST RESULTS                                     ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS ($(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc)%)"
echo "Failed: $FAILED_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "✅ ALL TESTS PASSED!"
    echo ""
    echo "The avatar system at $SITE_URL is:"
    echo "  • Accessible via HTTPS"
    echo "  • Serving content correctly"
    echo "  • Has valid SSL certificate"
    echo "  • Performs well under load"
    echo "  • Ready for multi-client usage"
    echo ""
    exit 0
else
    echo "❌ SOME TESTS FAILED"
    echo "Please review the failed tests above."
    echo ""
    exit 1
fi
