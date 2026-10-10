import { screen, fireEvent } from '@testing-library/react';
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

const mockTransactionRepository: TransactionRepository = {
  create: vi.fn().mockResolvedValue({
    transactionId: 'tx-1',
    reference: 'REF-001',
    checkoutUrl: undefined,
  }),
};

describe('CheckoutSummaryModal', () => {
  it('returns null when open is false', () => {
    renderWithProviders(
      <CheckoutSummaryModal open={false} onClose={vi.fn()} product={mockProduct} quantity={1} />,
      { transactionRepository: mockTransactionRepository },
    );
    expect(screen.queryByText('Resumen de compra')).not.toBeInTheDocument();
  });

  it('renders modal content when open is true', () => {
    renderWithProviders(
      <CheckoutSummaryModal open={true} onClose={vi.fn()} product={mockProduct} quantity={1} />,
      { transactionRepository: mockTransactionRepository },
    );
    expect(screen.getByText('Resumen de compra')).toBeInTheDocument();
    expect(screen.getByText('Datos del cliente')).toBeInTheDocument();
    expect(screen.getByText('Dirección de envío')).toBeInTheDocument();
    expect(screen.getByText('Tarjeta de crédito')).toBeInTheDocument();
  });

  it('renders Volver button', () => {
    renderWithProviders(
      <CheckoutSummaryModal open={true} onClose={vi.fn()} product={mockProduct} quantity={1} />,
      { transactionRepository: mockTransactionRepository },
    );
    expect(screen.getByText('Volver')).toBeInTheDocument();
  });

  it('calls onClose when Volver button is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <CheckoutSummaryModal open={true} onClose={onClose} product={mockProduct} quantity={1} />,
      { transactionRepository: mockTransactionRepository },
    );
    fireEvent.click(screen.getByText('Volver'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when close button (X) is clicked', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <CheckoutSummaryModal open={true} onClose={onClose} product={mockProduct} quantity={1} />,
      { transactionRepository: mockTransactionRepository },
    );
    fireEvent.click(screen.getByLabelText('Volver al formulario'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders Pagar button', () => {
    renderWithProviders(
      <CheckoutSummaryModal open={true} onClose={vi.fn()} product={mockProduct} quantity={1} />,
      { transactionRepository: mockTransactionRepository },
    );
    expect(screen.getByText('Pagar')).toBeInTheDocument();
  });
});
