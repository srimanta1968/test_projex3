#!/bin/bash
#===============================================================================
# ProjexLight UI Test Runner
#===============================================================================
# Runs BDD/Gherkin feature tests using Playwright Test MCP
#
# Usage:
#   ./run-ui-tests.sh                           # Run all feature tests
#   ./run-ui-tests.sh <feature_file>            # Run by feature file name
#   ./run-ui-tests.sh --feature <id_or_name>    # Run by feature ID or file name
#   ./run-ui-tests.sh --scenario <scenario_id>  # Run single scenario
#   ./run-ui-tests.sh --tag @ui_test            # Run by tag
#   ./run-ui-tests.sh --list                    # List all features with IDs
#
# Features:
#   - Run by feature ID (UUID) or feature file name
#   - Self-healing selectors with AI fallback
#   - Screenshot capture on failure
#   - Video recording (optional)
#   - Detailed HTML reports
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
FEATURES_DIR="${PROJECT_ROOT}/tests/features"
RESULTS_DIR="${PROJECT_ROOT}/test-results/ui"

# Test options
BASE_URL="${BASE_URL:-http://localhost:3000}"
HEADLESS="${HEADLESS:-true}"
RECORD_VIDEO="${RECORD_VIDEO:-false}"
TAKE_SCREENSHOTS="${TAKE_SCREENSHOTS:-true}"

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
    echo -e "${BLUE}[INFO]${NC} $1"
}

ensure_container() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${TEST_MCP_CONTAINER}$"; then
        echo -e "${YELLOW}Starting Test MCP container...${NC}"
        "$SCRIPT_DIR/setup-test-mcp.sh" start
        sleep 5
    fi
}

list_features() {
    print_header "Available Feature Files"

    if [ ! -d "$FEATURES_DIR" ]; then
        print_fail "Features directory not found: $FEATURES_DIR"
        exit 1
    fi

    local count=0
    echo ""
    printf "  %-45s %-38s\n" "FEATURE FILE" "FEATURE ID"
    printf "  %-45s %-38s\n" "$(printf '%0.s-' {1..44})" "$(printf '%0.s-' {1..36})"

    for feature in "$FEATURES_DIR"/*.feature; do
        if [ -f "$feature" ]; then
            feature_name=$(basename "$feature")
            # Extract feature ID from file
            feature_id=$(grep -m1 "@feature_id:" "$feature" | sed 's/.*@feature_id://' | tr -d '[:space:]')
            # Extract feature title from file
            title=$(grep -m1 "^Feature:" "$feature" | sed 's/Feature: //')

            printf "  %-45s %-38s\n" "$feature_name" "${feature_id:-N/A}"
            echo -e "    ${BLUE}$title${NC}"
            ((count++))
        fi
    done

    echo ""
    echo "Total: $count feature files"
    echo ""
    echo "Usage:"
    echo "  ./run-ui-tests.sh <feature_file>           # By file name"
    echo "  ./run-ui-tests.sh --feature <feature_id>   # By feature ID"
}

find_feature_by_id() {
    local feature_id="$1"

    if [ ! -d "$FEATURES_DIR" ]; then
        return 1
    fi

    # Search for feature file containing this ID
    for feature in "$FEATURES_DIR"/*.feature; do
        if [ -f "$feature" ]; then
            if grep -q "@feature_id:$feature_id" "$feature"; then
                basename "$feature"
                return 0
            fi
        fi
    done

    return 1
}

resolve_feature() {
    local input="$1"

    # Check if input looks like a UUID (feature ID)
    if [[ "$input" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]; then
        # It's a feature ID, find the file
        local found_file=$(find_feature_by_id "$input")
        if [ -n "$found_file" ]; then
            print_info "Resolved feature ID to: $found_file"
            echo "$found_file"
            return 0
        else
            print_fail "No feature file found with ID: $input"
            return 1
        fi
    else
        # It's a file name, add .feature if missing
        if [[ "$input" != *.feature ]]; then
            input="${input}.feature"
        fi
        echo "$input"
        return 0
    fi
}

run_feature() {
    local feature_file="$1"
    local feature_path

    if [[ "$feature_file" == /* ]]; then
        feature_path="$feature_file"
    else
        feature_path="$FEATURES_DIR/$feature_file"
    fi

    if [ ! -f "$feature_path" ]; then
        print_fail "Feature file not found: $feature_path"
        return 1
    fi

    local feature_name=$(basename "$feature_file" .feature)
    local log_file="$RESULTS_DIR/${feature_name}.log"
    local report_file="$RESULTS_DIR/${feature_name}_report.json"

    print_info "Running: $feature_name"

    # Read feature file content
    local feature_content
    feature_content=$(cat "$feature_path")

    # Build JSON request
    local json_request
    json_request=$(jq -n         --arg content "$feature_content"         --arg base_url "$BASE_URL"         --argjson headless "$HEADLESS"         --argjson record_video "$RECORD_VIDEO"         --argjson screenshots "$TAKE_SCREENSHOTS"         '{
            feature_content: $content,
            options: {
                base_url: $base_url,
                headless: $headless,
                record_video: $record_video,
                take_screenshots: $screenshots
            }
        }')

    # Call the HTTP API
    local response
    response=$(curl -s -w "
%{http_code}" -X POST         "http://localhost:${MCP_TEST_PORT:-8000}/run-feature"         -H "Content-Type: application/json"         -d "$json_request" 2>&1)

    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | sed '$d')

    # Save response to log and report
    echo "$body" | tee "$log_file"
    echo "$body" > "$report_file"

    # Check result
    local status=$(echo "$body" | jq -r '.status // "error"' 2>/dev/null)
    local failed_count=$(echo "$body" | jq -r '.summary.failed // 0' 2>/dev/null)
    local passed_count=$(echo "$body" | jq -r '.summary.passed // 0' 2>/dev/null)
    local total_count=$(echo "$body" | jq -r '.summary.total_steps // 0' 2>/dev/null)
    local pass_rate=$(echo "$body" | jq -r '.summary.pass_rate // 0' 2>/dev/null)

    # Extract HTML report path
    local html_report=$(echo "$body" | jq -r '.html_report // ""' 2>/dev/null)

    # Display summary
    echo ""
    echo "  ============================================"
    echo "  Test Summary for: $feature_name"
    echo "  ============================================"
    echo "  Status:     $status"
    echo "  Total:      $total_count steps"
    echo -e "  Passed:     ${GREEN}$passed_count${NC}"
    echo -e "  Failed:     ${RED}$failed_count${NC}"
    echo "  Pass Rate:  ${pass_rate}%"
    echo "  ============================================"
    echo ""
    echo "  Reports:"
    echo "    JSON: $report_file"
    if [ -n "$html_report" ] && [ "$html_report" != "null" ]; then
        echo "    HTML: $html_report"
    fi
    echo ""

    # Check for success: status is "completed" AND no failures
    if [ "$http_code" = "200" ] && [ "$status" = "completed" ] && [ "$failed_count" = "0" ]; then
        print_success "$feature_name"
        return 0
    else
        print_fail "$feature_name"
        return 1
    fi
}

run_all_features() {
    print_header "Running All UI Tests"

    mkdir -p "$RESULTS_DIR"

    local passed=0
    local failed=0
    local total=0

    for feature in "$FEATURES_DIR"/*.feature; do
        if [ -f "$feature" ]; then
            ((total++))
            feature_name=$(basename "$feature")

            echo ""
            echo -e "${BLUE}[$total] $feature_name${NC}"

            if run_feature "$feature_name"; then
                ((passed++))
            else
                ((failed++))
            fi
        fi
    done

    print_header "UI Test Summary"
    echo "  Total:  $total"
    echo -e "  ${GREEN}Passed: $passed${NC}"
    echo -e "  ${RED}Failed: $failed${NC}"
    echo ""
    echo "  Results: $RESULTS_DIR"

    # Generate summary report
    cat > "$RESULTS_DIR/summary.json" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "total": $total,
  "passed": $passed,
  "failed": $failed,
  "pass_rate": $(echo "scale=2; $passed * 100 / $total" | bc 2>/dev/null || echo "0"),
  "base_url": "$BASE_URL"
}
EOF

    return $failed
}

run_by_scenario() {
    local scenario_id="$1"

    print_header "Running Scenario: $scenario_id"

    # Find feature containing this scenario
    local feature_file=$(grep -l "@scenario_id:$scenario_id" "$FEATURES_DIR"/*.feature 2>/dev/null | head -1)

    if [ -z "$feature_file" ]; then
        print_fail "Scenario not found: $scenario_id"
        exit 1
    fi

    print_info "Found in: $(basename "$feature_file")"

    # Read feature file content
    local feature_content
    feature_content=$(cat "$feature_file")

    # Build JSON request with scenario filter
    local json_request
    json_request=$(jq -n         --arg content "$feature_content"         --arg base_url "$BASE_URL"         --arg scenario_id "$scenario_id"         '{
            feature_content: $content,
            options: {
                base_url: $base_url,
                scenario_id: $scenario_id
            }
        }')

    # Call the HTTP API
    local response
    response=$(curl -s -w "
%{http_code}" -X POST         "http://localhost:${MCP_TEST_PORT:-8000}/run-feature"         -H "Content-Type: application/json"         -d "$json_request" 2>&1)

    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | sed '$d')

    # Save response
    echo "$body" | tee "$RESULTS_DIR/scenario_${scenario_id}.log"
}

run_by_tag() {
    local tag="$1"

    print_header "Running Tests with Tag: $tag"

    mkdir -p "$RESULTS_DIR"

    # Find features with this tag
    local features=$(grep -l "$tag" "$FEATURES_DIR"/*.feature 2>/dev/null)

    if [ -z "$features" ]; then
        print_fail "No features found with tag: $tag"
        exit 1
    fi

    for feature in $features; do
        feature_name=$(basename "$feature")
        print_info "Running: $feature_name"
        run_feature "$feature_name" || true
    done
}

show_usage() {
    echo ""
    echo "ProjexLight UI Test Runner"
    echo "=========================="
    echo ""
    echo "Usage: $0 [options] [feature_file_or_id]"
    echo ""
    echo "Commands:"
    echo "  (no args)              - Run all feature tests"
    echo "  <feature_file>         - Run by feature file name"
    echo "  <feature_id>           - Run by feature UUID (auto-detected)"
    echo "  --feature <id_or_name> - Run by feature ID or file name"
    echo "  --scenario <id>        - Run specific scenario by ID"
    echo "  --tag <tag>            - Run scenarios with specific tag"
    echo "  --list                 - List all features with IDs"
    echo ""
    echo "Options:"
    echo "  --base-url <url>       - Target application URL"
    echo "  --headless             - Run in headless mode (default: true)"
    echo "  --headed               - Run with visible browser"
    echo "  --video                - Record video of test execution"
    echo "  --no-screenshots       - Disable screenshot capture"
    echo ""
    echo "Environment Variables:"
    echo "  BASE_URL               - Target application URL"
    echo "  HEADLESS               - true/false"
    echo "  RECORD_VIDEO           - true/false"
    echo "  TAKE_SCREENSHOTS       - true/false"
    echo ""
    echo "Examples:"
    echo "  $0                                              # All tests"
    echo "  $0 lead-contact-management.feature             # By file name"
    echo "  $0 lead-contact-management                     # By name (auto .feature)"
    echo "  $0 0d9a7b15-2c75-4ac4-8ade-bbc8dd9e4e75        # By feature ID"
    echo "  $0 --feature 0d9a7b15-2c75-4ac4-8ade-bbc8dd9e4e75"
    echo "  $0 --scenario 8aa0cc8f-c800-480f-bb8a-4bc73296360f"
    echo "  $0 --tag @ui_test"
    echo "  $0 --base-url http://myapp.com --headed"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --list)
            list_features
            exit 0
            ;;
        --feature)
            FEATURE_INPUT="$2"
            shift 2
            ;;
        --scenario)
            SCENARIO_ID="$2"
            shift 2
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --base-url)
            BASE_URL="$2"
            shift 2
            ;;
        --headless)
            HEADLESS="true"
            shift
            ;;
        --headed)
            HEADLESS="false"
            shift
            ;;
        --video)
            RECORD_VIDEO="true"
            shift
            ;;
        --no-screenshots)
            TAKE_SCREENSHOTS="false"
            shift
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
            FEATURE_INPUT="$1"
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

# Run tests
if [ -n "$SCENARIO_ID" ]; then
    run_by_scenario "$SCENARIO_ID"
elif [ -n "$TAG" ]; then
    run_by_tag "$TAG"
elif [ -n "$FEATURE_INPUT" ]; then
    # Resolve feature ID or file name
    FEATURE_FILE=$(resolve_feature "$FEATURE_INPUT")
    if [ $? -eq 0 ] && [ -n "$FEATURE_FILE" ]; then
        run_feature "$FEATURE_FILE"
    else
        exit 1
    fi
else
    run_all_features
fi
