import type { Transaction } from '@/domain/models/transaction';
import type { PaymentRepository } from '@/domain/ports/payment-repository.port';
import type { SafeStorage } from '../storage/safe-storage';

const STORAGE_KEY = 'front-pyments:transactions';

/** Máximo de transacciones conservadas en el historial local. */
const MAX_HISTORY_LENGTH = 20;

/**
 * Adaptador del puerto PaymentRepository sobre localStorage.
 * Usa SafeStorage: si el navegador bloquea el storage, degrada sin romper.
 */
export class LocalStoragePaymentRepository implements PaymentRepository {
  private readonly storage: SafeStorage;

  constructor(storage: SafeStorage) {
    this.storage = storage;
  }

  async saveTransaction(transaction: Transaction): Promise<void> {
    const history = this.readHistory();
    this.storage.set(STORAGE_KEY, [transaction, ...history].slice(0, MAX_HISTORY_LENGTH));
  }

  async getHistory(): Promise<Transaction[]> {
    return this.readHistory();
  }

  async clear(): Promise<void> {
    this.storage.remove(STORAGE_KEY);
  }

  /** Lee el historial; cualquier dato corrupto se ignora. */
  private readHistory(): Transaction[] {
    const stored = this.storage.get<Transaction[]>(STORAGE_KEY);
    return Array.isArray(stored) ? stored : [];
  }
}
