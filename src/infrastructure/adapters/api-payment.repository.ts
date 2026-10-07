import type { Transaction } from '@/domain/models/transaction';
import type { PaymentRepository } from '@/domain/ports/payment-repository.port';

const DEFAULT_BASE_URL = '/api/payments';

/**
 * Adaptador HTTP del puerto PaymentRepository (ejemplo).
 * No es el adaptador por defecto: para usarlo, inyectarlo en
 * PaymentRepositoryProvider. Requiere un backend real disponible.
 * La URL base se configura con VITE_PAYMENTS_API_URL.
 */
export class ApiPaymentRepository implements PaymentRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_PAYMENTS_API_URL ?? DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async saveTransaction(transaction: Transaction): Promise<void> {
    await this.request('POST', transaction);
  }

  async getHistory(): Promise<Transaction[]> {
    const data = await this.request('GET');
    return Array.isArray(data) ? (data as Transaction[]) : [];
  }

  async clear(): Promise<void> {
    await this.request('DELETE');
  }

  private async request(method: string, body?: unknown): Promise<unknown> {
    const response = await fetch(this.baseUrl, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Payments API respondió con estado ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }
}
