/**
 * Datos del cliente — capa de dominio.
 *
 * Refleja el CustomerDataDto del backend (core-payments).
 * TypeScript puro: sin dependencias de React, Tailwind ni Redux.
 */

/** Datos del cliente para crear una transacción. */
export interface CustomerData {
  /** Correo electrónico válido. */
  email: string;
  /** Nombre completo del cliente. */
  fullName: string;
  /** Número de teléfono sin prefijo. */
  phoneNumber: string;
  /** Prefijo internacional, ej: "+57". */
  phoneNumberPrefix: string;
  /** Tipo de documento (CC, CE, NIT, ...). Opcional. */
  legalIdType?: string;
  /** Número de documento. Opcional. */
  legalId?: string;
}
