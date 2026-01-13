# ProjexLight Code Generation

## STEP 0: VERIFY CURL IS INSTALLED (MANDATORY)

Before proceeding, you MUST verify curl is available. Run this check:

```bash
curl --version
```

### If curl is NOT installed:

**Windows (run in PowerShell as Admin):**
```powershell
winget install curl.curl
```
Or download from: https://curl.se/windows/

**macOS:**
```bash
brew install curl
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update && sudo apt-get install -y curl
```

**Linux (CentOS/RHEL/Fedora):**
```bash
sudo yum install -y curl
```

**Alpine Linux:**
```bash
apk add curl
```

### ⚠️ STOP IF CURL INSTALLATION FAILS

If curl cannot be installed automatically:
1. **STOP code generation immediately**
2. **Tell the user:** "curl is required but not installed. Please install curl manually and restart."
3. **DO NOT proceed** until curl is confirmed working

### Verify curl works:
```bash
curl --version
```
If this shows version info, proceed to Step 1.

---

## STEP 1: READ PROJECT CONFIGURATION

```
.projexlight/context/framework-config.json
```

This tells you the language/framework. DO NOT assume TypeScript.

---

## STEP 2: GET COMPLETE WORKFLOW

```bash
curl http://localhost:8766/api/instruction/bootstrap
```

This returns the complete EXECUTION_FLOW with all phases and tools.

---

## STEP 3: FOLLOW EXECUTION_FLOW FROM RESPONSE

Execute each phase automatically. DO NOT ask for confirmation.

---

## CRITICAL RULES

- Read framework-config.json FIRST to know language/framework
- Execute all steps automatically - DO NOT ask for confirmation
- Follow NEXT_STEP in each API response
- Validate before commit - only commit when validation.passed === true
- If any curl command fails, check MCP server: `docker ps | grep projexlight`

---

Project: 7c131623... | Tasks: 27

## Notes

Instructions delivered via MCP server.
