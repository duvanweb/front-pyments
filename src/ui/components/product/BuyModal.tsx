import { useEffect } from 'react';
import { X } from 'lucide-react';

interface BuyModalProps {
  /** Controla la visibilidad del modal. */
  open: boolean;
  /** Callback al cerrar el modal. */
  onClose: () => void;
}

/**
 * Modal de compra — shell vacío por ahora.
 *
 * Renderiza un overlay centrado con botón de cierre (X) y Escape.
 * El contenido se completará en una iteración futura con el flujo
 * de pago / confirmación de compra.
 */
export function BuyModal({ open, onClose }: BuyModalProps) {
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

      {/* Contenedor del modal — vacío por ahora */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Modal de compra"
        className="relative z-10 w-full max-w-lg rounded-t-xl bg-white p-6 shadow-xl sm:rounded-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          aria-label="Cerrar modal"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        {/* Contenido del modal — se completará en una iteración futura */}
      </div>
    </div>
  );
}
