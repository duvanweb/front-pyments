import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import type { Product } from '@/domain/models/product';
import { BuyModal } from './BuyModal';

const mockProduct: Product = {
  id: 'test-id',
  title: 'Tesla Chill Hoodie',
  description: 'Hoodie cómodo de Tesla.',
  price: 130,
  imageUrl: 'http://localhost:3000/images/hoodie.jpg',
  stock: 10,
};

describe('BuyModal', () => {
  it('no renderiza nada cuando open es false', () => {
    renderWithProviders(
      <BuyModal open={false} onClose={vi.fn()} onContinue={vi.fn()} product={mockProduct} quantity={1} />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza el dialog cuando open es true', () => {
    renderWithProviders(
      <BuyModal open={true} onClose={vi.fn()} onContinue={vi.fn()} product={mockProduct} quantity={1} />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('llama a onClose al hacer clic en el botón X', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <BuyModal open={true} onClose={onClose} onContinue={vi.fn()} product={mockProduct} quantity={1} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar modal' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('llama a onClose al presionar Escape', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <BuyModal open={true} onClose={onClose} onContinue={vi.fn()} product={mockProduct} quantity={1} />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('no llama a onClose al presionar otra tecla', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <BuyModal open={true} onClose={onClose} onContinue={vi.fn()} product={mockProduct} quantity={1} />,
    );

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(onClose).not.toHaveBeenCalled();
  });
});
