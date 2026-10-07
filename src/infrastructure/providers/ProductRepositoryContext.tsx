import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ProductRepository } from '@/domain/ports/product-repository.port';
import { ApiProductRepository } from '../adapters/api-product.repository';

const ProductRepositoryContext = createContext<ProductRepository | null>(null);

/** Repositorio por defecto: adaptador HTTP de la API de core-payments. */
function createDefaultRepository(): ProductRepository {
  return new ApiProductRepository();
}

interface ProductRepositoryProviderProps {
  /**
   * Instancia del puerto a inyectar. Por defecto usa el adaptador HTTP;
   * pasar un mock u otro adaptador para testing sin tocar la UI.
   */
  repository?: ProductRepository;
  children: ReactNode;
}

/**
 * Raíz de composición (inyección de dependencias): expone la instancia
 * del puerto ProductRepository a la UI sin acoplarla al adaptador.
 */
export function ProductRepositoryProvider({ repository, children }: ProductRepositoryProviderProps) {
  const value = useMemo(() => repository ?? createDefaultRepository(), [repository]);

  return <ProductRepositoryContext.Provider value={value}>{children}</ProductRepositoryContext.Provider>;
}

/**
 * Hook de acceso al puerto inyectado. Lanza si se usa fuera del provider.
 */
// eslint-disable-next-line react-refresh/only-export-components -- patrón estándar de Context: provider + hook en el mismo archivo
export function useProductRepository(): ProductRepository {
  const repository = useContext(ProductRepositoryContext);
  if (!repository) {
    throw new Error('useProductRepository debe usarse dentro de <ProductRepositoryProvider>');
  }
  return repository;
}
