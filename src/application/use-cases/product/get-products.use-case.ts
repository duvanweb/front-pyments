import type { Product } from '@/domain/models/product';
import type { ProductRepository } from '@/domain/ports/product-repository.port';

/**
 * Caso de uso: consultar todos los productos del catálogo.
 * Delega en el puerto de repositorio.
 */
export class GetProducts {
  private readonly repository: ProductRepository;

  constructor(repository: ProductRepository) {
    this.repository = repository;
  }

  execute(): Promise<Product[]> {
    return this.repository.findAll();
  }
}
