import { CheckCircle, X } from 'lucide-react';

interface TransactionResultProps {
  /** Referencia (número) de la transacción creada. */
  reference: string;
  /** Callback al cerrar. */
  onClose: () => void;
}

/**
 * Pantalla de éxito: muestra el número de transacción y el estado PENDIENTE.
 * Se muestra tras crear la transacción correctamente.
 */
export function TransactionResult({ reference, onClose }: TransactionResultProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle className="size-8 text-emerald-600" aria-hidden="true" />
      </div>

      <div>
        <h3 className="font-display text-xl font-bold text-stone-900">
          Transacción creada
        </h3>
        <p className="mt-1 text-sm text-stone-500">
          Tu transacción fue creada exitosamente.
        </p>
      </div>

      <div className="w-full rounded-lg border border-stone-200 bg-stone-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Número de transacción
        </p>
        <p className="mt-1 font-display text-lg font-bold text-stone-900">
          {reference}
        </p>
      </div>

      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
        Estado: PENDIENTE
      </span>

      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 px-6 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
      >
        <X className="size-4" aria-hidden="true" />
        Cerrar
      </button>
    </div>
  );
}
