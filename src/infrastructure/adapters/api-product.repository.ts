import type { Product } from '@/domain/models/product';
import type { ProductRepository } from '@/domain/ports/product-repository.port';

const DEFAULT_BASE_URL = '/api';

/**
 * Adaptador HTTP del puerto ProductRepository.
 * Consume la API de core-payments (GET /api/products, GET /api/products/:id).
 * La URL base por defecto es relativa ("/api") y se proxya en desarrollo
 * hacia http://localhost:3000 vía Vite (ver vite.config.ts → server.proxy).
 * Se puede override con la variable de entorno VITE_API_URL.
 */
export class ApiProductRepository implements ProductRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_URL ?? DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async findAll(): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products`);
    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? (data as Product[]) : [];
  }

  async findById(id: string): Promise<Product | null> {
    const response = await fetch(`${this.baseUrl}/products/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Error al obtener el producto: ${response.status}`);
    }
    return (await response.json()) as Product;
  }
}
