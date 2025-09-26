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