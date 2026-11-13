# Risk Register

| ID | Risk | Severity | Likelihood | Mitigation | Residual |
|---|---|---|---|---|---|
| R-01 | External practice sites (saucedemo, dummyjson, playwright.dev) change or go down | Medium | Medium | Tests assert observable contract, not markup internals; mock layer for deterministic UI states; failure is honest red, not hidden | Medium — inherent to public practice systems |
| R-02 | CI green check ≠ merge protection if required checks not configured | High | Medium | Documented manual step in `starter/README.md` §CI Quality Gates | Medium until verified in repo settings |
| R-03 | Observability history too short for trends | Low | High (early) | Explicit "insufficient data" reporting; history files committable | Low — self-resolving with runs |
| R-04 | Playwright JSON format changes on upgrade | Low | Low | Parser pinned to @playwright/test 1.64.x; unit tests cover contract | Low |
| R-05 | Secrets/credentials leak | High | Low | Only public demo credentials; contract strips stdout/stderr; `contents: read` | Low |
| R-06 | Flaky tests erode trust | Medium | Low-Med | Web-first assertions, no fixed waits, per-test isolation; flaky state surfaced by observability layer | Low-Med |
| R-07 | Mock drift vs real API contract | Medium | Medium | Real API test (#05) kept alongside mock; docs warn mock ≠ contract validation | Medium |
| R-08 | Scope creep / framework over-engineering | Medium | Low | Increment prompts enforced smallest-change rule; ADRs document boundaries | Low |
