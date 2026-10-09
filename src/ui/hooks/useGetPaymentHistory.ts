import { useCallback, useEffect } from 'react';
import { GetPaymentHistory } from '@/application/use-cases/get-payment-history.use-case';
import { usePaymentRepository } from '@/infrastructure/providers/PaymentRepositoryContext';
import { useAppDispatch, useAppSelector } from '@/infrastructure/store/hooks';
import { setHistory } from '@/infrastructure/store/payment.slice';

/**
 * Smart hook: sincroniza el historial desde el repositorio (fuente de
 * verdad) hacia el store de Redux. Se ejecuta al montar la página y
 * expone refresh() para re-sincronizar tras cada pago.
 */
export function useGetPaymentHistory() {
  const repository = usePaymentRepository();
  const dispatch = useAppDispatch();
  const history = useAppSelector((state) => state.payment.history);

  const refresh = useCallback(async () => {
    const transactions = await new GetPaymentHistory(repository).execute();
    dispatch(setHistory(transactions));
  }, [repository, dispatch]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { history, refresh };
}
