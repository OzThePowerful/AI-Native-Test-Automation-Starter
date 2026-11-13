import type { Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  item(productName: string) {
    return this.page.locator('.cart_item').filter({ hasText: productName });
  }
}
