import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Product } from '@/domain/models/product';
import { CheckoutForm } from './CheckoutForm';

interface BuyModalProps {
  /** Controla la visibilidad del modal. */
  open: boolean;
  /** Callback al cerrar el modal. */
  onClose: () => void;
  /** Producto que se está comprando. */
  product: Product;
  /** Cantidad seleccionada. */
  quantity: number;
}

/**
 * Modal de compra — contiene el formulario de checkout.
 *
 * Renderiza un overlay centrado con botón de cierre (X) y Escape.
 * El contenido es el formulario de datos del cliente, envío, tarjeta
 * y resumen del pago.
 */
export function BuyModal({ open, onClose, product, quantity }: BuyModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
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
        aria-label="Modal de compra"
        className="relative z-10 max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-t-xl bg-white p-6 shadow-xl sm:rounded-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          aria-label="Cerrar modal"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <h2 className="mb-4 pr-10 font-display text-lg font-bold text-stone-900">
          Finalizar compra
        </h2>

        <CheckoutForm product={product} quantity={quantity} onClose={onClose} />
      </div>
    </div>
  );
}
