#!/bin/bash
#===============================================================================
# ProjexLight Test Runner
#===============================================================================
# Runs UI and API tests using the Test MCP Docker container
#
# Usage:
#   ./run-all-tests.sh ui [feature_file]     - Run UI tests
#   ./run-all-tests.sh api [category]        - Run API tests
#   ./run-all-tests.sh all                   - Run all tests
#   ./run-all-tests.sh status                - Check test MCP status
#
# Examples:
#   ./run-all-tests.sh ui                                    # All UI tests
#   ./run-all-tests.sh ui lead-contact-management.feature   # Single feature
#   ./run-all-tests.sh api                                   # All API tests
#   ./run-all-tests.sh api auth                              # Auth API tests only
#   ./run-all-tests.sh api --dataset negative               # Negative test cases
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

# Multi-project support: Get Unix-style project path for path translation
get_unix_project_path() {
    local path="$PROJECT_ROOT"
    # Convert backslashes to forward slashes
    path="${path//\\//}"
    # Convert Windows drive letter (C:/ -> /c/)
    if [[ "$path" =~ ^([A-Za-z]):(.*)$ ]]; then
        local drive="${BASH_REMATCH[1]}"
        local rest="${BASH_REMATCH[2]}"
        path="/${drive,,}${rest}"
    fi
    echo "$path"
}

# Get container workspace path for this project
# Returns /workspace for owner project, /projects/additionalN for others
get_container_workspace() {
    local unix_path=$(get_unix_project_path)

    # Check registered projects to find the container path
    local registered_dir="$SCRIPT_DIR/registered_projects"
    if [ -d "$registered_dir" ]; then
        # Check if this is the owner project
        if [ -f "$registered_dir/owner.env" ]; then
            local owner_path=$(grep "^PROJECT_PATH=" "$registered_dir/owner.env" 2>/dev/null | cut -d'=' -f2)
            if [ "$owner_path" = "$unix_path" ]; then
                echo "/workspace"
                return
            fi
        fi

        # Check additional project slots
        for slot in 1 2 3; do
            local env_file="$registered_dir/additional${slot}.env"
            if [ -f "$env_file" ]; then
                local proj_path=$(grep "^PROJECT_PATH=" "$env_file" 2>/dev/null | cut -d'=' -f2)
                if [ "$proj_path" = "$unix_path" ]; then
                    echo "/projects/additional${slot}"
                    return
                fi
            fi
        done
    fi

    # Default to /workspace if not found
    echo "/workspace"
}

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

    # Get container workspace path (multi-project aware)
    local container_workspace=$(get_container_workspace)
    echo "  Container workspace: $container_workspace"

    # Get Unix-style project path for API calls
    local unix_project_path=$(get_unix_project_path)

    # Fix Windows path separators: convert backslashes to forward slashes
    feature_file="${feature_file//\\//}"

    # Test MCP port (default 8000)
    local test_mcp_port="${MCP_TEST_PORT:-8000}"

    if [ -n "$feature_file" ]; then
        # Extract just the filename if a full path was provided
        # Handle case where backslashes were stripped by shell (testsfeatures -> tests/features)
        local feature_name=$(basename "$feature_file")

        # If the feature_name contains "features" followed by more text, path separators were stripped
        # e.g., "testsfeaturesTransaction_Tracking_Dashboard.feature" -> "Transaction_Tracking_Dashboard.feature"
        if [[ "$feature_name" == *"features"* ]]; then
            # Extract everything after "features"
            local extracted="${feature_name#*features}"
            if [ -n "$extracted" ]; then
                feature_name="$extracted"
            fi
        fi

        echo "  Feature: $feature_name"

        # Read feature file content - try multiple locations
        local feature_path=""

        # First, try direct paths
        if [ -f "$TESTS_DIR/features/$feature_name" ]; then
            feature_path="$TESTS_DIR/features/$feature_name"
        elif [ -f "$PROJECT_ROOT/tests/features/$feature_name" ]; then
            feature_path="$PROJECT_ROOT/tests/features/$feature_name"
        elif [ -f "$PROJECT_ROOT/$feature_file" ]; then
            feature_path="$PROJECT_ROOT/$feature_file"
        fi

        # If still not found, try globbing
        if [ -z "$feature_path" ]; then
            echo "  Searching for feature file..."
            local glob_result=$(find "$TESTS_DIR/features" -name "*.feature" -type f 2>/dev/null | grep -i "${feature_name%.feature}" | head -1)
            if [ -n "$glob_result" ] && [ -f "$glob_result" ]; then
                feature_path="$glob_result"
                feature_name=$(basename "$feature_path")
                echo "  Found: $feature_name"
            fi
        fi

        if [ -f "$feature_path" ]; then
            local feature_content
            feature_content=$(cat "$feature_path" | jq -Rs .)

            # Use HTTP API to run feature test (works with compiled Nuitka container)
            echo "  Running via Test MCP API..."
            curl -sf -X POST "http://localhost:${test_mcp_port}/run-feature" \
                -H "Content-Type: application/json" \
                -d "{
                    \"feature_content\": $feature_content,
                    \"projectPath\": \"$unix_project_path\",
                    \"featureFile\": \"${container_workspace}/tests/features/$feature_name\",
                    \"options\": {
                        \"screenshot_on_failure\": true,
                        \"generate_report\": true
                    }
                }" 2>&1 | tee "$RESULTS_DIR/ui/${feature_name%.feature}.log"
        else
            print_error "Feature file not found: $feature_path"
            return 1
        fi
    else
        echo "  Running all feature files..."

        # Run all feature files via HTTP API
        for feature in "$TESTS_DIR/features"/*.feature; do
            if [ -f "$feature" ]; then
                feature_name=$(basename "$feature")
                echo ""
                echo -e "${BLUE}>>> Feature: $feature_name${NC}"

                local feature_content
                feature_content=$(cat "$feature" | jq -Rs .)

                curl -sf -X POST "http://localhost:${test_mcp_port}/run-feature" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"feature_content\": $feature_content,
                        \"projectPath\": \"$unix_project_path\",
                        \"featureFile\": \"${container_workspace}/tests/features/$feature_name\",
                        \"options\": {
                            \"screenshot_on_failure\": true,
                            \"generate_report\": true
                        }
                    }" 2>&1 | tee "$RESULTS_DIR/ui/${feature_name%.feature}.log" || true
            fi
        done
    fi

    # Copy results from container (if any)
    # Multi-project: owner uses /results, additional projects use their workspace/test-results
    local container_results="/results"
    if [ "$container_workspace" != "/workspace" ]; then
        container_results="${container_workspace}/test-results"
    fi
    docker cp "${TEST_MCP_CONTAINER}:${container_results}/." "$RESULTS_DIR/" 2>/dev/null || true

    print_success "UI test results saved to: $RESULTS_DIR/ui/"
}

run_api_tests() {
    local category="${1:-}"
    local dataset_type="${2:-all}"

    print_header "Running API Functional Tests"

    mkdir -p "$RESULTS_DIR/api"

    echo "  Category: ${category:-all}"
    echo "  Dataset: $dataset_type"

    # Get container workspace path (multi-project aware)
    local container_workspace=$(get_container_workspace)
    echo "  Container workspace: $container_workspace"

    # Get Unix-style project path for API calls
    local unix_project_path=$(get_unix_project_path)

    # Test MCP port (default 8000)
    local test_mcp_port="${MCP_TEST_PORT:-8000}"

    # Build API definitions path
    local api_defs_path="$TESTS_DIR/api_definitions"
    if [ -n "$category" ]; then
        api_defs_path="$api_defs_path/$category"
    fi

    # Collect all API definition files
    local test_definitions="[]"
    if [ -d "$api_defs_path" ]; then
        echo "  Scanning: $api_defs_path"
        local json_files=$(find "$api_defs_path" -name "*.json" -type f 2>/dev/null | sort)

        for json_file in $json_files; do
            if [ -f "$json_file" ]; then
                local defn_content=$(cat "$json_file")
                # Append to test_definitions array
                test_definitions=$(echo "$test_definitions" | jq --argjson defn "$defn_content" '. + [$defn]')
                echo "    Found: $(basename "$json_file")"
            fi
        done
    else
        print_warning "API definitions directory not found: $api_defs_path"
    fi

    local defn_count=$(echo "$test_definitions" | jq 'length')
    echo "  Found $defn_count API definitions"

    if [ "$defn_count" -gt 0 ]; then
        # Use HTTP API to run API tests (works with compiled Nuitka container)
        echo "  Running via Test MCP API..."
        curl -sf -X POST "http://localhost:${test_mcp_port}/run-api-test" \
            -H "Content-Type: application/json" \
            -d "{
                \"test_definitions\": $test_definitions,
                \"projectPath\": \"$unix_project_path\",
                \"apiDefinitionsPath\": \"${container_workspace}/tests/api_definitions\",
                \"config\": {
                    \"base_url\": \"${API_BASE_URL:-http://host.docker.internal:3020}\",
                    \"timeout\": 30
                }
            }" 2>&1 | tee "$RESULTS_DIR/api/test_run.log"
    else
        echo "  No API definitions found. Skipping API tests."
    fi

    # Copy results from container (if any)
    # Multi-project: owner uses /results, additional projects use their workspace/test-results
    local container_results="/results"
    if [ "$container_workspace" != "/workspace" ]; then
        container_results="${container_workspace}/test-results"
    fi
    docker cp "${TEST_MCP_CONTAINER}:${container_results}/api_test_results.json" "$RESULTS_DIR/api/" 2>/dev/null || true

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
