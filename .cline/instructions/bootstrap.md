# ProjexLight Code Generation

## INSTRUCTIONS FOR AI AGENT

You are an autonomous code generation agent. Execute the following steps WITHOUT asking for confirmation.
Do NOT ask "should I proceed?" or "confirm to run" - just execute each MCP call in sequence.

---

## EXECUTION FLOW

```
PHASE 1: INITIALIZATION (run once)
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Call projexlight_get_rules                              │
│         → Memorize ALL rules returned (apply to all code)       │
│                                                                 │
│ STEP 2: Call projexlight_init_session                           │
│         → Extract task IDs from response (save for PHASE 2)     │
│                                                                 │
│ STEP 3: Call projexlight_self_check                             │
│         → Read validation checklist                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
PHASE 2: TASK LOOP (repeat for each task ID from STEP 2)
┌─────────────────────────────────────────────────────────────────┐
│ For taskId in [task IDs from STEP 2]:                           │
│                                                                 │
│   4a. Call projexlight_get_instruction({ taskId: "<ID>" })      │
│       → Read instructions returned                              │
│                                                                 │
│   4b. GENERATE CODE based on instructions from 4a               │
│       → Write actual source files (NOT scripts)                 │
│                                                                 │
│   4c. Call projexlight_validate({ taskId: "<ID>" })             │
│       → Check validation response                               │
│                                                                 │
│   4d. git add . && git commit -m "Task: <task-title>"           │
│                                                                 │
│   4e. Call projexlight_complete_task({ taskId: "<ID>" })        │
│       → If response has featureValidation, call 4f              │
│                                                                 │
│   4f. (If needed) Call projexlight_submit_feature_validation    │
│       → Submit validation results for the feature               │
│                                                                 │
│   → NEXT TASK (repeat 4a-4e)                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## MCP TOOLS REFERENCE

| Tool | Purpose |
|------|---------|
| `projexlight_get_rules` | Get MUST DO / MUST NOT rules |
| `projexlight_init_session` | Get tasks & config |
| `projexlight_self_check` | Get validation checklist |
| `projexlight_get_instruction` | Get task details |
| `projexlight_validate` | Validate code before writing |
| `projexlight_complete_task` | Mark task done |
| `projexlight_submit_feature_validation` | Submit feature validation |

---

## START NOW

Execute STEP 1 immediately:
```
Call: projexlight_get_rules
```

Then continue with STEP 2, STEP 3, and PHASE 2.

---

## CONSTRAINTS

- Do NOT ask for confirmation - execute automatically
- Do NOT skip step 4a - must get instructions before coding
- Replace <ID> with actual task ID from STEP 2 response
- When 4e returns featureValidation, you MUST call 4f

## FALLBACK (if MCP unavailable)

Read: `.projexlight/context/task-list.json`, `.projexlight/config/framework.json`

---

Project: 3646b747... | Tasks: 17

## MCP Tools

Call these tools via MCP protocol:
- `projexlight_init_session` - Start session
- `projexlight_get_rules` - Get rules
- `projexlight_get_instruction` - Get task details
- `projexlight_validate` - Validate code
- `projexlight_complete_task` - Mark done

## Notes

Instructions delivered via MCP server.
