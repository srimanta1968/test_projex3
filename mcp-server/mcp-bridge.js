#!/usr/bin/env node
/**
 * ProjexLight MCP Stdio Bridge
 *
 * Bridges MCP JSON-RPC protocol to ProjexLight HTTP API
 *
 * Usage:
 *   node mcp-bridge.js
 *
 * Environment Variables:
 *   MCP_SERVER_URL - HTTP API URL (default: http://localhost:8766)
 *   SESSION_TOKEN - Encrypted session token for authentication (required)
 *   PROJECT_ID - Project UUID for authentication (required)
 */

const http = require('http');
const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Configuration
// MCP_SERVER_URL points to the LOCAL Docker MCP server (not the backend API)
// The Docker MCP server then connects to the backend API (api.projexlight.com)
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:8766';
const DEBUG = process.env.MCP_DEBUG === 'true';

// Authentication credentials - loaded from environment or .projexlight/config.json
let SESSION_TOKEN = process.env.SESSION_TOKEN || '';
let PROJECT_ID = process.env.PROJECT_ID || '';

// Project path for multi-project support
// Converts Windows paths to Unix format for Docker compatibility
let PROJECT_PATH = '';

function getProjectPath() {
  if (PROJECT_PATH) return PROJECT_PATH;

  // Get current working directory
  let cwd = process.cwd();

  // Convert Windows path to Unix format (C:\Users\name -> /c/Users/name)
  cwd = cwd.replace(/\\/g, '/');
  if (cwd.length >= 2 && cwd[1] === ':') {
    const drive = cwd[0].toLowerCase();
    cwd = '/' + drive + cwd.slice(2);
  }

  PROJECT_PATH = cwd;
  if (DEBUG) {
    console.error(`[MCP Bridge] Detected project path: ${PROJECT_PATH}`);
  }
  return PROJECT_PATH;
}

// Try to load credentials from config file (NOT the API URL - that's always localhost)
function loadCredentialsFromConfig() {
  const configPaths = [
    path.join(process.cwd(), '.projexlight', 'config.json'),
    path.join(process.cwd(), 'mcp-server', 'config.json'),
  ];

  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        // Load session token if not set via environment
        if (config.sessionToken && !SESSION_TOKEN) {
          SESSION_TOKEN = config.sessionToken;
        }

        // Load project ID if not set via environment
        if (config.projectId && !PROJECT_ID) {
          PROJECT_ID = config.projectId;
        }

        if (DEBUG) {
          console.error(`[MCP Bridge] Loaded credentials from ${configPath}`);
        }
        break;
      }
    } catch (e) {
      // Ignore config loading errors
    }
  }
}

loadCredentialsFromConfig();

// Tool definitions for MCP protocol
// projectPath is optional but recommended for multi-project setups
const TOOLS = [
  {
    name: 'projexlight_init_session',
    description: 'Initialize code generation session and get assigned tasks. For multi-project setups, projectPath routes credentials correctly.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Unix-style path to project root (e.g., /c/Users/name/project). Auto-detected if not provided.'
        }
      },
      required: []
    }
  },
  {
    name: 'projexlight_get_instruction',
    description: 'Get detailed implementation instructions for a specific task',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The UUID of the task to get instructions for'
        },
        taskType: {
          type: 'string',
          description: 'Type of task (api_endpoint, frontend, database, etc.)',
          enum: ['api_endpoint', 'frontend', 'backend', 'database', 'service', 'ui_component', 'testing']
        },
        projectPath: {
          type: 'string',
          description: 'Unix-style path to project root for multi-project setups. Auto-detected if not provided.'
        }
      },
      required: ['taskId']
    }
  },
  {
    name: 'projexlight_validate',
    description: 'Validate generated code against quality rules',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The UUID of the task being validated'
        },
        taskType: {
          type: 'string',
          description: 'Type of task'
        },
        codeSnippets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              content: { type: 'string' }
            },
            required: ['filePath', 'content']
          },
          description: 'Array of code files to validate'
        },
        projectPath: {
          type: 'string',
          description: 'Unix-style path to project root for multi-project setups. Auto-detected if not provided.'
        }
      },
      required: ['taskId', 'codeSnippets']
    }
  },
  {
    name: 'projexlight_complete_task',
    description: 'Mark a task as complete and get the next task',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The UUID of the completed task'
        },
        metrics: {
          type: 'object',
          properties: {
            filesGenerated: { type: 'number' },
            linesOfCode: { type: 'number' },
            violationsDetected: { type: 'number' },
            complianceScore: { type: 'number' }
          },
          required: ['filesGenerated', 'linesOfCode', 'complianceScore']
        },
        projectPath: {
          type: 'string',
          description: 'Unix-style path to project root for multi-project setups. Auto-detected if not provided.'
        }
      },
      required: ['taskId', 'metrics']
    }
  },
  {
    name: 'projexlight_get_rules',
    description: 'Get code generation rules and best practices',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'projexlight_decision_tree',
    description: 'Get decision tree for specific coding scenarios',
    inputSchema: {
      type: 'object',
      properties: {
        scenario: {
          type: 'string',
          description: 'The scenario to get decision logic for',
          enum: ['file_creation', 'error_handling', 'database_query', 'api_design', 'validation']
        }
      },
      required: ['scenario']
    }
  },
  {
    name: 'projexlight_quality_gates',
    description: 'Get quality gate requirements for code validation',
    inputSchema: {
      type: 'object',
      properties: {
        taskType: {
          type: 'string',
          description: 'Type of task to get quality gates for'
        }
      },
      required: []
    }
  },
  {
    name: 'projexlight_get_template',
    description: 'Get code template for specific task type',
    inputSchema: {
      type: 'object',
      properties: {
        taskType: {
          type: 'string',
          description: 'Type of task to get template for'
        },
        framework: {
          type: 'string',
          description: 'Framework to use (express, react, etc.)'
        }
      },
      required: ['taskType']
    }
  },
  {
    name: 'projexlight_self_check',
    description: 'Get self-check validation checklist to run before writing files',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'projexlight_submit_feature_validation',
    description: 'Submit feature validation results after completing all tasks in a feature',
    inputSchema: {
      type: 'object',
      properties: {
        featureId: {
          type: 'string',
          description: 'The UUID of the feature being validated'
        },
        status: {
          type: 'string',
          enum: ['validated', 'validation_failed', 'partial'],
          description: 'Validation status: validated (all pass), validation_failed (any fail), partial (some incomplete)'
        },
        overallResult: {
          type: 'string',
          enum: ['pass', 'fail', 'partial'],
          description: 'Overall result: pass (all criteria met), fail (criteria not met), partial (some criteria met)'
        },
        acceptanceCriteriaResults: {
          type: 'array',
          description: 'Results for each acceptance criterion',
          items: {
            type: 'object',
            properties: {
              criterion: { type: 'string' },
              status: { type: 'string', enum: ['implemented', 'partial', 'not_implemented'] },
              notes: { type: 'string' }
            }
          }
        },
        scenarioResults: {
          type: 'array',
          description: 'Results for each test scenario',
          items: {
            type: 'object',
            properties: {
              scenarioId: { type: 'string' },
              status: { type: 'string', enum: ['pass', 'fail', 'partial'] },
              issues: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      },
      required: ['featureId', 'status', 'overallResult']
    }
  },
  {
    name: 'projexlight_get_pending_violations',
    description: 'Get pending coding violations from pre-commit hook. Call after git commit to check for issues that need fixing.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'projexlight_clear_violations',
    description: 'Clear pending violations after fixing. Call after fixing all issues and before git commit --amend.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'projexlight_get_pending_test_failures',
    description: 'Get pending test failures from pre-push hook. Call after git push attempt to check for failed tests. Returns auto-marked manual tests and failures requiring fix.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'projexlight_clear_test_failures',
    description: 'Clear pending test failures after fixing. Call after all tests pass before pushing again.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'projexlight_mark_test_manual',
    description: 'Mark a specific test as manual (requires user approval). Only use after 3+ failures and user confirmation.',
    inputSchema: {
      type: 'object',
      properties: {
        apiDefinitionPath: {
          type: 'string',
          description: 'Path to the api_definition JSON file'
        },
        testName: {
          type: 'string',
          description: 'Name of the test case to mark as manual'
        },
        reason: {
          type: 'string',
          description: 'Reason for marking as manual test'
        }
      },
      required: ['apiDefinitionPath', 'reason']
    }
  },
  {
    name: 'projexlight_reset_failure_counts',
    description: 'Reset failure counts for all tests. Use after major code changes or environment fixes.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'projexlight_set_context',
    description: 'Set project context for multi-project setups. Call once at start of session to ensure correct credentials are used.',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Unix-style path to project root (e.g., /c/Users/name/project)'
        }
      },
      required: ['projectPath']
    }
  },
  {
    name: 'projexlight_get_context',
    description: 'Get current project context. Shows which project credentials are active.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

// Map MCP tool names to HTTP endpoints
// These paths match the Docker MCP server routes (without /mcp/ prefix)
// The Docker server handles forwarding to the backend API if needed
const TOOL_ENDPOINTS = {
  'projexlight_init_session': { method: 'POST', path: '/api/instruction/init' },
  'projexlight_get_instruction': { method: 'POST', path: '/api/instruction/get' },
  'projexlight_validate': { method: 'POST', path: '/api/instruction/validate' },
  'projexlight_complete_task': { method: 'POST', path: '/api/instruction/complete' },
  'projexlight_get_rules': { method: 'GET', path: '/api/instruction/rules' },
  'projexlight_decision_tree': { method: 'POST', path: '/api/instruction/decision-tree' },
  'projexlight_quality_gates': { method: 'POST', path: '/api/instruction/quality-gates' },
  'projexlight_get_template': { method: 'POST', path: '/api/instruction/template' },
  'projexlight_self_check': { method: 'GET', path: '/api/instruction/self-check' },
  'projexlight_submit_feature_validation': { method: 'POST', path: '/api/instruction/submit-feature-validation' },
  'projexlight_get_pending_violations': { method: 'GET', path: '/api/instruction/pending-violations' },
  'projexlight_clear_violations': { method: 'POST', path: '/api/instruction/clear-violations' },
  'projexlight_get_pending_test_failures': { method: 'GET', path: '/api/instruction/pending-test-failures' },
  'projexlight_clear_test_failures': { method: 'POST', path: '/api/instruction/clear-test-failures' },
  'projexlight_mark_test_manual': { method: 'POST', path: '/api/instruction/mark-test-manual' },
  'projexlight_reset_failure_counts': { method: 'POST', path: '/api/instruction/reset-failure-counts' },
  'projexlight_set_context': { method: 'POST', path: '/api/context/set' },
  'projexlight_get_context': { method: 'GET', path: '/api/context/current' }
};

// HTTP request helper
function makeHttpRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    // Check if we have required credentials for authenticated endpoints
    const isAuthenticatedEndpoint = path.includes('/instruction/') && !path.includes('/health');
    if (isAuthenticatedEndpoint && (!SESSION_TOKEN || !PROJECT_ID)) {
      reject(new Error('Missing SESSION_TOKEN or PROJECT_ID. Please ensure credentials are set via environment variables or .projexlight/config.json'));
      return;
    }

    const url = new URL(path, MCP_SERVER_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (DEBUG) {
      console.error(`[MCP Bridge] ${method} ${url.href}`);
    }

    // Add authentication credentials and project context to request body
    let requestBody = body || {};
    if (isAuthenticatedEndpoint && method !== 'GET') {
      // Auto-detect project path if not provided in the request
      const projectPath = requestBody.projectPath || getProjectPath();

      requestBody = {
        ...requestBody,
        sessionToken: SESSION_TOKEN,
        projectId: PROJECT_ID,
        projectPath: projectPath  // For multi-project credential routing
      };

      if (DEBUG) {
        console.error(`[MCP Bridge] Request includes projectPath: ${projectPath}`);
      }
    }

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(json.error || json.message || `HTTP ${res.statusCode}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ raw: data });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (method !== 'GET') {
      req.write(JSON.stringify(requestBody));
    }
    req.end();
  });
}

// Check if MCP server is healthy
async function checkHealth() {
  try {
    await makeHttpRequest('GET', '/health');
    return true;
  } catch (e) {
    return false;
  }
}

// Handle MCP JSON-RPC requests
async function handleRequest(request) {
  const { jsonrpc, id, method, params } = request;

  if (jsonrpc !== '2.0') {
    return { jsonrpc: '2.0', id, error: { code: -32600, message: 'Invalid JSON-RPC version' } };
  }

  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'projexlight-mcp-bridge',
              version: '1.0.0'
            }
          }
        };

      case 'initialized':
        // Notification, no response needed
        return null;

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: TOOLS
          }
        };

      case 'tools/call':
        const { name, arguments: args } = params;
        const endpoint = TOOL_ENDPOINTS[name];

        if (!endpoint) {
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Unknown tool: ${name}` }
          };
        }

        try {
          const result = await makeHttpRequest(endpoint.method, endpoint.path, args);
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            }
          };
        } catch (error) {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `Error calling ${name}: ${error.message}`
                }
              ],
              isError: true
            }
          };
        }

      case 'ping':
        return { jsonrpc: '2.0', id, result: {} };

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${method}` }
        };
    }
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: error.message }
    };
  }
}

// Main stdio loop
async function main() {
  // Check server health on startup
  const healthy = await checkHealth();
  if (!healthy) {
    console.error('[MCP Bridge] Warning: ProjexLight MCP server not reachable at ' + MCP_SERVER_URL);
    console.error('[MCP Bridge] Make sure the Docker container is running: docker-compose up -d mcp-server');
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    if (!line.trim()) return;

    try {
      const request = JSON.parse(line);
      const response = await handleRequest(request);

      if (response) {
        console.log(JSON.stringify(response));
      }
    } catch (error) {
      console.log(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error: ' + error.message }
      }));
    }
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

main().catch(error => {
  console.error('[MCP Bridge] Fatal error:', error);
  process.exit(1);
});
