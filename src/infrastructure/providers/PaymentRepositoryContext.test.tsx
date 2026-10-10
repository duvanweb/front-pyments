import { renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import type { PaymentRepository } from '@/domain/ports/payment-repository.port';
import { PaymentRepositoryProvider, usePaymentRepository } from './PaymentRepositoryContext';

describe('PaymentRepositoryContext', () => {
  it('provides the injected repository to the hook', () => {
    const mockRepository: PaymentRepository = {
      getHistory: vi.fn(),
      saveTransaction: vi.fn(),
      clear: vi.fn(),
    };

    const { result } = renderHook(() => usePaymentRepository(), {
      wrapper: ({ children }) => (
        <PaymentRepositoryProvider repository={mockRepository}>
          {children}
        </PaymentRepositoryProvider>
      ),
    });

    expect(result.current).toBe(mockRepository);
  });

  it('throws if the hook is used outside the provider', () => {
    expect(() => renderHook(() => usePaymentRepository())).toThrow(
      /usePaymentRepository debe usarse dentro de <PaymentRepositoryProvider>/,
    );
  });

  it('renders children inside the provider', () => {
    const mockRepository: PaymentRepository = {
      getHistory: vi.fn(),
      saveTransaction: vi.fn(),
      clear: vi.fn(),
    };
    renderWithProviders(
      <PaymentRepositoryProvider repository={mockRepository}>
        <div data-testid="child">content</div>
      </PaymentRepositoryProvider>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
