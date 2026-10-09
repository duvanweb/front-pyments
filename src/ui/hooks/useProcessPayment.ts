import { useCallback } from 'react';
import { ProcessPayment } from '@/application/use-cases/process-payment.use-case';
import type { PaymentRequest } from '@/domain/models/payment';
import type { Transaction } from '@/domain/models/transaction';
import { usePaymentRepository } from '@/infrastructure/providers/PaymentRepositoryContext';
import { useAppDispatch, useAppSelector } from '@/infrastructure/store/hooks';
import { setPaymentError, setProcessing, setTransaction } from '@/infrastructure/store/payment.slice';

/**
 * Smart hook: integra la UI con la capa de aplicación.
 * Toma el repositorio del Context de DI, ejecuta el caso de uso y
 * refleja el resultado en el store de Redux.
 */
export function useProcessPayment() {
  const repository = usePaymentRepository();
  const dispatch = useAppDispatch();
  const currentTransaction = useAppSelector((state) => state.payment.currentTransaction);
  const flowStatus = useAppSelector((state) => state.payment.flowStatus);
  const error = useAppSelector((state) => state.payment.error);

  const processPayment = useCallback(
    async (request: PaymentRequest): Promise<Transaction> => {
      dispatch(setProcessing());
      try {
        const transaction = await new ProcessPayment(repository).execute(request);
        dispatch(setTransaction(transaction));
        return transaction;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error inesperado al procesar el pago';
        dispatch(setPaymentError(message));
        throw err;
      }
    },
    [repository, dispatch],
  );

  return { processPayment, currentTransaction, flowStatus, error };
}
