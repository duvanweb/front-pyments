import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import type { Product } from '@/domain/models/product';
import type { ProductRepository } from '@/domain/ports/product-repository.port';
import { ProductListPage } from './ProductListPage';

const mockProducts: Product[] = [
  { id: '1', title: 'Tesla Hoodie', description: 'Desc 1', price: 130, imageUrl: 'http://example.com/1.jpg', stock: 10 },
  { id: '2', title: 'Tesla Shirt', description: 'Desc 2', price: 45, imageUrl: 'http://example.com/2.jpg', stock: 5 },
  { id: '3', title: 'Tesla Hat', description: 'Desc 3', price: 25, imageUrl: 'http://example.com/3.jpg', stock: 0 },
];

function createMockRepository(products: Product[] = mockProducts): ProductRepository {
  return {
    findAll: vi.fn().mockResolvedValue(products),
    findById: vi.fn(),
  };
}

describe('ProductListPage', () => {
  it('renderiza el header con título "Productos"', () => {
    renderWithProviders(<ProductListPage />, { repository: createMockRepository() });

    expect(screen.getByRole('heading', { name: 'Productos' })).toBeInTheDocument();
  });

  it('muestra los productos cuando carga exitosamente', async () => {
    renderWithProviders(<ProductListPage />, { repository: createMockRepository() });

    const buttons = await screen.findAllByRole('button', { name: /Ver más/ });
    expect(buttons).toHaveLength(3);
    expect(screen.getByText('Tesla Hoodie')).toBeInTheDocument();
    expect(screen.getByText('Tesla Shirt')).toBeInTheDocument();
    expect(screen.getByText('Tesla Hat')).toBeInTheDocument();
  });

  it('muestra el estado de vacío cuando no hay productos', async () => {
    renderWithProviders(<ProductListPage />, { repository: createMockRepository([]) });

    await waitFor(() => {
      expect(screen.getByText('No hay productos disponibles')).toBeInTheDocument();
    });
  });

  it('muestra el mensaje de error y botón de reintentar cuando falla la carga', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn().mockRejectedValue(new Error('Error de red')),
      findById: vi.fn(),
    };

    renderWithProviders(<ProductListPage />, { repository });

    await waitFor(() => {
      expect(screen.getByText('Error de red')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Reintentar/ })).toBeInTheDocument();
  });

  it('reintenta la carga al hacer clic en Reintentar', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn().mockRejectedValueOnce(new Error('Error de red')).mockResolvedValueOnce(mockProducts),
      findById: vi.fn(),
    };

    renderWithProviders(<ProductListPage />, { repository });

    const retryButton = await screen.findByRole('button', { name: /Reintentar/ });
    fireEvent.click(retryButton);

    expect(await screen.findByText('Tesla Hoodie')).toBeInTheDocument();
  });
});
