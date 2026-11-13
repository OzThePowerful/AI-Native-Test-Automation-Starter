import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { ProductsPage } from './pages/products.page';
import { CartPage } from './pages/cart.page';
import { SAUCEDEMO_CREDENTIALS, PRODUCTS } from './data/saucedemo.data';

const { username, password } = SAUCEDEMO_CREDENTIALS.standardUser;

test('standard user can log in to SauceDemo and see the products page', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const productsPage = new ProductsPage(page);

  //expect(await loginPage.loginAs(username, password)).toBe(true);
  await loginPage.loginAs(username, password).then(respuesta => { console.log({ respuesta }) })

  // Expect to land on the inventory page with the product list.
  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(productsPage.title).toHaveText('Products');
  await expect(productsPage.items).toHaveCount(6);
});

test('standard user can add Sauce Labs Backpack to the cart', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const productsPage = new ProductsPage(page);
  const cartPage = new CartPage(page);

  expect(await loginPage.loginAs(username, password)).toBe(true);

  await productsPage.addToCart(PRODUCTS.backpack);

  await expect(productsPage.cartBadge).toHaveText('1');

  await productsPage.openCart();
  await expect(page).toHaveURL(/\/cart\.html$/);
  await expect(cartPage.item(PRODUCTS.backpack)).toBeVisible();
});