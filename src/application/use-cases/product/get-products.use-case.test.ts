import { describe, expect, it, vi } from 'vitest';
import type { Product } from '@/domain/models/product';
import type { ProductRepository } from '@/domain/ports/product-repository.port';
import { GetProducts } from './get-products.use-case';

const mockProducts: Product[] = [
  { id: '1', title: 'Producto 1', description: 'Desc 1', price: 100, imageUrl: 'http://example.com/1.jpg', stock: 5 },
  { id: '2', title: 'Producto 2', description: 'Desc 2', price: 200, imageUrl: 'http://example.com/2.jpg', stock: 0 },
];

function createMockRepository(): ProductRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
  };
}

describe('GetProducts', () => {
  it('devuelve todos los productos del repositorio', async () => {
    const repository = createMockRepository();
    repository.findAll = vi.fn().mockResolvedValue(mockProducts);

    const result = await new GetProducts(repository).execute();

    expect(repository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(mockProducts);
  });

  it('devuelve un array vacío cuando no hay productos', async () => {
    const repository = createMockRepository();
    repository.findAll = vi.fn().mockResolvedValue([]);

    const result = await new GetProducts(repository).execute();

    expect(result).toEqual([]);
  });

  it('propaga errores del repositorio', async () => {
    const repository = createMockRepository();
    repository.findAll = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(new GetProducts(repository).execute()).rejects.toThrow('Network error');
  });
});
