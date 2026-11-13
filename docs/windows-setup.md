# Windows Setup

Step-by-step setup for Windows 10/11. When you finish, run the
validator and complete the [pre-course checklist](pre-course-checklist.md).

> On a corporate laptop, keep the installer defaults unless your IT
> team requires otherwise. Do not disable security controls.

## 1. Devin Desktop

1. Download Devin Desktop from <https://devin.ai/desktop>.
2. Install it and sign in.
3. Confirm you can open a folder and that the AI/Agent features work.

## 2. Node.js LTS (includes npm)

1. Download the **LTS** installer from <https://nodejs.org/en/download>.
2. Run the installer and keep the default options.
3. Close **all** terminals and open a new PowerShell window.
4. Verify:

   ``` powershell
   node -v
   npm -v
   npm ping
   ```

## 3. Git

1. Download Git for Windows from <https://git-scm.com/install/>.
2. Run the installer and keep the default options.
3. Open a new PowerShell window and verify:

   ``` powershell
   git --version
   ```

4. Configure your identity (use your GitHub email):

   ``` powershell
   git config --global user.name "Your Name"
   git config --global user.email "you@example.com"
   ```

## 4. Browser

Install Google Chrome (<https://www.google.com/chrome/>) or use
Microsoft Edge, which ships with Windows.

## 5. Get the kit

``` powershell
git clone https://github.com/<org>/AI-Native-Test-Automation-Starter.git
cd AI-Native-Test-Automation-Starter
```

Replace `<org>` with the organization or account your instructor shares.

## 6. Run the validator

``` powershell
powershell -ExecutionPolicy Bypass -File scripts\verify-environment.ps1
```

`-ExecutionPolicy Bypass` applies only to this single run; it does not
change your system policy. If your organization blocks it, ask IT, or
run the commands from [section 3 of the checklist](pre-course-checklist.md#3-terminal-pre-flight)
manually.

## Windows notes

- **Windows PowerShell 5.1** does not support `&&` between commands.
  Run chained commands one per line, or use PowerShell 7 or Git Bash.
- If a command is "not recognized" right after installing, close every
  terminal (including the IDE) and open a new one.
- More fixes: [troubleshooting.md](troubleshooting.md).
