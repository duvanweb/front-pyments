import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProductRepository } from '@/domain/ports/product-repository.port';
import { ProductRepositoryProvider } from '@/infrastructure/providers/ProductRepositoryContext';
import { useGetProductById } from './useGetProductById';

const mockProduct = {
  id: '1', title: 'Product 1', description: 'Desc 1', price: 100, imageUrl: 'http://example.com/1.jpg', stock: 5,
};

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

describe('useGetProductById', () => {
  it('returns loading=true and product=null initially', () => {
    const repository: ProductRepository = { findAll: vi.fn(), findById: vi.fn() };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useGetProductById('1'), { wrapper: Wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.product).toBeNull();
  });

  it('fetches product and sets loading=false on success', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockProduct),
    };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useGetProductById('1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.product).toEqual(mockProduct);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failure', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockRejectedValue(new Error('Not found')),
    };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useGetProductById('1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Not found');
  });

  it('returns product=null and loading=false when id is undefined', async () => {
    const repository: ProductRepository = { findAll: vi.fn(), findById: vi.fn() };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useGetProductById(undefined), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.product).toBeNull();
    expect(repository.findById).not.toHaveBeenCalled();
  });
});
