# Capstone Defense Preparation

Guide for the 10–15 minute technical defense. Elements a strong answer
should cover — write your own words.

## Suggested flow

1. **Problem & risks** — certify SauceDemo UI flows and DummyJSON API
   contracts automatically before merge; keep feedback fast and honest.
2. **Strategy** — vertical slices per increment; smallest justified
   change each time; no framework built upfront.
3. **Architecture** — Page Objects for UI, one API object for HTTP,
   data/models separated; see `architecture.md` + ADRs.
4. **Demo** — `npx playwright test --project=chromium` locally; CI run
   on GitHub Actions with typecheck, 3 browsers, artifacts.
5. **Observability** — JSON reporter → schema 1.0 → metrics → report;
   flaky counted once; "insufficient data" honesty.
6. **Limitations** — public practice systems can change; mock ≠ real
   contract; trends need history; required checks are manual config.
7. **Evolution** — more endpoints, fixtures when repetition earns them,
   committed history for trends.

## Panel questions to prepare (with what a good answer covers)

1. **Why this architecture?** → responsibilities mapped before code;
   Page Objects chosen over fixtures for one-reason-to-change pages;
   no BasePage because nothing justified it yet.
2. **What did you decide NOT to automate?** → GraphQL (no surface),
   visual regression, performance, auth state (public demo creds),
   broad CRUD on DummyJSON.
3. **How do you verify CI reports a real failure?** → exit-code
   propagation, no `continue-on-error`/`|| true`; artifacts upload with
   `!cancelled()`; trace on retry.
4. **Product vs automation vs infrastructure defect?** → reproduce
   locally, inspect trace/report, check external service status;
   never weaken assertions to go green.
5. **What evidence backs the metrics?** → `test-results/results.json`
   → normalized schema → formulas with explicit denominators;
   synthetic fixtures only in unit tests, labeled.
6. **Practice service unavailable?** → mock layer proves UI handling;
   real API test goes red honestly; never fake green.
7. **What did the AI agent contribute vs. what did you review?** →
   agent proposed architecture, you approved each gate; you own the
   diff review and the trust decision.
8. **Trade-off to reduce feedback time?** → fewer browsers/projects in
   PR vs full matrix on main; shard CI; accept coverage trade-off.
9. **Open risks?** → external service drift, required-checks config,
   short observability history.
10. **Scale without over-engineering?** → add Page Objects/fixtures
    only when a second consumer exists; keep data-driven tables in
    `tests/data/`; no generic managers.

## Release-decision exercise (didactic, fictitious data)

Case: 291/300 tests passed (97%); 9 failures (2 auth, 3 external
dependency, 4 unknown); 14 flaky; mandatory Quality Gate failed;
critical-requirement coverage unconfirmed.

**Prepare a reasoned recommendation** covering: missing evidence you
would request, mitigations per failure class, who owns risk
acceptance, and conditions to reconsider the release. Do not mix these
figures with this repository's real metrics.
