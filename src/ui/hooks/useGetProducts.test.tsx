import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProductRepository } from '@/domain/ports/product-repository.port';
import { ProductRepositoryProvider } from '@/infrastructure/providers/ProductRepositoryContext';
import { useGetProducts } from './useGetProducts';

const mockProducts = [
  { id: '1', title: 'Product 1', description: 'Desc 1', price: 100, imageUrl: 'http://example.com/1.jpg', stock: 5 },
];

function createWrapper(repository: ProductRepository) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ProductRepositoryProvider repository={repository}>
        {children}
      </ProductRepositoryProvider>
    );
  }
  return { Wrapper };
}

describe('useGetProducts', () => {
  it('returns loading=true initially', () => {
    const repository: ProductRepository = { findAll: vi.fn(), findById: vi.fn() };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useGetProducts(), { wrapper: Wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);
  });

  it('fetches products and sets loading=false on success', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn().mockResolvedValue(mockProducts),
      findById: vi.fn(),
    };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useGetProducts(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failure', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn().mockRejectedValue(new Error('Network error')),
      findById: vi.fn(),
    };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useGetProducts(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error');
  });

  it('retry re-triggers the fetch', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn().mockResolvedValue(mockProducts),
      findById: vi.fn(),
    };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useGetProducts(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(repository.findAll).toHaveBeenCalledTimes(1);

    result.current.retry();
    await waitFor(() => expect(repository.findAll).toHaveBeenCalledTimes(2));
  });
});
