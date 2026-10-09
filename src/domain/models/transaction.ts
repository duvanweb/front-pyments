import type { Payment } from './payment';

/** Estados posibles de una transacción. */
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Entidad transacción: el resultado de procesar un pago. */
export interface Transaction {
  id: string;
  payment: Payment;
  status: TransactionStatus;
  /** Última actualización del estado, en ISO 8601. */
  updatedAt: string;
}

/** Indica si el estado es final (no requiere más acción). */
export function isFinalStatus(status: TransactionStatus): boolean {
  return status === 'APPROVED' || status === 'REJECTED';
}
