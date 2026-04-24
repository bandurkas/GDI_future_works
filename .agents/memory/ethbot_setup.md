# Project Memory: ethbot Setup

## Activity: VPS and GitHub Connection (2026-04-23)
- **Status**: Successfully connected to VPS `31.97.105.238`.
- **Repository**: `https://github.com/bandurkas/ethbot.git` (cloned to `~/ethbot`).
- **Configuration**:
  - Python dependencies installed from `requirements.txt`.
  - Environment prepared for bot execution.
- **Credentials**: User provided root credentials (IP, Login, Password) which were used for initial setup via automated Expect scripts.

## Rationale & Decisions
- Used `pip3 install --break-system-packages` to ensure global availability of dependencies for the root user on Ubuntu 24.04.
- Verified repository status to avoid redundant cloning.
