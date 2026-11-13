import type { APIRequestContext, APIResponse } from '@playwright/test';

const API_BASE_URL = process.env.DUMMYJSON_BASE_URL ?? 'https://dummyjson.com';

export class ProductsApi {
  constructor(private readonly request: APIRequestContext) {}

  async getProduct(id: number): Promise<APIResponse> {
    return this.request.get(`${API_BASE_URL}/products/${id}`);
  }
}
