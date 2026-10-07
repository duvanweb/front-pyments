import type { Payment, PaymentRequest } from '@/domain/models/payment';
import type { Transaction } from '@/domain/models/transaction';
import type { PaymentRepository } from '@/domain/ports/payment-repository.port';
import {
  PaymentValidationError,
  resolveTransactionStatus,
  validatePayment,
} from '@/domain/rules/payment-validation.rules';

/**
 * Caso de uso: procesar un pago.
 * Orquesta el dominio (validación, decisión de estado) y el puerto de
 * persistencia. No conoce React ni el mecanismo de almacenamiento.
 */
export class ProcessPayment {
  private readonly repository: PaymentRepository;

  constructor(repository: PaymentRepository) {
    this.repository = repository;
  }

  async execute(request: PaymentRequest): Promise<Transaction> {
    const validation = validatePayment(request);
    if (!validation.isValid) {
      throw new PaymentValidationError(validation.errors);
    }

    const now = new Date().toISOString();
    const payment: Payment = { id: crypto.randomUUID(), ...request, createdAt: now };

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      payment,
      status: resolveTransactionStatus(payment),
      updatedAt: now,
    };

    await this.repository.saveTransaction(transaction);
    return transaction;
  }
}
