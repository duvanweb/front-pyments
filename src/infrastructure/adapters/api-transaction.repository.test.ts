import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiTransactionRepository } from './api-transaction.repository';
import type { CreateTransactionRequest } from '@/domain/models/transaction-request';

const validRequest: CreateTransactionRequest = {
  productId: 'prod-1',
  quantity: 1,
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

describe('ApiTransactionRepository', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('envía POST al endpoint correcto y retorna la respuesta', async () => {
    const mockResponse = {
      transactionId: 'tx-1',
      reference: 'REF-001',
      checkoutUrl: 'https://wompi.co/checkout/REF-001',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const repo = new ApiTransactionRepository('http://localhost:3000/api');
    const result = await repo.create(validRequest);

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validRequest),
    });
    expect(result).toEqual(mockResponse);
  });

  it('lanza con el mensaje del backend si la respuesta no es ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Producto sin stock' }),
      }),
    );

    const repo = new ApiTransactionRepository();
    await expect(repo.create(validRequest)).rejects.toThrow('Producto sin stock');
  });

  it('lanza un mensaje genérico si el cuerpo no es JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('not JSON')),
      }),
    );

    const repo = new ApiTransactionRepository();
    await expect(repo.create(validRequest)).rejects.toThrow(
      'Error al crear la transacción: 500',
    );
  });
});
