#!/bin/bash
#===============================================================================
# ProjexLight Test Runner - Main Entry Point
#===============================================================================
# Runs UI and API tests using the Test MCP Docker container
#
# Usage:
#   ./run-tests.sh ui [feature_file]     - Run UI tests
#   ./run-tests.sh api [category]        - Run API tests
#   ./run-tests.sh all                   - Run all tests
#   ./run-tests.sh status                - Check test MCP status
#
# Examples:
#   ./run-tests.sh ui                                    # All UI tests
#   ./run-tests.sh ui lead-contact-management.feature   # Single feature
#   ./run-tests.sh api                                   # All API tests
#   ./run-tests.sh api auth                              # Auth API tests only
#   ./run-tests.sh api --dataset negative               # Negative test cases
#===============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
TEST_MCP_IMAGE="${TEST_MCP_IMAGE:-projexlight/projex-test-mcp:latest}"
TEST_MCP_CONTAINER="projexlight-test-mcp"
TESTS_DIR="${PROJECT_ROOT}/tests"
RESULTS_DIR="${PROJECT_ROOT}/test-results"

print_header() {
    echo ""
    echo -e "${BLUE}=============================================="
    echo -e "$1"
    echo -e "==============================================${NC}"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi

    if [ ! -d "$TESTS_DIR" ]; then
        print_error "Tests directory not found: $TESTS_DIR"
        exit 1
    fi
}

ensure_test_mcp() {
    print_header "Ensuring Test MCP Container"

    # Check if container is running
    if docker ps --format '{{.Names}}' | grep -q "^${TEST_MCP_CONTAINER}$"; then
        print_success "Test MCP container is running"
        return 0
    fi

    # Pull latest image
    print_warning "Pulling Test MCP image..."
    docker pull "$TEST_MCP_IMAGE"

    # Start container
    print_warning "Starting Test MCP container..."
    "$SCRIPT_DIR/setup-test-mcp.sh" start

    # Wait for health check
    sleep 5
    print_success "Test MCP container started"
}

run_ui_tests() {
    local feature_file="${1:-}"

    print_header "Running UI Tests"

    mkdir -p "$RESULTS_DIR/ui"

    if [ -n "$feature_file" ]; then
        echo "  Feature: $feature_file"

        # Run single feature file
        docker exec "$TEST_MCP_CONTAINER" \
            python -m src.mcp_bdd_runner \
            --feature-file "/workspace/tests/features/$feature_file" \
            --output-dir "/results" \
            2>&1 | tee "$RESULTS_DIR/ui/${feature_file%.feature}.log"
    else
        echo "  Running all feature files..."

        # Run all feature files
        for feature in "$TESTS_DIR/features"/*.feature; do
            if [ -f "$feature" ]; then
                feature_name=$(basename "$feature")
                echo ""
                echo -e "${BLUE}>>> Feature: $feature_name${NC}"

                docker exec "$TEST_MCP_CONTAINER" \
                    python -m src.mcp_bdd_runner \
                    --feature-file "/workspace/tests/features/$feature_name" \
                    --output-dir "/results" \
                    2>&1 | tee "$RESULTS_DIR/ui/${feature_name%.feature}.log" || true
            fi
        done
    fi

    # Copy results from container
    docker cp "${TEST_MCP_CONTAINER}:/results/." "$RESULTS_DIR/ui/" 2>/dev/null || true

    print_success "UI test results saved to: $RESULTS_DIR/ui/"
}

run_api_tests() {
    local category="${1:-}"
    local dataset_type="${2:-all}"

    print_header "Running API Functional Tests"

    mkdir -p "$RESULTS_DIR/api"

    echo "  Category: ${category:-all}"
    echo "  Dataset: $dataset_type"

    # Build API definitions path
    local api_path="/workspace/tests/api_definitions"
    if [ -n "$category" ]; then
        api_path="$api_path/$category"
    fi

    # Run API tests with dataset
    docker exec "$TEST_MCP_CONTAINER" \
        python -c "
import asyncio
import json
import os
import sys
sys.path.insert(0, '/app')

from src.api_testing.api_test_runner import APIDynamicTestRunner
from src.api_testing.dataset_manager import DatasetManager

async def run_tests():
    # Load API definitions
    api_path = '$api_path'
    dataset_type = '$dataset_type'

    definitions = []

    # Walk through API definitions
    for root, dirs, files in os.walk(api_path):
        for file in sorted(files):
            if file.endswith('.json'):
                with open(os.path.join(root, file)) as f:
                    defn = json.load(f)
                    # Filter test cases by dataset type
                    if dataset_type != 'all':
                        filtered_cases = []
                        for tc in defn.get('testCases', []):
                            name = tc.get('name', '').lower()
                            if dataset_type == 'positive' and ('happy' in name or 'success' in name or tc.get('expectedStatus') == 200):
                                filtered_cases.append(tc)
                            elif dataset_type == 'negative' and ('invalid' in name or 'missing' in name or 'error' in name or tc.get('expectedStatus', 200) >= 400):
                                filtered_cases.append(tc)
                            elif dataset_type == 'all':
                                filtered_cases.append(tc)
                        defn['testCases'] = filtered_cases
                    definitions.append(defn)

    print(f'Found {len(definitions)} API definitions')

    # Initialize runner
    runner = APIDynamicTestRunner({
        'base_url': os.environ.get('API_BASE_URL', 'http://host.docker.internal:3020'),
        'timeout': 30
    })

    # Run tests
    results = await runner.run_tests(definitions)

    # Save results
    with open('/results/api_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)

    print(json.dumps(results.get('summary', {}), indent=2))
    return results

asyncio.run(run_tests())
" 2>&1 | tee "$RESULTS_DIR/api/test_run.log"

    # Copy results from container
    docker cp "${TEST_MCP_CONTAINER}:/results/api_test_results.json" "$RESULTS_DIR/api/" 2>/dev/null || true

    print_success "API test results saved to: $RESULTS_DIR/api/"
}

run_all_tests() {
    print_header "Running All Tests"

    run_ui_tests
    echo ""
    run_api_tests "" "all"

    print_header "Test Summary"
    echo "  UI Results: $RESULTS_DIR/ui/"
    echo "  API Results: $RESULTS_DIR/api/"
}

show_status() {
    print_header "Test MCP Status"
    "$SCRIPT_DIR/setup-test-mcp.sh" status
}

show_usage() {
    echo ""
    echo "ProjexLight Test Runner"
    echo "======================="
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  ui [feature_file]      - Run UI/BDD tests"
    echo "  api [category]         - Run API functional tests"
    echo "  all                    - Run all tests"
    echo "  status                 - Check Test MCP status"
    echo ""
    echo "Options:"
    echo "  --dataset <type>       - Filter tests by dataset type"
    echo "                           Types: all, positive, negative"
    echo ""
    echo "Examples:"
    echo "  $0 ui                                    # All UI tests"
    echo "  $0 ui lead-contact-management.feature   # Single feature"
    echo "  $0 api                                   # All API tests"
    echo "  $0 api auth                              # Auth API tests"
    echo "  $0 api --dataset negative               # Negative test cases"
    echo "  $0 all                                   # All tests"
    echo ""
    echo "Environment Variables:"
    echo "  TEST_MCP_IMAGE         - Docker image (default: projexlight/projex-test-mcp:latest)"
    echo "  API_BASE_URL           - API base URL for testing"
    echo ""
}

# Parse arguments
COMMAND="${1:-}"
shift || true

# Check for --dataset flag
DATASET_TYPE="all"
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dataset)
            DATASET_TYPE="$2"
            shift 2
            ;;
        *)
            FEATURE_OR_CATEGORY="$1"
            shift
            ;;
    esac
done

# Main
check_prerequisites

case "$COMMAND" in
    ui)
        ensure_test_mcp
        run_ui_tests "$FEATURE_OR_CATEGORY"
        ;;
    api)
        ensure_test_mcp
        run_api_tests "$FEATURE_OR_CATEGORY" "$DATASET_TYPE"
        ;;
    all)
        ensure_test_mcp
        run_all_tests
        ;;
    status)
        show_status
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

echo ""
print_success "Test execution complete!"
