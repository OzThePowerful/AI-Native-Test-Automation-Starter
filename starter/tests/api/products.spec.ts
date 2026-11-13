import { test, expect } from '@playwright/test';
import { ProductsApi } from './products.api';
import { PRODUCT_SCENARIOS } from '../data/dummyjson.data';
import type { Product } from '../models/product';

test('can retrieve a product by ID from DummyJSON', async ({ request }) => {
  const productsApi = new ProductsApi(request);
  const { productId } = PRODUCT_SCENARIOS.retrieveById;

  const response = await productsApi.getProduct(productId);

  expect(response.status()).toBe(200);

  const product = (await response.json()) as Product;

  // Identity: the API returned the requested product.
  expect(product.id).toBe(productId);

  // Contract: meaningful fields are present with usable values.
  expect(product.title).toBeTruthy();
  expect(typeof product.description).toBe('string');
  expect(product.category).toBeTruthy();
  expect(product.brand).toBeTruthy();

  // Business-relevant data.
  expect(product.price).toBeGreaterThan(0);
  expect(product.stock).toBeGreaterThanOrEqual(0);
});

test('returns 404 when requesting a product that does not exist', async ({ request }) => {
  const productsApi = new ProductsApi(request);

  const response = await productsApi.getProduct(99999);

  expect(response.status()).toBe(404);
});
