# AI-Native Test Automation Starter

Pre-course kit for **AI-Native Test Automation Engineering**.

It helps you arrive at Lab 0 with a validated environment, and gives you
a ready-to-run Playwright project if your own setup fails during Lab 0.

## Quick Start

1. Follow the setup guide for your operating system:
   [Windows](docs/windows-setup.md) or [macOS](docs/macos-setup.md).
2. Run the environment validator from the repository root.

   Windows (PowerShell):

   ``` powershell
   powershell -ExecutionPolicy Bypass -File scripts\verify-environment.ps1
   ```

   macOS / Linux:

   ``` bash
   bash scripts/verify-environment.sh
   ```

3. Complete the [pre-course checklist](docs/pre-course-checklist.md).
4. On course day, follow the [Lab 0 guide](docs/lab-0-guide.md).

The validators are **read-only**. They check tools, Git identity, and
connectivity, then print `READY`, `READY WITH WARNING`, or `NOT READY`.
They never install or change anything.

## Repository Structure

``` text
AI-Native-Test-Automation-Starter/
├── README.md
├── LICENSE
├── .gitignore
├── .github/workflows/
│   ├── validate-kit.yml        # lints and runs the environment validators
│   └── playwright.yml          # runs the starter/ Playwright tests
├── docs/
│   ├── pre-course-checklist.md
│   ├── windows-setup.md
│   ├── macos-setup.md
│   ├── troubleshooting.md
│   └── lab-0-guide.md
├── scripts/
│   ├── verify-environment.sh   # macOS / Linux validator
│   └── verify-environment.ps1  # Windows validator
└── starter/                    # ready-to-run Playwright + TypeScript project
    ├── README.md
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── playwright.config.ts
    ├── .gitignore
    └── tests/example.spec.ts
```

## Scope

This kit covers **environment readiness and Lab 0 recovery only**.

- `docs/` and `scripts/` get your machine ready before the course.
- `starter/` is a ready Playwright project that serves as the
  **recovery path**: if `npm init playwright@latest` or the browser
  download fails during Lab 0 and you cannot fix it quickly, clone this
  repository and continue from `starter/`. See
  [starter/README.md](starter/README.md).

It is **not** the course framework. `starter/` is the plain output of
the Playwright initializer, with no Page Objects, fixtures, or other
abstractions. You will build the real framework during the course.

## Getting Help

- Check [docs/troubleshooting.md](docs/troubleshooting.md) first.
- If you are blocked, send your instructor the full validator output
  and the exact error message.
- Do not disable antivirus, certificates, proxy, VPN, or other security
  controls. Ask your IT team for help instead.

## License

[MIT](LICENSE)
