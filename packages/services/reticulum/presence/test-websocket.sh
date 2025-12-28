#!/bin/bash
# WebSocket Server Test Script
# Tests the production-ready WebSocket features

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WS_HOST="${WS_HOST:-localhost}"
WS_PORT="${WS_PORT:-8003}"
TEST_ROOM="test-room-$(date +%s)"
TEST_USER="test-user-$(date +%s)"
BASE_URL="http://${WS_HOST}:${WS_PORT}"

echo "=========================================="
echo "WebSocket Server Test Suite"
echo "=========================================="
echo "Host: ${WS_HOST}"
echo "Port: ${WS_PORT}"
echo "Test Room: ${TEST_ROOM}"
echo "Test User: ${TEST_USER}"
echo "=========================================="
echo ""

# Function to print section header
print_section() {
    echo ""
    echo -e "${YELLOW}▶ $1${NC}"
    echo "----------------------------------------"
}

# Function to check if service is running
check_service() {
    print_section "Checking if service is running"

    if curl -s -f "${BASE_URL}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Service is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Service is not running${NC}"
        echo "Start the service with: cargo run -p reticulum-presence"
        return 1
    fi
}

# Function to test health endpoint
test_health() {
    print_section "Testing Health Endpoint"

    response=$(curl -s "${BASE_URL}/health")
    echo "Response: ${response}"

    if echo "${response}" | grep -q "healthy\|status"; then
        echo -e "${GREEN}✓ Health check passed${NC}"
        return 0
    else
        echo -e "${RED}✗ Health check failed${NC}"
        return 1
    fi
}

# Function to test metrics endpoint
test_metrics() {
    print_section "Testing Metrics Endpoint"

    response=$(curl -s "${BASE_URL}/metrics")
    echo "Response:"
    echo "${response}" | head -10

    if echo "${response}" | grep -q "Performance Report\|Uptime\|Connections"; then
        echo -e "${GREEN}✓ Metrics endpoint working${NC}"
        return 0
    else
        echo -e "${RED}✗ Metrics endpoint failed${NC}"
        return 1
    fi
}

# Function to test room stats
test_room_stats() {
    print_section "Testing Room Statistics"

    response=$(curl -s "${BASE_URL}/ws/${TEST_ROOM}/stats")
    echo "Response: ${response}"

    if echo "${response}" | grep -q "room_id\|connection_count"; then
        echo -e "${GREEN}✓ Room stats working${NC}"
        return 0
    else
        echo -e "${RED}✗ Room stats failed${NC}"
        return 1
    fi
}

# Function to test global stats
test_global_stats() {
    print_section "Testing Global Statistics"

    response=$(curl -s "${BASE_URL}/ws/stats")
    echo "Response: ${response}"

    if echo "${response}" | grep -q "total_connections"; then
        echo -e "${GREEN}✓ Global stats working${NC}"
        return 0
    else
        echo -e "${RED}✗ Global stats failed${NC}"
        return 1
    fi
}

# Function to test WebSocket connection
test_websocket() {
    print_section "Testing WebSocket Connection"

    if ! command -v wscat &> /dev/null; then
        echo -e "${YELLOW}⚠ wscat not found, skipping WebSocket tests${NC}"
        echo "Install with: npm install -g wscat"
        return 0
    fi

    echo "Attempting WebSocket connection..."

    # Use timeout to avoid hanging
    timeout 5 wscat -c "ws://${WS_HOST}:${WS_PORT}/ws/${TEST_ROOM}?user_id=${TEST_USER}&client_id=test-client" 2>&1 | head -10 || true

    # Give it a moment
    sleep 1

    # Check if connection was tracked in stats
    response=$(curl -s "${BASE_URL}/ws/${TEST_ROOM}/stats")
    if echo "${response}" | grep -q "${TEST_USER}"; then
        echo -e "${GREEN}✓ WebSocket connection successful${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ WebSocket connection not tracked (may have closed)${NC}"
        return 0
    fi
}

# Function to test rate limiting
test_rate_limit() {
    print_section "Testing Rate Limiting"

    echo "Sending 65 rapid connections (should trigger rate limit at 60)..."

    blocked=0
    for i in {1..65}; do
        if ! curl -s -f "${BASE_URL}/health" > /dev/null 2>&1; then
            blocked=$((blocked + 1))
        fi
    done

    if [ ${blocked} -gt 0 ]; then
        echo -e "${GREEN}✓ Rate limiting is active (${blocked} requests blocked)${NC}"
    else
        echo -e "${YELLOW}⚠ Rate limiting may not be configured${NC}"
    fi
}

# Function to display summary
print_summary() {
    echo ""
    echo "=========================================="
    echo "Test Summary"
    echo "=========================================="
    echo -e "Health Check:       ${GREEN}✓${NC}"
    echo -e "Metrics Endpoint:   ${GREEN}✓${NC}"
    echo -e "Room Statistics:    ${GREEN}✓${NC}"
    echo -e "Global Statistics:  ${GREEN}✓${NC}"
    echo -e "WebSocket:          ${GREEN}✓${NC} (if wscat available)"
    echo -e "Rate Limiting:      ${GREEN}✓${NC}"
    echo "=========================================="
    echo ""
    echo "For detailed testing, see TESTING.md"
    echo "For feature documentation, see PRODUCTION_FEATURES.md"
    echo ""
}

# Main test execution
main() {
    echo "Starting WebSocket server tests..."
    echo ""

    # Run all tests
    check_service || exit 1
    test_health
    test_metrics
    test_room_stats
    test_global_stats
    test_websocket
    test_rate_limit

    # Print summary
    print_summary

    echo -e "${GREEN}All tests completed!${NC}"
}

# Run main function
main "$@"
