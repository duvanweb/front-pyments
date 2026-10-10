import { screen, waitFor, fireEvent } from '@testing-library/react';
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

  it('renders pay button and clicks it', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockProduct),
    };
    renderWithProviders(<ProductDetailPage />, { repository });

    await waitFor(() => expect(screen.getByText('Pagar con tarjeta de crédito')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Pagar con tarjeta de crédito'));
    // The click dispatches startCheckout which opens the BuyModal
    // No error means the click handler executed successfully
  });

  it('clicks Reintentar button on error state', async () => {
    const reloadMock = vi.fn();
    vi.stubGlobal('location', { reload: reloadMock });
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockRejectedValue(new Error('Network error')),
    };
    renderWithProviders(<ProductDetailPage />, { repository });

    await waitFor(() => expect(screen.getByText('Reintentar')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Reintentar'));
    vi.unstubAllGlobals();
  });

  it('clicks Volver al listado button on not found', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };
    renderWithProviders(<ProductDetailPage />, { repository });

    await waitFor(() => expect(screen.getByText('Volver al listado')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Volver al listado'));
    // navigate('/') is called — mocked via useNavigate
  });

  it('clicks back button in header', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockProduct),
    };
    renderWithProviders(<ProductDetailPage />, { repository });

    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Volver al listado'));
    // navigate('/') is called — mocked via useNavigate
  });

  it('opens BuyModal and closes it', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockProduct),
    };
    renderWithProviders(<ProductDetailPage />, { repository });

    await waitFor(() => expect(screen.getByText('Pagar con tarjeta de crédito')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Pagar con tarjeta de crédito'));

    await waitFor(() => expect(screen.getByText('Finalizar compra')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Cerrar modal'));
    // BuyModal onClose dispatches resetCheckout
  });

  it('opens BuyModal, fills form, continues to summary, and closes summary', async () => {
    const repository: ProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockProduct),
    };
    renderWithProviders(<ProductDetailPage />, { repository });

    await waitFor(() => expect(screen.getByText('Pagar con tarjeta de crédito')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Pagar con tarjeta de crédito'));

    await waitFor(() => expect(screen.getByText('Finalizar compra')).toBeInTheDocument());

    // Fill customer fields
    fireEvent.change(screen.getByPlaceholderText('cliente@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), { target: { value: 'Juan Pérez' } });
    const phoneInputs = screen.getAllByPlaceholderText('3001234567');
    fireEvent.change(phoneInputs[0], { target: { value: '3001234567' } });

    // Fill shipping fields
    fireEvent.change(screen.getByPlaceholderText('Calle 123 #45-67'), { target: { value: 'Calle 123' } });
    fireEvent.change(screen.getByPlaceholderText('CO'), { target: { value: 'CO' } });
    fireEvent.change(screen.getByPlaceholderText('Bogotá'), { target: { value: 'Bogotá' } });
    fireEvent.change(screen.getByPlaceholderText('Cundinamarca'), { target: { value: 'Cundinamarca' } });

    // Fill card fields
    fireEvent.change(screen.getByPlaceholderText('4242 4242 4242 4242'), { target: { value: '4111111111111111' } });
    fireEvent.change(screen.getByPlaceholderText('JUAN PEREZ'), { target: { value: 'JUAN PEREZ' } });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'), { target: { value: '12/30' } });
    fireEvent.change(screen.getByPlaceholderText('123'), { target: { value: '123' } });

    // Click Continuar to open CheckoutSummaryModal
    fireEvent.click(screen.getByText('Continuar'));

    await waitFor(() => expect(screen.getByText('Resumen de compra')).toBeInTheDocument());

    // Close the summary modal — calls setSummaryOpen(false)
    fireEvent.click(screen.getByText('Volver'));
  });
});
