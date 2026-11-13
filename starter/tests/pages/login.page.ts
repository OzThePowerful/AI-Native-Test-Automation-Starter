import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async loginAs(username: string, password: string): Promise<boolean> {
    try {
      await this.page.goto('/');

      await this.page.getByPlaceholder('Username').fill(username);
      await this.page.getByPlaceholder('Password').fill(password);
      await this.page.getByRole('button', { name: 'Login' }).click();

      await expect(this.page).toHaveURL(/\/inventory\.html$/);
      return true;
    } catch {
      return false;
    }
  }
}
