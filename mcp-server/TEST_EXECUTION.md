# ProjexLight Test Execution Guide

This guide explains how to run UI and API tests using the ProjexLight MCP Test Server.

## Table of Contents

- [Authentication](#authentication)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [MCP Server Setup](#mcp-server-setup)
- [UI Tests (Feature Files)](#ui-tests-feature-files)
- [API Functional Tests](#api-functional-tests)
- [Test Results](#test-results)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Authentication

The Test MCP supports **two authentication methods**:

### Method 1: mcp-config.json (Recommended for Developers)

When using CLI export, the `mcp-config.json` file contains encrypted API keys that are automatically decrypted:

```
your-project/
├── mcp-server/
│   ├── mcp-config.json      # Encrypted config (from CLI export)
│   └── ...
```

The Test MCP will automatically:
1. Detect `mcp-config.json` on startup
2. Decrypt using the project ID
3. Configure ProjexLight API key and LLM settings

### Method 2: Environment Variables (For QA/Production)

For QA teams running tests without CLI export, set environment variables directly:

```bash
# Required for ProjexLight API access
export PROJEXLIGHT_API_KEY=your_api_key

# Required for LLM-based self-healing
export OPENAI_API_KEY=your_openai_key

# Optional LLM settings
export LLM_PROVIDER=openai
export LLM_MODEL_REVIEW=gpt-4o-mini
```

### Priority Order

1. **mcp-config.json** - If present, used first (decrypted automatically)
2. **Environment Variables** - Fallback if no config file found

### Checking Configuration Status

```bash
# Check which auth method is active
curl http://localhost:8000/config-status
```

Response:
```json
{
  "config_source": "mcp_config",
  "has_projexlight_key": true,
  "has_llm_key": true,
  "llm_provider": "openai",
  "project_id": "d90b34b6..."
}
```

---

## Prerequisites

1. **Docker** installed and running
2. **Tests folder** with feature files and API definitions:
   ```
   your-project/
   ├── tests/
   │   ├── features/           # BDD/Gherkin feature files
   │   │   ├── lead-contact-management.feature
   │   │   └── ...
   │   └── api_definitions/    # API test definitions
   │       ├── auth/
   │       ├── leads/
   │       └── ...
   └── mcp-server/             # MCP server files (from CLI export)
       ├── setup-all.sh
       ├── run-all-tests.sh
       └── ...
   ```

---

## Quick Start

```bash
cd your-project/mcp-server

# 1. Start all MCP services
./setup-all.sh

# 2. Run all UI tests
./run-all-tests.sh ui

# 3. Run all API tests
./run-all-tests.sh api

# 4. Run ALL tests (UI + API)
./run-all-tests.sh all

# 5. Check results
ls ../test-results/
```

---

## MCP Server Setup

### Docker Hub Images

| Image | Port | Purpose |
|-------|------|---------|
| `projexlight/projex-dev-mcp` | 8766 | Code review, development assistance |
| `projexlight/projex-test-mcp` | 8000 | UI testing, API functional tests |

### Start/Stop Commands

```bash
# Start all services (recommended)
./setup-all.sh

# Check status
./setup-all.sh --status

# Start Test MCP only
./setup-test-mcp.sh start

# View logs
./setup-test-mcp.sh logs

# Stop
./setup-test-mcp.sh stop

# Update to latest image
./setup-test-mcp.sh update
```

---

## Test Runner

The `run-all-tests.sh` script provides a unified interface for all testing:

```bash
# Show help
./run-all-tests.sh

# Check Test MCP status
./run-all-tests.sh status

# Run all tests (UI + API)
./run-all-tests.sh all
```

---

## UI Tests (Feature Files)

### Run All UI Tests

```bash
./run-all-tests.sh ui
```

### Run Single Feature (by File Name)

```bash
# With .feature extension
./run-all-tests.sh ui lead-contact-management.feature

# Without extension (auto-added)
./run-all-tests.sh ui lead-contact-management
```

### UI Test Options

```bash
# Set target application URL
BASE_URL=http://localhost:3000 ./run-all-tests.sh ui

# Run with visible browser (not headless)
HEADLESS=false ./run-all-tests.sh ui

# Record video of test execution
RECORD_VIDEO=true ./run-all-tests.sh ui

# Combined options
BASE_URL=http://myapp.com HEADLESS=false RECORD_VIDEO=true ./run-all-tests.sh ui lead-contact-management.feature
```

---

## API Functional Tests

### Run All API Tests

```bash
./run-all-tests.sh api
```

### Run Specific Category

```bash
./run-all-tests.sh api auth
./run-all-tests.sh api leads
./run-all-tests.sh api activities
```

### Dataset Filtering

The API test runner supports filtering test cases by type:

```bash
# Run ALL test cases (default)
./run-all-tests.sh api --dataset all

# Run only POSITIVE tests (2xx success responses)
./run-all-tests.sh api --dataset positive

# Run only NEGATIVE tests (4xx/5xx error responses)
./run-all-tests.sh api --dataset negative
```

### Dataset Types Explained

| Dataset | Description | Example Test Cases |
|---------|-------------|-------------------|
| `all` | All test cases | Everything |
| `positive` | Success scenarios (2xx) | "Login with valid credentials" |
| `negative` | Error scenarios (4xx, 5xx) | "Login with invalid password", "Missing required field" |

### Combine Category and Dataset

```bash
# Run positive auth tests only
./run-all-tests.sh api auth --dataset positive

# Run negative leads tests only
./run-all-tests.sh api leads --dataset negative
```

### Set API Base URL

```bash
API_BASE_URL=http://localhost:3020 ./run-all-tests.sh api
API_BASE_URL=https://api.myapp.com ./run-all-tests.sh api auth
```

---

## Test Results

Results are saved to `test-results/` folder:

```
your-project/
└── test-results/
    ├── ui/
    │   ├── lead-contact-management.log
    │   ├── lead-contact-management_report.json
    │   ├── screenshots/
    │   └── summary.json
    └── api/
        ├── auth_tests.log
        ├── auth_report.json
        ├── leads_report.json
        └── api_summary.json
```

### View Results

```bash
# UI test summary
cat test-results/ui/summary.json

# API test summary
cat test-results/api/api_summary.json
```

### Sample API Summary

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "dataset_type": "all",
  "categories": 5,
  "total_tests": 25,
  "passed": 23,
  "failed": 2,
  "pass_rate": 92.0,
  "category_results": [
    { "category": "auth", "total": 3, "passed": 3, "failed": 0 },
    { "category": "leads", "total": 8, "passed": 7, "failed": 1 }
  ]
}
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | Target UI application URL |
| `API_BASE_URL` | `http://localhost:3020` | Target API base URL |
| `HEADLESS` | `true` | Run browser in headless mode |
| `RECORD_VIDEO` | `false` | Record video of UI tests |
| `TAKE_SCREENSHOTS` | `true` | Capture screenshots on failure |
| `TEST_MCP_IMAGE` | `projexlight/projex-test-mcp:latest` | Docker image |

### Example with Environment Variables

```bash
# Run UI tests against staging
BASE_URL=https://staging.myapp.com HEADLESS=false ./run-all-tests.sh ui

# Run API tests against production
API_BASE_URL=https://api.myapp.com ./run-all-tests.sh api --dataset positive
```

---

## Troubleshooting

### Test MCP container not starting

```bash
# Check Docker status
docker ps

# Pull latest image
docker pull projexlight/projex-test-mcp:latest

# Check container logs
./setup-test-mcp.sh logs
```

### Feature file not found

```bash
# Check tests directory exists
ls -la ../tests/features/
```

### API tests failing

```bash
# Check API is running
curl http://localhost:3020/health

# Run with verbose logging
docker logs projexlight-test-mcp -f
```

### Connection refused errors

```bash
# For Docker-to-host connections, use:
API_BASE_URL=http://host.docker.internal:3020 ./run-all-tests.sh api
```

---

## Feature File Format

Feature files follow Gherkin syntax with ProjexLight metadata:

```gherkin
@feature_id:0d9a7b15-2c75-4ac4-8ade-bbc8dd9e4e75
@epic_id:aa89024e-7a11-48a1-93f6-b3871c09f7cf
Feature: Lead & Contact Management
  Core functionality to manage leads and contacts.

  @scenario_id:8aa0cc8f-c800-480f-bb8a-4bc73296360f
  @scenario_type:Integration
  Scenario: Search for leads
    Given A user is logged into the CRM
    When The user searches for "John"
    Then The system displays matching leads
```

### Supported Tags

- `@feature_id:<uuid>` - Unique feature identifier
- `@scenario_id:<uuid>` - Unique scenario identifier
- `@scenario_type:<type>` - Integration, UI, API
- `@ui_test` - UI automation test
- `@api_test` - API test

---

## API Definition Format

```json
{
  "endpoint": "/api/auth/login",
  "method": "POST",
  "description": "Login with email and password",
  "category": "auth",
  "requiresAuth": false,
  "testCases": [
    {
      "name": "Login with valid credentials",
      "priority": 1,
      "payload": {
        "email": "{{cache:user.email}}",
        "password": "{{static:SecurePass123!}}"
      },
      "expectedStatus": 200
    },
    {
      "name": "Login with invalid password",
      "priority": 2,
      "payload": {
        "email": "{{static:test@example.com}}",
        "password": "{{static:wrong}}"
      },
      "expectedStatus": 401
    }
  ]
}
```

---

## Support

For issues or questions:
- Check container logs: `./setup-test-mcp.sh logs`
