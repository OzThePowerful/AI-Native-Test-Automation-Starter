# Traceability Matrix

Requirement → risk → tests → evidence → status.

| Req | Business risk | Test(s) | Implementation | Evidence | Status |
|---|---|---|---|---|---|
| BR-01 Auth | Bad credentials accepted silently | `saucedemo.spec.ts` login test + invalid-credentials test | `pages/login.page.ts`, `data/saucedemo.data.ts` | CI run `41c3f7f` (green), local runs | Meets |
| BR-02 Catalog consistency | Corrupt/missing product data | `api/products.spec.ts` contract asserts (id, title, price>0, stock≥0) | `api/products.api.ts`, `models/product.ts` | CI run `41c3f7f` | Meets (single endpoint scope) |
| BR-03 Cart operations | Item lost between inventory and cart | backpack add-to-cart test (badge=1, /cart.html, item visible) | `pages/products.page.ts`, `pages/cart.page.ts` | CI run `41c3f7f` | Meets |
| BR-04 API contracts | Contract drift undetected | products.spec.ts GET 200 asserts + 404 negative test | `products.api.ts` | Local + CI `41c3f7f` | Partial — one endpoint only |
| BR-05 Regression gate | Broken code merged | `playwright.yml` full suite + `tsc --noEmit` on push/PR | `.github/workflows/playwright.yml` | Runs `41c3f7f`, `b11d1e6` green | Partial — required checks config not verified |
| BR-06 Traceability | Results not investigable | observability layer: schema 1.0, metrics, history, step summary | `scripts/observability/`, `docs/observability.md` | Local report + CI artifact | Partial — trends need history |
| BR-07 Deterministic UI states | Flaky UI tests | `mocking/product-browser-mock.spec.ts` | `page.route`/`route.fulfill` | Local + CI | Meets (scoped demo) |

## Evidence registry

| ID | Execution | Env | Commit | Result | Limitation |
|---|---|---|---|---|---|
| EV-01 | `npx playwright test --project=chromium` | local Win | working tree | 6→8 tests pass | chromium only locally |
| EV-02 | GitHub Actions Playwright Tests #2 | ubuntu CI | `41c3f7f` | success (18 tests, 3 browsers) | — |
| EV-03 | GitHub Actions Playwright Tests #3 | ubuntu CI | `b11d1e6` | success (incl. observability step) | history not committed by CI |
| EV-04 | `node --test scripts/observability/*.test.mjs` | local | `b11d1e6` | 10/10 pass | synthetic fixtures |
| EV-05 | Validate Kit runs #1/#2 | ubuntu/macos/windows | `b2d5313`,`41c3f7f` | success | — |
