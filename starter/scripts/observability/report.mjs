#!/usr/bin/env node
// Genera el reporte de observabilidad a partir del JSON del reporter de
// Playwright. Uso:
//   node scripts/observability/report.mjs [ruta-results.json]
// Salidas: observability/out/report.md + normalized-run.json,
//          append a observability/history/, y GITHUB_STEP_SUMMARY en CI.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeRun } from './normalize.mjs';
import { computeMetrics } from './metrics.mjs';

const STARTER_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const OUT_DIR = join(STARTER_ROOT, 'observability', 'out');
const HISTORY_DIR = join(STARTER_ROOT, 'observability', 'history');
const DEFAULT_RESULTS = join(STARTER_ROOT, 'test-results', 'results.json');

const resultsPath = process.argv[2] ?? DEFAULT_RESULTS;

function buildMarkdown(doc, metrics, historyRuns) {
  const r = doc.run;
  const lines = [];
  lines.push('# Observability Report');
  lines.push('');
  lines.push(`- **Run ID:** ${r.runId ?? 'unknown'}`);
  lines.push(`- **Source:** ${r.source}`);
  lines.push(`- **Started:** ${r.startedAt ?? 'unknown'}`);
  lines.push(`- **Commit:** ${r.commitSha ?? 'unknown (local run)'}`);
  lines.push(`- **Workflow:** ${r.workflow ?? 'n/a'}`);
  lines.push(`- **Completeness:** ${r.completeness}${r.completenessReason ? ` — ${r.completenessReason}` : ''}`);
  lines.push(`- **Results file:** ${doc.provenance.resultsFile ?? resultsPath}`);
  lines.push('');
  lines.push('## Metrics');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|---|---|');
  lines.push(`| Logical tests | ${metrics.testsTotal} |`);
  lines.push(`| Passed | ${metrics.passed} |`);
  lines.push(`| Failed | ${metrics.failed} |`);
  lines.push(`| Flaky (fail→pass on retry, counted once) | ${metrics.flaky} |`);
  lines.push(`| Skipped (excluded from pass rate) | ${metrics.skipped} |`);
  lines.push(`| Unknown | ${metrics.unknown} |`);
  lines.push(`| Executed (denominator) | ${metrics.executed} |`);
  lines.push(`| Pass rate | ${metrics.passRate === null ? 'Insufficient data (no executed tests)' : `${metrics.passRate}%`} |`);
  lines.push(`| Total test duration | ${metrics.durationMs} ms |`);
  lines.push('');
  lines.push('## Tests');
  lines.push('');
  lines.push('| Test | Project | Status | Duration (ms) |');
  lines.push('|---|---|---|---|');
  for (const t of doc.tests) {
    lines.push(`| ${t.title ?? t.id} | ${t.project} | ${t.finalStatus} | ${t.durationMs} |`);
  }
  lines.push('');
  lines.push('## History & trends');
  lines.push('');
  if (historyRuns.length < 2) {
    lines.push('**Insufficient history for trends** — need at least 2 recorded executions.');
  } else {
    lines.push('| Run | Commit | Pass rate | Tests |');
    lines.push('|---|---|---|---|');
    for (const h of historyRuns) {
      lines.push(`| ${h.runId ?? '?'} | ${(h.commitSha ?? 'unknown').slice(0, 7)} | ${h.passRate === null ? 'n/a' : `${h.passRate}%`} | ${h.testsTotal} |`);
    }
    lines.push('');
    lines.push('_Comparison is informational only; runs with different test populations are not strictly comparable._');
  }
  lines.push('');
  lines.push('## Definitions');
  lines.push('');
  lines.push('- `flaky`: failed at least once, passed on a later retry — counted once as a logical test.');
  lines.push('- `passRate`: passed / (passed + failed + flaky). `skipped` and `unknown` are excluded.');
  lines.push('- Durations are per-test sums of Playwright attempt durations, not wall-clock CI time.');
  lines.push('- This report contains metadata only — no secrets, stdout, or error payloads.');
  return lines.join('\n');
}

function main() {
  let raw;
  try {
    raw = readFileSync(resultsPath, 'utf8');
  } catch {
    console.error(`No se encontró el archivo de resultados: ${resultsPath}`);
    console.error('Ejecuta primero: npx playwright test (genera test-results/results.json)');
    process.exit(1);
  }

  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    console.error(`JSON inválido en ${resultsPath}: ${err.message}`);
    process.exit(1);
  }

  const isCI = process.env.CI === 'true';
  const doc = normalizeRun(json, {
    runId: process.env.GITHUB_RUN_ID ?? `local-${Date.now()}`,
    source: isCI ? 'github-actions' : 'local',
    commitSha: process.env.GITHUB_SHA ?? null,
    workflow: process.env.GITHUB_WORKFLOW ?? null,
    resultsFile: resultsPath,
  });

  const metrics = computeMetrics(doc.tests);

  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(HISTORY_DIR, { recursive: true });

  // Historial idempotente: un runId+commitSha ya registrado no se duplica.
  const historyFile = join(HISTORY_DIR, `run-${doc.run.runId}.json`);
  let historyRuns = [];
  if (!existsSync(historyFile)) {
    writeFileSync(historyFile, JSON.stringify(doc, null, 2));
  }
  for (const f of readdirSync(HISTORY_DIR).filter((f) => f.endsWith('.json'))) {
    try {
      const h = JSON.parse(readFileSync(join(HISTORY_DIR, f), 'utf8'));
      historyRuns.push({
        runId: h.run?.runId ?? null,
        commitSha: h.run?.commitSha ?? null,
        startedAt: h.run?.startedAt ?? null,
        passRate: computeMetrics(h.tests ?? []).passRate,
        testsTotal: h.tests?.length ?? 0,
      });
    } catch { /* archivo de historial corrupto: se ignora */ }
  }
  historyRuns.sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt)));

  const markdown = buildMarkdown(doc, metrics, historyRuns);
  writeFileSync(join(OUT_DIR, 'report.md'), markdown);
  writeFileSync(join(OUT_DIR, 'normalized-run.json'), JSON.stringify(doc, null, 2));

  if (process.env.GITHUB_STEP_SUMMARY) {
    writeFileSync(process.env.GITHUB_STEP_SUMMARY, markdown + '\n', { flag: 'a' });
  }

  console.log(`Observability report generado:`);
  console.log(`  tests: ${metrics.testsTotal} | pass rate: ${metrics.passRate ?? 'n/a'}% | flaky: ${metrics.flaky}`);
  console.log(`  → observability/out/report.md`);
}

main();
