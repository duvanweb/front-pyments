/**
 * Reglas de validación del checkout — capa de dominio.
 *
 * Validaciones puras (sin side-effects) para datos del cliente,
 * dirección de envío y tarjeta de crédito. Incluye detección de
 * marca (VISA/MASTERCARD) y algoritmo de Luhn.
 */
import type { CardBrand, CreditCardData } from '../models/credit-card';
import type { CustomerData } from '../models/customer';
import type { ShippingAddress } from '../models/shipping-address';

/** Tarifa base en centavos (matching backend BASE_FEE_IN_CENTS). */
export const BASE_FEE_IN_CENTS = 250_000;

/** Tarifa de envío en centavos (matching backend SHIPPING_FEE_IN_CENTS). */
export const SHIPPING_FEE_IN_CENTS = 300_000;

/** Tipos de documento legal soportados por el backend. */
export const LEGAL_ID_TYPES = [
  'CC',
  'CE',
  'NIT',
  'PP',
  'TI',
  'DNI',
  'RG',
  'OTHER',
] as const;

/** Mapa de errores por campo (clave = nombre del campo, valor = mensaje). */
export type FieldErrors = Record<string, string>;

// ---------------------------------------------------------------------------
// Tarjeta de crédito
// ---------------------------------------------------------------------------

/**
 * Algoritmo de Luhn: valida que un número de tarjeta sea estructuralmente
 * correcto. Solo recibe dígitos.
 */
export function isValidLuhn(number: string): boolean {
  const digits = number.replace(/\D/g, '');
  if (digits.length === 0) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Detecta la marca de la tarjeta a partir del número.
 * - VISA: empieza con 4.
 * - MASTERCARD: empieza con 51-55 o 2221-2720.
 * - UNKNOWN: cualquier otro prefijo.
 */
export function detectCardBrand(number: string): CardBrand {
  const digits = number.replace(/\D/g, '');

  if (digits.startsWith('4')) return 'VISA';

  if (digits.length >= 2) {
    const prefix2 = parseInt(digits.slice(0, 2), 10);
    if (prefix2 >= 51 && prefix2 <= 55) return 'MASTERCARD';
  }

  if (digits.length >= 4) {
    const prefix4 = parseInt(digits.slice(0, 4), 10);
    if (prefix4 >= 2221 && prefix4 <= 2720) return 'MASTERCARD';
  }

  return 'UNKNOWN';
}

/** Formatea un número de tarjeta agrupando dígitos en 4s. */
export function formatCardNumber(number: string): string {
  const digits = number.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

/** Valida los datos de la tarjeta de crédito. */
export function validateCreditCard(data: CreditCardData): FieldErrors {
  const errors: FieldErrors = {};
  const digits = data.number.replace(/\D/g, '');

  if (!digits) {
    errors.number = 'El número de tarjeta es obligatorio.';
  } else if (digits.length < 13 || digits.length > 19) {
    errors.number = 'El número de tarjeta debe tener entre 13 y 19 dígitos.';
  } else if (!isValidLuhn(digits)) {
    errors.number = 'El número de tarjeta no es válido.';
  }

  if (!data.holder.trim()) {
    errors.holder = 'El nombre del titular es obligatorio.';
  }

  if (!data.expiry) {
    errors.expiry = 'La fecha de vencimiento es obligatoria.';
  } else {
    const match = data.expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
      errors.expiry = 'Formato inválido (MM/YY).';
    } else {
      const month = parseInt(match[1], 10);
      const year = parseInt(match[2], 10) + 2000;
      if (month < 1 || month > 12) {
        errors.expiry = 'Mes inválido.';
      } else {
        const expiryDate = new Date(year, month, 1);
        const now = new Date();
        if (expiryDate <= now) {
          errors.expiry = 'La tarjeta está vencida.';
        }
      }
    }
  }

  if (!data.cvv) {
    errors.cvv = 'El CVV es obligatorio.';
  } else if (!/^\d{3,4}$/.test(data.cvv)) {
    errors.cvv = 'El CVV debe tener 3 o 4 dígitos.';
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Cliente
// ---------------------------------------------------------------------------

/** Valida los datos del cliente. */
export function validateCustomer(data: CustomerData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'El correo electrónico no es válido.';
  }

  if (!data.fullName.trim()) {
    errors.fullName = 'El nombre completo es obligatorio.';
  }

  if (!data.phoneNumber.trim()) {
    errors.phoneNumber = 'El número de teléfono es obligatorio.';
  }

  if (!data.phoneNumberPrefix.trim()) {
    errors.phoneNumberPrefix = 'El prefijo es obligatorio.';
  } else if (!/^\+\d{1,4}$/.test(data.phoneNumberPrefix)) {
    errors.phoneNumberPrefix = 'El prefijo debe ser + seguido de 1-4 dígitos.';
  }

  if (data.legalIdType && !LEGAL_ID_TYPES.includes(data.legalIdType as (typeof LEGAL_ID_TYPES)[number])) {
    errors.legalIdType = 'Tipo de documento no válido.';
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Dirección de envío
// ---------------------------------------------------------------------------

/** Valida la dirección de envío. */
export function validateShippingAddress(data: ShippingAddress): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.addressLine1.trim()) {
    errors.addressLine1 = 'La dirección es obligatoria.';
  }

  if (!data.country.trim()) {
    errors.country = 'El país es obligatorio.';
  } else if (!/^[A-Z]{2}$/.test(data.country)) {
    errors.country = 'El país debe ser un código de 2 letras (ej: CO).';
  }

  if (!data.city.trim()) {
    errors.city = 'La ciudad es obligatoria.';
  }

  if (!data.region.trim()) {
    errors.region = 'La región es obligatoria.';
  }

  if (!data.phoneNumber.trim()) {
    errors.phoneNumber = 'El teléfono es obligatorio.';
  }

  return errors;
}
