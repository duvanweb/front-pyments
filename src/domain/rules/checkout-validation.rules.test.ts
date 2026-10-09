import { describe, expect, it } from 'vitest';
import {
  BASE_FEE_IN_CENTS,
  SHIPPING_FEE_IN_CENTS,
  LEGAL_ID_TYPES,
  isValidLuhn,
  detectCardBrand,
  formatCardNumber,
  validateCreditCard,
  validateCustomer,
  validateShippingAddress,
} from './checkout-validation.rules';
import type { CreditCardData } from '../models/credit-card';
import type { CustomerData } from '../models/customer';
import type { ShippingAddress } from '../models/shipping-address';

describe('checkout-validation.rules', () => {
  describe('constantes', () => {
    it('expone la tarifa base y de envío en centavos', () => {
      expect(BASE_FEE_IN_CENTS).toBe(250_000);
      expect(SHIPPING_FEE_IN_CENTS).toBe(300_000);
    });

    it('expone los tipos de documento legal soportados', () => {
      expect(LEGAL_ID_TYPES).toContain('CC');
      expect(LEGAL_ID_TYPES).toContain('NIT');
      expect(LEGAL_ID_TYPES.length).toBeGreaterThan(0);
    });
  });

  describe('isValidLuhn', () => {
    it('valida un número VISA de prueba conocido', () => {
      expect(isValidLuhn('4242424242424242')).toBe(true);
    });

    it('rechaza un número con checksum inválido', () => {
      expect(isValidLuhn('4242424242424241')).toBe(false);
    });

    it('rechaza una cadena vacía', () => {
      expect(isValidLuhn('')).toBe(false);
    });

    it('ignora caracteres no numéricos', () => {
      expect(isValidLuhn('4242 4242 4242 4242')).toBe(true);
    });

    it('valida un número de 15 dígitos (Amex-like)', () => {
      expect(isValidLuhn('378282246310005')).toBe(true);
    });
  });

  describe('detectCardBrand', () => {
    it('detecta VISA cuando empieza con 4', () => {
      expect(detectCardBrand('4242424242424242')).toBe('VISA');
    });

    it('detecta MASTERCARD por prefijo 51-55', () => {
      expect(detectCardBrand('5555555555554444')).toBe('MASTERCARD');
      expect(detectCardBrand('5111111111111111')).toBe('MASTERCARD');
    });

    it('detecta MASTERCARD por prefijo 2221-2720', () => {
      expect(detectCardBrand('2221000000000009')).toBe('MASTERCARD');
      expect(detectCardBrand('2720999999999995')).toBe('MASTERCARD');
    });

    it('retorna UNKNOWN para prefijos no reconocidos', () => {
      expect(detectCardBrand('6011000000000004')).toBe('UNKNOWN');
    });

    it('retorna UNKNOWN para una cadena vacía', () => {
      expect(detectCardBrand('')).toBe('UNKNOWN');
    });
  });

  describe('formatCardNumber', () => {
    it('agrupa dígitos en bloques de 4', () => {
      expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
    });

    it('ignora caracteres no numéricos', () => {
      expect(formatCardNumber('4242-4242-4242-4242')).toBe('4242 4242 4242 4242');
    });

    it('limita a 19 dígitos', () => {
      const result = formatCardNumber('12345678901234567890123456');
      expect(result.replace(/\s/g, '').length).toBe(19);
    });

    it('retorna cadena vacía para input vacío', () => {
      expect(formatCardNumber('')).toBe('');
    });
  });

  describe('validateCreditCard', () => {
    const validCard: CreditCardData = {
      number: '4242424242424242',
      holder: 'Juan Perez',
      expiry: '12/30',
      cvv: '123',
    };

    it('retorna sin errores para datos válidos', () => {
      expect(validateCreditCard(validCard)).toEqual({});
    });

    it('reporta error si el número es obligatorio', () => {
      expect(validateCreditCard({ ...validCard, number: '' }).number).toBeDefined();
    });

    it('reporta error si el número es muy corto', () => {
      expect(validateCreditCard({ ...validCard, number: '4242' }).number).toBeDefined();
    });

    it('reporta error si el número no pasa Luhn', () => {
      expect(validateCreditCard({ ...validCard, number: '4242424242424241' }).number).toBeDefined();
    });

    it('reporta error si el titular es vacío', () => {
      expect(validateCreditCard({ ...validCard, holder: '' }).holder).toBeDefined();
    });

    it('reporta error si la fecha tiene formato inválido', () => {
      expect(validateCreditCard({ ...validCard, expiry: 'invalido' }).expiry).toBeDefined();
    });

    it('reporta error si el mes es inválido', () => {
      expect(validateCreditCard({ ...validCard, expiry: '13/30' }).expiry).toBeDefined();
    });

    it('reporta error si la tarjeta está vencida', () => {
      expect(validateCreditCard({ ...validCard, expiry: '01/20' }).expiry).toBeDefined();
    });

    it('reporta error si el CVV es vacío', () => {
      expect(validateCreditCard({ ...validCard, cvv: '' }).cvv).toBeDefined();
    });

    it('reporta error si el CVV no tiene 3-4 dígitos', () => {
      expect(validateCreditCard({ ...validCard, cvv: '12' }).cvv).toBeDefined();
    });
  });

  describe('validateCustomer', () => {
    const validCustomer: CustomerData = {
      email: 'juan@example.com',
      fullName: 'Juan Perez',
      phoneNumber: '3001234567',
      phoneNumberPrefix: '+57',
    };

    it('retorna sin errores para datos válidos', () => {
      expect(validateCustomer(validCustomer)).toEqual({});
    });

    it('reporta error si el email es vacío', () => {
      expect(validateCustomer({ ...validCustomer, email: '' }).email).toBeDefined();
    });

    it('reporta error si el email es inválido', () => {
      expect(validateCustomer({ ...validCustomer, email: 'no-es-email' }).email).toBeDefined();
    });

    it('reporta error si el nombre es vacío', () => {
      expect(validateCustomer({ ...validCustomer, fullName: '' }).fullName).toBeDefined();
    });

    it('reporta error si el teléfono es vacío', () => {
      expect(validateCustomer({ ...validCustomer, phoneNumber: '' }).phoneNumber).toBeDefined();
    });

    it('reporta error si el prefijo es vacío', () => {
      expect(validateCustomer({ ...validCustomer, phoneNumberPrefix: '' }).phoneNumberPrefix).toBeDefined();
    });

    it('reporta error si el prefijo no tiene formato válido', () => {
      expect(validateCustomer({ ...validCustomer, phoneNumberPrefix: '57' }).phoneNumberPrefix).toBeDefined();
    });

    it('reporta error si el tipo de documento no es válido', () => {
      expect(validateCustomer({ ...validCustomer, legalIdType: 'INVALID' }).legalIdType).toBeDefined();
    });

    it('acepta un tipo de documento válido', () => {
      expect(validateCustomer({ ...validCustomer, legalIdType: 'CC' }).legalIdType).toBeUndefined();
    });
  });

  describe('validateShippingAddress', () => {
    const validAddress: ShippingAddress = {
      addressLine1: 'Calle 123',
      country: 'CO',
      city: 'Bogotá',
      region: 'Cundinamarca',
      phoneNumber: '3001234567',
    };

    it('retorna sin errores para datos válidos', () => {
      expect(validateShippingAddress(validAddress)).toEqual({});
    });

    it('reporta error si la dirección es vacía', () => {
      expect(validateShippingAddress({ ...validAddress, addressLine1: '' }).addressLine1).toBeDefined();
    });

    it('reporta error si el país es vacío', () => {
      expect(validateShippingAddress({ ...validAddress, country: '' }).country).toBeDefined();
    });

    it('reporta error si el país no es un código de 2 letras', () => {
      expect(validateShippingAddress({ ...validAddress, country: 'COL' }).country).toBeDefined();
    });

    it('reporta error si la ciudad es vacía', () => {
      expect(validateShippingAddress({ ...validAddress, city: '' }).city).toBeDefined();
    });

    it('reporta error si la región es vacía', () => {
      expect(validateShippingAddress({ ...validAddress, region: '' }).region).toBeDefined();
    });

    it('reporta error si el teléfono es vacío', () => {
      expect(validateShippingAddress({ ...validAddress, phoneNumber: '' }).phoneNumber).toBeDefined();
    });
  });
});
