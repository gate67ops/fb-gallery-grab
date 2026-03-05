

## Dependabot Findings Analysis

### Key Insight: Almost All Are Development-Only

Looking at your scan, every single vulnerability is tagged **"Development"** and detected in **package-lock.json** — meaning they exist in dev/build tooling, not in your production application code served to users.

| Severity | Package | Type | Fixable? |
|----------|---------|------|----------|
| High | Rollup 4 path traversal | Dev transitive | Update vite |
| High | minimatch ReDoS (×2) | Dev transitive | Update eslint/glob |
| High | glob CLI command injection | Dev transitive | Update glob |
| Moderate | vite server.fs.deny bypass | Dev, **Direct** | **Yes — update vite** |
| Moderate | Lodash prototype pollution | Transitive | Dependabot PR |
| Moderate | js-yaml prototype pollution | Dev transitive | Dependabot PR |
| Moderate | esbuild dev server | Dev transitive | Update vite |
| Low | Vite middleware (×2) | Dev, **Direct** | **Yes — update vite** |

### What We Can Fix

**1. Update Vite** — This resolves 5 of the 10 findings (the 3 direct vite issues + rollup + esbuild as transitive deps). Update from `^5.4.19` to latest Vite 5.x or 6.x.

**2. Merge Dependabot PRs** — Dependabot likely already opened pull requests for the others. Merge those from the Pull Requests tab.

**3. Regenerate lockfile** — After updates, delete `package-lock.json` and reinstall to clear stale transitive deps.

### How to Report This to Meta

Write something like:

> *"GitHub Dependabot dependency vulnerability scan conducted on [date]. Scope: all npm dependencies for React/TypeScript frontend and Deno/TypeScript backend functions. Results: 10 findings identified, all in development-only dependencies (build tooling). Zero findings affect production runtime code or pose any risk of unauthorized access to Meta Platform Data. Development dependencies are not deployed to production — only the compiled/bundled output is served to users. Remediation: Vite updated to resolve 5 findings; remaining transitive dependency alerts resolved via Dependabot security PRs."*

Key points for Meta:
- **Zero Critical** severity findings
- **All High/Moderate findings are development-only** — they do not run in production and cannot enable unauthorized access to Meta Platform Data
- Screenshot the Dependabot alerts page **after** remediation showing "0 Open" or reduced count
- Include both the "before" screenshot (what you uploaded) and the "after" screenshot

### Implementation

Update `vite` in package.json to latest, which will cascade-fix the transitive rollup/esbuild issues. The minimatch/glob/lodash/js-yaml issues should be resolved by merging the Dependabot PRs GitHub has likely auto-created.

