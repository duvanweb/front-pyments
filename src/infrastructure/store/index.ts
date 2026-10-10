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
import { persistStorage } from '../storage/safe-storage';
import checkoutReducer from './checkout.slice';
import paymentReducer from './payment.slice';

/**
 * Persistencia de los slices de pago y checkout: los datos sobreviven
 * recargas. Se persisten 'payment' e 'checkout' (whitelist) y el storage
 * es seguro (degrada sin romper si localStorage no está disponible).
 *
 * persistReducer se aplica al root reducer combinado (no por slice) para
 * que el whitelist funcione correctamente y ambas slices compartan una
 * sola key de localStorage sin sobreescribirse.
 */
const rootReducer = combineReducers({
  payment: paymentReducer,
  checkout: checkoutReducer,
});

const persistConfig = {
  key: 'front-pyments',
  storage: persistStorage,
  version: 2,
  whitelist: ['payment', 'checkout'],
  // v1 tenía un bug de colisión de keys (persistReducer por slice con la misma
  // key). migrate descarta estado sin forma válida (sin payment+checkout) y
  // preserva el válido. Nota: redux-persist stringifica _persist, así que
  // migrate se llama siempre, no solo cuando las versiones difieren.
  migrate: (state: unknown) =>
    Promise.resolve(
      state && typeof state === 'object' && 'payment' in state && 'checkout' in state
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (state as any)
        : undefined,
    ),
};

/** Exported for testing. */
export function migrate(state: unknown): Promise<unknown> {
  return persistConfig.migrate(state);
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // redux-persist despacha acciones no serializables; se ignoran en el check
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
