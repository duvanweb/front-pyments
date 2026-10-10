import { describe, expect, it } from 'vitest';
import { REHYDRATE } from 'redux-persist';
import paymentReducer, {
  setTransaction,
  setHistory,
  setProcessing,
  setPaymentError,
  clearTransaction,
  type PaymentState,
} from './payment.slice';
import type { Transaction } from '@/domain/models/transaction';

const initialState: PaymentState = {
  currentTransaction: null,
  history: [],
  flowStatus: 'idle',
  error: null,
};

const mockTransaction: Transaction = {
  id: 'tx-1',
  payment: { id: 'pay-1', amountInCents: 10000, currency: 'COP', method: 'CREDIT_CARD', createdAt: '2026-01-01T00:00:00Z' },
  status: 'APPROVED',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('payment.slice', () => {
  it('has correct initial state', () => {
    expect(paymentReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setTransaction', () => {
    it('sets currentTransaction, flowStatus succeeded, clears error', () => {
      const state = paymentReducer(initialState, setTransaction(mockTransaction));
      expect(state.currentTransaction).toEqual(mockTransaction);
      expect(state.flowStatus).toBe('succeeded');
      expect(state.error).toBeNull();
    });
  });

  describe('setHistory', () => {
    it('sets the history array', () => {
      const state = paymentReducer(initialState, setHistory([mockTransaction]));
      expect(state.history).toEqual([mockTransaction]);
    });
  });

  describe('setProcessing', () => {
    it('sets flowStatus processing and clears error', () => {
      const state = paymentReducer(
        { ...initialState, error: 'previous error' },
        setProcessing(),
      );
      expect(state.flowStatus).toBe('processing');
      expect(state.error).toBeNull();
    });
  });

  describe('setPaymentError', () => {
    it('sets flowStatus failed and error message', () => {
      const state = paymentReducer(initialState, setPaymentError('Something went wrong'));
      expect(state.flowStatus).toBe('failed');
      expect(state.error).toBe('Something went wrong');
    });
  });

  describe('clearTransaction', () => {
    it('resets all to initial state', () => {
      const state = paymentReducer(
        { currentTransaction: mockTransaction, history: [mockTransaction], flowStatus: 'succeeded', error: 'err' },
        clearTransaction(),
      );
      expect(state).toEqual(initialState);
    });
  });

  describe('REHYDRATE', () => {
    it('resets flowStatus to idle and clears error', () => {
      const state = paymentReducer(
        { ...initialState, flowStatus: 'processing', error: 'mid-flight error' },
        { type: REHYDRATE },
      );
      expect(state.flowStatus).toBe('idle');
      expect(state.error).toBeNull();
    });

    it('preserves currentTransaction and history', () => {
      const state = paymentReducer(
        { currentTransaction: mockTransaction, history: [mockTransaction], flowStatus: 'processing', error: 'err' },
        { type: REHYDRATE },
      );
      expect(state.currentTransaction).toEqual(mockTransaction);
      expect(state.history).toEqual([mockTransaction]);
    });
  });
});
