import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { persistStorage } from '../storage/safe-storage';
import checkoutReducer, {
  updateCustomer,
  updateShippingAddress,
  startCheckout,
  type CheckoutState,
} from './checkout.slice';
import paymentReducer, { setProcessing, type PaymentState } from './payment.slice';

/** redux-persist prependa "persist:" a la key configurada. */
const STORAGE_KEY = 'persist:front-pyments';

/** migrate idéntico al de producción: preserva estado válido, descarta corrupto. */
function migrate(state: unknown) {
  return Promise.resolve(
    state && typeof state === 'object' && 'payment' in state && 'checkout' in state
      ? (state as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      : undefined,
  );
}

const persistConfig = {
  key: 'front-pyments',
  storage: persistStorage,
  version: 2,
  whitelist: ['payment', 'checkout'],
  migrate,
};

/**
 * Crea un store persistido idéntico al de producción pero fresco.
 * Simula lo que ocurre al recargar la página: un nuevo store lee localStorage.
 */
function createPersistedStore() {
  const rootReducer = combineReducers({
    payment: paymentReducer,
    checkout: checkoutReducer,
  });

  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
  const persistor = persistStore(store);
  return { store, persistor };
}

/** Espera ms milisegundos. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Lee y parsea el estado persistido en localStorage (cada slice es un JSON string). */
function readPersistedState(): Record<string, unknown> | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const outer = JSON.parse(raw) as Record<string, string>;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(outer)) {
    if (key === '_persist') continue;
    try {
      result[key] = JSON.parse(value);
    } catch {
      result[key] = value;
    }
  }
  return result;
}

const expectedCustomer = {
  email: 'persisted@example.com',
  fullName: 'Juan Persistido',
  phoneNumber: '3001234567',
  phoneNumberPrefix: '+57',
};

const expectedShipping = {
  addressLine1: 'Calle Persistida 123',
  country: 'CO',
  city: 'Bogotá',
  region: 'Cundinamarca',
  phoneNumber: '3001234567',
};

describe('persistencia del store en localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('persiste los datos del checkout y los rehidrata al crear un store nuevo', async () => {
    // 1. Crear store y esperar bootstrap.
    const { store: firstStore } = createPersistedStore();
    await sleep(300);

    // 2. Llenar el checkout con datos del cliente.
    firstStore.dispatch(startCheckout({ productId: 'prod-1', quantity: 2 }));
    firstStore.dispatch(updateCustomer(expectedCustomer));
    firstStore.dispatch(updateShippingAddress(expectedShipping));
    await sleep(300);

    // 3. Verificar que localStorage tiene los datos.
    const persisted = readPersistedState();
    expect(persisted).not.toBeNull();
    const checkout = persisted!.checkout as CheckoutState;
    expect(checkout.customer.email).toBe(expectedCustomer.email);
    expect(checkout.customer.fullName).toBe(expectedCustomer.fullName);

    // 4. Crear un store nuevo (simula recarga de página).
    const { store: secondStore } = createPersistedStore();
    await sleep(300);

    // 5. Verificar que los datos del cliente se rehidrataron.
    const state = secondStore.getState() as { checkout: CheckoutState };
    expect(state.checkout.customer.email).toBe(expectedCustomer.email);
    expect(state.checkout.customer.fullName).toBe(expectedCustomer.fullName);
    expect(state.checkout.customer.phoneNumber).toBe(expectedCustomer.phoneNumber);
    expect(state.checkout.customer.phoneNumberPrefix).toBe(expectedCustomer.phoneNumberPrefix);
    expect(state.checkout.shippingAddress.addressLine1).toBe(expectedShipping.addressLine1);
    expect(state.checkout.shippingAddress.city).toBe(expectedShipping.city);
    expect(state.checkout.productId).toBe('prod-1');
    expect(state.checkout.quantity).toBe(2);
  }, 10000);

  it('persiste el estado de payment y lo rehidrata correctamente', async () => {
    const { store: firstStore } = createPersistedStore();
    await sleep(300);

    firstStore.dispatch(setProcessing());
    await sleep(300);

    const { store: secondStore } = createPersistedStore();
    await sleep(300);

    const state = secondStore.getState() as { payment: PaymentState };
    // El estado persistido se rehidrata correctamente.
    expect(state.payment).toBeDefined();
    expect(state.payment.flowStatus).toBe('processing');
  }, 10000);

  it('no rompe si localStorage no está disponible', async () => {
    // Simular storage no disponible removiendo localStorage temporalmente.
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      get: () => { throw new Error('Storage no disponible'); },
      configurable: true,
    });

    try {
      const { store } = createPersistedStore();
      await sleep(300);

      // El store debe funcionar con el estado inicial.
      const state = store.getState() as { checkout: CheckoutState };
      expect(state.checkout.customer.email).toBe('');
    } finally {
      Object.defineProperty(globalThis, 'localStorage', {
        value: original,
        configurable: true,
        writable: true,
      });
    }
  }, 10000);

  it('descarta el estado corrupto de v1 (sin payment+checkout) al migrar', async () => {
    // Simular datos viejos de v1: un solo slice sin la forma del root state.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      email: 'old-v1-data@example.com',
      _persist: { version: 1, rehydrated: true },
    }));

    const { store } = createPersistedStore();
    await sleep(300);

    // El migrate descarta v1 → estado inicial limpio.
    const state = store.getState() as { checkout: CheckoutState };
    expect(state.checkout.customer.email).toBe('');
  }, 10000);
});
