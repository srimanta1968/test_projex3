# Sprint1 - Claude Export

## 📦 Export Configuration

- **CLI Tool:** Claude
- **Export Mode:** new_repository
- **Export Scope:** full_sprint
- **Selected Purposes:** api_development, ui_development, unit_tests, integration_tests

## 📋 Sprint Information

- **Sprint:** Sprint1
- **Project:** Banking Portal
- **Total Tasks:** 5

## 🔒 Security

This export includes a `.claudeignore` file that **protects sensitive files** from AI access:
- `.env` files (environment variables with secrets)
- API keys, credentials, certificates
- Database files and backups
- SSH keys and tokens

**The AI cannot read or modify ignored files.** This is a security feature to prevent accidental exposure of secrets.



## 📁 Initial Project Setup

**Before starting code generation, set up your project:**

```bash
# 1. Copy .gitignore template (IMPORTANT: prevents committing sensitive files)
cp .gitignore.example .gitignore

# 2. Copy environment variables template (customize with your values)
cp .env.example .env

# 3. Edit .env with your actual configuration values
# NEVER commit .env to git - it contains secrets!
```

**🚨 CRITICAL: Your .gitignore includes protection for:**
- `.env` files (secrets and credentials)
- `.projexlight/feedback/logs/` (CLI export logs)
- `mcp-server/feedback/logs/` (MCP server logs)
- `node_modules/`, `dist/`, `build/` (dependencies and build artifacts)
- IDE files (`.vscode/`, `.idea/`)


## 🚀 Quick Start

### First Run (Session 1):

Use the detailed generation plan for the FIRST session only:

```bash
# First time - creates actionable-instructions.md
claude .claude/instructions/generation-plan.md
```

### Subsequent Runs (Session 2+):

**⚠️ IMPORTANT:** For all sessions (new or resume), use the same command:

```bash
# Works for both new and resume sessions!
claude .claude/instructions/generation-plan.md
```

**Why one file?** The generation-plan.md automatically detects if you're starting fresh or resuming:
- Checks if `..claude/progress/tasks-completed.json` exists
- **If NO**: Runs full planning and starts code generation
- **If YES**: Skips planning, reads progress, continues from where you left off

**No need to remember different commands!** The same file works intelligently for both scenarios.

---

### Docker Setup (Optional):

**⚠️ IMPORTANT: Start Docker Desktop first!**
- Windows: Search for "Docker Desktop" in Start Menu and launch it
- Mac: Open Docker Desktop from Applications
- Wait for Docker Desktop to fully start (30-60 seconds)
- Verify: Run `docker ps` to test

```bash
# 1. Verify Docker is running
docker ps
# If this works, Docker is ready!

# 2. Check if port 5432 is already in use (port conflict detection)
# Windows:
netstat -ano | findstr :5432
# Mac/Linux:
lsof -i :5432

# If you see output, port 5432 is in use! See "Port Conflict Resolution" below.

# 3. Copy environment variables
cp .env.example .env

# 4. (Optional) If port conflict detected, change to port 5433:
# Windows (PowerShell):
(Get-Content .env) -replace 'DB_PORT=5432', 'DB_PORT=5433' | Set-Content .env
# Mac/Linux:
sed -i.bak 's/DB_PORT=5432/DB_PORT=5433/' .env
# Or manually edit .env and change DB_PORT from 5432 to 5433

# 5. Pull latest database image
docker-compose pull

# 6. Start database with Docker
docker-compose up -d

# 7. Verify database is running
docker-compose ps

# 8. Database is ready! Schema and sample data loaded automatically
# - Schema: init-scripts/01-schema.sql
# - Sample data: init-scripts/02-sample-data.sql (if available)
```

### 🔧 Port Conflict Resolution

**Problem:** Port 5432 is already in use (local PostgreSQL/MySQL installed)

**Solution 1: Use Different Port (Recommended)**
```bash
# Edit .env file and change DB_PORT from 5432 to 5433
# Option A: Manual edit (easiest)
# Open .env in text editor and change: DB_PORT=5432 → DB_PORT=5433

# Option B: Using sed (Mac/Linux)
sed -i.bak 's/DB_PORT=5432/DB_PORT=5433/' .env

# Option C: Using PowerShell (Windows)
(Get-Content .env) -replace 'DB_PORT=5432','DB_PORT=5433' | Set-Content .env

# Restart container
docker-compose down
docker-compose up -d

# Connect using port 5433:
# - Host: localhost
# - Port: 5433 (not 5432!)
# - Database: your_database_name
# - Username: postgres
# - Password: postgres
```

**Solution 2: Stop Conflicting Service**
```bash
# Windows - Stop local PostgreSQL service:
sc query | findstr postgres
sc stop postgresql-x64-17  # Replace with your service name

# Mac - Stop local PostgreSQL:
brew services stop postgresql

# Linux - Stop local PostgreSQL:
sudo systemctl stop postgresql

# Then restart Docker container:
docker-compose restart
```

**Solution 3: Check Which Process is Using Port 5432**
```bash
# Windows:
netstat -ano | findstr :5432

# Mac/Linux:
lsof -i :5432
# or
sudo ss -tulpn | grep :5432
```

### Option 2: Manual Setup

1. Extract this package to your project directory
2. Review the generation plan: `.claude/instructions/generation-plan.md`
3. Run Claude with the provided instructions
4. Follow the merge strategy guide (if team member export)

## 📁 Package Structure

```
📦 Project Root
├── .projexlight/           # 🔒 READ-ONLY Source of Truth
│   ├── context/
│   │   ├── requirements.md          # ✅ Original requirements & acceptance criteria
│   │   └── sprint-context.json      # Sprint metadata
│   ├── schemas/
│   │   └── user-defined-schemas.sql      # ✅ User database schemas
│   └── config/
│       ├── framework.json           # Tech stack configuration
│       └── export-config.json       # Export settings
│
├── .claude/              # 📝 Claude-Specific Config & Progress
│   ├── instructions/
│   │   ├── generation-plan.md       # Smart instructions (auto-detects new vs resume)
│   │   └── actionable-instructions.md # Generated task breakdown (created in Session 1)
│   ├── progress/
│   │   ├── tasks-completed.json     # Overall progress tracker
│   │   └── major-tasks/
│   │       ├── task-0.json          # Foundation setup
│   │       ├── task-1.json          # Feature tasks
│   │       └── task-N.json
│   ├── logs/
│   │   └── error-session-*.md       # Error logs (if any)
│   └── config/
│       └── (tool-specific configs)
│
├── init-scripts/              # 🆕 Auto-loaded by Docker
│   ├── 01-schema.sql          # Database schema (auto-runs on first start)
│   └── 02-sample-data.sql     # Sample data (if available)
│
├── docker-compose.yml         # 🆕 Database container setup
├── .env.example               # 🆕 Environment variables template
└── README.md                   # This file
```

### 🔒 Important: Two Separate Folders

**.projexlight/ (READ-ONLY Source of Truth)**
- Contains original requirements, schemas, and configurations
- ✅ LLMs read from here to understand WHAT to build
- ❌ Never modify these files - they are the source of truth
- All CLI tools (Claude, Goose, Cursor, etc.) reference this same folder

**.claude/ (Claude Config & Progress)**
- Contains Claude-specific instructions and progress tracking
- ✅ LLMs write progress updates here
- ✅ Contains generated task breakdowns
- Each CLI tool has its own config folder (.claude/, .goose/, .cursor/, etc.)
```

## ⚠️ Important Notes

- Claude Code supports both CLI and Desktop modes
- Works best with clear, step-by-step instructions
- Can reference context files automatically
- Supports incremental development

### 🗄️ Database Auto-Setup

The `init-scripts/` folder contains SQL files that are **automatically executed** when you first start the Docker container:

1. **01-schema.sql** - Creates all database tables, indexes, and constraints
2. **02-sample-data.sql** - Inserts sample data (if available in your schema)

**How it works:**
- PostgreSQL/MySQL/MariaDB containers automatically run all `.sql` files in `/docker-entrypoint-initdb.d/` on first startup
- Files are executed in alphabetical order (01, 02, etc.)
- This only happens on **first run** when the database volume is empty
- To re-run: `docker-compose down -v` (⚠️ deletes all data) then `docker-compose up -d`


## 🔧 Troubleshooting

### Session Failures & Recovery

**🚨 If your session fails or is interrupted:**

#### Step 1: Assess the Situation
```bash
# Check your progress
cat .claude/progress/tasks-completed.json

# Count generated files
find server client tests -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l

# View remaining tasks
cat .claude/instructions/actionable-instructions.md
```

#### Step 2: Understand the Error Type

**Network/API Errors** (most common):
- Error: "Request failed: error sending request"
- Error: "Connection timeout"
- Error: "API rate limit exceeded"
- **Action:** Wait 1-5 minutes, then resume

**File System Errors:**
- Error: "Permission denied"
- Error: "File exists"
- **Action:** Fix permissions, remove duplicates, then resume

**Configuration Errors:**
- Error: "API key not found"
- Error: "Invalid configuration"
- **Action:** Check environment variables and API keys

#### Step 3: Resume Session

**🎯 SAME COMMAND AS BEFORE:**
```bash
claude .claude/instructions/generation-plan.md
```

**This command will automatically:**
- ✅ Detect that progress files exist
- ✅ Read your current progress
- ✅ Skip all completed sub-tasks
- ✅ Continue from where it stopped
- ✅ NOT create duplicate files
- ✅ Complete remaining work

#### Step 4: If Resume Fails Multiple Times

**After 3 failed resume attempts:**

1. **Check your environment:**
   ```bash
   # Internet connection
   ping -c 3 8.8.8.8

   # API connectivity (for OpenAI)
   curl -I https://api.openai.com/v1/models

   # Check API key is set
   echo $OPENAI_API_KEY

   # Disk space
   df -h .
   ```

2. **Verify progress files are valid:**
   ```bash
   # Check if progress file is valid JSON
   cat .claude/progress/tasks-completed.json | jq .

   # If broken, you may need to regenerate (rare)
   ```

3. **Contact support or continue manually:**
   - Review remaining tasks in `.claude/instructions/actionable-instructions.md`
   - Complete manually or use focused prompts

### Common Issues & Solutions

#### Issue 1: "mkdir: cannot create directory: File exists"
**Cause:** Trying to create folders that already exist
**Solution:**
```bash
# This is usually harmless, just continue with the same command
claude .claude/instructions/generation-plan.md
```

#### Issue 2: "Port 5432 already in use"
**Cause:** Local database or another container using the same port
**Solution:** See "Port Conflict Resolution" section above

#### Issue 3: Session creates duplicate files
**Cause:** Progress files were not created or were deleted
**Solution:**
```bash
# The generation-plan.md auto-detects and resumes correctly
# Make sure ..claude/progress/ folder exists with tasks-completed.json
claude .claude/instructions/generation-plan.md
```

#### Issue 4: "Cannot find module" or import errors
**Cause:** Dependencies not installed
**Solution:**
```bash
# Install dependencies first
npm install
# or for Python
pip install -r requirements.txt
```

#### Issue 5: Database connection failed
**Cause:** Docker not running or database not started
**Solution:**
```bash
# 1. Check Docker is running
docker ps

# 2. Start database
docker-compose up -d

# 3. Wait 10 seconds for database to initialize

# 4. Verify database is ready
docker-compose logs | tail -20

# 5. Test connection (if applicable)
# TypeScript/JavaScript:
npx ts-node server/src/config/testConnection.ts
# Python:
python server/config/testConnection.py
# Java:
mvn exec:java -Dexec.mainClass="config.TestConnection"
# Go:
go run server/config/testConnection.go
```

#### Issue 6: LLM stopped generating code mid-file
**Cause:** Token limit reached or API timeout
**Solution:** Your progress is saved! Just continue with the same command:
```bash
claude .claude/instructions/generation-plan.md
```

### Health Check

**Run this to diagnose issues:**
```bash
# Check all prerequisites
echo "=== Environment Check ==="
echo -n "Node.js: "; node --version 2>/dev/null || echo "NOT FOUND"
echo -n "npm: "; npm --version 2>/dev/null || echo "NOT FOUND"
echo -n "Docker: "; docker --version 2>/dev/null || echo "NOT FOUND"

echo ""
echo "=== API Check ==="
echo -n "API Key Set: "; [ -n "$OPENAI_API_KEY" ] && echo "YES" || echo "NO"

echo ""
echo "=== Progress Check ==="
[ -f ".claude/progress/tasks-completed.json" ] && echo "Progress file: EXISTS" || echo "Progress file: NOT FOUND"
[ -f ".claude/instructions/actionable-instructions.md" ] && echo "Instructions: EXISTS" || echo "Instructions: NOT FOUND"

echo ""
echo "=== Files Generated ==="
find server client tests -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | xargs echo "TypeScript files:"
```

### Getting Help

**Before asking for help, please:**
1. ✅ Run the health check above
2. ✅ Check `.claude/progress/tasks-completed.json`
3. ✅ Review `.claude/logs/` for error logs
4. ✅ Try resuming at least once

**When reporting issues, include:**
- Session ID (shown at start)
- Error message (exact text)
- Output of health check
- Contents of `.claude/progress/tasks-completed.json`
- What you were trying to do

### Remember

**✅ Your progress is ALWAYS saved!**
- Never delete files unless certain they're corrupted
- Always resume using the same `generation-plan.md` command
- Session interruptions are normal and recoverable
- The system tracks your progress automatically in JSON files

## 📚 Documentation

For more information, see:
- [Claude Documentation](https://claude.ai/code)
- ProjexLight CLI Export Guide
- Troubleshooting: See analysis at `.claude/logs/` if errors occur

---
**Generated by ProjexLight CLI Export System**
**Export Date:** 2025-11-17T06:38:16.115Z
