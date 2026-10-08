import { PackageSearch, RefreshCw, ShoppingBag } from 'lucide-react';
import { ProductCard } from '@/ui/components/product/ProductCard';
import { useGetProducts } from '@/ui/hooks/useGetProducts';

/** Esqueleto de tarjeta para el estado de carga. */
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="aspect-square animate-pulse bg-stone-200" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200" />
        <div className="h-10 animate-pulse rounded-lg bg-stone-200" />
      </div>
    </div>
  );
}

/**
 * Vista principal: listado de productos en grid responsive.
 * Muestra solo imagen y título por tarjeta, con botón "Ver más".
 * Mobile-first: 1 columna → 2 (sm) → 3 (lg) → 4 (xl).
 */
export function ProductListPage() {
  const { products, loading, error, retry } = useGetProducts();

  return (
    <div className="min-h-dvh bg-stone-50">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
          <span
            className="flex size-9 items-center justify-center rounded-lg bg-brand-500 text-white"
            aria-hidden="true"
          >
            <ShoppingBag className="size-5" />
          </span>
          <h1 className="font-display text-xl font-bold text-stone-900">Productos</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <p className="text-base font-medium text-stone-700">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <PackageSearch className="size-12 text-stone-300" aria-hidden="true" />
            <p className="text-base font-medium text-stone-500">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
