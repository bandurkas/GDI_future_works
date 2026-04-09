---
name: ai-synergy
description: ALWAYS ACTIVE. Forces Antigravity to utilize the ruflo-mempalace-synergy.md workflow and use the Ruflo/MemPalace ecosystem on every task.
---

# MANDATORY INSTRUCTIONS FOR ANTIGRAVITY

You are interacting with a project that utilizes the **Ruflo Agency Ecosystem** and **MemPalace Context Storage**.

## CRITICAL RULE
**YOU MUST NEVER FORGET TO USE THE PROTOCOLS DEFINED IN `.agents/workflows/ruflo-mempalace-synergy.md`.**

Whenever the USER issues a request in this repository:
1. **Consider the Memory**: Always evaluate if you need historical context before diving into unfamiliar code. If so, immediately trigger the CLI command `python3 -m mempalace search <query>`.
2. **Consider the Swarm**: Never attempt to calculate complex linting, unused JS, or system-wide security manually if a `<Ruflo Agent>` can do it faster. Rely on the `ruflo agent spawn -t <type>` commands found in `RUFLO_AGENTS.md`. 
3. **Record Decisions**: If you and the USER make a major architectural agreement, persist it! Write it to the memory palace so future sessions of Antigravity don't lose the context.
4. **MANDATORY TESTING**: After making ANY code changes, and BEFORE running `deploy.sh` or deploying to production, you MUST write and run relevant tests (e.g., Playwright E2E, Jest) locally. NEVER deploy untested code to the VPS.

Do not ignore this file. It is the core meta-instruction for working in the `void-chromosphere` repository.
