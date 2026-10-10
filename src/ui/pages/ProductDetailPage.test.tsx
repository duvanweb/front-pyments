import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProductRepository } from '@/domain/ports/product-repository.port';
import { renderWithProviders } from '@/test-utils';
import { ProductDetailPage } from './ProductDetailPage';

const mockProduct = {
  id: '1',
  title: 'Test Product',
  description: 'A great product',
  price: 50000,
  imageUrl: 'http://example.com/img.jpg',
  stock: 5,
};

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
  };
});

describe('ProductDetailPage', () => {
  it('renders loading skeleton initially', () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockReturnValue(new Promise(() => {})), // never resolves
    };
    renderWithProviders(<ProductDetailPage />, { repository });
    expect(screen.getByText('Detalle del producto')).toBeInTheDocument();
  });

  it('renders product detail on success', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockProduct),
    };
    renderWithProviders(<ProductDetailPage />, { repository });

    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
    expect(screen.getByText('A great product')).toBeInTheDocument();
    expect(screen.getByText('5 disponibles')).toBeInTheDocument();
  });

  it('renders error message on failure', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockRejectedValue(new Error('Network error')),
    };
    renderWithProviders(<ProductDetailPage />, { repository });

    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument());
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('renders not found message when product is null', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };
    renderWithProviders(<ProductDetailPage />, { repository });

    await waitFor(() => expect(screen.getByText('Producto no encontrado')).toBeInTheDocument());
    expect(screen.getByText('Volver al listado')).toBeInTheDocument();
  });

  it('renders out of stock badge when stock is 0', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue({ ...mockProduct, stock: 0 }),
    };
    renderWithProviders(<ProductDetailPage />, { repository });

    await waitFor(() => expect(screen.getByText('Agotado')).toBeInTheDocument());
  });

  it('renders singular "disponible" when stock is 1', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue({ ...mockProduct, stock: 1 }),
    };
    renderWithProviders(<ProductDetailPage />, { repository });

    await waitFor(() => expect(screen.getByText('1 disponible')).toBeInTheDocument());
  });

  it('renders pay button', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockProduct),
    };
    renderWithProviders(<ProductDetailPage />, { repository });

    await waitFor(() => expect(screen.getByText('Pagar con tarjeta de crédito')).toBeInTheDocument());
  });
});
