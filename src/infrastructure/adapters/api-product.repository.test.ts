import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@/domain/models/product';
import { ApiProductRepository } from './api-product.repository';

const mockProduct: Product = {
  id: '1',
  title: 'Test Product',
  description: 'Test Description',
  price: 100,
  imageUrl: 'http://localhost:3000/images/test.jpg',
  stock: 5,
};

const mockFetch = vi.fn();

describe('ApiProductRepository', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findAll', () => {
    it('devuelve productos cuando la respuesta es OK', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([mockProduct]),
      });

      const repo = new ApiProductRepository();
      const result = await repo.findAll();

      expect(mockFetch).toHaveBeenCalledWith('/api/products');
      expect(result).toEqual([mockProduct]);
    });

    it('lanza error cuando la respuesta es 500', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      const repo = new ApiProductRepository();

      await expect(repo.findAll()).rejects.toThrow('Error al obtener productos: 500');
    });

    it('devuelve array vacío cuando la respuesta no es un array', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'not an array' }),
      });

      const repo = new ApiProductRepository();
      const result = await repo.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('devuelve el producto cuando la respuesta es OK', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockProduct),
      });

      const repo = new ApiProductRepository();
      const result = await repo.findById('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/products/1');
      expect(result).toEqual(mockProduct);
    });

    it('devuelve null cuando la respuesta es 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      });

      const repo = new ApiProductRepository();
      const result = await repo.findById('non-existent');

      expect(result).toBeNull();
    });

    it('lanza error cuando la respuesta es 500', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      const repo = new ApiProductRepository();

      await expect(repo.findById('1')).rejects.toThrow('Error al obtener el producto: 500');
    });
  });
});
