import { renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import type { TransactionRepository } from '@/domain/ports/transaction-repository.port';
import {
  TransactionRepositoryProvider,
  useTransactionRepository,
} from './TransactionRepositoryContext';

describe('TransactionRepositoryContext', () => {
  it('provee el repositorio inyectado al hook', () => {
    const mockRepository: TransactionRepository = { create: vi.fn() };

    const { result } = renderHook(() => useTransactionRepository(), {
      wrapper: ({ children }) => (
        <TransactionRepositoryProvider repository={mockRepository}>
          {children}
        </TransactionRepositoryProvider>
      ),
    });

    expect(result.current).toBe(mockRepository);
  });

  it('lanza si el hook se usa fuera del provider', () => {
    expect(() => renderHook(() => useTransactionRepository())).toThrow(
      /useTransactionRepository debe usarse dentro de <TransactionRepositoryProvider>/,
    );
  });

  it('renderiza children dentro del provider', () => {
    const mockRepository: TransactionRepository = { create: vi.fn() };
    renderWithProviders(
      <TransactionRepositoryProvider repository={mockRepository}>
        <div data-testid="child">contenido</div>
      </TransactionRepositoryProvider>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
