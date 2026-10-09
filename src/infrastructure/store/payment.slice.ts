import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import type { Transaction } from '@/domain/models/transaction';

/** Estado del flujo de pago en la UI. */
export type PaymentFlowStatus = 'idle' | 'processing' | 'succeeded' | 'failed';

export interface PaymentState {
  currentTransaction: Transaction | null;
  history: Transaction[];
  flowStatus: PaymentFlowStatus;
  error: string | null;
}

const initialState: PaymentState = {
  currentTransaction: null,
  history: [],
  flowStatus: 'idle',
  error: null,
};

/**
 * Slice de pago: estado de UI espejado desde el dominio.
 * La fuente de verdad de los registros es el repositorio (puerto);
 * este estado se rehidrata con redux-persist y se re-sincroniza
 * desde el repositorio al montar la página.
 */
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setTransaction(state, action: PayloadAction<Transaction>) {
      state.currentTransaction = action.payload;
      state.flowStatus = 'succeeded';
      state.error = null;
    },
    setHistory(state, action: PayloadAction<Transaction[]>) {
      state.history = action.payload;
    },
    setProcessing(state) {
      state.flowStatus = 'processing';
      state.error = null;
    },
    setPaymentError(state, action: PayloadAction<string>) {
      state.flowStatus = 'failed';
      state.error = action.payload;
    },
    clearTransaction(state) {
      state.currentTransaction = null;
      state.history = [];
      state.flowStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Tras rehidratar desde localStorage el flujo de UI vuelve a idle:
    // evita quedar "Procesando…" para siempre si se recargó a mitad de un pago.
    builder.addCase(REHYDRATE, (state) => {
      state.flowStatus = 'idle';
      state.error = null;
    });
  },
});

export const { setTransaction, setHistory, setProcessing, setPaymentError, clearTransaction } =
  paymentSlice.actions;

export default paymentSlice.reducer;
