import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import checkoutReducer from '@/infrastructure/store/checkout.slice';
import paymentReducer from '@/infrastructure/store/payment.slice';
import type { PaymentRepository } from '@/domain/ports/payment-repository.port';
import { PaymentRepositoryProvider } from '@/infrastructure/providers/PaymentRepositoryContext';
import { useProcessPayment } from './useProcessPayment';

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

describe('useProcessPayment', () => {
  it('returns initial state', () => {
    const repository: PaymentRepository = {
      getHistory: vi.fn(),
      saveTransaction: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
    };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useProcessPayment(), { wrapper: Wrapper });
    expect(result.current.flowStatus).toBe('idle');
    expect(result.current.currentTransaction).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('processPayment dispatches setProcessing then setTransaction on success', async () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValue('test-uuid') });
    const repository: PaymentRepository = {
      getHistory: vi.fn(),
      saveTransaction: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
    };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useProcessPayment(), { wrapper: Wrapper });

    const transaction = await result.current.processPayment({
      amountInCents: 10000,
      currency: 'COP',
      method: 'CREDIT_CARD',
    });

    expect(transaction.status).toBe('APPROVED');
    await waitFor(() => expect(result.current.flowStatus).toBe('succeeded'));
    expect(result.current.currentTransaction).not.toBeNull();

    vi.unstubAllGlobals();
  });

  it('processPayment dispatches setPaymentError on failure', async () => {
    const repository: PaymentRepository = {
      getHistory: vi.fn(),
      saveTransaction: vi.fn().mockRejectedValue(new Error('Save failed')),
      clear: vi.fn(),
    };
    const { Wrapper } = createWrapper(repository);

    const { result } = renderHook(() => useProcessPayment(), { wrapper: Wrapper });

    await expect(
      result.current.processPayment({ amountInCents: 10000, currency: 'COP', method: 'CREDIT_CARD' }),
    ).rejects.toThrow('Save failed');

    await waitFor(() => expect(result.current.flowStatus).toBe('failed'));
    expect(result.current.error).toBe('Save failed');
  });
});
