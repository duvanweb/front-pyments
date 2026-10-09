/**
 * Puerto del repositorio de transacciones — capa de dominio.
 *
 * Define el contrato para crear transacciones sin acoplar el dominio
 * al transporte (HTTP, mock, etc.).
 */
import type { CreateTransactionRequest, CreateTransactionResponse } from '../models/transaction-request';
import type { TransactionDetails } from '../models/transaction-details';

/** Puerto para crear y consultar transacciones en el backend. */
export interface TransactionRepository {
  /** Crea una transacción en estado PENDIENTE. */
  create(request: CreateTransactionRequest): Promise<CreateTransactionResponse>;
  /** Obtiene los detalles de una transacción por ID. */
  getById(id: string): Promise<TransactionDetails>;
}
