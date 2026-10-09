import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import type { Product } from '@/domain/models/product';
import type { TransactionRepository } from '@/domain/ports/transaction-repository.port';
import { TransactionRepositoryProvider } from '@/infrastructure/providers/TransactionRepositoryContext';
import checkoutReducer, {
  startCheckout,
  updateCustomer,
  updateShippingAddress,
  updateCreditCard,
  setSuccess,
} from '@/infrastructure/store/checkout.slice';
import paymentReducer from '@/infrastructure/store/payment.slice';
import { CheckoutSummaryModal } from './CheckoutSummaryModal';

const mockProduct: Product = {
  id: 'prod-1',
  title: 'Tesla Hoodie',
  description: 'Hoodie cómodo',
  price: 130,
  imageUrl: 'http://localhost:3000/img.jpg',
  stock: 10,
};

function createSeededStore() {
  const store = configureStore({ reducer: { payment: paymentReducer, checkout: checkoutReducer } });
  store.dispatch(startCheckout({ productId: 'prod-1', quantity: 1 }));
  store.dispatch(updateCustomer({ fullName: 'Juan Pérez', email: 'juan@example.com', phoneNumber: '3001234567', phoneNumberPrefix: '+57' }));
  store.dispatch(updateShippingAddress({ addressLine1: 'Calle 123', city: 'Bogotá', region: 'Cundinamarca', country: 'CO', phoneNumber: '3001234567' }));
  store.dispatch(updateCreditCard({ number: '4242424242424242', holder: 'JUAN PEREZ', expiry: '12/28', cvv: '123' }));
  return store;
}

function renderModal(
  repository: TransactionRepository,
  store = createSeededStore(),
  open = true,
) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <TransactionRepositoryProvider repository={repository}>
          <CheckoutSummaryModal open={open} onClose={vi.fn()} product={mockProduct} quantity={1} />
        </TransactionRepositoryProvider>
      </MemoryRouter>
    </Provider>,
  );
}

import { render } from '@testing-library/react';

describe('CheckoutSummaryModal', () => {
  it('no renderiza nada cuando open es false', () => {
    const repository: TransactionRepository = { create: vi.fn(), getById: vi.fn() };
    renderModal(repository, createSeededStore(), false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra el resumen con datos del cliente', () => {
    const repository: TransactionRepository = { create: vi.fn(), getById: vi.fn() };
    renderModal(repository);

    expect(screen.getByText('Resumen de compra')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
  });

  it('muestra la dirección de envío', () => {
    const repository: TransactionRepository = { create: vi.fn(), getById: vi.fn() };
    renderModal(repository);

    expect(screen.getByText('Calle 123')).toBeInTheDocument();
    expect(screen.getByText(/Bogotá.*Cundinamarca/)).toBeInTheDocument();
  });

  it('muestra los últimos 4 dígitos de la tarjeta', () => {
    const repository: TransactionRepository = { create: vi.fn(), getById: vi.fn() };
    renderModal(repository);

    expect(screen.getByText(/4242/)).toBeInTheDocument();
  });

  it('muestra el botón Pagar y el botón Volver', () => {
    const repository: TransactionRepository = { create: vi.fn(), getById: vi.fn() };
    renderModal(repository);

    expect(screen.getByRole('button', { name: /Pagar/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Volver' })).toBeEnabled();
  });

  it('llama a createTransaction al hacer clic en Pagar', async () => {
    const create = vi.fn().mockResolvedValue({
      transactionId: 'tx-1',
      reference: 'REF-001',
      checkoutUrl: 'https://wompi.co/checkout/REF-001',
    });
    const repository: TransactionRepository = { create, getById: vi.fn() };
    renderModal(repository);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Pagar/ }));
    });

    await waitFor(() => {
      expect(create).toHaveBeenCalledTimes(1);
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'prod-1',
        quantity: 1,
        productPrice: 130,
      }),
    );
  });

  it('muestra error del backend cuando createTransaction falla', async () => {
    const create = vi.fn().mockRejectedValue(new Error('Error de red'));
    const repository: TransactionRepository = { create, getById: vi.fn() };
    renderModal(repository);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Pagar/ }));
    });

    await waitFor(() => {
      expect(screen.getByText('Error de red')).toBeInTheDocument();
    });
  });

  it('muestra pantalla de éxito cuando status es success', () => {
    const repository: TransactionRepository = { create: vi.fn(), getById: vi.fn() };
    const store = createSeededStore();
    store.dispatch(setSuccess({ reference: 'REF-001', transactionId: 'tx-1' }));
    renderModal(repository, store);

    expect(screen.getByText('Transacción creada')).toBeInTheDocument();
    expect(screen.getByText('REF-001')).toBeInTheDocument();
  });
});
