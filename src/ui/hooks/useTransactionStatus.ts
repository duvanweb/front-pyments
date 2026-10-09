import { useEffect, useRef, useState } from 'react';
import type { TransactionDetails, TransactionStatus } from '@/domain/models/transaction-details';
import { useTransactionRepository } from '@/infrastructure/providers/TransactionRepositoryContext';

/** Intervalo de polling en ms. */
const POLL_INTERVAL = 2000;
/** Timeout máximo de polling en ms. */
const POLL_TIMEOUT = 30_000;

interface UseTransactionStatusResult {
  /** Estado de la transacción, o null mientras carga. */
  status: TransactionStatus | null;
  /** Detalles de la transacción, o null mientras carga. */
  transaction: TransactionDetails | null;
  /** True mientras se consulta el estado. */
  loading: boolean;
  /** Mensaje de error si la consulta falla. */
  error: string | null;
}

/**
 * Hook que consulta el estado de una transacción por ID.
 * Hace polling cada 2s mientras el estado sea PENDING.
 * Timeout después de 30s.
 */
export function useTransactionStatus(transactionId: string | null): UseTransactionStatusResult {
  const repository = useTransactionRepository();
  const [status, setStatus] = useState<TransactionStatus | null>(null);
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(transactionId !== null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!transactionId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const startTime = Date.now();

    async function poll() {
      while (!cancelled && mountedRef.current) {
        if (Date.now() - startTime > POLL_TIMEOUT) {
          if (mountedRef.current) {
            setError('Timeout: no se pudo confirmar el estado de la transacción.');
            setLoading(false);
          }
          return;
        }

        try {
          const details = await repository.getById(transactionId);
          if (cancelled || !mountedRef.current) return;

          setTransaction(details);
          setStatus(details.status);

          if (details.status !== 'PENDING') {
            setLoading(false);
            return;
          }
        } catch (err) {
          if (cancelled || !mountedRef.current) return;
          setError(err instanceof Error ? err.message : 'Error al consultar la transacción.');
          setLoading(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }
    }

    setLoading(true);
    setError(null);
    poll();

    return () => { cancelled = true; };
  }, [transactionId, repository]);

  return { status, transaction, loading, error };
}
