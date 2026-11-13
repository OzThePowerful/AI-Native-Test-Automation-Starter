# Lab 0 Guide - Environment Validation and Project Start

**Goal:** finish Lab 0 with a Playwright + TypeScript project that runs
locally and is pushed to your own GitHub repository.

**Time:** about 30 minutes.

## Step 1 - Validate your environment

From the root of this kit:

``` powershell
# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File scripts\verify-environment.ps1
```

``` bash
# macOS / Linux
bash scripts/verify-environment.sh
```

Continue when you see `READY` or `READY WITH WARNING`.

## Step 2 - Create a project folder

Create the folder **outside** this kit, inside your user folder:

``` bash
mkdir ai-native-playwright
cd ai-native-playwright
```

## Step 3 - Initialize Playwright

``` bash
npm init playwright@latest
```

Answer the prompts with the recommended choices:

| Prompt | Answer |
|---|---|
| TypeScript or JavaScript? | **TypeScript** |
| Where to put your end-to-end tests? | **tests** |
| Add a GitHub Actions workflow? | **Yes** |
| Install Playwright browsers? | **Yes** |

> **Fallback:** if `npm init playwright@latest` fails and the
> [quick fix](troubleshooting.md#npm-install-fails) does not solve it
> in about 5 minutes, use the ready project in
> [`starter/`](../starter/README.md) and continue the course from there.

## Step 4 - Install browsers and run the tests

If you skipped the browser install, run it now, then run the tests:

``` bash
npx playwright install
npx playwright test
```

Expected result: all example tests pass, for example `6 passed`.

> **Fallback:** if the browser install fails and the
> [quick fix](troubleshooting.md#playwright-cannot-download-browsers)
> does not solve it in about 5 minutes, use [`starter/`](../starter/README.md).
> It needs the same browser download, so a blocked network still
> requires a different network or IT.

## Step 5 - Add npm scripts

Add these scripts to `package.json`:

``` json
"scripts": {
  "test": "playwright test",
  "test:ui": "playwright test --ui",
  "show-report": "playwright show-report"
}
```

Try them:

``` bash
npm test
npm run show-report
```

## Step 6 - Push to GitHub

1. Create an **empty** repository on GitHub (no README, no license).
2. Push your project:

   ``` bash
   git init
   git add .
   git commit -m "Lab 0: Playwright starting point"
   git branch -M main
   git remote add origin https://github.com/<your-user>/<your-repo>.git
   git push -u origin main
   ```

3. Open the **Actions** tab and confirm the **Playwright Tests**
   workflow runs.

## Done

- [ ] Validator shows `READY` or `READY WITH WARNING`
- [ ] Playwright project created with TypeScript and tests in `tests/`
- [ ] `npx playwright test` passes locally
- [ ] Project pushed to your own GitHub repository
- [ ] **Playwright Tests** workflow visible in the Actions tab
