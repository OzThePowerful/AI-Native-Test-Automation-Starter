import type { Page } from '@playwright/test';

export class ProductsPage {
  constructor(private readonly page: Page) {}

  get title() {
    return this.page.locator('[data-test="title"]');
  }

  get items() {
    return this.page.locator('[data-test="inventory-item"]');
  }

  get cartBadge() {
    return this.page.locator('.shopping_cart_badge');
  }

  productCard(productName: string) {
    return this.page.locator('.inventory_item').filter({ hasText: productName });
  }

  async addToCart(productName: string) {
    await this.productCard(productName)
      .getByRole('button', { name: 'Add to cart' })
      .click();
  }

  async openCart() {
    await this.page.locator('.shopping_cart_link').click();
  }
}
