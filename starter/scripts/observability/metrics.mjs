// Motor de métricas puro: sin fs, sin red, sin tiempo. Misma entrada,
// misma salida — determinista y testeable.

const KNOWN_STATUSES = ['passed', 'failed', 'flaky', 'skipped', 'unknown'];

/**
 * @param {Array} tests tests normalizados (schemaVersion 1.0)
 * @returns métricas del run; null cuando el denominador no existe
 */
export function computeMetrics(tests) {
  const counts = Object.fromEntries(KNOWN_STATUSES.map((s) => [s, 0]));
  let durationMs = 0;

  for (const t of tests ?? []) {
    if (t.finalStatus in counts) counts[t.finalStatus] += 1;
    if (typeof t.durationMs === 'number') durationMs += t.durationMs;
  }

  // Denominador del pass rate: solo tests ejecutados con resultado
  // concluyente. skipped y unknown quedan fuera y se reportan aparte.
  const executed = counts.passed + counts.failed + counts.flaky;
  const total = tests?.length ?? 0;

  return {
    testsTotal: total,
    ...counts,
    executed,
    passRate: executed > 0 ? Math.round((counts.passed / executed) * 1000) / 10 : null,
    flakyRate: executed > 0 ? Math.round((counts.flaky / executed) * 1000) / 10 : null,
    durationMs,
    skippedExcludedFromPassRate: true,
  };
}
