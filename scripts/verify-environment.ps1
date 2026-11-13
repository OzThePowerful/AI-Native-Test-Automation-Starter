# AI-Native Test Automation Engineering - environment validator (Windows PowerShell 5.1+ / PowerShell 7+).
# Read-only: checks tools, Git identity, and connectivity. Changes nothing.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\verify-environment.ps1

$ErrorActionPreference = 'Continue'
$script:Pass = 0
$script:Warn = 0
$script:Fail = 0

function Write-Ok([string]$Message)   { $script:Pass++; Write-Host '  [ OK ] ' -ForegroundColor Green -NoNewline; Write-Host $Message }
function Write-Warn([string]$Message) { $script:Warn++; Write-Host '  [WARN] ' -ForegroundColor Yellow -NoNewline; Write-Host $Message }
function Write-Fail([string]$Message) { $script:Fail++; Write-Host '  [FAIL] ' -ForegroundColor Red -NoNewline; Write-Host $Message }
function Write-Section([string]$Title) { Write-Host ''; Write-Host $Title }

function Test-Command([string]$Name) {
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-Url([string]$Name, [string]$Url, [bool]$Required) {
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
        $params = @{ Uri = $Url; Method = 'Get'; TimeoutSec = 15; MaximumRedirection = 5; ErrorAction = 'Stop' }
        if ($PSVersionTable.PSVersion.Major -lt 6) { $params.UseBasicParsing = $true }
        $response = Invoke-WebRequest @params
        Write-Ok "$Name reachable ($Url, HTTP $([int]$response.StatusCode))"
    }
    catch {
        $status = $null
        if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
        if ($status -and $status -lt 500) {
            Write-Ok "$Name reachable ($Url, HTTP $status)"
        }
        elseif ($Required) {
            Write-Fail "$Name unreachable ($Url). Check VPN/proxy/firewall - see docs/troubleshooting.md"
        }
        else {
            Write-Warn "$Name unreachable ($Url). Check VPN/proxy/firewall - see docs/troubleshooting.md"
        }
    }
}

Write-Host 'AI-Native Test Automation Engineering - Environment Check'
Write-Host "Platform: $([Environment]::OSVersion.VersionString) / PowerShell $($PSVersionTable.PSVersion)"

Write-Section '1. Software'
if (Test-Command 'node') {
    $nodeVersion = (& node -v 2>$null)
    $nodeMajor = 0
    [void][int]::TryParse(($nodeVersion -replace '^v', '').Split('.')[0], [ref]$nodeMajor)
    if ($nodeMajor -ge 20 -and ($nodeMajor % 2) -eq 0) {
        Write-Ok "Node.js $nodeVersion"
    }
    else {
        Write-Warn "Node.js $nodeVersion - install an LTS release (even major version, 20 or newer)"
    }
}
else {
    Write-Fail 'Node.js not found - see docs/troubleshooting.md#node-command-not-found'
}

if (Test-Command 'npm') {
    Write-Ok "npm $(& npm -v 2>$null)"
}
else {
    Write-Fail 'npm not found - see docs/troubleshooting.md#npm-command-not-found'
}

if (Test-Command 'npx') {
    Write-Ok 'npx available'
}
else {
    Write-Fail 'npx not found - reinstall Node.js LTS'
}

if (Test-Command 'git') {
    Write-Ok "$(& git --version 2>$null)"
}
else {
    Write-Fail 'Git not found - see docs/troubleshooting.md#git-command-not-found'
}

Write-Section '2. Git identity'
if (Test-Command 'git') {
    $gitName = (& git config --global user.name 2>$null)
    $gitEmail = (& git config --global user.email 2>$null)
    if ($gitName) { Write-Ok "user.name is set ($gitName)" } else { Write-Warn 'user.name not set - run: git config --global user.name "Your Name"' }
    if ($gitEmail) { Write-Ok "user.email is set ($gitEmail)" } else { Write-Warn 'user.email not set - run: git config --global user.email "you@example.com"' }
}
else {
    Write-Warn 'Skipped - Git not installed'
}

Write-Section '3. npm registry'
if (Test-Command 'npm') {
    & npm ping *> $null
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "npm ping succeeded ($(& npm config get registry 2>$null))"
    }
    else {
        Write-Fail 'npm ping failed - see docs/troubleshooting.md#npm-ping-fails'
    }
}
else {
    Write-Warn 'Skipped - npm not installed'
}

Write-Section '4. Connectivity'
Test-Url 'GitHub'              'https://github.com'               $true
Test-Url 'npm registry'        'https://registry.npmjs.org'       $true
Test-Url 'Playwright docs'     'https://playwright.dev'           $true
Test-Url 'Playwright browsers' 'https://cdn.playwright.dev'       $false
Test-Url 'SauceDemo'           'https://www.saucedemo.com'        $true
Test-Url 'DummyJSON'           'https://dummyjson.com/products/1' $true
Test-Url 'ReqRes'              'https://reqres.in'                $false

Write-Section 'Summary'
Write-Host "  Passed: $script:Pass  Warnings: $script:Warn  Failed: $script:Fail"
Write-Host ''

if ($script:Fail -gt 0) {
    Write-Host 'NOT READY' -ForegroundColor Red -NoNewline
    Write-Host ' - fix the failed checks. See docs/troubleshooting.md'
    exit 1
}
elseif ($script:Warn -gt 0) {
    Write-Host 'READY WITH WARNING' -ForegroundColor Yellow -NoNewline
    Write-Host ' - review the warnings before Lab 0.'
    exit 0
}
else {
    Write-Host 'READY' -ForegroundColor Green -NoNewline
    Write-Host ' - your environment is prepared for Lab 0.'
    exit 0
}
