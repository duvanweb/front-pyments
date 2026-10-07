import type { Transaction } from '@/domain/models/transaction';
import type { PaymentRepository } from '@/domain/ports/payment-repository.port';

/**
 * Caso de uso: consultar el historial de pagos.
 * Delega en el puerto de persistencia; la fuente de la verdad es el
 * repositorio (localStorage hoy, una API mañana — mismo contrato).
 */
export class GetPaymentHistory {
  private readonly repository: PaymentRepository;

  constructor(repository: PaymentRepository) {
    this.repository = repository;
  }

  execute(): Promise<Transaction[]> {
    return this.repository.getHistory();
  }
}
