import { Loader2, Lock } from 'lucide-react';
import type { Product } from '@/domain/models/product';
import { BASE_FEE_IN_CENTS, SHIPPING_FEE_IN_CENTS } from '@/domain/rules/checkout-validation.rules';

interface PaymentSummaryProps {
  /** Producto que se está comprando. */
  product: Product;
  /** Cantidad seleccionada. */
  quantity: number;
  /** Si la transacción se está enviando. */
  loading: boolean;
  /** Callback al hacer clic en el botón. */
  onPay: () => void;
  /** Texto del botón (default "Pagar"). */
  buttonLabel?: string;
}

/** Formatea centavos como moneda COP. */
function formatCents(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Resumen del pago en un componente de fondo opaco (backdrop).
 * Muestra el monto del producto, tarifa base, tarifa de envío y total,
 * con el botón de pago.
 */
export function PaymentSummary({ product, quantity, loading, onPay, buttonLabel = 'Pagar' }: PaymentSummaryProps) {
  const unitPriceInCents = Math.round(product.price * 100);
  const productTotal = unitPriceInCents * quantity;
  const total = productTotal + BASE_FEE_IN_CENTS + SHIPPING_FEE_IN_CENTS;

  return (
    <div className="rounded-lg bg-stone-900 p-4 text-white">
      <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-stone-300">
        Resumen del pago
      </h3>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone-300">
            {product.title} × {quantity}
          </dt>
          <dd className="font-medium tabular-nums">{formatCents(productTotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone-300">Tarifa base</dt>
          <dd className="font-medium tabular-nums">{formatCents(BASE_FEE_IN_CENTS)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone-300">Tarifa de envío</dt>
          <dd className="font-medium tabular-nums">{formatCents(SHIPPING_FEE_IN_CENTS)}</dd>
        </div>
      </dl>

      <div className="my-3 border-t border-stone-700" />

      <div className="flex items-center justify-between">
        <span className="font-display text-base font-semibold">Total</span>
        <span className="font-display text-xl font-bold tabular-nums text-brand-500">
          {formatCents(total)}
        </span>
      </div>

      <button
        type="button"
        onClick={onPay}
        disabled={loading}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            Procesando...
          </>
        ) : (
          <>
            <Lock className="size-5" aria-hidden="true" />
            {buttonLabel}
          </>
        )}
      </button>
    </div>
  );
}
