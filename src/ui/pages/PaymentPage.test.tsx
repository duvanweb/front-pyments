import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import checkoutReducer from '@/infrastructure/store/checkout.slice';
import paymentReducer from '@/infrastructure/store/payment.slice';
import type { PaymentRepository } from '@/domain/ports/payment-repository.port';
import { PaymentRepositoryProvider } from '@/infrastructure/providers/PaymentRepositoryContext';
import { PaymentPage } from './PaymentPage';

function renderPage(repository: PaymentRepository) {
  const store = configureStore({ reducer: { payment: paymentReducer, checkout: checkoutReducer } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter>
          <PaymentRepositoryProvider repository={repository}>
            {children}
          </PaymentRepositoryProvider>
        </MemoryRouter>
      </Provider>
    );
  }
  // We need to use render from @testing-library/react directly since renderWithProviders
  // doesn't include PaymentRepositoryProvider
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { render } = require('@testing-library/react');
  return render(<PaymentPage />, { wrapper: Wrapper });
}

describe('PaymentPage', () => {
  it('renders the new payment form heading', () => {
    const repository: PaymentRepository = {
      getHistory: vi.fn().mockResolvedValue([]),
      saveTransaction: vi.fn(),
      clear: vi.fn(),
    };
    renderPage(repository);
    expect(screen.getByText('Nuevo pago')).toBeInTheDocument();
  });

  it('renders the history section with empty message', () => {
    const repository: PaymentRepository = {
      getHistory: vi.fn().mockResolvedValue([]),
      saveTransaction: vi.fn(),
      clear: vi.fn(),
    };
    renderPage(repository);
    expect(screen.getByText('Historial')).toBeInTheDocument();
    expect(screen.getByText('Aún no hay transacciones.')).toBeInTheDocument();
  });

  it('renders currency and method selectors', () => {
    const repository: PaymentRepository = {
      getHistory: vi.fn().mockResolvedValue([]),
      saveTransaction: vi.fn(),
      clear: vi.fn(),
    };
    renderPage(repository);
    expect(screen.getByText('Moneda')).toBeInTheDocument();
    expect(screen.getByText('Método')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    const repository: PaymentRepository = {
      getHistory: vi.fn().mockResolvedValue([]),
      saveTransaction: vi.fn(),
      clear: vi.fn(),
    };
    renderPage(repository);
    expect(screen.getByText('Pagar')).toBeInTheDocument();
  });

  it('processes payment on submit and shows transaction', async () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValue('test-uuid') });
    const repository: PaymentRepository = {
      getHistory: vi.fn().mockResolvedValue([]),
      saveTransaction: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
    };
    renderPage(repository);

    const amountInput = screen.getByPlaceholderText('10000');
    fireEvent.change(amountInput, { target: { value: '100.00' } });

    const submitButton = screen.getByText('Pagar');
    fireEvent.click(submitButton);

    await waitFor(() => expect(screen.getByText('Última transacción')).toBeInTheDocument());
    expect(screen.getByText('Aprobada')).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it('changes currency selector', () => {
    const repository: PaymentRepository = {
      getHistory: vi.fn().mockResolvedValue([]),
      saveTransaction: vi.fn(),
      clear: vi.fn(),
    };
    renderPage(repository);

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'USD' } });
    expect(selects[0]).toHaveValue('USD');
  });

  it('changes method selector', () => {
    const repository: PaymentRepository = {
      getHistory: vi.fn().mockResolvedValue([]),
      saveTransaction: vi.fn(),
      clear: vi.fn(),
    };
    renderPage(repository);

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'PSE' } });
    expect(selects[1]).toHaveValue('PSE');
  });

  it('renders history items when available', async () => {
    const mockTransactions = [
      {
        id: 'tx-1',
        payment: { id: 'pay-1', amountInCents: 10000, currency: 'COP', method: 'CREDIT_CARD', createdAt: '2026-01-01T00:00:00Z' },
        status: 'APPROVED',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];
    const repository: PaymentRepository = {
      getHistory: vi.fn().mockResolvedValue(mockTransactions),
      saveTransaction: vi.fn(),
      clear: vi.fn(),
    };
    renderPage(repository);

    await waitFor(() => expect(screen.getByText('Aprobada')).toBeInTheDocument());
    expect(screen.queryByText('Aún no hay transacciones.')).not.toBeInTheDocument();
  });
});
