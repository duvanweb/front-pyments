import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import { BuyModal } from './BuyModal';

describe('BuyModal', () => {
  it('no renderiza nada cuando open es false', () => {
    renderWithProviders(<BuyModal open={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza el dialog cuando open es true', () => {
    renderWithProviders(<BuyModal open={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('llama a onClose al hacer clic en el botón X', () => {
    const onClose = vi.fn();
    renderWithProviders(<BuyModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar modal' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('llama a onClose al presionar Escape', () => {
    const onClose = vi.fn();
    renderWithProviders(<BuyModal open={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('no llama a onClose al presionar otra tecla', () => {
    const onClose = vi.fn();
    renderWithProviders(<BuyModal open={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(onClose).not.toHaveBeenCalled();
  });
});
