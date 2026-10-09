import { useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import type { Product } from '@/domain/models/product';
import { resetCheckout } from '@/infrastructure/store/checkout.slice';
import { useAppDispatch, useAppSelector } from '@/infrastructure/store/hooks';
import { useCreateTransaction } from '@/ui/hooks/useCreateTransaction';
import { PaymentSummary } from './PaymentSummary';

interface CheckoutSummaryModalProps {
  /** Controla la visibilidad del modal. */
  open: boolean;
  /** Callback al cerrar el modal (volver al formulario). */
  onClose: () => void;
  /** Producto que se está comprando. */
  product: Product;
  /** Cantidad seleccionada. */
  quantity: number;
}

/**
 * Modal de resumen de compra — muestra todos los datos del checkout
 * (cliente, envío, tarjeta) en formato read-only y el botón de Pagar
 * que crea la transacción y redirige a Wompi.
 *
 * Se renderiza encima del BuyModal (z-[60]) para que el usuario pueda
 * volver al formulario con el botón "Volver".
 */
export function CheckoutSummaryModal({ open, onClose, product, quantity }: CheckoutSummaryModalProps) {
  const dispatch = useAppDispatch();
  const { customer, shippingAddress, creditCard, status, transactionReference, error } =
    useAppSelector((state) => state.checkout);
  const { createTransaction } = useCreateTransaction();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const loading = status === 'submitting';

  /** Últimos 4 dígitos de la tarjeta. */
  const lastFour = creditCard.number.replace(/\D/g, '').slice(-4).padStart(4, '•');

  async function handlePay() {
    await createTransaction({
      productId: product.id,
      quantity,
      productPrice: product.price,
      customer,
      shippingAddress,
    });
  }

  function handleClose() {
    dispatch(resetCheckout());
    onClose();
  }

  // Pantalla de éxito: transacción creada (caso edge sin checkoutUrl).
  if (status === 'success' && transactionReference) {
    return (
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
        <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" aria-hidden="true" />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Transacción creada"
          className="relative z-10 w-full max-w-xl rounded-t-xl bg-white p-6 shadow-xl sm:rounded-xl"
        >
          <p className="text-center font-display text-lg font-bold text-stone-900">
            Transacción creada
          </p>
          <p className="mt-2 text-center text-sm text-stone-500">
            Referencia: <span className="font-bold">{transactionReference}</span>
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-stone-300 px-6 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor del modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Resumen de compra"
        className="relative z-10 max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-t-xl bg-white p-6 shadow-xl sm:rounded-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          aria-label="Volver al formulario"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <h2 className="mb-4 pr-10 font-display text-lg font-bold text-stone-900">
          Resumen de compra
        </h2>

        <div className="space-y-6">
          {/* Error del backend */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Datos del cliente */}
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-stone-500">
              Datos del cliente
            </h3>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm">
              <p className="font-medium text-stone-900">{customer.fullName || '—'}</p>
              <p className="text-stone-600">{customer.email || '—'}</p>
              <p className="text-stone-600">
                {customer.phoneNumberPrefix} {customer.phoneNumber}
              </p>
            </div>
          </section>

          {/* Dirección de envío */}
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-stone-500">
              Dirección de envío
            </h3>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
              <p className="text-stone-900">{shippingAddress.addressLine1 || '—'}</p>
              {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
              <p>
                {shippingAddress.city || '—'}, {shippingAddress.region || '—'}
              </p>
              <p>{shippingAddress.country || '—'}</p>
            </div>
          </section>

          {/* Tarjeta */}
          <section className="space-y-2">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-stone-500">
              Tarjeta de crédito
            </h3>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm">
              <p className="font-medium tabular-nums text-stone-900">
                •••• •••• •••• {lastFour}
              </p>
              <p className="text-stone-600">{creditCard.holder || '—'}</p>
            </div>
          </section>

          {/* Resumen del pago con botón Pagar */}
          <PaymentSummary
            product={product}
            quantity={quantity}
            loading={loading}
            onPay={handlePay}
          />

          {/* Botón Volver */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 px-6 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
