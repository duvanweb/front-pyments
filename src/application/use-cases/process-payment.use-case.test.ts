import { describe, expect, it, vi } from 'vitest';
import type { PaymentRepository } from '@/domain/ports/payment-repository.port';
import { ProcessPayment } from './process-payment.use-case';
import { PaymentValidationError } from '@/domain/rules/payment-validation.rules';

function createMockRepository(): PaymentRepository {
  return {
    getHistory: vi.fn(),
    saveTransaction: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn(),
  };
}

const validRequest = {
  amountInCents: 10000,
  currency: 'COP' as const,
  method: 'CREDIT_CARD' as const,
};

describe('ProcessPayment', () => {
  it('throws PaymentValidationError when validation fails', async () => {
    const repository = createMockRepository();
    const useCase = new ProcessPayment(repository);

    await expect(
      useCase.execute({ amountInCents: -1, currency: 'COP', method: 'CREDIT_CARD' }),
    ).rejects.toThrow(PaymentValidationError);
  });

  it('constructs a payment and transaction, saves, and returns the transaction', async () => {
    const repository = createMockRepository();
    vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValue('test-uuid') });
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    const result = await new ProcessPayment(repository).execute(validRequest);

    expect(result.id).toBe('test-uuid');
    expect(result.payment.id).toBe('test-uuid');
    expect(result.payment.amountInCents).toBe(10000);
    expect(result.payment.currency).toBe('COP');
    expect(result.payment.method).toBe('CREDIT_CARD');
    expect(result.payment.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(result.status).toBe('APPROVED');
    expect(result.updatedAt).toBe('2026-01-01T00:00:00.000Z');

    expect(repository.saveTransaction).toHaveBeenCalledWith(result);

    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('rejects transactions above the decline threshold', async () => {
    const repository = createMockRepository();
    vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValue('test-uuid') });

    const result = await new ProcessPayment(repository).execute({
      amountInCents: 60_000_000,
      currency: 'COP',
      method: 'CREDIT_CARD',
    });

    expect(result.status).toBe('REJECTED');
    vi.unstubAllGlobals();
  });

  it('propagates repository errors', async () => {
    const repository = createMockRepository();
    repository.saveTransaction = vi.fn().mockRejectedValue(new Error('Save failed'));
    vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValue('test-uuid') });

    await expect(
      new ProcessPayment(repository).execute(validRequest),
    ).rejects.toThrow('Save failed');

    vi.unstubAllGlobals();
  });
});
