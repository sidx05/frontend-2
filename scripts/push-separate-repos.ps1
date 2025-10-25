<#
Push frontend and backend as separate GitHub repositories (PowerShell script).

Prereqs:
- Git installed and repo initialized (run from repository root)
- GitHub CLI `gh` installed and authenticated (gh auth login)

Usage:
.\push-separate-repos.ps1 -GitHubOwner "YOUR_USER_OR_ORG" -FrontendRepo "newshub-frontend" -BackendRepo "newshub-backend" -Visibility public

This script will:
- Create a branch `backend-only` containing history for `backend/` (via git subtree split)
- Create GitHub repos for frontend and backend using `gh`
- Push backend-only branch to backend repo as `main`
- Create a temp clone for frontend, remove the `backend/` folder, commit, and push to frontend repo

Be careful: this script will create repos in your GitHub account/organization.
#>

param(
  [Parameter(Mandatory=$true)] [string]$GitHubOwner,
  [Parameter(Mandatory=$true)] [string]$FrontendRepo,
  [Parameter(Mandatory=$true)] [string]$BackendRepo,
  [ValidateSet('public','private')] [string]$Visibility = 'public',
  [switch]$UseHttps
)

function Exec($cmd) {
  Write-Host "> $cmd"
  iex $cmd
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git is not installed or not in PATH"
  exit 1
}
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "gh (GitHub CLI) is not installed or not in PATH. Install and run 'gh auth login' first."
  exit 1
}

$root = Resolve-Path .
Write-Host "Repository root: $root"

# Ensure we are in a git repo
if (-not (Test-Path .git)) {
  Write-Error "This directory does not appear to be a git repository (no .git folder). Initialize or clone your repo and re-run."
  exit 1
}

try {
  # create backend-only branch with history for backend/
  Exec "git fetch --all"
  Exec "git checkout --quiet -B tmp-split-branch"
  Exec "git subtree split --prefix backend -b backend-only"

  # create backend repo on GitHub
  $createCmd = "gh repo create $GitHubOwner/$BackendRepo --$Visibility --confirm"
  Exec $createCmd

  # determine remote url
  if ($UseHttps) { $remoteUrl = "https://github.com/$GitHubOwner/$BackendRepo.git" } else { $remoteUrl = "git@github.com:$GitHubOwner/$BackendRepo.git" }

  Exec "git remote add backend-origin $remoteUrl"
  Exec "git push backend-origin backend-only:main --force"
  Exec "git remote remove backend-origin"
  Exec "git branch -D backend-only"
  Exec "git checkout -"
  Exec "git branch -D tmp-split-branch"

  # Create frontend repo
  $createFront = "gh repo create $GitHubOwner/$FrontendRepo --$Visibility --confirm"
  Exec $createFront

  # prepare a temp clone for frontend-only
  $tempDir = Join-Path -Path (Get-Location).Parent.FullName -ChildPath "${FrontendRepo}-temp"
  if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
  Exec "git clone . $tempDir"
  Push-Location $tempDir
  Exec "git rm -r backend || true"
  Exec "git commit -m 'Remove backend folder for frontend-only repository' --allow-empty"

  if ($UseHttps) { $frontRemote = "https://github.com/$GitHubOwner/$FrontendRepo.git" } else { $frontRemote = "git@github.com:$GitHubOwner/$FrontendRepo.git" }
  Exec "git remote add origin $frontRemote"
  Exec "git push -u origin HEAD:main --force"
  Pop-Location

  Write-Host "Cleanup temp clone"
  Remove-Item -Recurse -Force $tempDir

  Write-Host "Done. Backend and frontend pushed to GitHub under $GitHubOwner"
  Write-Host "Backend repo: https://github.com/$GitHubOwner/$BackendRepo"
  Write-Host "Frontend repo: https://github.com/$GitHubOwner/$FrontendRepo"
} catch {
  Write-Error "An error occurred: $_"
  exit 1
}
