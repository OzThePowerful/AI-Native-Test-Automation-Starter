import { test, expect } from '@playwright/test';

// Fixture HTML mínima: simula una página que pide un producto a la API
// mediante fetch desde el navegador. El botón dispara la solicitud.
const PRODUCT_PAGE_HTML = `
  <button id="load-product">Cargar producto</button>
  <p id="product-title"></p>
  <script>
    document.querySelector('#load-product').addEventListener('click', async () => {
      const response = await fetch('https://dummyjson.com/products/1');
      const product = await response.json();
      document.querySelector('#product-title').textContent = product.title;
    });
  </script>
`;

test('intercepta la solicitud del navegador y muestra el producto mockeado', async ({ page }) => {
  let interceptedCount = 0;

  // Respuesta simulada: valores deliberadamente distintos al backend real.
  const productMock = {
    id: 1,
    title: 'Producto simulado para QA',
    price: 199,
    stock: 0,
  };

  // El handler debe registrarse ANTES de que el navegador dispare el fetch.
  await page.route('https://dummyjson.com/products/1', async (route) => {
    // Señal inequívoca de interceptación: método esperado + contador.
    expect(route.request().method()).toBe('GET');
    interceptedCount += 1;

    await route.fulfill({
      status: 200,
      json: productMock,
      // La fixture corre en origen about:blank → la llamada es cross-origin.
      // Sin este header la página no podría leer el body de la respuesta.
      headers: { 'access-control-allow-origin': '*' },
    });
  });

  await page.setContent(PRODUCT_PAGE_HTML);
  await page.getByRole('button', { name: 'Cargar producto' }).click();

  // Efecto observable: la UI muestra el título del mock, no el real.
  await expect(page.locator('#product-title')).toHaveText(
    'Producto simulado para QA'
  );
  expect(interceptedCount).toBe(1);
});
