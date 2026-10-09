import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import type { Product } from '@/domain/models/product';
import { ProductCard } from './ProductCard';

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockProduct: Product = {
  id: 'abc-123',
  title: 'Tesla Chill Hoodie',
  description: 'Hoodie cómodo de Tesla',
  price: 130,
  imageUrl: 'http://localhost:3000/images/hoodie.jpg',
  stock: 10,
};

describe('ProductCard', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renderiza la imagen con src y alt correctos', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', mockProduct.imageUrl);
    expect(img).toHaveAttribute('alt', mockProduct.title);
  });

  it('renderiza el título del producto', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
  });

  it('renderiza el botón "Ver más"', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByRole('button', { name: /Ver más/ })).toBeInTheDocument();
  });

  it('navega al detalle del producto al hacer clic en "Ver más"', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    fireEvent.click(screen.getByRole('button', { name: /Ver más/ }));

    expect(mockNavigate).toHaveBeenCalledWith('/products/abc-123');
  });
});
