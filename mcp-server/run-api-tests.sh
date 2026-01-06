#!/bin/bash
#===============================================================================
# ProjexLight API Functional Test Runner
#===============================================================================
# Runs API functional tests with data-driven testing support
#
# Usage:
#   ./run-api-tests.sh                          # Run all API tests
#   ./run-api-tests.sh <category>               # Run category (auth, leads, etc.)
#   ./run-api-tests.sh --dataset positive       # Run positive test cases only
#   ./run-api-tests.sh --dataset negative       # Run negative test cases only
#   ./run-api-tests.sh --dataset custom.json    # Use custom dataset file
#   ./run-api-tests.sh --list                   # List all API categories
#
# Features:
#   - Data-driven testing with multiple datasets
#   - Positive/Negative test case filtering
#   - Variable chaining between tests
#   - Response validation
#   - Detailed reports
#===============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
TEST_MCP_IMAGE="${TEST_MCP_IMAGE:-projexlight/projex-test-mcp:latest}"
TEST_MCP_CONTAINER="projexlight-test-mcp"
API_DEFINITIONS_DIR="${PROJECT_ROOT}/tests/api_definitions"
DATASETS_DIR="${PROJECT_ROOT}/tests/datasets"
RESULTS_DIR="${PROJECT_ROOT}/test-results/api"

# Test options
API_BASE_URL="${API_BASE_URL:-http://host.docker.internal:3020}"
DATASET_TYPE="all"
CUSTOM_DATASET=""

print_header() {
    echo ""
    echo -e "${BLUE}=============================================="
    echo -e "$1"
    echo -e "==============================================${NC}"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

ensure_container() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${TEST_MCP_CONTAINER}$"; then
        echo -e "${YELLOW}Starting Test MCP container...${NC}"
        "$SCRIPT_DIR/setup-test-mcp.sh" start
        sleep 5
    fi
}

list_categories() {
    print_header "Available API Categories"

    if [ ! -d "$API_DEFINITIONS_DIR" ]; then
        print_fail "API definitions directory not found: $API_DEFINITIONS_DIR"
        exit 1
    fi

    echo ""
    for category in "$API_DEFINITIONS_DIR"/*/; do
        if [ -d "$category" ]; then
            category_name=$(basename "$category")
            file_count=$(find "$category" -name "*.json" | wc -l)
            echo -e "  ${CYAN}$category_name${NC} ($file_count definitions)"

            # List API endpoints
            for api_file in "$category"/*.json; do
                if [ -f "$api_file" ]; then
                    endpoint=$(grep -o '"endpoint": *"[^"]*"' "$api_file" | head -1 | sed 's/"endpoint": *"/  - /' | sed 's/"$//')
                    method=$(grep -o '"method": *"[^"]*"' "$api_file" | head -1 | sed 's/"method": *"//' | sed 's/"$//')
                    echo "    [$method] $endpoint"
                fi
            done
            echo ""
        fi
    done
}

run_category() {
    local category="$1"
    local category_path="$API_DEFINITIONS_DIR/$category"

    if [ ! -d "$category_path" ]; then
        print_fail "Category not found: $category"
        echo "Available categories:"
        ls -1 "$API_DEFINITIONS_DIR"
        exit 1
    fi

    print_header "Running API Tests: $category"

    local log_file="$RESULTS_DIR/${category}_tests.log"
    local report_file="$RESULTS_DIR/${category}_report.json"

    docker exec \
        -e API_BASE_URL="$API_BASE_URL" \
        -e DATASET_TYPE="$DATASET_TYPE" \
        "$TEST_MCP_CONTAINER" \
        python -c "
import asyncio
import json
import os
import sys
sys.path.insert(0, '/app')

from src.api_testing.api_test_runner import APIDynamicTestRunner

async def run_tests():
    category = '$category'
    dataset_type = '$DATASET_TYPE'
    api_path = '/workspace/tests/api_definitions/' + category

    definitions = []
    for file in sorted(os.listdir(api_path)):
        if file.endswith('.json'):
            with open(os.path.join(api_path, file)) as f:
                defn = json.load(f)

                # Filter by dataset type
                if dataset_type != 'all':
                    filtered = []
                    for tc in defn.get('testCases', []):
                        name = tc.get('name', '').lower()
                        status = tc.get('expectedStatus', 200)

                        if dataset_type == 'positive':
                            if status >= 200 and status < 300:
                                filtered.append(tc)
                        elif dataset_type == 'negative':
                            if status >= 400 or 'invalid' in name or 'missing' in name or 'error' in name:
                                filtered.append(tc)
                        elif dataset_type == 'happy':
                            if tc.get('priority', 99) == 1:
                                filtered.append(tc)
                    defn['testCases'] = filtered

                if defn.get('testCases'):
                    definitions.append(defn)

    print(f'Running {len(definitions)} API definitions ({dataset_type} tests)')

    runner = APIDynamicTestRunner({
        'base_url': os.environ.get('API_BASE_URL', 'http://host.docker.internal:3020'),
        'timeout': 30
    })

    results = await runner.run_tests(definitions)

    # Save results
    with open('/results/${category}_report.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)

    # Print summary
    summary = results.get('summary', {})
    print()
    print('=' * 50)
    print(f\"Total: {summary.get('total', 0)}\")
    print(f\"Passed: {summary.get('passed', 0)}\")
    print(f\"Failed: {summary.get('failed', 0)}\")
    print('=' * 50)

    return results

asyncio.run(run_tests())
" 2>&1 | tee "$log_file"

    # Copy results
    docker cp "${TEST_MCP_CONTAINER}:/results/${category}_report.json" "$RESULTS_DIR/" 2>/dev/null || true

    print_success "Results saved to: $report_file"
}

run_all_categories() {
    print_header "Running All API Tests"

    mkdir -p "$RESULTS_DIR"

    local total_passed=0
    local total_failed=0
    local categories=0

    for category in "$API_DEFINITIONS_DIR"/*/; do
        if [ -d "$category" ]; then
            category_name=$(basename "$category")
            ((categories++))

            echo ""
            echo -e "${BLUE}[$categories] $category_name${NC}"

            run_category "$category_name" || true
        fi
    done

    print_header "API Test Summary"
    echo "  Categories: $categories"
    echo "  Dataset: $DATASET_TYPE"
    echo "  Results: $RESULTS_DIR"

    # Generate combined report
    docker exec "$TEST_MCP_CONTAINER" \
        python -c "
import json
import os
from datetime import datetime

reports = []
results_dir = '/results'

for file in os.listdir(results_dir):
    if file.endswith('_report.json'):
        with open(os.path.join(results_dir, file)) as f:
            try:
                reports.append({
                    'category': file.replace('_report.json', ''),
                    'data': json.load(f)
                })
            except:
                pass

# Calculate totals
total = sum(r['data'].get('summary', {}).get('total', 0) for r in reports)
passed = sum(r['data'].get('summary', {}).get('passed', 0) for r in reports)
failed = sum(r['data'].get('summary', {}).get('failed', 0) for r in reports)

summary = {
    'timestamp': datetime.utcnow().isoformat() + 'Z',
    'dataset_type': '$DATASET_TYPE',
    'categories': len(reports),
    'total_tests': total,
    'passed': passed,
    'failed': failed,
    'pass_rate': round(passed * 100 / total, 2) if total > 0 else 0,
    'category_results': [{
        'category': r['category'],
        'total': r['data'].get('summary', {}).get('total', 0),
        'passed': r['data'].get('summary', {}).get('passed', 0),
        'failed': r['data'].get('summary', {}).get('failed', 0)
    } for r in reports]
}

with open('/results/api_summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(json.dumps(summary, indent=2))
" 2>&1 | tee "$RESULTS_DIR/summary.log"

    docker cp "${TEST_MCP_CONTAINER}:/results/api_summary.json" "$RESULTS_DIR/" 2>/dev/null || true
}

run_with_custom_dataset() {
    local dataset_file="$1"

    if [ ! -f "$dataset_file" ]; then
        # Check in datasets directory
        dataset_file="$DATASETS_DIR/$dataset_file"
    fi

    if [ ! -f "$dataset_file" ]; then
        print_fail "Dataset file not found: $1"
        exit 1
    fi

    print_header "Running with Custom Dataset"
    print_info "Dataset: $dataset_file"

    # Copy dataset to container
    docker cp "$dataset_file" "${TEST_MCP_CONTAINER}:/workspace/tests/datasets/"

    local dataset_name=$(basename "$dataset_file")

    docker exec \
        -e API_BASE_URL="$API_BASE_URL" \
        "$TEST_MCP_CONTAINER" \
        python -c "
import asyncio
import json
import os
sys.path.insert(0, '/app')

from src.api_testing.api_test_runner import APIDynamicTestRunner
from src.api_testing.dataset_manager import DatasetManager

async def run_tests():
    dm = DatasetManager('/workspace/tests/datasets')
    dataset = dm.load_json('/workspace/tests/datasets/$dataset_name')

    print(f'Loaded {len(dataset)} test data rows')

    # Load all API definitions
    api_path = '/workspace/tests/api_definitions'
    definitions = []
    for root, dirs, files in os.walk(api_path):
        for file in sorted(files):
            if file.endswith('.json'):
                with open(os.path.join(root, file)) as f:
                    definitions.append(json.load(f))

    runner = APIDynamicTestRunner({
        'base_url': os.environ.get('API_BASE_URL', 'http://host.docker.internal:3020'),
        'timeout': 30
    })

    results = await runner.run_tests(definitions, datasets=dataset)

    with open('/results/custom_dataset_report.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)

    print(json.dumps(results.get('summary', {}), indent=2))

asyncio.run(run_tests())
" 2>&1 | tee "$RESULTS_DIR/custom_dataset.log"

    docker cp "${TEST_MCP_CONTAINER}:/results/custom_dataset_report.json" "$RESULTS_DIR/" 2>/dev/null || true
}

show_usage() {
    echo ""
    echo "ProjexLight API Functional Test Runner"
    echo "======================================="
    echo ""
    echo "Usage: $0 [options] [category]"
    echo ""
    echo "Commands:"
    echo "  (no args)              - Run all API tests"
    echo "  <category>             - Run specific category (auth, leads, etc.)"
    echo "  --list                 - List all API categories"
    echo ""
    echo "Dataset Options:"
    echo "  --dataset all          - Run all test cases (default)"
    echo "  --dataset positive     - Run positive/success test cases (2xx)"
    echo "  --dataset negative     - Run negative/error test cases (4xx, 5xx)"
    echo "  --dataset happy        - Run happy path tests only (priority 1)"
    echo "  --dataset <file.json>  - Use custom dataset file"
    echo ""
    echo "Options:"
    echo "  --base-url <url>       - API base URL (default: http://localhost:3020)"
    echo ""
    echo "Environment Variables:"
    echo "  API_BASE_URL           - API base URL for testing"
    echo ""
    echo "Examples:"
    echo "  $0                                    # All tests, all datasets"
    echo "  $0 auth                               # Auth category only"
    echo "  $0 --dataset positive                 # Positive tests only"
    echo "  $0 --dataset negative                 # Negative tests only"
    echo "  $0 leads --dataset happy              # Leads happy path only"
    echo "  $0 --dataset my_test_data.json        # Custom dataset"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --list)
            list_categories
            exit 0
            ;;
        --dataset)
            DATASET_TYPE="$2"
            if [[ "$DATASET_TYPE" == *.json ]]; then
                CUSTOM_DATASET="$DATASET_TYPE"
                DATASET_TYPE="custom"
            fi
            shift 2
            ;;
        --base-url)
            API_BASE_URL="$2"
            shift 2
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        -*)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
        *)
            CATEGORY="$1"
            shift
            ;;
    esac
done

# Check prerequisites
if ! command -v docker &> /dev/null; then
    print_fail "Docker is not installed"
    exit 1
fi

# Create results directory
mkdir -p "$RESULTS_DIR"

# Ensure container is running
ensure_container

print_info "API Base URL: $API_BASE_URL"
print_info "Dataset Type: $DATASET_TYPE"

# Run tests
if [ -n "$CUSTOM_DATASET" ]; then
    run_with_custom_dataset "$CUSTOM_DATASET"
elif [ -n "$CATEGORY" ]; then
    run_category "$CATEGORY"
else
    run_all_categories
fi
