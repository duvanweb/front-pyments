import { useEffect, useState } from 'react';
import { GetProductById } from '@/application/use-cases/product/get-product-by-id.use-case';
import type { Product } from '@/domain/models/product';
import { useProductRepository } from '@/infrastructure/providers/ProductRepositoryContext';

interface UseGetProductByIdResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
}

/**
 * Smart hook: obtiene un producto por id desde el repositorio.
 * Pensado para la página de detalle.
 */
export function useGetProductById(id: string | undefined): UseGetProductByIdResult {
  const repository = useProductRepository();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const result = await new GetProductById(repository).execute(id!);
        if (!cancelled) {
          setProduct(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error inesperado al cargar el producto');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [repository, id]);

  return { product, loading, error };
}
