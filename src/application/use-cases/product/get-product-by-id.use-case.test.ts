import { describe, expect, it, vi } from 'vitest';
import type { Product } from '@/domain/models/product';
import type { ProductRepository } from '@/domain/ports/product-repository.port';
import { GetProductById } from './get-product-by-id.use-case';

const mockProduct: Product = {
  id: 'abc-123',
  title: 'Producto Test',
  description: 'Descripción de prueba',
  price: 150,
  imageUrl: 'http://example.com/test.jpg',
  stock: 10,
};

function createMockRepository(): ProductRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
  };
}

describe('GetProductById', () => {
  it('devuelve el producto cuando existe', async () => {
    const repository = createMockRepository();
    repository.findById = vi.fn().mockResolvedValue(mockProduct);

    const result = await new GetProductById(repository).execute('abc-123');

    expect(repository.findById).toHaveBeenCalledWith('abc-123');
    expect(result).toEqual(mockProduct);
  });

  it('devuelve null cuando el producto no existe', async () => {
    const repository = createMockRepository();
    repository.findById = vi.fn().mockResolvedValue(null);

    const result = await new GetProductById(repository).execute('non-existent');

    expect(repository.findById).toHaveBeenCalledWith('non-existent');
    expect(result).toBeNull();
  });

  it('propaga errores del repositorio', async () => {
    const repository = createMockRepository();
    repository.findById = vi.fn().mockRejectedValue(new Error('Server error'));

    await expect(new GetProductById(repository).execute('abc-123')).rejects.toThrow('Server error');
  });
});
