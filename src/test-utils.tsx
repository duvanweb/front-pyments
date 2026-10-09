import { configureStore } from '@reduxjs/toolkit';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import type { ProductRepository } from '@/domain/ports/product-repository.port';
import type { TransactionRepository } from '@/domain/ports/transaction-repository.port';
import checkoutReducer from '@/infrastructure/store/checkout.slice';
import paymentReducer from '@/infrastructure/store/payment.slice';
import { ProductRepositoryProvider } from '@/infrastructure/providers/ProductRepositoryContext';
import { TransactionRepositoryProvider } from '@/infrastructure/providers/TransactionRepositoryContext';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Repositorio de productos mock a inyectar vía Context. */
  repository?: ProductRepository;
  /** Repositorio de transacciones mock a inyectar vía Context. */
  transactionRepository?: TransactionRepository;
  /** Rutas iniciales del MemoryRouter. */
  initialEntries?: string[];
}

/**
 * Crea un store de Redux fresco para tests (sin persistencia).
 * Evita side-effects de localStorage entre tests.
 */
function createTestStore() {
  return configureStore({
    reducer: {
      payment: paymentReducer,
      checkout: checkoutReducer,
    },
  });
}

/**
 * Render con providers de test: Redux Provider + MemoryRouter +
 * ProductRepositoryProvider + TransactionRepositoryProvider.
 * Evita repetir el wrapper en cada test de componentes.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderWithProvidersOptions,
) {
  const {
    repository,
    transactionRepository,
    initialEntries = ['/'],
    ...renderOptions
  } = options ?? {};

  const store = createTestStore();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <ProductRepositoryProvider repository={repository}>
            <TransactionRepositoryProvider repository={transactionRepository}>
              {children}
            </TransactionRepositoryProvider>
          </ProductRepositoryProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
