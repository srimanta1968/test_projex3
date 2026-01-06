#!/bin/bash
#===============================================================================
# ProjexLight MCP Server Setup Script
#===============================================================================
# This script manages both DEV and TEST MCP Server Docker containers.
#
# Usage:
#   ./setup-mcp.sh start [dev|test|all]   - Start MCP server(s)
#   ./setup-mcp.sh stop [dev|test|all]    - Stop MCP server(s)
#   ./setup-mcp.sh restart [dev|test|all] - Restart MCP server(s)
#   ./setup-mcp.sh status                 - Check all server status
#   ./setup-mcp.sh logs [dev|test]        - View server logs
#   ./setup-mcp.sh update [dev|test|all]  - Pull latest images and restart
#
# Default target: dev
#===============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_msg() {
    local color=$1
    local msg=$2
    echo -e "${color}${msg}${NC}"
}

print_header() {
    echo ""
    print_msg "$BLUE" "=============================================="
    print_msg "$BLUE" "$1"
    print_msg "$BLUE" "=============================================="
}

check_prerequisites() {
    if ! command -v docker &> /dev/null; then
        print_msg "$RED" "[ERROR] Docker is not installed"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_msg "$RED" "[ERROR] Docker daemon is not running"
        exit 1
    fi
}

manage_dev() {
    local action=$1
    "$SCRIPT_DIR/setup-dev-mcp.sh" "$action"
}

manage_test() {
    local action=$1
    "$SCRIPT_DIR/setup-test-mcp.sh" "$action"
}

start_servers() {
    local target=${1:-dev}

    case "$target" in
        dev)
            manage_dev start
            ;;
        test)
            manage_test start
            ;;
        all)
            print_header "Starting All MCP Servers"
            manage_dev start
            echo ""
            manage_test start
            ;;
        *)
            print_msg "$RED" "[ERROR] Invalid target: $target"
            exit 1
            ;;
    esac
}

stop_servers() {
    local target=${1:-dev}

    case "$target" in
        dev)
            manage_dev stop
            ;;
        test)
            manage_test stop
            ;;
        all)
            print_header "Stopping All MCP Servers"
            manage_dev stop
            echo ""
            manage_test stop
            ;;
        *)
            print_msg "$RED" "[ERROR] Invalid target: $target"
            exit 1
            ;;
    esac
}

restart_servers() {
    local target=${1:-dev}

    case "$target" in
        dev)
            manage_dev restart
            ;;
        test)
            manage_test restart
            ;;
        all)
            print_header "Restarting All MCP Servers"
            manage_dev restart
            echo ""
            manage_test restart
            ;;
        *)
            print_msg "$RED" "[ERROR] Invalid target: $target"
            exit 1
            ;;
    esac
}

show_status() {
    print_header "MCP Server Status"
    echo ""

    print_msg "$BLUE" "=== DEV MCP Server ==="
    manage_dev status 2>/dev/null || print_msg "$RED" "[NOT CONFIGURED]"

    echo ""
    print_msg "$BLUE" "=== TEST MCP Server ==="
    manage_test status 2>/dev/null || print_msg "$RED" "[NOT CONFIGURED]"
}

show_logs() {
    local target=${1:-dev}

    case "$target" in
        dev)
            manage_dev logs
            ;;
        test)
            manage_test logs
            ;;
        *)
            print_msg "$RED" "[ERROR] Specify 'dev' or 'test' for logs"
            exit 1
            ;;
    esac
}

update_servers() {
    local target=${1:-dev}

    case "$target" in
        dev)
            manage_dev update
            ;;
        test)
            manage_test update
            ;;
        all)
            print_header "Updating All MCP Servers"
            manage_dev update
            echo ""
            manage_test update
            ;;
        *)
            print_msg "$RED" "[ERROR] Invalid target: $target"
            exit 1
            ;;
    esac
}

show_usage() {
    echo ""
    echo "ProjexLight MCP Server Management"
    echo "=================================="
    echo ""
    echo "Usage: $0 <command> [target]"
    echo ""
    echo "Commands:"
    echo "  start [dev|test|all]    - Start MCP server(s)"
    echo "  stop [dev|test|all]     - Stop MCP server(s)"
    echo "  restart [dev|test|all]  - Restart MCP server(s)"
    echo "  status                  - Check all server status"
    echo "  logs [dev|test]         - View server logs"
    echo "  update [dev|test|all]   - Pull latest images and restart"
    echo ""
    echo "Targets:"
    echo "  dev   - Development MCP (port 8766) - code analysis, review"
    echo "  test  - Test/UI MCP (port 8000) - UI testing, test execution"
    echo "  all   - Both servers"
    echo ""
    echo "Examples:"
    echo "  $0 start dev          # Start dev MCP only"
    echo "  $0 start all          # Start both MCP servers"
    echo "  $0 status             # Check status of all servers"
    echo "  $0 logs test          # View test MCP logs"
    echo "  $0 update all         # Update all servers to latest"
    echo ""
}

# Main
check_prerequisites

case "${1:-}" in
    start)
        start_servers "${2:-dev}"
        ;;
    stop)
        stop_servers "${2:-dev}"
        ;;
    restart)
        restart_servers "${2:-dev}"
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "${2:-dev}"
        ;;
    update)
        update_servers "${2:-dev}"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
