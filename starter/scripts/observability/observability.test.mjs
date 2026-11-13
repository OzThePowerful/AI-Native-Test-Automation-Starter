// Tests unitarios del normalizador y métricas — fixtures SINTÉTICOS,
// no son evidencia de ejecuciones reales.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRun, SCHEMA_VERSION } from './normalize.mjs';
import { computeMetrics } from './metrics.mjs';

// Fixture sintético con la forma real del reporter JSON de Playwright.
function pwJson(specs) {
  return {
    config: {},
    suites: [{ title: 'suite', file: 'x.spec.ts', suites: [], specs }],
    errors: [],
    stats: { startTime: '2026-01-01T00:00:00Z', expected: 0, unexpected: 0, flaky: 0, skipped: 0 },
  };
}

function spec(title, projectName, results) {
  return {
    title,
    file: 'tests/demo.spec.ts',
    tests: [{ projectName, expectedStatus: 'passed', results }],
  };
}

const res = (status, duration = 100, retry = 0) => ({ status, duration, retry });

test('normaliza tests passed y failed con métricas correctas', () => {
  const doc = normalizeRun(pwJson([
    spec('pasa', 'chromium', [res('passed', 500)]),
    spec('falla', 'chromium', [res('failed', 800)]),
  ]), { runId: 'r1', source: 'local', commitSha: null });

  assert.equal(doc.schemaVersion, SCHEMA_VERSION);
  assert.equal(doc.tests.length, 2);
  const m = computeMetrics(doc.tests);
  assert.deepEqual(
    { p: m.passed, f: m.failed, fl: m.flaky, s: m.skipped, e: m.executed, pr: m.passRate },
    { p: 1, f: 1, fl: 0, s: 0, e: 2, pr: 50 }
  );
});

test('skipped queda fuera del denominador del pass rate', () => {
  const doc = normalizeRun(pwJson([
    spec('pasa', 'chromium', [res('passed')]),
    spec('salta', 'chromium', [res('skipped')]),
  ]));
  const m = computeMetrics(doc.tests);
  assert.equal(m.skipped, 1);
  assert.equal(m.executed, 1);
  assert.equal(m.passRate, 100);
});

test('fail→pass en retry cuenta una vez como flaky', () => {
  const doc = normalizeRun(pwJson([
    spec('inestable', 'chromium', [res('failed', 100, 0), res('passed', 100, 1)]),
  ]));
  assert.equal(doc.tests.length, 1);
  assert.equal(doc.tests[0].finalStatus, 'flaky');
  assert.equal(doc.tests[0].attempts.length, 2);
  const m = computeMetrics(doc.tests);
  assert.equal(m.flaky, 1);
  assert.equal(m.executed, 1); // un solo test lógico, no dos
});

test('mismo título en proyectos distintos son tests distintos', () => {
  const doc = normalizeRun(pwJson([
    spec('login', 'chromium', [res('passed')]),
    spec('login', 'firefox', [res('passed')]),
  ]));
  assert.equal(doc.tests.length, 2);
  assert.notEqual(doc.tests[0].id, doc.tests[1].id);
});

test('JSON sin suites → completeness unknown y zero tests', () => {
  const doc = normalizeRun({ config: {} });
  assert.equal(doc.tests.length, 0);
  assert.equal(doc.run.completeness, 'unknown');
  const m = computeMetrics(doc.tests);
  assert.equal(m.passRate, null); // nunca dividir por cero
});

test('errores top-level → completeness partial', () => {
  const json = pwJson([spec('pasa', 'chromium', [res('passed')])]);
  json.errors = [{ message: 'worker crashed' }];
  const doc = normalizeRun(json);
  assert.equal(doc.run.completeness, 'partial');
});

test('execución vacía → passRate null (insufficient data, no 0%)', () => {
  const m = computeMetrics([]);
  assert.equal(m.passRate, null);
  assert.equal(m.testsTotal, 0);
});

test('el contrato no filtra stdout/stderr ni mensajes de error', () => {
  const doc = normalizeRun(pwJson([
    spec('pasa', 'chromium', [res('passed')]),
  ]));
  const serialized = JSON.stringify(doc);
  assert.ok(!serialized.includes('stdout'));
  assert.ok(!serialized.includes('stderr'));
  assert.ok(!serialized.includes('password'));
});

test('timeout e interrupted se mapean a failed', () => {
  const doc = normalizeRun(pwJson([
    spec('t', 'chromium', [res('timedOut')]),
    spec('i', 'chromium', [res('interrupted')]),
  ]));
  const m = computeMetrics(doc.tests);
  assert.equal(m.failed, 2);
});

test('status desconocido → unknown, fuera del pass rate', () => {
  const doc = normalizeRun(pwJson([
    spec('x', 'chromium', [{ status: 'weirdNewStatus', duration: 1 }]),
  ]));
  assert.equal(doc.tests[0].finalStatus, 'unknown');
  assert.equal(computeMetrics(doc.tests).executed, 0);
});
