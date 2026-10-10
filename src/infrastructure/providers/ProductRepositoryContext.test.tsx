import { renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import type { ProductRepository } from '@/domain/ports/product-repository.port';
import { ProductRepositoryProvider, useProductRepository } from './ProductRepositoryContext';

describe('ProductRepositoryContext', () => {
  it('provides the injected repository to the hook', () => {
    const mockRepository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
    };

    const { result } = renderHook(() => useProductRepository(), {
      wrapper: ({ children }) => (
        <ProductRepositoryProvider repository={mockRepository}>
          {children}
        </ProductRepositoryProvider>
      ),
    });

    expect(result.current).toBe(mockRepository);
  });

  it('throws if the hook is used outside the provider', () => {
    expect(() => renderHook(() => useProductRepository())).toThrow(
      /useProductRepository debe usarse dentro de <ProductRepositoryProvider>/,
    );
  });

  it('renders children inside the provider', () => {
    const mockRepository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
    };
    renderWithProviders(
      <ProductRepositoryProvider repository={mockRepository}>
        <div data-testid="child">content</div>
      </ProductRepositoryProvider>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
