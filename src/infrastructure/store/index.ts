import { configureStore } from '@reduxjs/toolkit';
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
 */
const persistConfig = {
  key: 'front-pyments',
  storage: persistStorage,
  version: 1,
  whitelist: ['payment', 'checkout'],
};

const persistedPaymentReducer = persistReducer(persistConfig, paymentReducer);
const persistedCheckoutReducer = persistReducer(persistConfig, checkoutReducer);

export const store = configureStore({
  reducer: {
    payment: persistedPaymentReducer,
    checkout: persistedCheckoutReducer,
  },
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
