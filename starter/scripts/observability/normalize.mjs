// Normaliza el JSON nativo del reporter de Playwright al contrato
// observability schemaVersion 1.0. Sin dependencias externas.

export const SCHEMA_VERSION = '1.0';

const ATTEMPT_STATUS = {
  passed: 'passed',
  failed: 'failed',
  timedOut: 'failed',
  interrupted: 'failed',
  skipped: 'skipped',
};

function collectSpecs(suites, acc = []) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) acc.push(spec);
    collectSpecs(suite.suites, acc);
  }
  return acc;
}

function mapStatus(raw) {
  return ATTEMPT_STATUS[raw] ?? 'unknown';
}

function deriveFinalStatus(statuses) {
  if (statuses.length === 0) return 'unknown';
  if (statuses.every((s) => s === 'skipped')) return 'skipped';
  const last = statuses[statuses.length - 1];
  if (last === 'passed') {
    // Falló antes y pasó al reintentar -> un solo test lógico, estado flaky.
    return statuses.slice(0, -1).some((s) => s === 'failed') ? 'flaky' : 'passed';
  }
  if (last === 'skipped') return 'skipped';
  return last === 'failed' ? 'failed' : 'unknown';
}

/**
 * @param {object} json  JSON crudo del reporter 'json' de Playwright
 * @param {object} context metadatos de ejecución (runId, source, commitSha...)
 */
export function normalizeRun(json, context = {}) {
  const hasSuites = Array.isArray(json?.suites);
  const specs = hasSuites ? collectSpecs(json.suites) : [];

  const tests = [];
  for (const spec of specs) {
    for (const t of spec.tests ?? []) {
      const project = t.projectName ?? t.projectId ?? 'unknown';
      const attempts = (t.results ?? []).map((r, i) => ({
        status: mapStatus(r.status),
        durationMs: typeof r.duration === 'number' ? r.duration : null,
        retry: typeof r.retry === 'number' ? r.retry : i,
      }));
      const statuses = attempts.map((a) => a.status);

      tests.push({
        id: `${spec.file ?? 'unknown'}::${spec.title ?? 'untitled'}::${project}`,
        title: spec.title ?? null,
        file: spec.file ?? null,
        project,
        finalStatus: deriveFinalStatus(statuses),
        attempts,
        durationMs: attempts.reduce((sum, a) => sum + (a.durationMs ?? 0), 0),
        evidenceRefs: [],
      });
    }
  }

  const errors = Array.isArray(json?.errors) ? json.errors : [];
  let completeness = 'complete';
  let completenessReason = null;
  if (!hasSuites) {
    completeness = 'unknown';
    completenessReason = 'playwright JSON has no suites array';
  } else if (errors.length > 0) {
    completeness = 'partial';
    completenessReason = `${errors.length} top-level error(s) reported by Playwright`;
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    run: {
      runId: context.runId ?? null,
      source: context.source ?? 'unknown',
      startedAt: context.startedAt ?? json?.stats?.startTime ?? null,
      commitSha: context.commitSha ?? null,
      workflow: context.workflow ?? null,
      completeness,
      completenessReason,
    },
    tests,
    provenance: {
      resultsFile: context.resultsFile ?? null,
      normalizedAt: context.normalizedAt ?? new Date().toISOString(),
    },
  };
}
