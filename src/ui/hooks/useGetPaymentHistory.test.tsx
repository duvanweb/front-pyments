import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from '@/infrastructure/store/checkout.slice';
import paymentReducer from '@/infrastructure/store/payment.slice';
import type { PaymentRepository } from '@/domain/ports/payment-repository.port';
import { PaymentRepositoryProvider } from '@/infrastructure/providers/PaymentRepositoryContext';
import { useGetPaymentHistory } from './useGetPaymentHistory';
import type { Transaction } from '@/domain/models/transaction';

const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    payment: { id: 'pay-1', amountInCents: 10000, currency: 'COP', method: 'CREDIT_CARD', createdAt: '2026-01-01T00:00:00Z' },
    status: 'APPROVED',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

function createWrapper(repository: PaymentRepository) {
  const store = configureStore({ reducer: { payment: paymentReducer, checkout: checkoutReducer } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <PaymentRepositoryProvider repository={repository}>
          {children}
        </PaymentRepositoryProvider>
      </Provider>
    );
  }
  return { store, Wrapper };
}

describe('useGetPaymentHistory', () => {
  it('returns initial empty history from Redux store', () => {
    const repository: PaymentRepository = {
      getHistory: vi.fn().mockResolvedValue([]),
      saveTransaction: vi.fn(),
      clear: vi.fn(),
    };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useGetPaymentHistory(), { wrapper: Wrapper });
    expect(result.current.history).toEqual([]);
  });

  it('fetches history on mount and dispatches to Redux', async () => {
    const repository: PaymentRepository = {
      getHistory: vi.fn().mockResolvedValue(mockTransactions),
      saveTransaction: vi.fn(),
      clear: vi.fn(),
    };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useGetPaymentHistory(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.history).toEqual(mockTransactions));
    expect(repository.getHistory).toHaveBeenCalledOnce();
  });

  it('refresh re-fetches and updates history', async () => {
    const repository: PaymentRepository = {
      getHistory: vi.fn().mockResolvedValue(mockTransactions),
      saveTransaction: vi.fn(),
      clear: vi.fn(),
    };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useGetPaymentHistory(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.history).toEqual(mockTransactions));
    expect(repository.getHistory).toHaveBeenCalledTimes(1);

    await result.current.refresh();
    expect(repository.getHistory).toHaveBeenCalledTimes(2);
  });
});
