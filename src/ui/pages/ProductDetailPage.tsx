import { useState } from 'react';
import { ArrowLeft, Minus, PackageX, RefreshCw, ShoppingCart } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Product } from '@/domain/models/product';
import { resetCheckout, startCheckout } from '@/infrastructure/store/checkout.slice';
import { useAppDispatch, useAppSelector } from '@/infrastructure/store/hooks';
import { BuyModal } from '@/ui/components/product/BuyModal';
import { QuantitySelector } from '@/ui/components/product/QuantitySelector';
import { useGetProductById } from '@/ui/hooks/useGetProductById';

/** Formatea un precio como moneda COP (es-CO). */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);
}

/** Esqueleto de carga para el detalle del producto. */
function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
        <div className="aspect-square animate-pulse rounded-lg bg-stone-200" />
        <div className="flex flex-col gap-4 py-2">
          <div className="h-7 w-3/4 animate-pulse rounded bg-stone-200" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-stone-200" />
          <div className="h-5 w-1/4 animate-pulse rounded bg-stone-200" />
          <div className="mt-4 space-y-2">
            <div className="h-4 animate-pulse rounded bg-stone-200" />
            <div className="h-4 animate-pulse rounded bg-stone-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-stone-200" />
          </div>
          <div className="mt-6 h-12 animate-pulse rounded-lg bg-stone-200" />
        </div>
      </div>
    </div>
  );
}

/** Vista de detalle con toda la información del producto y acciones de compra. */
function ProductDetail({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const checkout = useAppSelector((state) => state.checkout);

  const [quantity, setQuantity] = useState(1);
  const checkoutActive = checkout.productId === product.id && checkout.status !== 'idle';

  const outOfStock = product.stock <= 0;

  // Si el stock cambia y la cantidad queda por encima, se reajusta al tope.
  const safeQuantity = Math.min(quantity, Math.max(1, product.stock));
  // Cantidad a mostrar en el modal: la del checkout si está activo, sino la actual.
  const modalQuantity = checkoutActive ? checkout.quantity : safeQuantity;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
        {/* Imagen */}
        <div className="aspect-square overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="size-full object-cover"
          />
        </div>

        {/* Información */}
        <div className="flex flex-col gap-4 py-1">
          <h2 className="font-display text-2xl font-bold leading-tight text-stone-900">
            {product.title}
          </h2>

          <p className="font-display text-2xl font-bold text-brand-500">
            {formatPrice(product.price)}
          </p>

          {/* Stock */}
          {outOfStock ? (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
              <PackageX className="size-4" aria-hidden="true" />
              Agotado
            </span>
          ) : (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
              {product.stock} {product.stock === 1 ? 'disponible' : 'disponibles'}
            </span>
          )}

          {/* Descripción */}
          <div className="mt-2">
            <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-stone-500">
              Descripción
            </h3>
            <p className="text-base leading-relaxed text-stone-700">
              {product.description}
            </p>
          </div>

          {/* Selector de cantidad + botón de compra */}
          <div className="mt-4 flex flex-col gap-4">
            <QuantitySelector
              value={safeQuantity}
              onChange={setQuantity}
              max={product.stock}
              disabled={outOfStock}
            />

            <button
              type="button"
              onClick={() => dispatch(startCheckout({ productId: product.id, quantity: safeQuantity }))}
              disabled={outOfStock}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              <ShoppingCart className="size-5" aria-hidden="true" />
              Comprar
            </button>
          </div>
        </div>
      </div>

      <BuyModal
        open={checkoutActive}
        onClose={() => dispatch(resetCheckout())}
        product={product}
        quantity={modalQuantity}
      />
    </div>
  );
}

/**
 * Página de detalle del producto.
 * Obtiene el producto por id (parámetro de ruta) y muestra toda la
 * información: imagen, título, precio, stock, descripción.
 * Incluye selector de cantidad (por defecto en 1) y botón de comprar.
 * Si el stock es ≤ 0, el botón de comprar y el selector se deshabilitan.
 * El botón de comprar abre un modal (componente vacío por ahora).
 */
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useGetProductById(id);

  return (
    <div className="min-h-dvh bg-stone-50">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex size-9 items-center justify-center rounded-lg border border-stone-300 text-stone-700 transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            aria-label="Volver al listado"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="font-display text-xl font-bold text-stone-900">Detalle del producto</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <p className="text-base font-medium text-stone-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <ProductDetailSkeleton />
        ) : !product ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <PackageX className="size-12 text-stone-300" aria-hidden="true" />
            <p className="text-base font-medium text-stone-500">
              Producto no encontrado
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
            >
              <Minus className="size-4 rotate-90" aria-hidden="true" />
              Volver al listado
            </button>
          </div>
        ) : (
          <ProductDetail product={product} />
        )}
      </main>
    </div>
  );
}
