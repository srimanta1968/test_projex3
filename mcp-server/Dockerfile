# ProjexLight MCP Server Dockerfile (CLI Export Version)
# Uses PRE-COMPILED executable - NO Python source code!
# This protects intellectual property

FROM debian:bullseye-slim

# Install minimal runtime dependencies only
RUN apt-get update && apt-get install -y \
  curl \
  git \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy COMPILED executable (NO .py files!)
COPY mcp-server /app/mcp-server
RUN chmod +x /app/mcp-server

# Copy git hook templates (safe to expose - just bash scripts)
COPY templates /app/templates

# Create necessary directories
RUN mkdir -p /feedback /feedback/history /feedback/logs /workspace

# Expose MCP server port
EXPOSE 8766

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8766/health || exit 1

# Start MCP server using compiled executable
CMD ["/app/mcp-server"]
