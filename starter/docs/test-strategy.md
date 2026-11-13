# Test Strategy — Capstone

## Scope and priorities

| Priority | Area | Coverage |
|---|---|---|
| P0 | Critical UI flows (SauceDemo) | Login, catalog display, add-to-cart |
| P0 | API contract sanity (DummyJSON) | GET product by id, 404 path |
| P1 | Negative paths | Invalid login credentials |
| P1 | Regression before merge | Full suite in CI on every push/PR |
| P2 | Browser/network resilience | Route interception with mocked response |
| P3 | GraphQL | Not in scope — no GraphQL surface in the course systems |

## Systems under test

- **SauceDemo** (`saucedemo.com`) — public UI practice app; server-rendered,
  no client-side API consumption we rely on.
- **DummyJSON** (`dummyjson.com`) — public REST practice API; products
  endpoint only.
- These are **independent systems** — no invented integrations.

## Test layers

1. **UI e2e** — `tests/saucedemo.spec.ts` with Page Objects
   (`tests/pages/`). Real browser, real assertions on observable state.
2. **API contract** — `tests/api/products.spec.ts` via Playwright
   `APIRequestContext` (fixture `request`). Validates status, identity,
   contract fields, and business-plausible data.
3. **Network mocking** — `tests/mocking/product-browser-mock.spec.ts`.
   Proves UI consumption of controlled responses; explicitly does **not**
   validate the real backend contract.
4. **Observability unit tests** — `scripts/observability/*.test.mjs`
   (`node:test`), synthetic fixtures only.

## Conventions

- Web-first assertions, stable locators, no `waitForTimeout`.
- Test data in `tests/data/`; types in `tests/models/`.
- Credentials are public demo values only — no secrets anywhere.
- Every spec is independent: fresh browser context per test, no shared
  state, no ordering assumptions.

## Out of scope

GraphQL, performance testing, visual regression, accessibility audits,
production integrations, database state.
