import { useEffect, useState } from 'react';
import { GetProducts } from '@/application/use-cases/product/get-products.use-case';
import type { Product } from '@/domain/models/product';
import { useProductRepository } from '@/infrastructure/providers/ProductRepositoryContext';

interface UseGetProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Smart hook: obtiene todos los productos del catálogo desde el repositorio
 * (puerto inyectado vía Context). No usa Redux — el listado no requiere
 * persistencia local.
 */
export function useGetProducts(): UseGetProductsResult {
  const repository = useProductRepository();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const result = await new GetProducts(repository).execute();
        if (!cancelled) {
          setProducts(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error inesperado al cargar productos');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [repository, retryCount]);

  const retry = () => setRetryCount((c) => c + 1);

  return { products, loading, error, retry };
}
