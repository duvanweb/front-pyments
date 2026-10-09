import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { TransactionDetails } from '@/domain/models/transaction-details';
import type { TransactionRepository } from '@/domain/ports/transaction-repository.port';
import { TransactionRepositoryProvider } from '@/infrastructure/providers/TransactionRepositoryContext';
import checkoutReducer from '@/infrastructure/store/checkout.slice';
import paymentReducer from '@/infrastructure/store/payment.slice';
import { useTransactionStatus } from './useTransactionStatus';

function createTestStore() {
  return configureStore({ reducer: { payment: paymentReducer, checkout: checkoutReducer } });
}

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

const mockDetails = (overrides: Partial<TransactionDetails> = {}): TransactionDetails => ({
  id: 'tx-1',
  status: 'PENDING',
  reference: 'REF-001',
  productId: 'prod-1',
  quantity: 1,
  totalAmountInCents: 13000,
  currency: 'COP',
  wompiTransactionId: null,
  customerId: null,
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('useTransactionStatus', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('retorna loading false y status null cuando transactionId es null', () => {
    const repository: TransactionRepository = { create: vi.fn(), getById: vi.fn() };
    const { Wrapper } = createWrapper(repository);
    const { result } = renderHook(() => useTransactionStatus(null), { wrapper: Wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.status).toBeNull();
    expect(result.current.transaction).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('inicia con loading true y consulta el estado de la transacción', async () => {
    const repository: TransactionRepository = {
      create: vi.fn(),
      getById: vi.fn().mockResolvedValue(mockDetails({ status: 'APPROVED' })),
    };
    const { Wrapper } = createWrapper(repository);
    const { result } = renderHook(() => useTransactionStatus('tx-1'), { wrapper: Wrapper });

    // Inicia cargando.
    expect(result.current.loading).toBe(true);

    // Después de la primera consulta, llega APPROVED.
    await waitFor(() => {
      expect(result.current.status).toBe('APPROVED');
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.transaction?.reference).toBe('REF-001');
    expect(repository.getById).toHaveBeenCalledWith('tx-1');
  });

  it('hace polling mientras el estado sea PENDING y para al recibir APPROVED', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });

    const getById = vi
      .fn()
      .mockResolvedValueOnce(mockDetails({ status: 'PENDING' }))
      .mockResolvedValueOnce(mockDetails({ status: 'PENDING' }))
      .mockResolvedValueOnce(mockDetails({ status: 'APPROVED' }));

    const repository: TransactionRepository = { create: vi.fn(), getById };
    const { Wrapper } = createWrapper(repository);
    const { result } = renderHook(() => useTransactionStatus('tx-1'), { wrapper: Wrapper });

    // Primera consulta: PENDING (flush microtasks de la promesa).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.status).toBe('PENDING');
    expect(result.current.loading).toBe(true);

    // Avanzar 2s → segunda consulta: PENDING.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(result.current.status).toBe('PENDING');
    expect(result.current.loading).toBe(true);

    // Avanzar 2s → tercera consulta: APPROVED.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(result.current.status).toBe('APPROVED');
    expect(result.current.loading).toBe(false);
    expect(getById).toHaveBeenCalledTimes(3);
  });

  it('deja de hacer polling cuando el estado es DECLINED', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });

    const getById = vi
      .fn()
      .mockResolvedValueOnce(mockDetails({ status: 'PENDING' }))
      .mockResolvedValueOnce(mockDetails({ status: 'DECLINED' }));

    const repository: TransactionRepository = { create: vi.fn(), getById };
    const { Wrapper } = createWrapper(repository);
    const { result } = renderHook(() => useTransactionStatus('tx-1'), { wrapper: Wrapper });

    // Primera consulta: PENDING.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.status).toBe('PENDING');

    // Avanzar 2s → segunda consulta: DECLINED.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(result.current.status).toBe('DECLINED');
    expect(result.current.loading).toBe(false);

    // Avanzar más tiempo — no debe consultar de nuevo.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(getById).toHaveBeenCalledTimes(2);
  });

  it('establece error cuando el repositorio falla', async () => {
    const repository: TransactionRepository = {
      create: vi.fn(),
      getById: vi.fn().mockRejectedValue(new Error('Error de red')),
    };
    const { Wrapper } = createWrapper(repository);
    const { result } = renderHook(() => useTransactionStatus('tx-1'), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.error).toBe('Error de red');
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.status).toBeNull();
  });

  it('establece error de timeout después de 30s en PENDING', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });

    const repository: TransactionRepository = {
      create: vi.fn(),
      getById: vi.fn().mockResolvedValue(mockDetails({ status: 'PENDING' })),
    };
    const { Wrapper } = createWrapper(repository);
    const { result } = renderHook(() => useTransactionStatus('tx-1'), { wrapper: Wrapper });

    // Avanzar en pasos de 2s para procesar cada iteración del polling.
    // Después de 32s (16 pasos), el timeout de 30s debe dispararse.
    for (let i = 0; i < 16; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
    }

    expect(result.current.error).toContain('Timeout');
    expect(result.current.loading).toBe(false);
  });
});
