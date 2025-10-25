Push separate frontend and backend repositories
=============================================

This folder contains a PowerShell script to split and push the current mono-repo into two GitHub repositories: frontend and backend.

Usage (PowerShell):

1. Ensure prerequisites:
   - `git` installed
   - `gh` (GitHub CLI) installed and authenticated: `gh auth login`

2. From project root run (example):

```powershell
.\scripts\push-separate-repos.ps1 -GitHubOwner "your-gh-user-or-org" -FrontendRepo "newshub-frontend" -BackendRepo "newshub-backend" -Visibility public
```

3. The script will create two repos and push:
   - backend-only branch (history of `backend/`) pushed to backend repo main
   - a frontend-only repo with `backend/` removed pushed to frontend repo main

Notes:
- The script uses `git subtree split` to preserve backend history.
- The script will create repos under the GitHub owner you provide.
- If you prefer HTTPS remotes, pass `-UseHttps`.
