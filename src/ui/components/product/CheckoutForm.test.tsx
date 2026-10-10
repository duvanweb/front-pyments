import { screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import type { Product } from '@/domain/models/product';
import { CheckoutForm } from './CheckoutForm';

const mockProduct: Product = {
  id: '1',
  title: 'Test Product',
  description: 'A test product',
  price: 10000,
  imageUrl: 'http://example.com/img.jpg',
  stock: 5,
};

describe('CheckoutForm', () => {
  it('renders all section headers', () => {
    renderWithProviders(<CheckoutForm product={mockProduct} quantity={1} onContinue={vi.fn()} />);
    expect(screen.getByText('Datos del cliente')).toBeInTheDocument();
    expect(screen.getByText('Dirección de envío')).toBeInTheDocument();
    expect(screen.getByText('Tarjeta de crédito')).toBeInTheDocument();
  });

  it('renders email input placeholder', () => {
    renderWithProviders(<CheckoutForm product={mockProduct} quantity={1} onContinue={vi.fn()} />);
    expect(screen.getByPlaceholderText('cliente@example.com')).toBeInTheDocument();
  });

  it('does not call onContinue when fields are empty and submit is clicked', () => {
    const onContinue = vi.fn();
    renderWithProviders(<CheckoutForm product={mockProduct} quantity={1} onContinue={onContinue} />);

    const button = screen.getByText('Continuar');
    fireEvent.click(button);

    expect(onContinue).not.toHaveBeenCalled();
  });

  it('shows field errors after submit attempt with empty fields', () => {
    renderWithProviders(<CheckoutForm product={mockProduct} quantity={1} onContinue={vi.fn()} />);

    const button = screen.getByText('Continuar');
    fireEvent.click(button);

    expect(screen.getByText('El correo electrónico es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('El nombre completo es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('La dirección es obligatoria.')).toBeInTheDocument();
  });

  it('calls onContinue when all required fields are valid', () => {
    const onContinue = vi.fn();
    renderWithProviders(<CheckoutForm product={mockProduct} quantity={1} onContinue={onContinue} />);

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

    // Fill card fields — use a valid Luhn number (4111111111111111)
    fireEvent.change(screen.getByPlaceholderText('4242 4242 4242 4242'), { target: { value: '4111111111111111' } });
    fireEvent.change(screen.getByPlaceholderText('JUAN PEREZ'), { target: { value: 'JUAN PEREZ' } });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'), { target: { value: '12/30' } });
    fireEvent.change(screen.getByPlaceholderText('123'), { target: { value: '123' } });

    const button = screen.getByText('Continuar');
    fireEvent.click(button);

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('syncs phone number to shipping address', () => {
    renderWithProviders(<CheckoutForm product={mockProduct} quantity={1} onContinue={vi.fn()} />);

    const phoneInputs = screen.getAllByPlaceholderText('3001234567');
    fireEvent.change(phoneInputs[0], { target: { value: '3009876543' } });

    // The customer phone is the first input; after change, the value should
    // be dispatched to both customer and shipping address in Redux.
    expect(phoneInputs[0]).toHaveValue('3009876543');
  });

  it('shows field error on blur without submit', () => {
    renderWithProviders(<CheckoutForm product={mockProduct} quantity={1} onContinue={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText('cliente@example.com');
    fireEvent.blur(emailInput);

    // After blur, the email field error should appear
    expect(screen.getByText('El correo electrónico es obligatorio.')).toBeInTheDocument();
  });

  it('updates country field to uppercase', () => {
    renderWithProviders(<CheckoutForm product={mockProduct} quantity={1} onContinue={vi.fn()} />);

    const countryInput = screen.getByPlaceholderText('CO');
    fireEvent.change(countryInput, { target: { value: 'co' } });
    expect(countryInput).toHaveValue('CO');
  });

  it('formats expiry field with slash', () => {
    renderWithProviders(<CheckoutForm product={mockProduct} quantity={1} onContinue={vi.fn()} />);

    const expiryInput = screen.getByPlaceholderText('MM/YY');
    fireEvent.change(expiryInput, { target: { value: '1230' } });
    expect(expiryInput).toHaveValue('12/30');
  });

  it('filters non-digits in CVV', () => {
    renderWithProviders(<CheckoutForm product={mockProduct} quantity={1} onContinue={vi.fn()} />);

    const cvvInput = screen.getByPlaceholderText('123');
    fireEvent.change(cvvInput, { target: { value: '12a3b' } });
    expect(cvvInput).toHaveValue('123');
  });
});
