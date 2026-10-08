import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import { CardNumberInput } from './CardNumberInput';

describe('CardNumberInput', () => {
  it('renderiza la etiqueta y el placeholder', () => {
    renderWithProviders(
      <CardNumberInput value="" onChange={vi.fn()} />,
    );
    expect(screen.getByText(/Número de tarjeta/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('4242 4242 4242 4242')).toBeInTheDocument();
  });

  it('muestra el valor formateado con espacios', () => {
    renderWithProviders(
      <CardNumberInput value="4242424242424242" onChange={vi.fn()} />,
    );
    expect(screen.getByDisplayValue('4242 4242 4242 4242')).toBeInTheDocument();
  });

  it('muestra el badge VISA para un número que empieza con 4', () => {
    renderWithProviders(
      <CardNumberInput value="4242424242424242" onChange={vi.fn()} />,
    );
    expect(screen.getByText('VISA')).toBeInTheDocument();
  });

  it('llama a onChange con solo dígitos al escribir', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <CardNumberInput value="" onChange={onChange} />,
    );
    fireEvent.change(screen.getByPlaceholderText('4242 4242 4242 4242'), {
      target: { value: '4242a4242' },
    });
    expect(onChange).toHaveBeenCalledWith('42424242');
  });

  it('limita el input a 19 dígitos', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <CardNumberInput value="" onChange={onChange} />,
    );
    fireEvent.change(screen.getByPlaceholderText('4242 4242 4242 4242'), {
      target: { value: '12345678901234567890123456' },
    });
    expect(onChange).toHaveBeenCalledWith('1234567890123456789');
  });

  it('muestra el mensaje de error cuando se proporciona', () => {
    renderWithProviders(
      <CardNumberInput value="" onChange={vi.fn()} error="Número inválido" />,
    );
    expect(screen.getByText('Número inválido')).toBeInTheDocument();
  });
});
