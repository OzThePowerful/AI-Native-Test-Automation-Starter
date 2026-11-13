# Pre-Course Checklist

Complete this checklist **before Lab 0**, on the same computer and, if
possible, the same network/VPN you will use during the course.

Setup steps: [Windows](windows-setup.md) · [macOS](macos-setup.md).
Problems: [troubleshooting.md](troubleshooting.md).

## 1. Software

- [ ] Devin Desktop (formerly Windsurf) installed, opens, and you can sign in
- [ ] Node.js **LTS** installed (`node -v` prints a version, e.g. `v24.x.x`)
- [ ] npm available (`npm -v` prints a version)
- [ ] Git installed (`git --version` prints a version)
- [ ] Google Chrome or Microsoft Edge installed

## 2. Accounts

- [ ] Devin account with an active Pro plan, signed in from Devin Desktop
- [ ] GitHub account with a verified email
- [ ] ChatGPT or Claude access (optional)

## 3. Terminal pre-flight

Open PowerShell, Terminal, or the IDE's integrated terminal:

``` bash
node -v
npm -v
git --version
npm ping
```

- [ ] The first three commands print versions
- [ ] `npm ping` completes successfully (usually prints `PONG`)

## 4. Connectivity

Open each site in a browser:

- [ ] <https://github.com> loads and you can sign in
- [ ] <https://www.npmjs.com> loads
- [ ] <https://playwright.dev> loads
- [ ] <https://www.saucedemo.com> shows the login screen
- [ ] <https://dummyjson.com/products/1> returns JSON
- [ ] <https://reqres.in> loads

## 5. Permissions

- [ ] `npm install` works in a temporary folder:

  ``` bash
  mkdir course-precheck
  cd course-precheck
  npm init -y
  npm install lodash
  ```

  You can delete `course-precheck` afterwards.

- [ ] Git identity is configured:

  ``` bash
  git config --global user.name "Your Name"
  git config --global user.email "you@example.com"
  ```

  Use an email associated with your GitHub account.

- [ ] Your VPN/proxy does not block GitHub, npm, or the practice sites

## 6. Run the validator

From the repository root:

``` powershell
# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File scripts\verify-environment.ps1
```

``` bash
# macOS / Linux
bash scripts/verify-environment.sh
```

- [ ] The validator prints `READY` or `READY WITH WARNING`

## 7. Report your status to the instructor

| Status | Meaning |
|---|---|
| **READY** | All required checks pass. |
| **READY WITH WARNING** | You can participate, but have a known restriction to resolve during Lab 0. Include the details. |
| **NOT READY** | One or more required checks fail. Include the problem, the exact error, and the affected tool. |

You do **not** need to build a framework or create a project in
advance. Lab 0 creates the project starting point.
