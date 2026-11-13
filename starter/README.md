# Starter Project - Lab 0 Recovery Path

A ready-to-run **Playwright + TypeScript** project. Use it when your own
Lab 0 setup fails and you cannot fix it quickly, so you can keep going
with the course.

> **This is a recovery tool, not the course framework.** It is the plain
> output of the Playwright initializer with one example spec. You will
> build the real framework (Page Objects, fixtures, API clients, and so
> on) during the course.

## When to Use It

``` text
Lab 0 issue → Quick Fix (docs/troubleshooting.md) → Fixed in <5 min?
 ├── Yes → continue your own project
 └── No  → this starter project → continue the course
```

Typical reasons: `npm init playwright@latest` errors, confusion during
the scaffold, or a broken `playwright.config.ts`. Always try the
[quick fixes](../docs/troubleshooting.md#lab-0) first.

## Requirements

- Node.js LTS, npm, and Git (see the [pre-course checklist](../docs/pre-course-checklist.md))
- Network access to the npm registry and the Playwright browser download

## Run It (under 5 minutes)

``` bash
git clone https://github.com/<org>/AI-Native-Test-Automation-Starter.git
cd AI-Native-Test-Automation-Starter
cd starter && npm ci && npx playwright install && npx playwright test
```

Replace `<org>` with the organization or account your instructor shares.

> **Windows PowerShell 5.1** does not support `&&`. Run the same
> commands one per line:
>
> ``` powershell
> cd starter
> npm ci
> npx playwright install
> npx playwright test
> ```

Expected result: 2 tests run in each of Chromium, Firefox, and WebKit:

``` text
Running 6 tests using 6 workers
...
  6 passed
```

Useful scripts (the same ones as in the [Lab 0 guide](../docs/lab-0-guide.md#step-5---add-npm-scripts)):

| Command | What it does |
|---|---|
| `npm test` | Runs all tests (`playwright test`) |
| `npm run test:ui` | Opens UI mode (`playwright test --ui`) |
| `npm run show-report` | Opens the last HTML report |

## What's Inside

| File | Purpose |
|---|---|
| `package.json` | Pinned `@playwright/test` and `@types/node` |
| `package-lock.json` | Committed so `npm ci` installs the exact same versions |
| `tsconfig.json` | Editor support (`moduleResolution: "Bundler"`) |
| `playwright.config.ts` | Standard generated config with `list` + `html` reporters |
| `tests/example.spec.ts` | Generated example spec against playwright.dev |
| `.gitignore` | Excludes `node_modules/`, reports, and test results |

### Course Lab Additions

As the course progresses this project gains lab exercises on top of the
generated scaffold:

| Path | Content |
|---|---|
| `tests/saucedemo.spec.ts` + `tests/pages/` | UI tests with Page Objects |
| `tests/api/products.spec.ts` | Real API test (`APIRequestContext` → DummyJSON) |
| `tests/mocking/product-browser-mock.spec.ts` | Browser request interception + mocked response |
| `docs/api-interception-mocking.md` | Guide: how the mocking test works, when to use it, debugging |

## Publish to Your Own GitHub Repository

The CI workflow lives at the repository root
(`.github/workflows/playwright.yml`) and runs from `starter/`, so push
the **whole kit**, not only this folder.

1. On GitHub, create an **empty** repository (no README, no license).
2. From the root of the kit, point `origin` at your repository and push:

   ``` bash
   git remote set-url origin https://github.com/<your-user>/<your-repo>.git
   git push -u origin main
   ```

3. Open the **Actions** tab of **your** repository. The
   **Playwright Tests** workflow runs on every push and pull request,
   and you can also start it manually (**Run workflow**). The HTML
   report is attached to each run as the `playwright-report` artifact.

## CI Quality Gates

The `Playwright Tests` workflow (`.github/workflows/playwright.yml`)
runs on every push and pull request:

1. `npm ci` — reproducible install from `package-lock.json`
2. `npx tsc --noEmit` — TypeScript validation (fails the job on errors)
3. `npx playwright install --with-deps` — browser binaries
4. `npx playwright test` — the full suite (UI + API + mocking specs)

Artifacts uploaded per run: `playwright-report` (HTML report, 30 days)
and `playwright-traces` (traces/screenshots on failure, 7 days).

### Requiring these checks (manual step)

Workflow checks only report status — blocking merges is configured in
GitHub, not in this repo:

1. Push this kit to your repository (see above).
2. Open **Settings → Branches → Branch protection rules** (or
   **Rules → Rulesets**) for `main`.
3. Enable **Require status checks to pass before merging** and add:
   - `Playwright Tests / test`
   - `Validate Kit / lint`
   - `Validate Kit / validate`
4. Save. From then on, a red Playwright or validator run blocks the
   merge until it passes.

## Limitations

- **Clone-and-continue still needs Node.js, npm, and network access.**
  `npm ci` downloads packages from the npm registry and
  `npx playwright install` downloads browser binaries. If your blocker
  is a restricted network (proxy, firewall, certificates), this project
  fails the same way. The fix is a different network or an IT
  escalation; see [troubleshooting.md](../docs/troubleshooting.md#network).
- If only Chromium can be downloaded, run
  `npx playwright install chromium` and `npx playwright test --project=chromium`.
- The example tests visit <https://playwright.dev>, so they need internet access.
