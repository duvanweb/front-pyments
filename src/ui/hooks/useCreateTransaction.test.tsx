import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from '@/infrastructure/store/checkout.slice';
import paymentReducer from '@/infrastructure/store/payment.slice';
import { TransactionRepositoryProvider } from '@/infrastructure/providers/TransactionRepositoryContext';
import type { TransactionRepository } from '@/domain/ports/transaction-repository.port';
import type { CreateTransactionRequest } from '@/domain/models/transaction-request';
import { useCreateTransaction } from './useCreateTransaction';

function createTestStore() {
  return configureStore({ reducer: { payment: paymentReducer, checkout: checkoutReducer } });
}

const mockRequest: CreateTransactionRequest = {
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

function createWrapper(repository: TransactionRepository) {
  const store = createTestStore();
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <TransactionRepositoryProvider repository={repository}>
          {children}
        </TransactionRepositoryProvider>
      </Provider>
    );
  }
  return { store, Wrapper };
}

describe('useCreateTransaction', () => {
  it('inicia con status idle', () => {
    const repository: TransactionRepository = { create: vi.fn() };
    const { Wrapper } = createWrapper(repository);
    const { result } = renderHook(() => useCreateTransaction(), { wrapper: Wrapper });
    expect(result.current.status).toBe('idle');
    expect(result.current.transactionReference).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('dispatcha success cuando la transacción se crea correctamente', async () => {
    const repository: TransactionRepository = {
      create: vi.fn().mockResolvedValue({
        transactionId: 'tx-1',
        reference: 'REF-001',
        checkoutUrl: 'https://wompi.co/c/REF-001',
      }),
    };
    const { Wrapper } = createWrapper(repository);
    const { result } = renderHook(() => useCreateTransaction(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.createTransaction(mockRequest);
    });

    expect(result.current.status).toBe('success');
    expect(result.current.transactionReference).toBe('REF-001');
  });

  it('dispatcha error cuando el repositorio falla', async () => {
    const repository: TransactionRepository = {
      create: vi.fn().mockRejectedValue(new Error('Error de red')),
    };
    const { Wrapper } = createWrapper(repository);
    const { result } = renderHook(() => useCreateTransaction(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.createTransaction(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.error).toBe('Error de red');
  });
});
