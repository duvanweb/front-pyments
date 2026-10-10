import { describe, expect, it, vi } from 'vitest';
import type { Transaction } from '@/domain/models/transaction';
import type { PaymentRepository } from '@/domain/ports/payment-repository.port';
import { GetPaymentHistory } from './get-payment-history.use-case';

function createMockRepository(): PaymentRepository {
  return {
    getHistory: vi.fn(),
    saveTransaction: vi.fn(),
    clear: vi.fn(),
  };
}

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    payment: { id: 'pay-1', amountInCents: 10000, currency: 'COP', method: 'CREDIT_CARD', createdAt: '2026-01-01T00:00:00Z' },
    status: 'APPROVED',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('GetPaymentHistory', () => {
  it('returns transactions from the repository', async () => {
    const repository = createMockRepository();
    repository.getHistory = vi.fn().mockResolvedValue(mockTransactions);

    const result = await new GetPaymentHistory(repository).execute();

    expect(repository.getHistory).toHaveBeenCalledOnce();
    expect(result).toEqual(mockTransactions);
  });

  it('returns an empty array when no transactions exist', async () => {
    const repository = createMockRepository();
    repository.getHistory = vi.fn().mockResolvedValue([]);

    const result = await new GetPaymentHistory(repository).execute();

    expect(result).toEqual([]);
  });

  it('propagates repository errors', async () => {
    const repository = createMockRepository();
    repository.getHistory = vi.fn().mockRejectedValue(new Error('Storage error'));

    await expect(new GetPaymentHistory(repository).execute()).rejects.toThrow('Storage error');
  });
});
