# macOS Setup

Step-by-step setup for macOS (Apple Silicon or Intel). When you finish,
run the validator and complete the [pre-course checklist](pre-course-checklist.md).

> On a corporate laptop, follow your IT team's software policy. Do not
> disable security controls or use `sudo` as a generic fix.

## 1. Devin Desktop

1. Download Devin Desktop from <https://devin.ai/desktop>.
2. Move it to **Applications**, open it, and sign in.
3. Confirm you can open a folder and that the AI/Agent features work.

## 2. Node.js LTS (includes npm)

1. Download the **LTS** macOS installer from <https://nodejs.org/en/download>.
2. Run the installer.
3. Close Terminal and open a new window.
4. Verify:

   ``` bash
   node -v
   npm -v
   npm ping
   ```

## 3. Git

1. Check whether Git is already available:

   ``` bash
   git --version
   ```

2. If macOS offers to install the **Command Line Tools**, accept. You
   can also follow the options at <https://git-scm.com/install/>.
3. Configure your identity (use your GitHub email):

   ``` bash
   git config --global user.name "Your Name"
   git config --global user.email "you@example.com"
   ```

## 4. Browser

Install Google Chrome (<https://www.google.com/chrome/>) or Microsoft
Edge (<https://www.microsoft.com/edge/download>).

## 5. Get the kit

``` bash
git clone https://github.com/<org>/AI-Native-Test-Automation-Starter.git
cd AI-Native-Test-Automation-Starter
```

Replace `<org>` with the organization or account your instructor shares.

## 6. Run the validator

``` bash
bash scripts/verify-environment.sh
```

## macOS notes

- If `npm install -g` fails with `EACCES`, do not use `sudo`. The
  course only needs local (project) installs.
- More fixes: [troubleshooting.md](troubleshooting.md).
