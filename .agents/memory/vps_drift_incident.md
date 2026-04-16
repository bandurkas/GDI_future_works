# Project Memory: Production Safety

## Incident: VPS Drift (2026-04-17)
- **Cause**: AI edited code directly on VPS via SSH, bypassing Git.
- **Impact**: Deleted 'id' field in LeadInfo, broke Telegram action buttons, deleted 'take' API route.
- **Resolution**: User manually restored code. AI synchronized local state with GitHub.

## MANDATORY RULES
1. **NEVER** edit code directly on VPS. All changes MUST go through Git (Commit -> Push -> VPS Pull).
2. **ID in LeadInfo**: The 'id' field is REQUIRED for Telegram interactivity. Never remove it.
3. **Safe Deploy**: Use 'scratch/deploy.exp' for all production updates to ensure ENV safety and clean status.
