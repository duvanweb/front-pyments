import type { Transaction } from '../models/transaction';

/**
 * Puerto de salida (Outbound): contrato que usa la capa de aplicación
 * para persistir transacciones de pago.
 *
 * Es asíncrono para ser agnóstico del transporte: localStorage, HTTP
 * o cualquier otro adaptador lo implementan con la misma firma.
 */
export interface PaymentRepository {
  /** Guarda una transacción. */
  saveTransaction(transaction: Transaction): Promise<void>;

  /** Devuelve el historial de transacciones, la más reciente primero. */
  getHistory(): Promise<Transaction[]>;

  /** Elimina todas las transacciones persistidas. */
  clear(): Promise<void>;
}
