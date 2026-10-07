import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  /** Cantidad actual (controlada). */
  value: number;
  /** Callback al cambiar la cantidad. */
  onChange: (value: number) => void;
  /** Stock disponible — tope superior del selector. */
  max: number;
  /** Deshabilita todo el selector (p. ej. cuando stock ≤ 0). */
  disabled?: boolean;
}

/**
 * Selector de cantidad con botones +/−.
 * El valor se acota entre 1 y `max` (stock).
 * Diseñado para usarse dentro de la página de detalle del producto.
 */
export function QuantitySelector({ value, onChange, max, disabled = false }: QuantitySelectorProps) {
  const canDecrement = !disabled && value > 1;
  const canIncrement = !disabled && value < max;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-stone-700">Cantidad</span>

      <div className="flex items-center rounded-lg border border-stone-300 bg-white">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={!canDecrement}
          className="flex size-10 items-center justify-center text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          aria-label="Disminuir cantidad"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>

        <output
          aria-live="polite"
          className="min-w-8 text-center text-base font-semibold tabular-nums text-stone-900"
        >
          {value}
        </output>

        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={!canIncrement}
          className="flex size-10 items-center justify-center text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          aria-label="Aumentar cantidad"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
