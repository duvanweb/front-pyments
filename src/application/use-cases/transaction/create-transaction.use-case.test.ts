import { describe, expect, it, vi } from 'vitest';
import { CreateTransaction } from './create-transaction.use-case';
import type { CreateTransactionRequest } from '@/domain/models/transaction-request';
import type { TransactionRepository } from '@/domain/ports/transaction-repository.port';

function createMockRepository(): TransactionRepository {
  return {
    create: vi.fn(),
    getById: vi.fn(),
  };
}

const validRequest: CreateTransactionRequest = {
  productId: 'prod-1',
  quantity: 2,
  productPrice: 130,
  customer: {
    email: 'juan@example.com',
    fullName: 'Juan Perez',
    phoneNumber: '3001234567',
    phoneNumberPrefix: '+57',
  },
  shippingAddress: {
    addressLine1: 'Calle 123',
    country: 'CO',
    city: 'Bogotá',
    region: 'Cundinamarca',
    phoneNumber: '3001234567',
  },
};

describe('CreateTransaction use case', () => {
  it('delega al repositorio y retorna la respuesta', async () => {
    const repository = createMockRepository();
    const mockResponse = {
      transactionId: 'tx-1',
      reference: 'REF-001',
      checkoutUrl: 'https://wompi.co/checkout/REF-001',
    };
    (repository.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await new CreateTransaction(repository).execute(validRequest);

    expect(repository.create).toHaveBeenCalledWith(validRequest);
    expect(result).toEqual(mockResponse);
  });

  it('propaga el error si el repositorio falla', async () => {
    const repository = createMockRepository();
    (repository.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Error de red'),
    );

    await expect(new CreateTransaction(repository).execute(validRequest)).rejects.toThrow(
      'Error de red',
    );
  });
});
