/**
 * Entidad de pago — capa de dominio.
 *
 * Regla de la arquitectura hexagonal: este archivo es TypeScript puro,
 * sin dependencias de React, Tailwind, Redux ni ningún framework.
 */

/** Métodos de pago soportados por el dominio. */
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE' | 'CASH';

/** Monedas soportadas por el dominio. */
export type Currency = 'COP' | 'USD' | 'MXN';

/**
 * Solicitud de pago que entra desde la UI (DTO de entrada).
 * El id y la fecha los genera el caso de uso al construir la entidad.
 */
export interface PaymentRequest {
  /** Monto en centavos (entero) para evitar errores de coma flotante. */
  amountInCents: number;
  currency: Currency;
  method: PaymentMethod;
}

/** Entidad de pago. */
export interface Payment extends PaymentRequest {
  id: string;
  /** Fecha de creación en ISO 8601. */
  createdAt: string;
}
