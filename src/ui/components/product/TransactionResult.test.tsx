import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import { TransactionResult } from './TransactionResult';

describe('TransactionResult', () => {
  it('muestra el título de éxito', () => {
    renderWithProviders(
      <TransactionResult reference="REF-001" onClose={vi.fn()} />,
    );
    expect(screen.getByText('Transacción creada')).toBeInTheDocument();
  });

  it('muestra la referencia de la transacción', () => {
    renderWithProviders(
      <TransactionResult reference="REF-12345" onClose={vi.fn()} />,
    );
    expect(screen.getByText('REF-12345')).toBeInTheDocument();
  });

  it('muestra el estado PENDIENTE', () => {
    renderWithProviders(
      <TransactionResult reference="REF-001" onClose={vi.fn()} />,
    );
    expect(screen.getByText(/PENDIENTE/)).toBeInTheDocument();
  });

  it('llama a onClose al hacer clic en Cerrar', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <TransactionResult reference="REF-001" onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Cerrar/ }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
