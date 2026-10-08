import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import type { Product } from '@/domain/models/product';
import { PaymentSummary } from './PaymentSummary';

const mockProduct: Product = {
  id: 'prod-1',
  title: 'Tesla Hoodie',
  description: 'Hoodie cómodo',
  price: 130,
  imageUrl: 'http://localhost:3000/img.jpg',
  stock: 10,
};

describe('PaymentSummary', () => {
  it('muestra el título del producto y la cantidad', () => {
    renderWithProviders(
      <PaymentSummary product={mockProduct} quantity={2} loading={false} onPay={vi.fn()} />,
    );
    expect(screen.getByText(/Tesla Hoodie × 2/)).toBeInTheDocument();
  });

  it('muestra el botón Pagar cuando no está cargando', () => {
    renderWithProviders(
      <PaymentSummary product={mockProduct} quantity={1} loading={false} onPay={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: /Pagar/ })).toBeEnabled();
  });

  it('muestra Procesando y deshabilita el botón cuando loading es true', () => {
    renderWithProviders(
      <PaymentSummary product={mockProduct} quantity={1} loading={true} onPay={vi.fn()} />,
    );
    const button = screen.getByRole('button', { name: /Procesando/ });
    expect(button).toBeDisabled();
  });

  it('llama a onPay al hacer clic en el botón', () => {
    const onPay = vi.fn();
    renderWithProviders(
      <PaymentSummary product={mockProduct} quantity={1} loading={false} onPay={onPay} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Pagar/ }));
    expect(onPay).toHaveBeenCalledTimes(1);
  });

  it('muestra las tarifas base y de envío', () => {
    renderWithProviders(
      <PaymentSummary product={mockProduct} quantity={1} loading={false} onPay={vi.fn()} />,
    );
    expect(screen.getByText('Tarifa base')).toBeInTheDocument();
    expect(screen.getByText('Tarifa de envío')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});
