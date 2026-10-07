import { describe, expect, it } from 'vitest';
import type { PaymentRequest } from '../models/payment';
import {
  DECLINE_THRESHOLD_IN_CENTS,
  MAX_AMOUNT_IN_CENTS,
  resolveTransactionStatus,
  validatePayment,
} from './payment-validation.rules';

const validRequest: PaymentRequest = {
  amountInCents: 10_000,
  currency: 'COP',
  method: 'CREDIT_CARD',
};

describe('validatePayment', () => {
  it('acepta una solicitud válida', () => {
    const result = validatePayment(validRequest);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rechaza monto cero', () => {
    const result = validatePayment({ ...validRequest, amountInCents: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBe('El monto debe ser mayor a cero.');
  });

  it('rechaza monto negativo', () => {
    const result = validatePayment({ ...validRequest, amountInCents: -100 });
    expect(result.isValid).toBe(false);
  });

  it('rechaza montos no enteros', () => {
    const result = validatePayment({ ...validRequest, amountInCents: 10_000.5 });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBe('El monto debe ser un número entero en centavos.');
  });

  it('rechaza montos sobre el límite por transacción', () => {
    const result = validatePayment({ ...validRequest, amountInCents: MAX_AMOUNT_IN_CENTS + 1 });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBe('El monto excede el límite por transacción.');
  });

  it('rechaza moneda no soportada', () => {
    const result = validatePayment({ ...validRequest, currency: 'EUR' as PaymentRequest['currency'] });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('La moneda no está soportada.');
  });

  it('rechaza método de pago no soportado', () => {
    const result = validatePayment({
      ...validRequest,
      method: 'WIRE_TRANSFER' as PaymentRequest['method'],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El método de pago no está soportado.');
  });

  it('acumula todos los errores (no corta en el primero)', () => {
    const result = validatePayment({
      amountInCents: -1,
      currency: 'EUR' as PaymentRequest['currency'],
      method: 'WIRE_TRANSFER' as PaymentRequest['method'],
    });
    expect(result.errors).toHaveLength(3);
  });
});

describe('resolveTransactionStatus', () => {
  it('aprueba montos en o por debajo del umbral simulado', () => {
    const request = { ...validRequest, amountInCents: DECLINE_THRESHOLD_IN_CENTS };
    expect(resolveTransactionStatus(request)).toBe('APPROVED');
  });

  it('rechaza montos por encima del umbral simulado', () => {
    const request = { ...validRequest, amountInCents: DECLINE_THRESHOLD_IN_CENTS + 1 };
    expect(resolveTransactionStatus(request)).toBe('REJECTED');
  });
});
