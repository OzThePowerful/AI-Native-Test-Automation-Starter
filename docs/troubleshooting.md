# Troubleshooting

Find the error you see, apply the quick fix, and re-run the validator.
If a fix does not work within about 5 minutes, report it to your
instructor with the **exact error message**.

> Never disable antivirus, certificates, proxy, VPN, or other security
> controls to force a fix. If a corporate restriction blocks you, ask
> IT or use an authorized environment.

## Tools

### node command not found

`node: command not found` or `'node' is not recognized`.

1. Confirm Node.js LTS is installed ([Windows](windows-setup.md#2-nodejs-lts-includes-npm),
   [macOS](macos-setup.md#2-nodejs-lts-includes-npm)).
2. Close **all** terminals, including the IDE, and open a new one.
3. Run `node -v`. If it still fails, check your `PATH` or ask IT.

### npm command not found

Run `node -v` first. If Node works but npm does not, repair or
reinstall Node.js LTS from <https://nodejs.org/en/download>.

### git command not found

Install Git from <https://git-scm.com/install/> and open a new terminal.

### Node.js version is not LTS

The validator warns when the major version is odd or older than 20.
Install the current **LTS** release from <https://nodejs.org/en/download>.

### PowerShell blocks the validator script

`running scripts is disabled on this system`: run it with a one-time
bypass, which does not change your system policy:

``` powershell
powershell -ExecutionPolicy Bypass -File scripts\verify-environment.ps1
```

If your organization blocks this, run the commands from the
[terminal pre-flight](pre-course-checklist.md#3-terminal-pre-flight) manually.

## Network

### npm ping fails

Likely causes: VPN/proxy, firewall, corporate certificates, a
restricted registry, or an organization npm configuration.

1. Check which registry npm uses: `npm config get registry`.
2. Test the same command with and without VPN, if your policy allows.
3. If it only fails on the corporate network, ask IT for the approved
   proxy/registry settings. Do not set `strict-ssl=false`.

### Site blocked by VPN or proxy

If GitHub, SauceDemo, DummyJSON, or ReqRes works without the VPN but
fails with it, there is a network restriction that must be resolved
with IT **before** the course.

## Lab 0

### npm install fails

Errors such as `ECONNRESET`, `ETIMEDOUT`, `SELF_SIGNED_CERT_IN_CHAIN`,
`EACCES`, or `EPERM` while running `npm init playwright@latest` or
`npm install`.

1. Network or certificate errors: see [npm ping fails](#npm-ping-fails).
2. Permission errors (`EACCES`/`EPERM`): make sure the project folder is
   inside your user folder (not `C:\Program Files` or a synced/locked
   folder) and do not use `sudo`.
3. Scaffold confusion or a broken config: delete the project folder
   and start Lab 0 Step 3 again.

**Still blocked after about 5 minutes?** Use the recovery path: the
ready Playwright project in [`starter/`](../starter/README.md):

``` bash
cd starter
npm ci
npx playwright install
npx playwright test
```

`npm ci` still needs access to the npm registry, so if the cause is a
restricted network, the recovery path will fail the same way.

### Playwright cannot download browsers

`npx playwright install` fails or hangs. This usually means a
proxy/firewall, certificate, download restriction, or permissions issue.

1. Try Chromium only: `npx playwright install chromium`.
2. Record the exact error and share it with your instructor or IT.
3. Do not disable antivirus, certificates, or proxy settings.

**Scaffold worked but you cannot fix the config?** Continue with the
[`starter/`](../starter/README.md) recovery project. It needs the same
browser download, so if the download itself is blocked, the fix is a
different network or an IT escalation.

### Tests fail with a timeout on playwright.dev

The example tests open <https://playwright.dev>. Confirm it loads in
your browser on the same network, then run the tests again.

## Still Blocked?

Send your instructor:

- The full validator output
- The exact command and error message
- Your OS, Node.js version (`node -v`), and whether you use a VPN
