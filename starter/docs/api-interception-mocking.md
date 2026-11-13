# API Interception & Response Mocking (Playwright)

Guía del Increment #05B: cómo interceptar una solicitud API realizada
**desde el navegador** y sustituir su respuesta con Playwright.

## 1. Qué es

`page.route()` registra una regla que coincide con una URL. Cuando el
navegador emite una solicitud que coincide, el `route handler` puede
decidir qué hacer con ella: dejarla pasar (`route.continue()`),
abortarla (`route.abort()`) o **responderla directamente**
(`route.fulfill()`) sin consultar el backend.

## 2. Qué problema resuelve

Probar estados y datos controlados sin depender del backend: errores
difíciles de provocar, respuestas extremas, escenarios deterministas.

## 3. Qué NO valida

Un test con mock **no** comprueba que el backend real respete su
contrato, ni la conectividad real, ni la autenticación, ni la
integración end-to-end. El mock solo demuestra que **tu UI maneja
bien** la respuesta que le diste.

## 4. Diferencia con los tests reales de API

| | Increment #05 (real) | Increment #05B (mock) |
|---|---|---|
| Herramienta | Fixture `request` (`APIRequestContext`) | `page.route` / `context.route` |
| Quién envía la solicitud | Playwright (cliente HTTP) | El navegador de la página |
| Qué valida | El servicio real de DummyJSON | Que la página consuma bien una respuesta controlada |
| Archivo | `tests/api/products.spec.ts` | `tests/mocking/product-browser-mock.spec.ts` |

**Ojo:** `page.route()` **no** intercepta llamadas hechas con el
fixture `request`. Son mecanismos distintos para propósitos distintos.

## 5. Cuándo usarlo

- Respuesta controlada para un escenario concreto de UI.
- Errores o datos extremos difíciles de provocar en el backend real.
- Tests de UI deterministas y rápidos.

## 6. Cuándo evitarlo

Cuando necesitas demostrar que el **servicio o contrato real**
funciona — para eso está el test de `APIRequestContext` (#05), que
sí toca DummyJSON de verdad.

## 7. Cómo funciona

```text
PÁGINA (fixture HTML)
  │  click → fetch('https://dummyjson.com/products/1')
  ▼
page.route('https://dummyjson.com/products/1', handler)  ← coincide
  │  route.fulfill({ status: 200, json: mock, headers })
  ▼
El navegador recibe la respuesta SIMULADA (nunca sale a la red)
  │  product.title → <p id="product-title">
  ▼
Assertions: método interceptado + contador + texto visible en UI
```

## 8. Ejemplo (archivo real del repo)

`tests/mocking/product-browser-mock.spec.ts`:

```ts
await page.route('https://dummyjson.com/products/1', async (route) => {
  expect(route.request().method()).toBe('GET');
  interceptedCount += 1;

  await route.fulfill({
    status: 200,
    json: productMock,
    headers: { 'access-control-allow-origin': '*' },
  });
});
```

Puntos clave del archivo real:

- El `page.route` se registra **antes** de `setContent`/click — si lo
  registras después, la petición ya salió y no hay nada que interceptar.
- `route.request().method()` verifica el método HTTP interceptado.
- `interceptedCount` prueba que el handler se ejecutó (y cuántas veces).
- `route.fulfill({ json })` devuelve el mock como body JSON con status 200.
- El header `access-control-allow-origin: *` es necesario porque la
  fixture corre en origen `about:blank` y el fetch es cross-origin.

## 9. Cómo ejecutarlo

Desde la carpeta `starter/`:

```powershell
npx playwright test tests/mocking/product-browser-mock.spec.ts --project=chromium
```

Precondiciones: `npm ci` y `npx playwright install` ya ejecutados.
No se necesita red ni DummyJSON disponible para este test.

## 10. Cómo agregar otro mock

1. Identifica el método y la URL exacta que dispara la página
   (DevTools → Network, o `page.on('request')` para depurar).
2. Registra `page.route` con un patrón **estrecho** que coincida solo
   con esa solicitud — evita `**/*` indiscriminado.
3. Define el JSON mock explícito y distinguible del real.
4. `route.fulfill` con `status`, `json` y headers CORS si aplica.
5. Verifica interceptación (método/URL/contador) **y** un efecto
   observable en la UI.
6. Mantén el handler dentro del test → aislamiento automático.

## 11. Depuración

- **El patrón no coincide:** la URL real puede tener query params o
  diferir en esquema. Usa `page.on('request', r => console.log(r.url()))`
  para ver la URL exacta antes de escribir el patrón.
- **Registro tardío:** el `page.route` debe existir antes de la
  navegación/acción que dispara la llamada.
- **CORS:** si la página no puede leer el body, añade
  `access-control-allow-origin` en el `fulfill` (como en el ejemplo).
- **Service Workers:** un SW puede servir la respuesta sin pasar por
  la red. Para ese contexto de test puedes usar
  `serviceWorkers: 'block'` en `browser.newContext()`.
- **Aserciones débiles:** si solo verificas el texto en pantalla,
  un backend real que devolviera lo mismo daría falso positivo. El
  contador + método lo hacen inequívoco.

## 12. Mantenimiento y límites

- Prefiere fixtures HTML pequeñas y mock data explícita en el spec.
- Revisa periódicamente que el mock siga siendo coherente con el
  contrato real (el test #05 te ayuda a detectarlo).
- Nunca incluyas secretos ni tokens reales en mocks ni en la guía.
- Un mock obsoleto es peor que ningún mock: documenta qué endpoint
  y qué forma de respuesta estás simulando.

## 13. Evidencia

```powershell
npx playwright test tests/mocking/product-browser-mock.spec.ts --project=chromium
```

Resultado esperado: `1 passed`. El reporte HTML se abre con
`npx playwright show-report` (incluye trace del contexto).

## 14. Enlaces oficiales

- Mock APIs: https://playwright.dev/docs/mock
- Network: https://playwright.dev/docs/network
- Route API: https://playwright.dev/docs/api/class-route
- APIRequestContext: https://playwright.dev/docs/api/class-apirequestcontext
