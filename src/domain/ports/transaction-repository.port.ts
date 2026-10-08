/**
 * Puerto del repositorio de transacciones — capa de dominio.
 *
 * Define el contrato para crear transacciones sin acoplar el dominio
 * al transporte (HTTP, mock, etc.).
 */
import type { CreateTransactionRequest, CreateTransactionResponse } from '../models/transaction-request';

/** Puerto para crear transacciones en el backend. */
export interface TransactionRepository {
  /** Crea una transacción en estado PENDIENTE. */
  create(request: CreateTransactionRequest): Promise<CreateTransactionResponse>;
}
