#!/bin/bash
#
# ProjexLight Unified Server Startup Script
# Generated during CLI Export for cross-platform support
# Exit codes: 0=success, 1=deps failed, 2=build failed, 3=start failed, 4=health failed

set -e

PROJECT_TYPE="node"
FRAMEWORK="Express.js"
LANGUAGE="javascript"
SERVER_PORT="${SERVER_PORT:-3000}"
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-http://localhost:3000/health}"
BUILD_COMMAND=""
START_COMMAND="npm run dev || npm start"
INSTALL_COMMAND="npm install"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
LOG_FILE="${PROJECT_ROOT}/.projexlight/logs/server-startup.log"
PID_FILE="${PROJECT_ROOT}/.projexlight/server.pid"

mkdir -p "$(dirname "$LOG_FILE")"

log() { echo -e "$1"; echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE" 2>/dev/null || true; }
log_error() { echo -e "${RED}$1${NC}" >&2; echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE" 2>/dev/null || true; }

load_env() {
    log "${BLUE}📁 Loading environment variables...${NC}"
    for env_file in "${PROJECT_ROOT}/.env" "${PROJECT_ROOT}/server/.env" "${PROJECT_ROOT}/.env.local"; do
        if [ -f "$env_file" ]; then
            log "   Loading: $env_file"
            set -a; source "$env_file"; set +a
        fi
    done
    [ -n "$PORT" ] && SERVER_PORT="$PORT" && log "   Using PORT from .env: $SERVER_PORT"
}

install_dependencies() {
    log "${BLUE}📦 Installing dependencies...${NC}"
    cd "$PROJECT_ROOT"
    [ -z "$INSTALL_COMMAND" ] && log "   Skipping (no install command)" && return 0
    if [ "$PROJECT_TYPE" = "node" ] && [ -d "node_modules" ]; then
        log "   Dependencies already installed"; return 0
    fi
    log "   Running: $INSTALL_COMMAND"
    if ! eval "$INSTALL_COMMAND" >> "$LOG_FILE" 2>&1; then
        log_error "❌ Dependency installation failed!"; return 1
    fi
    log "${GREEN}   ✓ Dependencies installed${NC}"
}

build_project() {
    log "${BLUE}🔨 Building project...${NC}"
    cd "$PROJECT_ROOT"
    [ -z "$BUILD_COMMAND" ] && log "   Skipping (no build command)" && return 0
    log "   Running: $BUILD_COMMAND"
    if ! eval "$BUILD_COMMAND" >> "$LOG_FILE" 2>&1; then
        log_error "❌ Build/compilation failed!"; return 2
    fi
    log "${GREEN}   ✓ Build successful${NC}"
}

start_server() {
    log "${BLUE}🚀 Starting development server...${NC}"
    cd "$PROJECT_ROOT"
    [ -z "$START_COMMAND" ] && log_error "❌ No start command!" && return 3

    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        log "   Server already running (PID: $(cat "$PID_FILE"))"; return 0
    fi

    log "   Running: $START_COMMAND"
    nohup bash -c "$START_COMMAND" >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    log "   Server PID: $!"

    ELAPSED=0
    while [ $ELAPSED -lt 60 ]; do
        sleep 2; ELAPSED=$((ELAPSED + 2))
        ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null && log_error "❌ Server died!" && return 3
        curl -s "http://localhost:$SERVER_PORT" > /dev/null 2>&1 && log "${GREEN}   ✓ Server started (${ELAPSED}s)${NC}" && return 0
    done
    log_error "❌ Server timeout"; return 3
}

health_check() {
    log "${BLUE}🏥 Running health check...${NC}"
    for i in 1 2 3 4 5; do
        RESPONSE=$(curl -s --max-time 10 -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo "000")
        [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "204" ] && log "${GREEN}   ✓ Health check passed (HTTP $RESPONSE)${NC}" && return 0
        sleep 2
    done
    log_error "❌ Health check failed"; return 4
}

main() {
    log "${BLUE}ProjexLight Server Startup${NC}"
    log "Project: $PROJECT_TYPE | Framework: $FRAMEWORK"
    load_env || exit 1
    install_dependencies || exit 1
    build_project || exit 2
    start_server || exit 3
    health_check || exit 4
    log "${GREEN}✅ Server running on port $SERVER_PORT${NC}"
}

case "${1:-start}" in
    start) main ;;
    stop) [ -f "$PID_FILE" ] && kill "$(cat "$PID_FILE")" 2>/dev/null; rm -f "$PID_FILE"; log "Server stopped" ;;
    status) [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null && log "Server running" && health_check || log "Server not running" ;;
    *) echo "Usage: $0 {start|stop|status}"; exit 1 ;;
esac
