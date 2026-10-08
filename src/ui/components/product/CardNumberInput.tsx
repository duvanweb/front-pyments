import { CreditCard } from 'lucide-react';
import { detectCardBrand, formatCardNumber } from '@/domain/rules/checkout-validation.rules';
import type { CardBrand } from '@/domain/models/credit-card';

interface CardNumberInputProps {
  /** Número de tarjeta (solo dígitos). */
  value: string;
  /** Callback con dígitos sin espacios. */
  onChange: (value: string) => void;
  /** Mensaje de error. */
  error?: string;
}

/** Badge de marca de tarjeta. */
function BrandBadge({ brand }: { brand: CardBrand }) {
  if (brand === 'VISA') {
    return (
      <span className="text-xs font-bold tracking-wide text-blue-600">VISA</span>
    );
  }
  if (brand === 'MASTERCARD') {
    return (
      <span className="flex items-center gap-0.5">
        <span className="size-4 rounded-full bg-red-500/80" />
        <span className="size-4 -ml-1.5 rounded-full bg-amber-400/80" />
      </span>
    );
  }
  return <CreditCard className="size-4 text-stone-400" aria-hidden="true" />;
}

/**
 * Input de número de tarjeta con detección de marca (VISA/MASTERCARD).
 * Formatea con espacios cada 4 dígitos para legibilidad.
 */
export function CardNumberInput({ value, onChange, error }: CardNumberInputProps) {
  const brand = detectCardBrand(value);
  const formatted = formatCardNumber(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 19);
    onChange(digits);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-stone-700">
        Número de tarjeta<span className="ml-0.5 text-red-500">*</span>
      </label>
      <div
        className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 transition-colors focus-within:border-brand-500 ${
          error ? 'border-red-400' : 'border-stone-300'
        }`}
      >
        <input
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={handleChange}
          placeholder="4242 4242 4242 4242"
          className="flex-1 bg-transparent text-base text-stone-900 outline-none placeholder:text-stone-400"
        />
        <BrandBadge brand={brand} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
