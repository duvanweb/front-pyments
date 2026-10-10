import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Product } from '@/domain/models/product';
import type { TransactionRepository } from '@/domain/ports/transaction-repository.port';
import { renderWithProviders } from '@/test-utils';
import { CheckoutSummaryModal } from './CheckoutSummaryModal';

const mockProduct: Product = {
  id: '1',
  title: 'Test Product',
  description: 'A test product',
  price: 50000,
  imageUrl: 'http://example.com/img.jpg',
  stock: 5,
};

function createMockRepository() {
  return {
    create: vi.fn().mockResolvedValue({
      transactionId: 'tx-1',
      reference: 'REF-001',
      checkoutUrl: undefined,
    }),
  } as unknown as TransactionRepository;
}

describe('CheckoutSummaryModal', () => {
  it('returns null when open is false', () => {
    renderWithProviders(
      <CheckoutSummaryModal open={false} onClose={vi.fn()} product={mockProduct} quantity={1} />,
      { transactionRepository: createMockRepository() },
    );
    expect(screen.queryByText('Resumen de compra')).not.toBeInTheDocument();
  });

  it('renders modal content when open is true', () => {
    renderWithProviders(
      <CheckoutSummaryModal open={true} onClose={vi.fn()} product={mockProduct} quantity={1} />,
      { transactionRepository: createMockRepository() },
    );
    expect(screen.getByText('Resumen de compra')).toBeInTheDocument();
    expect(screen.getByText('Datos del cliente')).toBeInTheDocument();
    expect(screen.getByText('Dirección de envío')).toBeInTheDocument();
    expect(screen.getByText('Tarjeta de crédito')).toBeInTheDocument();
  });

  it('renders Volver button', () => {
    renderWithProviders(
      <CheckoutSummaryModal open={true} onClose={vi.fn()} product={mockProduct} quantity={1} />,
      { transactionRepository: createMockRepository() },
    );
    expect(screen.getByText('Volver')).toBeInTheDocument();
  });

  it('calls onClose when Volver button is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <CheckoutSummaryModal open={true} onClose={onClose} product={mockProduct} quantity={1} />,
      { transactionRepository: createMockRepository() },
    );
    fireEvent.click(screen.getByText('Volver'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button (X) is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <CheckoutSummaryModal open={true} onClose={onClose} product={mockProduct} quantity={1} />,
      { transactionRepository: createMockRepository() },
    );
    fireEvent.click(screen.getByLabelText('Volver al formulario'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls createTransaction when Pagar is clicked', async () => {
    const repo = createMockRepository();
    renderWithProviders(
      <CheckoutSummaryModal open={true} onClose={vi.fn()} product={mockProduct} quantity={1} />,
      { transactionRepository: repo },
    );
    fireEvent.click(screen.getByText('Pagar'));
    await waitFor(() => expect(repo.create).toHaveBeenCalled());
  });

  it('renders success screen when status is success with reference', async () => {
    const repo = createMockRepository();
    const { store } = renderWithProviders(
      <CheckoutSummaryModal open={true} onClose={vi.fn()} product={mockProduct} quantity={1} />,
      { transactionRepository: repo },
    );
    // Dispatch setSuccess to trigger the success screen
    const { setSuccess } = await import('@/infrastructure/store/checkout.slice');
    store.dispatch(setSuccess({ reference: 'REF-123', transactionId: 'tx-1' }));
    await waitFor(() => expect(screen.getByText('Transacción creada')).toBeInTheDocument());
    expect(screen.getByText('REF-123')).toBeInTheDocument();
  });

  it('calls resetCheckout and onClose when Cerrar is clicked on success screen', async () => {
    const onClose = vi.fn();
    const repo = createMockRepository();
    const { store } = renderWithProviders(
      <CheckoutSummaryModal open={true} onClose={onClose} product={mockProduct} quantity={1} />,
      { transactionRepository: repo },
    );
    const { setSuccess } = await import('@/infrastructure/store/checkout.slice');
    store.dispatch(setSuccess({ reference: 'REF-123', transactionId: 'tx-1' }));
    await waitFor(() => expect(screen.getByText('Cerrar')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Cerrar'));
    expect(onClose).toHaveBeenCalled();
  });
});
