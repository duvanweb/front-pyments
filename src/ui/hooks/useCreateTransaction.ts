import { useCallback } from 'react';
import { CreateTransaction } from '@/application/use-cases/transaction/create-transaction.use-case';
import type { CreateTransactionRequest } from '@/domain/models/transaction-request';
import { useTransactionRepository } from '@/infrastructure/providers/TransactionRepositoryContext';
import {
  setCheckoutError,
  setSubmitting,
  setSuccess,
} from '@/infrastructure/store/checkout.slice';
import type { CheckoutStatus } from '@/infrastructure/store/checkout.slice';
import { useAppDispatch, useAppSelector } from '@/infrastructure/store/hooks';

interface UseCreateTransactionResult {
  /** Estado actual del flujo de checkout. */
  status: CheckoutStatus;
  /** Referencia de la transacción creada, o null. */
  transactionReference: string | null;
  /** Mensaje de error, o null. */
  error: string | null;
  /** Crea una transacción en estado PENDIENTE. */
  createTransaction: (request: CreateTransactionRequest) => Promise<void>;
}

/**
 * Smart hook: crea una transacción vía el repositorio inyectado y sincroniza
 * el estado del flujo en Redux (checkout slice). El estado se persiste con
 * redux-persist para sobrevivir recargas.
 */
export function useCreateTransaction(): UseCreateTransactionResult {
  const repository = useTransactionRepository();
  const dispatch = useAppDispatch();
  const { status, transactionReference, error } = useAppSelector((state) => state.checkout);

  const createTransaction = useCallback(
    async (request: CreateTransactionRequest) => {
      dispatch(setSubmitting());
      try {
        const response = await new CreateTransaction(repository).execute(request);
        dispatch(setSuccess(response.reference));
        // Redirigir a la página de checkout de Wompi generada por el backend.
        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        }
      } catch (err) {
        dispatch(
          setCheckoutError(err instanceof Error ? err.message : 'Error inesperado'),
        );
      }
    },
    [repository, dispatch],
  );

  return { status, transactionReference, error, createTransaction };
}
