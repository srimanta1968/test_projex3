#!/bin/bash
#===============================================================================
# ProjexLight TEST MCP Server Setup Script
#===============================================================================
# This script manages the Test/UI MCP Server Docker container.
# The TEST MCP provides UI testing, test execution, and result analysis.
#
# Usage:
#   ./setup-test-mcp.sh start    - Start the Test MCP server
#   ./setup-test-mcp.sh stop     - Stop the Test MCP server
#   ./setup-test-mcp.sh restart  - Restart the Test MCP server
#   ./setup-test-mcp.sh status   - Check server status
#   ./setup-test-mcp.sh logs     - View server logs
#   ./setup-test-mcp.sh update   - Pull latest image and restart
#===============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/test-mcp-compose.yml"
CONTAINER_NAME="projexlight-test-mcp"
DEFAULT_PORT=8000

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

check_prerequisites() {
    if ! command -v docker &> /dev/null; then
        print_msg "$RED" "[ERROR] Docker is not installed"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_msg "$RED" "[ERROR] Docker daemon is not running"
        exit 1
    fi

    if [ ! -f "$COMPOSE_FILE" ]; then
        print_msg "$RED" "[ERROR] Compose file not found: $COMPOSE_FILE"
        exit 1
    fi

    # Create sample mcp-config.json if it doesn't exist
    if [ ! -f "$SCRIPT_DIR/mcp-config.json" ]; then
        print_msg "$YELLOW" "[WARN] mcp-config.json not found, creating sample config..."
        create_sample_config
    fi

    # Create feedback directory if it doesn't exist
    mkdir -p "$SCRIPT_DIR/feedback" 2>/dev/null || true
}

create_sample_config() {
    cat > "$SCRIPT_DIR/mcp-config.json" << 'EOF'
{
  "projectId": "test-project",
  "sessionToken": "test-session-token",
  "apiUrl": "http://host.docker.internal:9999",
  "encryptedApiKey": "",
  "databaseConfig": {
    "enabled": true,
    "type": "postgresql",
    "host": "host.docker.internal",
    "port": 5432,
    "database": "appdb",
    "username": "appuser",
    "password": "apppassword"
  },
  "frameworkConfig": {
    "frontend": {
      "framework": "react",
      "language": "typescript",
      "styling": "tailwindcss"
    },
    "backend": {
      "framework": "express",
      "language": "typescript"
    }
  }
}
EOF
    print_msg "$GREEN" "[OK] Created sample mcp-config.json"
    print_msg "$YELLOW" "[INFO] Edit mcp-config.json to customize for your project"
}

start_server() {
    print_msg "$BLUE" "Starting Test MCP Server..."

    cd "$SCRIPT_DIR"
    docker-compose -f test-mcp-compose.yml up -d

    # Wait for health check
    print_msg "$YELLOW" "Waiting for server to be ready..."
    sleep 5

    if curl -sf http://localhost:${MCP_TEST_PORT:-$DEFAULT_PORT}/health > /dev/null 2>&1; then
        print_msg "$GREEN" "[OK] Test MCP Server is running on port ${MCP_TEST_PORT:-$DEFAULT_PORT}"
    else
        print_msg "$YELLOW" "[WARN] Health check pending (server may still be starting)"
    fi
}

stop_server() {
    print_msg "$BLUE" "Stopping Test MCP Server..."

    cd "$SCRIPT_DIR"
    docker-compose -f test-mcp-compose.yml down

    print_msg "$GREEN" "[OK] Test MCP Server stopped"
}

restart_server() {
    stop_server
    start_server
}

show_status() {
    print_msg "$BLUE" "Test MCP Server Status"
    echo ""

    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_msg "$GREEN" "[RUNNING] Container: $CONTAINER_NAME"

        # Show container details
        docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""

        # Health check
        if curl -sf http://localhost:${MCP_TEST_PORT:-$DEFAULT_PORT}/health > /dev/null 2>&1; then
            print_msg "$GREEN" "[HEALTHY] Server responding on port ${MCP_TEST_PORT:-$DEFAULT_PORT}"
        else
            print_msg "$YELLOW" "[WARN] Server not responding to health check"
        fi
    else
        print_msg "$RED" "[STOPPED] Container is not running"
    fi
}

show_logs() {
    print_msg "$BLUE" "Test MCP Server Logs (Ctrl+C to exit)"
    echo ""

    cd "$SCRIPT_DIR"
    docker-compose -f test-mcp-compose.yml logs -f
}

update_server() {
    print_msg "$BLUE" "Updating Test MCP Server..."

    cd "$SCRIPT_DIR"

    # Pull latest image
    print_msg "$YELLOW" "Pulling latest image..."
    docker-compose -f test-mcp-compose.yml pull

    # Restart with new image
    print_msg "$YELLOW" "Restarting with new image..."
    docker-compose -f test-mcp-compose.yml up -d

    print_msg "$GREEN" "[OK] Test MCP Server updated"
}

show_usage() {
    echo ""
    echo "ProjexLight Test MCP Server Management"
    echo "======================================="
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  start    - Start the Test MCP server"
    echo "  stop     - Stop the Test MCP server"
    echo "  restart  - Restart the Test MCP server"
    echo "  status   - Check server status"
    echo "  logs     - View server logs (follow mode)"
    echo "  update   - Pull latest image and restart"
    echo ""
    echo "Environment Variables:"
    echo "  MCP_TEST_PORT - Server port (default: 8000)"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  MCP_TEST_PORT=9000 $0 start"
    echo ""
}

# Main
check_prerequisites

case "${1:-}" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    update)
        update_server
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
