# Quick Start Guide - MCP Server with Automated Git Hooks

## 🚀 First Time Setup (5 Minutes)

### Step 1: Extract CLI Export

```bash
unzip your-project-export.zip
cd your-project-export
```

### Step 2: Start MCP Server

```bash
cd mcp-server
docker-compose up -d
```

**✨ Everything is pre-configured!**
- ✅ `.env` file auto-generated with encryption key
- ✅ `mcp-config.json` encrypted with project credentials
- ✅ No manual configuration needed!

**Note:** The MCP server automatically monitors for git initialization and installs hooks when you run `git init`.

### Step 3: Initialize Git Repository (When Ready)

```bash
git init
```

**✨ What Happens:**

**Scenario A: You ran `git init` BEFORE starting MCP:**
```
📋 Step 3/4: Installing Git Hooks...
============================================================
Installing Git Hooks
============================================================
   [OK] Installed: pre-commit
   [OK] Installed: pre-push
============================================================
[OK] Installed 2 git hook(s)
```

**Scenario B: You started MCP BEFORE running `git init`:**
```
📋 Step 3/4: Installing Git Hooks...

WARNING: Git repository not found - skipping hook installation
   Workspace: /workspace
   Hooks will not be installed automatically

   Starting automatic git repository monitoring...
   [MONITOR] Started git repository monitoring
   [MONITOR] Checking every 10 seconds for .git folder
   Git monitor will auto-install hooks when you run 'git init'
```

Then when you run `git init`:
```
============================================================
[AUTO-INSTALL] Git repository detected!
============================================================
   Timestamp: 2025-11-14T14:30:00Z
   Workspace: /workspace

   Installing git hooks automatically...

============================================================
Installing Git Hooks
============================================================
   [OK] Installed: pre-commit
   [OK] Installed: pre-push
============================================================
[OK] Installed 2 git hook(s)

============================================================
[AUTO-INSTALL] Hooks installed successfully!
============================================================
   Pre-commit and pre-push hooks are now active
   Duplicate detection will work on next commit/push
============================================================
```

**✅ Either way, hooks are installed automatically!**

### Step 4: Verify Installation

```bash
curl http://localhost:8766/health
curl http://localhost:8766/hooks/status
```

✅ **You're Done!** Git hooks are now automatically scanning for duplicates.

**Check monitoring status:**
```bash
curl http://localhost:8766/monitor/status
```

Response when monitoring (no .git yet):
```json
{
  "monitoring": true,
  "hooksInstalled": false,
  "gitDetected": false,
  "message": "Monitoring active - will auto-install hooks when git init is run"
}
```

Response after hooks installed:
```json
{
  "monitoring": false,
  "hooksInstalled": true,
  "gitDetected": true,
  "message": "Monitoring stopped"
}
```

---

## 📋 What Happens Next?

### Pre-Commit Duplicate Detection

Every time you commit, the pre-commit hook automatically scans for duplicate APIs:

```bash
git add .
git commit -m "Add user routes"

# 🔍 Pre-commit scan runs automatically
# ✅ Passes if no duplicates
# 🚨 Blocks if duplicates found
```

**If Duplicates Found:**
```
🚨 COMMIT BLOCKED: Duplicate APIs detected

Duplicate APIs found:
  🚨 POST /api/users
     File: server/src/routes/userRoutes.ts
     Conflicts with: server/src/routes/legacy/userRoutes.ts
     Sprint: Sprint 1

Action Required:
  1. ✅ Reuse existing API (recommended)
  2. 🔄 Modify endpoint path to make it unique
  3. 📝 Add justification comment
```

### Pre-Push API Testing

Every time you push, the pre-push hook automatically runs API tests:

```bash
git push origin main

# 🧪 API tests run automatically
# 🔍 Component scan runs automatically
# ✅ Results sent to Leadership Dashboard
```

---

## 🔧 Common Scenarios

### Scenario 1: MCP Server Offline

If MCP server is not running, hooks gracefully allow commits/pushes:

```bash
git commit -m "Emergency fix"

⚠️  MCP server not running
   Pre-commit scan skipped (graceful degradation)

[commit proceeds normally]
```

### Scenario 2: Bypass Hook (Emergency)

```bash
# Bypass pre-commit hook
git commit --no-verify -m "Emergency hotfix"

# Bypass pre-push hook
git push --no-verify
```

**⚠️ Warning:** Only use for emergencies! Bypasses are visible in git history.

### Scenario 3: Hook Says "Duplicate Found"

**DO:**
- ✅ Review the existing API
- ✅ Reuse it if possible
- ✅ Modify your endpoint path if needed
- ✅ Add justification comment if duplicate is intentional

**DON'T:**
- ❌ Immediately use `--no-verify`
- ❌ Ignore the warning
- ❌ Create the duplicate anyway

---

## 📊 Monitoring & Verification

### Check Hook Status

```bash
curl http://localhost:8766/hooks/status
```

**Response:**
```json
{
  "hooksInstalled": true,
  "hooks": {
    "pre-commit": {"installed": true, "executable": true},
    "pre-push": {"installed": true, "executable": true}
  }
}
```

### Check MCP Server Health

```bash
curl http://localhost:8766/health
```

### View Logs

```bash
docker-compose logs -f
```

---

## 🆘 Troubleshooting

### Problem: "WARNING: Git repository not found"

**Cause:** You started MCP server before running `git init`

**✨ NO ACTION NEEDED!** The MCP server is now monitoring automatically and will install hooks as soon as you run `git init`.

**Verify monitoring is active:**
```bash
curl http://localhost:8766/monitor/status
# Should show: "monitoring": true
```

**Then simply run:**
```bash
git init
# Hooks will install automatically within 10 seconds!
```

### Problem: Pre-commit hook doesn't run

**Check if hook exists:**
```bash
ls -la .git/hooks/pre-commit
```

**Reinstall manually:**
```bash
curl -X POST http://localhost:8766/hooks/install
```

### Problem: Hook says "MCP server not running"

**Start MCP server:**
```bash
cd mcp-server
docker-compose up -d
```

### Problem: Hook is too slow

**Commit smaller batches:**
```bash
# Instead of: git add .
# Do:
git add server/src/routes/userRoutes.ts
git commit -m "Add user routes"
```

---

## 📚 Full Documentation

- **Hook Installation Details:** `HOOKS_INSTALLATION.md`
- **MCP Server README:** `README.md`
- **Support Documents:** `docs/support/`

---

## ✅ Summary

1. **Extract CLI export** → `unzip project-export.zip`
2. **Start MCP server** → `docker-compose up -d` (any order!)
3. **Initialize git** → `git init` (any time!)
4. **Start coding** → Hooks install automatically!

**✨ NEW: Fully Automatic Hook Installation**
- ✅ No specific order required - start MCP first OR run `git init` first
- ✅ If no .git exists, MCP automatically monitors (checks every 10 seconds)
- ✅ Hooks install within 10 seconds of running `git init`
- ✅ No restart needed, no manual commands needed
- ✅ Works on every MCP restart
- ✅ Graceful degradation if MCP is offline

---

**Questions?** Check `HOOKS_INSTALLATION.md` or contact support@projexlight.com
