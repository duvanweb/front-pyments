import type {
  CreateTransactionRequest,
  CreateTransactionResponse,
} from '@/domain/models/transaction-request';
import type { TransactionRepository } from '@/domain/ports/transaction-repository.port';

/**
 * Caso de uso: crear una transacción en estado PENDIENTE.
 * Delega en el puerto del repositorio de transacciones.
 */
export class CreateTransaction {
  private readonly repository: TransactionRepository;

  constructor(repository: TransactionRepository) {
    this.repository = repository;
  }

  execute(request: CreateTransactionRequest): Promise<CreateTransactionResponse> {
    return this.repository.create(request);
  }
}
