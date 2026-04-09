---
description: Protocol for integrating MemPalace (Context/Memory) and Ruflo Agents (Workers)
---
# Antigravity ↔ MemPalace ↔ Ruflo Synergy Protocol

This workflow dictates how Antigravity (the primary agent) should leverage external AI tools (MemPalace and Ruflo) while solving user tasks in this repository.

## 1. Context Retrieval (MemPalace)
Before starting complex architectural changes or trying to understand why something was built a certain way:
- Run `mempalace search "<query>"` to retrieve historical context, previous bugs, or architectural decisions.
- If making a major, system-wide decision, use `mempalace_diary_write` to store the rationale for future sessions.

## 2. Delegation to Ruflo Agents
Do not try to do massive multi-file audits manually. Delegate specialized heavy-lifting to Ruflo agents using the background terminal (`run_command` with `SafeToAutoRun: true` and `WaitMsBeforeAsync: 0`, followed by `command_status`).

**When to spawn which Ruflo agent:**
- **Code Review / Security:** Run `npx ruflo agent spawn -t reviewer --task "review <file_pattern>"` before finalizing critical API changes.
- **Performance:** Run `npx ruflo agent spawn -t performance-engineer --task "analyze performance of <component>"` when the user requests LCP/UX optimization.
- **Testing:** Run `npx ruflo agent spawn -t tester --task "generate unit tests for <directory>"` when the user requests test coverage.
- **Dead Code:** Run `npx ruflo agent spawn -t optimizer --task "find unused code"` during refactoring.

## 3. Workflow Execution
1. [Antigravity] Receives task.
2. [Antigravity] Uses MemPalace to understand historical context (if needed).
3. [Antigravity] Writes code / performs primary edits.
4. [Antigravity] Spawns a Ruflo agent (e.g. `tester` or `reviewer`) in the background to validate changes.
5. [Antigravity] Aggregates Ruflo's output and presents the final, validated result to the USER.
