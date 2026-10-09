import { fireEvent, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import type { Product } from '@/domain/models/product';
import type { ProductRepository } from '@/domain/ports/product-repository.port';
import { ProductDetailPage } from './ProductDetailPage';

const mockProduct: Product = {
  id: 'test-id',
  title: 'Tesla Chill Hoodie',
  description: 'Hoodie cómodo de Tesla con logo bordado.',
  price: 130,
  imageUrl: 'http://localhost:3000/images/hoodie.jpg',
  stock: 10,
};

const outOfStockProduct: Product = {
  ...mockProduct,
  stock: 0,
};

function createMockRepository(product: Product | null = mockProduct): ProductRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn().mockResolvedValue(product),
  };
}

function renderDetailPage(repository: ProductRepository, productId = 'test-id') {
  return renderWithProviders(
    <Routes>
      <Route path="/products/:id" element={<ProductDetailPage />} />
    </Routes>,
    { repository, initialEntries: [`/products/${productId}`] },
  );
}

describe('ProductDetailPage', () => {
  it('renderiza el header con botón de regreso', () => {
    renderDetailPage(createMockRepository());

    expect(screen.getByRole('button', { name: 'Volver al listado' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Detalle del producto' })).toBeInTheDocument();
  });

  it('muestra la información del producto cuando carga', async () => {
    renderDetailPage(createMockRepository());

    expect(await screen.findByRole('heading', { name: mockProduct.title })).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    expect(screen.getByText(/10 disponibles/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pagar con tarjeta de crédito/ })).toBeEnabled();
  });

  it('muestra "Agotado" y deshabilita Comprar cuando stock es 0', async () => {
    renderDetailPage(createMockRepository(outOfStockProduct));

    expect(await screen.findByText('Agotado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pagar con tarjeta de crédito/ })).toBeDisabled();
  });

  it('muestra el estado de error cuando falla la carga', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockRejectedValue(new Error('Error de servidor')),
    };

    renderDetailPage(repository);

    expect(await screen.findByText('Error de servidor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/ })).toBeInTheDocument();
  });

  it('muestra "Producto no encontrado" cuando el producto no existe', async () => {
    renderDetailPage(createMockRepository(null));

    expect(await screen.findByText('Producto no encontrado')).toBeInTheDocument();
    expect(screen.getByText('Volver al listado')).toBeInTheDocument();
  });

  it('renderiza el selector de cantidad con valor inicial 1', async () => {
    renderDetailPage(createMockRepository());

    expect(await screen.findByText('Cantidad')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('permite aumentar la cantidad', async () => {
    renderDetailPage(createMockRepository());

    await screen.findByText('Cantidad');
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar cantidad' }));

    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
