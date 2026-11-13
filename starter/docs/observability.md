# Observability & Feedback (Increment #08)

Turns real Playwright results into normalized, traceable metrics —
without inventing data. Zero external dependencies (Node built-ins +
Playwright's native `json` reporter).

## Data flow

```text
playwright.config.ts (json reporter)
  → test-results/results.json          (raw, per run)
  → scripts/observability/normalize.mjs (validate + normalize, schema 1.0)
  → scripts/observability/metrics.mjs   (pure metric calculations)
  → scripts/observability/report.mjs    (report.md + normalized-run.json)
  → observability/history/              (one JSON per run, idempotent)
  → CI: GITHUB_STEP_SUMMARY + artifact  (playwright-report)
```

## Usage

```powershell
cd starter
npx playwright test --project=chromium   # generates test-results/results.json
npm run observability                    # → observability/out/report.md
npm run test:observability               # unit tests of the engine (node:test)
npm run typecheck                        # tsc --noEmit
```

In CI (`.github/workflows/playwright.yml`) the report step runs with
`if: always()` after the test step, appends the Markdown to the run's
**Summary** page, and `observability/out/` ships inside the
`playwright-report` artifact.

## The contract (`schemaVersion: "1.0"`)

- `run`: runId, source (`local|github-actions`), startedAt, commitSha,
  workflow, completeness (`complete|partial|unknown` + reason).
- `tests[]`: logical test id (`file::title::project`), finalStatus,
  per-attempt history, durationMs, evidenceRefs.
- `provenance`: which file produced the data and when it was normalized.

**Key semantics:**

- `flaky` = failed once, passed on retry → **one** logical test, not two.
- `skipped` and `unknown` are **excluded** from the pass-rate
  denominator and reported separately.
- `null` means "data not available" — never silently becomes `0`.
- The contract carries **no** stdout/stderr/error payloads → no secrets
  leak into reports.

## Metrics dictionary

| Metric | Formula | Notes |
|---|---|---|
| passed/failed/flaky/skipped/unknown | count by finalStatus | per logical test |
| passRate | passed / (passed+failed+flaky) | `null` when denominator is 0 |
| flakyRate | flaky / executed | needs retries enabled to be meaningful |
| durationMs | Σ attempt durations | per-test time, not CI wall-clock |
| trends | compare history runs | **Insufficient data** until ≥2 runs |

Rules: never divide by zero, never turn missing data into zero, never
infer causality from correlation, never read a 100% pass rate as
absence of risk.

## History & retention

- `observability/history/run-<runId>.json` — one normalized doc per
  execution; re-running the same runId is idempotent (no duplicates).
- `observability/out/` is git-ignored (generated output).
- History files **can** be committed for durable trends — do it
  deliberately; unbounded growth needs a retention decision later.
- GitHub artifacts expire (report 30d, traces 7d) — they are evidence,
  not a historical store.

## Limitations

- Metrics describe **this** run; a single execution cannot show trends.
- Local runs lack commit/workflow metadata (`null`, documented).
- The parser targets the JSON reporter format of the pinned
  `@playwright/test` version — upgrade Playwright → re-validate.
- Pass rate ≠ quality: it says nothing about coverage or risk.

## Feedback loop

```text
signal (metric/report) → evidence (results.json, traces, artifacts)
→ hypothesis → proposed action → HUMAN approval → change →
next run validates
```

The agent proposes; the engineer decides. Observability informs — it
does not replace judgment.
