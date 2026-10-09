import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import type { TransactionDetails } from '@/domain/models/transaction-details';
import type { TransactionRepository } from '@/domain/ports/transaction-repository.port';
import { TransactionRepositoryProvider } from '@/infrastructure/providers/TransactionRepositoryContext';
import checkoutReducer, {
  startCheckout,
  setSuccess,
} from '@/infrastructure/store/checkout.slice';
import paymentReducer from '@/infrastructure/store/payment.slice';
import { TransactionResultPage } from './TransactionResultPage';

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function createTestStore() {
  return configureStore({ reducer: { payment: paymentReducer, checkout: checkoutReducer } });
}

/** Crea un store con transactionId y productId pre-poblados (simula regreso de Wompi). */
function createSeededStore(transactionId = 'tx-1', productId = 'prod-1') {
  const store = createTestStore();
  store.dispatch(startCheckout({ productId, quantity: 1 }));
  store.dispatch(setSuccess({ reference: 'REF-001', transactionId }));
  return store;
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

function renderPage(
  repository: TransactionRepository,
  store = createSeededStore(),
  initialEntries = ['/transaction/result'],
) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <TransactionRepositoryProvider repository={repository}>
          <TransactionResultPage />
        </TransactionRepositoryProvider>
      </MemoryRouter>
    </Provider>,
  );
}

describe('TransactionResultPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('redirige a / cuando no hay transactionId en Redux', () => {
    const repository: TransactionRepository = { create: vi.fn(), getById: vi.fn() };
    const store = createTestStore(); // sin dispatchar setSuccess → transactionId es null

    renderPage(repository, store);

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('muestra spinner de procesamiento mientras el estado es PENDING', () => {
    const repository: TransactionRepository = {
      create: vi.fn(),
      getById: vi.fn().mockResolvedValue(mockDetails({ status: 'PENDING' })),
    };
    renderPage(repository);

    expect(screen.getByText('Procesando pago...')).toBeInTheDocument();
  });

  it('muestra pago aprobado cuando el estado es APPROVED', async () => {
    const repository: TransactionRepository = {
      create: vi.fn(),
      getById: vi.fn().mockResolvedValue(mockDetails({ status: 'APPROVED' })),
    };
    renderPage(repository);

    await waitFor(() => {
      expect(screen.getByText('¡Pago aprobado!')).toBeInTheDocument();
    });
    expect(screen.getByText('REF-001')).toBeInTheDocument();
    expect(screen.getByText('Ver producto')).toBeInTheDocument();
  });

  it('muestra pago rechazado cuando el estado es DECLINED', async () => {
    const repository: TransactionRepository = {
      create: vi.fn(),
      getById: vi.fn().mockResolvedValue(mockDetails({ status: 'DECLINED' })),
    };
    renderPage(repository);

    await waitFor(() => {
      expect(screen.getByText('Pago rechazado')).toBeInTheDocument();
    });
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('muestra error cuando el estado es ERROR', async () => {
    const repository: TransactionRepository = {
      create: vi.fn(),
      getById: vi.fn().mockResolvedValue(mockDetails({ status: 'ERROR' })),
    };
    renderPage(repository);

    await waitFor(() => {
      expect(screen.getByText('Error en la transacción')).toBeInTheDocument();
    });
  });

  it('muestra error cuando el repositorio falla', async () => {
    const repository: TransactionRepository = {
      create: vi.fn(),
      getById: vi.fn().mockRejectedValue(new Error('Error de red')),
    };
    renderPage(repository);

    await waitFor(() => {
      expect(screen.getByText('Error en la transacción')).toBeInTheDocument();
    });
    expect(screen.getByText('Error de red')).toBeInTheDocument();
  });

  it('auto-redirige al producto después del countdown', async () => {
    const repository: TransactionRepository = {
      create: vi.fn(),
      getById: vi.fn().mockResolvedValue(mockDetails({ status: 'APPROVED' })),
    };
    renderPage(repository);

    await waitFor(() => {
      expect(screen.getByText('¡Pago aprobado!')).toBeInTheDocument();
    });

    // Esperar a que el countdown de 5s redirija al producto.
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/products/prod-1', { replace: true });
      },
      { timeout: 8000 },
    );
  }, 10000);
});
