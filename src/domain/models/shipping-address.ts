/**
 * Dirección de envío — capa de dominio.
 *
 * Refleja el ShippingAddressDto del backend (core-payments).
 * TypeScript puro: sin dependencias de React, Tailwind ni Redux.
 */

/** Dirección de entrega para crear una transacción. */
export interface ShippingAddress {
  /** Línea principal de la dirección. */
  addressLine1: string;
  /** Línea secundaria (apto, suite, etc.). Opcional. */
  addressLine2?: string;
  /** Código ISO de 2 letras, ej: "CO". */
  country: string;
  /** Ciudad. */
  city: string;
  /** Región o departamento. */
  region: string;
  /** Teléfono de contacto en la dirección. */
  phoneNumber: string;
  /** Nombre del destinatario. Opcional. */
  name?: string;
  /** Código postal. Opcional. */
  postalCode?: string;
}
