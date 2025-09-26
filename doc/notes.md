https://nx.dev/getting-started/adding-to-existing

## Installation du Nx CLI

```bash
sudo add-apt-repository ppa:nrwl/nx
sudo apt update
sudo apt install nx
```

## Create a new workspace with presets

npx create-nx-workspace@latest

---

## Git: Resolving a Divergent `main` Branch (2025-09-26)

Context: Local `main` was ahead 1 commit and behind 2 commits compared to `origin/main`. A plain `git pull` failed with:

```
fatal: Need to specify how to reconcile divergent branches.
```

### Decision
Use a rebase to keep history linear (avoid an extra merge commit for a single local change).

### Commands Used
```bash
# Show divergence (ahead / behind counters)
git status --short --branch

# Inspect local commits
git log --oneline --decorate --graph --max-count=10

# Inspect remote commits
git log --oneline origin/main --max-count=5

# Rebase local commit(s) onto latest remote main
git pull --rebase origin main

# Push rebased branch
git push origin main
```

### Result
Local and remote `main` now point to the same commit. History is linear; no extra merge commit introduced.

### Optional Config (to avoid future prompts)
Pick one depending on team policy:
```bash
git config --global pull.rebase true   # Always rebase
# or
git config --global pull.rebase false  # Always merge
# or
git config --global pull.ff only       # Only fast-forward, fail if not possible
```

### Rationale for Rebase
Only one local commit; remote already had a merge PR. Rebase avoided unnecessary noise and preserved a clean timeline.

---

## Troubleshooting: Fixing a Nested Nx Workspace (2025-09-27)

**Problem**: An Nx workspace was accidentally created inside a subdirectory (`barades/org`) instead of at the repository root (`barades`). This happened by providing a name (`org`) to the `create-nx-workspace` command instead of `.` to specify the current directory. The root also contained partial files from a previously failed installation, causing conflicts.

**Diagnosis**: The incorrect file structure was visible in the file explorer. Commands like `mv` failed with `Directory not empty` errors, confirming the presence of conflicting files at the root.

### Resolution Steps

The solution was to "promote" the contents of the nested `org` directory to the root.

```bash
# 1. Navigate to the repository root
cd /path/to/barades

# 2. Delete conflicting partial directories at the root
# WARNING: rm -rf deletes permanently. Double-check your location.
rm -rf ./.github ./.nx ./.vscode

# 3. Move all contents from the nested folder to the current directory.
# This command moves both hidden (.*) and non-hidden (*) files.
# Note: Errors about moving '.' and '..' can be safely ignored.
mv org/* org/.* .

# 4. Remove the now-empty nested directory
rmdir org

# 5. Verify the clean structure and commit the fix
git status
git add .
git commit -m "fix(core): correct workspace file structure"
git push
```

**Outcome**: The repository now has a single, clean Nx workspace at its root. Commands like `nx show projects` and `nx graph` confirm that the structure is correctly recognized by all Nx tools.