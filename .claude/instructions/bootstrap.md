# ProjexLight Code Generation

## 🚨 MANDATORY AI AGENT INSTRUCTIONS - READ COMPLETELY FIRST!

**YOU ARE AN AUTONOMOUS CODE GENERATION AGENT.**

You MUST follow these instructions EXACTLY. Do NOT ask the user what to do.
Do NOT skip any steps. Do NOT modify this workflow.

---

## 📋 Session Information

- **Project ID:** 69965559-eb97-4b57-82ef-d497220e7ef5
- **Sprint ID:** c700990b-2399-4e6c-b1a0-db98628d4dea
- **CLI Tool:** claude
- **Total Tasks:** 27

- **Generated:** 2025-12-11T04:27:26.911Z

---

## 🎯 EXECUTION MODES

### Mode 1: Single Task (Default)
When user says nothing or just passes this file:
- Execute Task #1, then Task #2, etc. one by one

### Mode 2: Batch Execution (User Request)
When user requests multiple tasks:
- **"Execute tasks 1-5"** or **"tasks 1 to 5"** → Tasks 1, 2, 3, 4, 5 in sequence
- **"Next 5 tasks"** → Next 5 pending tasks from current position
- **"Execute all tasks"** or **"all remaining"** → All pending tasks until done
- **"Task 3"** or **"Execute task 3"** → Only task #3
- **"Tasks 2, 5, 8"** → Specific tasks by number

### Mode 3: Resume
If tasks already have progress, continue from last incomplete task.

---

## 📊 TASK PROGRESS PERSISTENCE

**IMPORTANT: Task progress is automatically saved to the ProjexLight server.**

### How It Works:
1. When you call `projexlight_complete_task`, the task status is saved to the database
2. When you call `projexlight_init_session` next time, only PENDING tasks are returned
3. Completed tasks are automatically filtered out - you will NOT get the same task twice

### Resume After Session Ends:
- If your session ends (context limit, crash, manual stop)
- Simply start a new session and call `projexlight_init_session`
- You will automatically get the next pending task (not tasks you already completed)

### Task Statuses:
- `not_started` - Task is pending, will be returned by init_session
- `in_progress` - Currently being worked on
- `completed` - Done, will NOT be returned again

### Example Resume Flow:
```
Session 1: Completed tasks 1, 2, 3 → called complete_task for each
Session 2: Call init_session → Returns tasks 4, 5, 6... (not 1, 2, 3)
```

---

## 🚀 MANDATORY STARTUP SEQUENCE

**Execute these steps IN ORDER when you start:**

### Step 1: Initialize Session
```
Call: projexlight_init_session
Purpose: Get task list and framework config
```

### Step 2: Fetch Priority Rules (MANDATORY!)
```
Call: projexlight_get_rules (or GET /api/instruction/rules)
Purpose: Get MUST DO and MUST NOT rules
Action: MEMORIZE these rules - they apply to ALL code you write
```

### Step 3: Fetch Self-Check Checklist
```
Call: projexlight_self_check (or GET /api/instruction/self-check)
Purpose: Get pre-write validation checklist
Action: Run this checklist BEFORE writing any file
```

### Step 4: Begin Task Execution
Start with Task #1 (or user-specified task)

---

## 🔄 TASK EXECUTION WORKFLOW (FOR EACH TASK)

**Follow these 11 steps for EVERY task. Do NOT skip any step.**

### Step 1: Check for MISSING API Definitions (CRITICAL!)
```
BEFORE starting any task, scan for missing API definitions:

1. Scan server/src/routes/*.ts for all route files
2. Extract all API endpoints (GET, POST, PUT, DELETE, PATCH)
3. Check tests/api_definitions/ for corresponding JSON files
4. CREATE missing API JSON definitions FIRST

Naming Convention:
  GET /api/users      → tests/api_definitions/users/list.json
  GET /api/users/:id  → tests/api_definitions/users/get.json
  POST /api/users     → tests/api_definitions/users/create.json
  PUT /api/users/:id  → tests/api_definitions/users/update.json
  DELETE /api/users/:id → tests/api_definitions/users/delete.json

If ANY existing route is missing its API JSON → CREATE IT NOW before proceeding!
```

### Step 2: Get Task Instructions
```
Call: projexlight_get_instruction({ taskId: "<task-id>", taskType: "<type>" })
Purpose: Get detailed implementation guidance, templates, and rules
```

### Step 3: Get Decision Tree (for key decisions)
```
Call: projexlight_decision_tree({ scenario: "file_creation" })
Purpose: Determine if creating new file or extending existing
Other scenarios: "api_endpoint", "error_handling", "database_query"
```

### Step 4: Read Existing Codebase
- Search for similar files/patterns
- Check if services/routes already exist
- Identify reusable code

### Step 5: Run Self-Check (Before Writing)
Before writing ANY file, verify:
- [ ] Checked for missing API definitions? (Step 1)
- [ ] Read user-defined-schemas.sql? (if database task)
- [ ] Created API JSON definition? (if API task)
- [ ] Searched for existing similar APIs/tables?
- [ ] Reusing existing models/services?
- [ ] All imports verified (files exist)?
- [ ] Using DataService (not direct DB access)?
- [ ] No hardcoded secrets?

### Step 6: Generate Code
- Follow the task instructions exactly
- Apply ALL priority rules
- Use provided templates
- Generate COMPLETE code (no TODOs or stubs)

### Step 7: Validate Code
```
Call: projexlight_validate({
  taskId: "<task-id>",
  taskType: "<type>",
  codeSnippets: [{ filePath: "...", content: "..." }]
})
Purpose: Check code against quality rules
Action: FIX any violations before proceeding
```

### Step 8: Write Files
Only after validation passes, write the files to disk.

### Step 9: Git Commit
```bash
git add .
git commit -m "feat: <task-title> - Task #<number>

- <brief description of changes>
- Files: <list of files created/modified>

Generated by ProjexLight CLI"
```

### Step 10: Complete Task & Update Leaderboard
```
Call: projexlight_complete_task({
  taskId: "<task-id>",
  metrics: {
    filesGenerated: <count>,
    linesOfCode: <count>,
    violationsDetected: <count>,
    complianceScore: <0-100>
  }
})
Purpose: Mark task done, update leaderboard, get next task
```

### Step 11: Git Push (After Each Task or Batch)
```bash
git push origin <branch>
```
**Leaderboard is automatically updated on push via git hooks.**

---

## 📊 LEADERBOARD UPDATES

The leaderboard tracks your code generation performance:
- **Files Generated**: Number of files created
- **Lines of Code**: Total lines written
- **Compliance Score**: Code quality (0-100)
- **Violations**: Issues detected and fixed

**When leaderboard updates:**
1. ✅ After each `projexlight_complete_task` call
2. ✅ On git push (via pre-push hook)
3. ✅ On code review (via MCP code reviewer)

---

## 🔴 PRIORITY RULES (ALWAYS FOLLOW!)

### MUST DO ✅

1. **API JSON First**: Create `tests/api_definitions/{resource}/{action}.json` BEFORE writing API code
2. **Search Existing APIs**: Check `server/src/routes/` for similar endpoints before creating new ones
3. **Search Existing Tables**: Check schemas before creating new tables or columns
4. **Read Schemas First**: Check `.projexlight/schemas/user-defined-schemas.sql` before any DB work
5. **Complete Code Only**: No `// TODO`, no stubs, no placeholders - COMPLETE implementations only
6. **Reuse Existing Code**: Search codebase first, import don't recreate
7. **Self-Check Before Write**: Run validation checklist before every file write
8. **DataService Only**: Use `dataService.queryTenant()` - NEVER direct pool.query()

### MUST NOT ❌

9. **NEVER create duplicate APIs**: Search existing routes first, EXTEND don't recreate
10. **NEVER create duplicate tables**: Search existing schemas first, ADD columns don't recreate
11. **NEVER create `.env`**: Only create `.env.example` with placeholder values
12. **NEVER modify `.projexlight/`**: This folder is READ-ONLY
13. **NEVER skip validation**: Always call `projexlight_validate` before completing
14. **NEVER guess imports**: Verify file exists before importing
15. **NEVER skip API JSON**: Every API endpoint needs its JSON definition

---

## 🔍 DUPLICATE PREVENTION (CRITICAL!)

### Before Creating ANY API Endpoint:
```
STEP 1: Search server/src/routes/*.ts for similar paths
STEP 2: Search tests/api_definitions/**/*.json for similar specs
STEP 3: Check if existing endpoint can be ENHANCED instead

DUPLICATE INDICATORS:
- Same HTTP method + similar path (POST /users vs POST /user)
- Same resource with different naming (/api/products vs /api/items)
- Overlapping functionality (/users/update vs PUT /users/:id)

RESOLUTION:
- EXTEND: Add new method to existing route file
- ENHANCE: Add optional parameters to existing endpoint
- MERGE: Combine similar endpoints into one
```

### Before Creating ANY Database Table:
```
STEP 1: Read .projexlight/schemas/user-defined-schemas.sql
STEP 2: Search init-scripts/*.sql for existing tables
STEP 3: Check migrations/ for table definitions
STEP 4: Search server/src/models/ for TypeScript interfaces

DUPLICATE INDICATORS:
- Same table name (case-insensitive)
- Singular vs plural (user vs users)
- Similar entity names (customers vs clients)

RESOLUTION:
- USE EXISTING: Import and use the existing table
- ADD COLUMNS: Create migration to add new columns
- ADD RELATION: Add foreign key to existing table
```

### Before Creating ANY Service File:
```
STEP 1: Search server/src/services/ for {entity}Service.ts
STEP 2: Search server/src/modules/*/services/ for related services

RESOLUTION:
- ADD METHOD: Add new method to existing service file
- DO NOT create UserService.ts if UsersService.ts exists
```

---

## 🌳 DECISION TREES

### File Creation Decision
```
IF creating a route file:
  → Search server/src/routes/ for existing endpoint
  → Search tests/api_definitions/ for similar API
  → EXISTS? → EXTEND existing file (add method)
  → SIMILAR? → ENHANCE existing endpoint (add params)
  → NEW? → CREATE with API JSON first

IF creating a component:
  → Check components/ folder for similar (>80% match?)
  → SIMILAR? → EXTEND existing component
  → UNIQUE? → CREATE new component

IF creating a service:
  → Service with same entity exists?
  → EXISTS? → ADD method to existing service
  → NEW? → CREATE new service file

IF creating a database table:
  → Check user-defined-schemas.sql
  → Check init-scripts/*.sql
  → Check migrations/*.sql
  → EXISTS? → USE existing table
  → SIMILAR? → ADD columns via migration
  → NEW? → CREATE only if truly unique entity
```

### API Endpoint Creation
```
STEP 0: SEARCH for existing similar endpoints first!
STEP 1: Create tests/api_definitions/{resource}/{action}.json
STEP 2: Implement server/src/services/{resource}.service.ts
STEP 3: Implement server/src/routes/{resource}.routes.ts
STEP 4: Verify response matches expectedResponse in JSON
STEP 5: Update progress
```

---

## 📋 API JSON DEFINITION (MANDATORY FOR ALL ENDPOINTS)

**CRITICAL: Create this JSON file BEFORE writing any API code!**

### File Location:
`tests/api_definitions/{resource}/{action}.json`

Example: `tests/api_definitions/users/create.json`

### Input Types (Use These Labels):
| Type | Description | Example |
|------|-------------|---------|
| `dynamic` | User-provided data that varies per request | Form fields, search queries |
| `static` | Fixed values from config | Default page size, sort order |
| `cached` | Data from cache/lookup tables | Category list, country codes |
| `computed` | Generated at runtime | UUIDs, timestamps, hashes |

### Complete API JSON Example:
```json
{
  "endpoint": "/api/users",
  "method": "POST",
  "description": "Create a new user account",

  "authentication": {
    "required": true,
    "type": "bearer",
    "roles": ["admin"]
  },

  "caching": {
    "enabled": false,
    "ttl": 0,
    "strategy": "none"
  },

  "requestBody": {
    "contentType": "application/json",
    "required": ["email", "name"],
    "properties": {
      "email": {
        "type": "string",
        "inputType": "dynamic",
        "description": "User email address",
        "validation": { "format": "email", "maxLength": 255 },
        "example": "user@example.com"
      },
      "name": {
        "type": "string",
        "inputType": "dynamic",
        "description": "User full name",
        "validation": { "minLength": 1, "maxLength": 100 },
        "example": "John Doe"
      },
      "role": {
        "type": "string",
        "inputType": "static",
        "description": "User role (defaults to 'user')",
        "default": "user",
        "enum": ["user", "admin", "moderator"]
      },
      "countryCode": {
        "type": "string",
        "inputType": "cached",
        "description": "Country code from cached lookup",
        "cacheKey": "countries",
        "example": "US"
      }
    }
  },

  "expectedResponse": {
    "status": 201,
    "schema": {
      "success": true,
      "data": {
        "id": { "type": "uuid", "inputType": "computed" },
        "email": { "type": "string" },
        "name": { "type": "string" },
        "role": { "type": "string" },
        "createdAt": { "type": "datetime", "inputType": "computed" }
      }
    },
    "example": {
      "success": true,
      "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "user",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    }
  },

  "errorResponses": {
    "400": { "code": "VALIDATION_ERROR", "message": "Invalid email format" },
    "409": { "code": "CONFLICT", "message": "User already exists" },
    "500": { "code": "INTERNAL_ERROR", "message": "Failed to create user" }
  },

  "testCases": [
    {
      "name": "Happy path - create user",
      "type": "positive",
      "input": {
        "body": { "email": "test@example.com", "name": "Test User" }
      },
      "expectedStatus": 201,
      "assertions": ["response.data.id !== null"]
    },
    {
      "name": "Validation error - invalid email",
      "type": "negative",
      "input": {
        "body": { "email": "invalid-email", "name": "Test" }
      },
      "expectedStatus": 400
    },
    {
      "name": "Conflict - duplicate email",
      "type": "negative",
      "input": {
        "body": { "email": "existing@example.com", "name": "Duplicate" }
      },
      "expectedStatus": 409
    }
  ]
}
```

---

### Error Handling
```
Validation error    → 400 Bad Request
Auth required       → 401 Unauthorized
Permission denied   → 403 Forbidden
Not found           → 404 Not Found
Already exists      → 409 Conflict
Server error        → 500 Internal Server Error
```

---

## 📁 BATCH EXECUTION EXAMPLE

When user says: **"Execute tasks 1-3"**

```
1. projexlight_init_session → Get all tasks
2. projexlight_get_rules → Memorize rules

FOR task 1:
  3. projexlight_get_instruction({ taskId: task1.id })
  4. projexlight_decision_tree({ scenario: "file_creation" })
  5. [Generate code following rules]
  6. projexlight_validate({ taskId: task1.id, codeSnippets: [...] })
  7. [Write files]
  8. git add . && git commit -m "feat: Task 1 - ..."
  9. projexlight_complete_task({ taskId: task1.id, metrics: {...} })

FOR task 2:
  10. projexlight_get_instruction({ taskId: task2.id })
  ... [repeat steps 4-9]

FOR task 3:
  ... [repeat steps 4-9]

AFTER batch complete:
  git push origin <branch>  ← Triggers leaderboard update
```

---

## 🤖 Claude Code Setup

**Claude Code has native MCP support!**

### Quick Setup (One-Time):
1. The `.mcp.json` file is already configured in the project root
2. Start the MCP server: `cd mcp-server && docker-compose up -d`
3. Claude Code will automatically detect and use the MCP tools

### 🚀 HOW TO START A SESSION

#### First Session (Fresh Start):
```bash
# In your terminal, navigate to project and run Claude Code:
cd <project-folder>
claude

# Then tell Claude:
"Read .claude/instructions/bootstrap.md and start executing tasks"
```

#### Resume Session (Continue from where you left off):
```bash
# Same as above - Claude will auto-detect progress:
cd <project-folder>
claude

# Tell Claude:
"Resume the ProjexLight sprint"
# OR
"Continue with the next task"
# OR
"Read .claude/instructions/bootstrap.md and continue"
```

#### Batch Execution:
```bash
# Tell Claude:
"Execute tasks 1-5"
"Next 3 tasks"
"Execute all remaining tasks"
```

### MCP Config Location:
- Project: `.mcp.json` (already configured)
- Desktop app: Copy `claude_desktop_config.json` to your Claude Desktop settings

### Available MCP Tools:
- `projexlight_init_session` - Initialize/resume session
- `projexlight_get_rules` - Get priority rules (MUST call first!)
- `projexlight_get_instruction` - Get task details
- `projexlight_validate` - Validate code before writing
- `projexlight_complete_task` - Mark done, update leaderboard

---

## 🔧 MCP TOOLS REFERENCE

| Tool | Purpose | When to Call |
|------|---------|--------------|
| `projexlight_init_session` | Get task list & config | Once at start |
| `projexlight_get_rules` | Get priority rules | Once at start, memorize |
| `projexlight_self_check` | Get validation checklist | Once at start |
| `projexlight_get_instruction` | Get task details | Before each task |
| `projexlight_decision_tree` | Get decision logic | When making key decisions |
| `projexlight_quality_gates` | Get quality requirements | Before validation |
| `projexlight_validate` | Validate code | Before writing files |
| `projexlight_complete_task` | Mark done, update leaderboard | After each task |

---

## 📡 HTTP API ENDPOINTS (Alternative)

If MCP tools unavailable, use HTTP directly:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/instruction/init` | POST | Initialize session |
| `/api/instruction/rules` | GET | Get priority rules |
| `/api/instruction/self-check` | GET | Get validation checklist |
| `/api/instruction/get` | POST | Get task instructions |
| `/api/instruction/decision-tree` | POST | Get decision tree |
| `/api/instruction/quality-gates` | POST | Get quality gates |
| `/api/instruction/validate` | POST | Validate code |
| `/api/instruction/complete` | POST | Complete task |

**Base URL:** `http://localhost:8766`

---

## 📂 CONTEXT FILES (Fallback Mode)

If MCP server unavailable, read these files:

| File | Purpose |
|------|---------|
| `.projexlight/context/requirements.md` | Feature requirements |
| `.projexlight/context/sprint-context.json` | Structured sprint data |
| `.projexlight/context/task-list.json` | Tasks to implement |
| `.projexlight/context/framework-config.json` | Tech stack config |
| `.projexlight/schemas/user-defined-schemas.sql` | Database schema |

---

## ⚙️ Framework Configuration

### Backend
- Framework: express
- Language: typescript
- Database: undefined

### Frontend
- Framework: react
- Language: typescript
- Styling: tailwind

### Testing
- Unit: undefined
- Integration: undefined


---

## 🔍 TROUBLESHOOTING

### MCP Server Not Responding?
```bash
curl http://localhost:8766/health
docker logs projexlight-mcp
docker-compose restart mcp-server
```

### Validation Failing?
- Check the specific violations in the response
- Common issues: direct DB access, missing types, hardcoded values
- Fix ALL violations before proceeding

### Leaderboard Not Updating?
- Ensure `projexlight_complete_task` was called with metrics
- Check git push was successful
- Verify network connectivity to API

---

## 🎯 QUICK START CHECKLIST

- [ ] MCP server running? `docker-compose up -d`
- [ ] `projexlight_init_session` called?
- [ ] `projexlight_get_rules` called and rules memorized?
- [ ] Ready to execute tasks?

**START NOW: Call `projexlight_init_session` and begin Task #1!**

---

**Session Token:** `AE6JIwcw38m/W3XCavW2...`
**API URL:** https://dev.projexlight.com

*Generated by ProjexLight*

## MCP Tools Available

### mcp__projexlight__init_session
Initialize session and get assigned tasks.
```json
{
  "parameters": {}
}
```

### mcp__projexlight__get_instruction
Get detailed instructions for a specific task.
```json
{
  "parameters": {
    "taskId": "uuid"
  }
}
```

### mcp__projexlight__complete_task
Mark task complete and get next task.
```json
{
  "parameters": {
    "taskId": "uuid",
    "metrics": {
      "filesGenerated": 0,
      "linesOfCode": 0,
      "violationsDetected": 0,
      "complianceScore": 100
    }
  }
}
```

### mcp__projexlight__validate
Validate generated code against rules.
```json
{
  "parameters": {
    "taskId": "uuid",
    "codeSnippets": [
      { "filePath": "string", "content": "string" }
    ]
  }
}
```

### mcp__projexlight__decision_tree
Get decision tree for specific scenarios.
```json
{
  "parameters": {
    "scenario": "file_creation | error_handling | database_query"
  }
}
```

## Additional Notes

This export includes:
- Project requirements and context
- User-defined schemas
- Framework configuration
- Task list
- Bootstrap instructions (this file)

Instructions are delivered via the MCP server running locally in Docker.
