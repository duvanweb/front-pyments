import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import { QuantitySelector } from './QuantitySelector';

describe('QuantitySelector', () => {
  it('renderiza el valor actual', () => {
    renderWithProviders(<QuantitySelector value={3} onChange={vi.fn()} max={10} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Cantidad')).toBeInTheDocument();
  });

  it('el botón de disminuir llama a onChange con value - 1', () => {
    const onChange = vi.fn();
    renderWithProviders(<QuantitySelector value={3} onChange={onChange} max={10} />);

    fireEvent.click(screen.getByRole('button', { name: 'Disminuir cantidad' }));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('el botón de aumentar llama a onChange con value + 1', () => {
    const onChange = vi.fn();
    renderWithProviders(<QuantitySelector value={3} onChange={onChange} max={10} />);

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar cantidad' }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('deshabilita el botón de disminuir cuando el valor es 1', () => {
    renderWithProviders(<QuantitySelector value={1} onChange={vi.fn()} max={10} />);

    expect(screen.getByRole('button', { name: 'Disminuir cantidad' })).toBeDisabled();
  });

  it('deshabilita el botón de aumentar cuando el valor es max', () => {
    renderWithProviders(<QuantitySelector value={10} onChange={vi.fn()} max={10} />);

    expect(screen.getByRole('button', { name: 'Aumentar cantidad' })).toBeDisabled();
  });

  it('deshabilita ambos botones cuando disabled es true', () => {
    renderWithProviders(<QuantitySelector value={3} onChange={vi.fn()} max={10} disabled />);

    expect(screen.getByRole('button', { name: 'Disminuir cantidad' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Aumentar cantidad' })).toBeDisabled();
  });
});
