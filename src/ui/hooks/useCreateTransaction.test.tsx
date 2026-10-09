import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

/** Mock de window.location para capturar redirecciones. */
function mockWindowLocation() {
  const href = vi.fn();
  const location = { ...window.location, set href(v: string) { href(v); } };
  Object.defineProperty(window, 'location', {
    value: location,
    writable: true,
    configurable: true,
  });
  return href;
}

describe('useCreateTransaction', () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it('inicia con status idle', () => {
    const repository: TransactionRepository = { create: vi.fn() };
    const { Wrapper } = createWrapper(repository);
    const { result } = renderHook(() => useCreateTransaction(), { wrapper: Wrapper });
    expect(result.current.status).toBe('idle');
    expect(result.current.transactionReference).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('dispatcha success y redirige a Wompi cuando la transacción se crea correctamente', async () => {
    const redirect = mockWindowLocation();
    const checkoutUrl = 'https://checkout.wompi.co/c/REF-001';
    const repository: TransactionRepository = {
      create: vi.fn().mockResolvedValue({
        transactionId: 'tx-1',
        reference: 'REF-001',
        checkoutUrl,
      }),
    };
    const { Wrapper } = createWrapper(repository);
    const { result } = renderHook(() => useCreateTransaction(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.createTransaction(mockRequest);
    });

    expect(result.current.status).toBe('success');
    expect(result.current.transactionReference).toBe('REF-001');
    expect(redirect).toHaveBeenCalledWith(checkoutUrl);
  });

  it('no redirige si checkoutUrl está vacía', async () => {
    const redirect = mockWindowLocation();
    const repository: TransactionRepository = {
      create: vi.fn().mockResolvedValue({
        transactionId: 'tx-1',
        reference: 'REF-001',
        checkoutUrl: '',
      }),
    };
    const { Wrapper } = createWrapper(repository);
    const { result } = renderHook(() => useCreateTransaction(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.createTransaction(mockRequest);
    });

    expect(result.current.status).toBe('success');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('dispatcha error y no redirige cuando el repositorio falla', async () => {
    const redirect = mockWindowLocation();
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
    expect(redirect).not.toHaveBeenCalled();
  });
});
