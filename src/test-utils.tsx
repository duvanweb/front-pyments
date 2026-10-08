import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import type { ProductRepository } from '@/domain/ports/product-repository.port';
import { ProductRepositoryProvider } from '@/infrastructure/providers/ProductRepositoryContext';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Repositorio mock a inyectar vía Context. */
  repository?: ProductRepository;
  /** Rutas iniciales del MemoryRouter. */
  initialEntries?: string[];
}

/**
 * Render con providers de test: MemoryRouter + ProductRepositoryProvider.
 * Evita repetir el wrapper en cada test de componentes.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderWithProvidersOptions,
) {
  const { repository, initialEntries = ['/'], ...renderOptions } = options ?? {};

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <ProductRepositoryProvider repository={repository}>
          {children}
        </ProductRepositoryProvider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
