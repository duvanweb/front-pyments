import type { Product } from '@/domain/models/product';
import type { ProductRepository } from '@/domain/ports/product-repository.port';

/**
 * Caso de uso: consultar un producto por id.
 * Devuelve null si el producto no existe (404 del backend).
 */
export class GetProductById {
  private readonly repository: ProductRepository;

  constructor(repository: ProductRepository) {
    this.repository = repository;
  }

  execute(id: string): Promise<Product | null> {
    return this.repository.findById(id);
  }
}
