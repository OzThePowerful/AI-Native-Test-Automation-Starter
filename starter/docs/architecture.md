# Architecture

## Diagram

```text
┌────────────────────────── starter/ ──────────────────────────┐
│                                                             │
│  tests/                                                     │
│  ├── example.spec.ts          (scaffold demo — playwright.dev)│
│  ├── saucedemo.spec.ts        UI scenarios                   │
│  │     └──→ pages/            LoginPage, ProductsPage, CartPage│
│  │           └──→ data/       saucedemo.data.ts              │
│  ├── api/products.spec.ts     API contract scenarios         │
│  │     └──→ products.api.ts   ProductsApi → APIRequestContext │
│  │           └──→ data/dummyjson.data.ts, models/product.ts  │
│  ├── mocking/*.spec.ts        route interception demo        │
│  └── (models/, data/)         shared types & scenario inputs │
│                                                             │
│  scripts/observability/       normalize → metrics → report   │
│  docs/                        course guides                  │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
   playwright.config.ts  (projects: chromium/firefox/webkit,
                          reporters: list + html + json)
              │
              ▼
   .github/workflows/playwright.yml  (CI: typecheck → install →
                                      test → observability → artifacts)
```

## Responsibilities

| Layer | Owns | Must not own |
|---|---|---|
| Specs | Scenario intent and business assertions | Locator mechanics, HTTP plumbing |
| Page Objects | Page-specific UI knowledge and actions | Test data, config, assertions policy |
| API object | Endpoint knowledge and request mechanics | Scenario expectations |
| Data/Models | Scenario inputs and typed contracts | Logic |
| Observability scripts | Result normalization, metrics, reports | Test behavior, CI gating |

## Dependency direction

```text
spec → pages/api objects → Playwright (page, request) → external systems
spec → data/models (types and constants only)
scripts/observability → test-results/results.json (read-only input)
```

## ADR-001: Page Objects over fixtures for UI layer

- **Context:** Increment #04 needed a boundary for UI knowledge.
- **Alternatives:** custom fixtures, Page Objects, inline locators.
- **Decision:** Page Objects per page (Login/Products/Cart). Smallest
  structure matching one page = one reason to change.
- **Consequences:** locators centralized; adding flows is cheap; no
  framework machinery (no BasePage, no DI container).

## ADR-002: APIRequestContext over HTTP libraries

- **Context:** Increment #05 needed real API calls.
- **Alternatives:** axios/got (new dependency), Playwright `request`.
- **Decision:** Playwright's built-in `request` fixture + one
  `ProductsApi` class. Zero new dependencies.
- **Consequences:** API tests share runner lifecycle; no auth/session
  machinery invented (public endpoints).

## ADR-003: Native route interception over MSW/Nock

- **Context:** Increment #05B needed browser-traffic mocking.
- **Decision:** `page.route` + `route.fulfill` — Playwright-native,
  per-test isolation, no dependency.

## ADR-004: JSON reporter + custom normalizer over SaaS analytics

- **Context:** Increment #08 needed metrics without infrastructure.
- **Alternatives:** Allure/ReportPortal (new deps + server), JSON
  reporter + Node scripts.
- **Decision:** native `json` reporter → versioned schema (1.0) →
  pure metrics → static report. No external service, auditable formulas.
- **Consequences:** trends require accumulated history files; storage
  strategy documented in `docs/observability.md`.
