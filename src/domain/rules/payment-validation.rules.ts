import type { Currency, PaymentMethod, PaymentRequest } from '../models/payment';
import type { TransactionStatus } from '../models/transaction';

/** Límite máximo por transacción: equivalente a $2.000.000 COP, en centavos. */
export const MAX_AMOUNT_IN_CENTS = 200_000_000;

/**
 * Umbral de rechazo simulado: montos por encima de este valor son
 * declinados por el "gateway" (simulación determinista para el scaffold).
 * Reemplazar por la integración real cuando exista el backend.
 */
export const DECLINE_THRESHOLD_IN_CENTS = 50_000_000;

/** Monedas soportadas. */
export const SUPPORTED_CURRENCIES: readonly Currency[] = ['COP', 'USD', 'MXN'];

/** Métodos de pago soportados. */
export const SUPPORTED_METHODS: readonly PaymentMethod[] = [
  'CREDIT_CARD',
  'DEBIT_CARD',
  'PSE',
  'CASH',
];

/** Resultado de validar una solicitud de pago. */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/** Error de dominio lanzado cuando una solicitud de pago no es válida. */
export class PaymentValidationError extends Error {
  readonly errors: string[];

  constructor(errors: string[]) {
    super(`Pago inválido: ${errors.join('; ')}`);
    this.name = 'PaymentValidationError';
    this.errors = errors;
  }
}

/**
 * Regla de negocio pura: valida una solicitud de pago.
 * Devuelve todos los errores encontrados (no corta en el primero).
 */
export function validatePayment(request: PaymentRequest): ValidationResult {
  const errors: string[] = [];

  if (!Number.isInteger(request.amountInCents)) {
    errors.push('El monto debe ser un número entero en centavos.');
  } else if (request.amountInCents <= 0) {
    errors.push('El monto debe ser mayor a cero.');
  } else if (request.amountInCents > MAX_AMOUNT_IN_CENTS) {
    errors.push('El monto excede el límite por transacción.');
  }

  if (!SUPPORTED_CURRENCIES.includes(request.currency)) {
    errors.push('La moneda no está soportada.');
  }

  if (!SUPPORTED_METHODS.includes(request.method)) {
    errors.push('El método de pago no está soportado.');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Regla de negocio pura: decide el estado inicial de la transacción.
 * Simulación determinista del gateway — reemplazar por la decisión real.
 */
export function resolveTransactionStatus(request: PaymentRequest): TransactionStatus {
  return request.amountInCents > DECLINE_THRESHOLD_IN_CENTS ? 'REJECTED' : 'APPROVED';
}
