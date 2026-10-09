/**
 * Tarjeta de crédito — capa de dominio.
 *
 * Los datos de tarjeta son falsos (solo para UI/validación).
 * No se envían al backend; el procesamiento real lo hace Wompi.
 */

/** Marca detectada a partir del número de tarjeta. */
export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

/** Datos de una tarjeta de crédito (falsa, solo para validación UI). */
export interface CreditCardData {
  /** Número de tarjeta, solo dígitos (sin espacios). */
  number: string;
  /** Nombre del titular. */
  holder: string;
  /** Fecha de vencimiento en formato MM/YY. */
  expiry: string;
  /** Código de seguridad (3-4 dígitos). */
  cvv: string;
}
