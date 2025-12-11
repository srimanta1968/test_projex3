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
const TOOLS = [
  {
    name: 'projexlight_init_session',
    description: 'Initialize code generation session and get assigned tasks',
    inputSchema: {
      type: 'object',
      properties: {},
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
  'projexlight_get_template': { method: 'POST', path: '/api/instruction/template' }
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

    // Add authentication credentials to request body for authenticated endpoints
    let requestBody = body || {};
    if (isAuthenticatedEndpoint && method !== 'GET') {
      requestBody = {
        ...requestBody,
        sessionToken: SESSION_TOKEN,
        projectId: PROJECT_ID
      };
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
