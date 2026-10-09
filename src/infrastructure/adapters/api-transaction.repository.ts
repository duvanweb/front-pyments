import type {
  CreateTransactionRequest,
  CreateTransactionResponse,
} from '@/domain/models/transaction-request';
import type { TransactionDetails } from '@/domain/models/transaction-details';
import type { TransactionRepository } from '@/domain/ports/transaction-repository.port';

const DEFAULT_BASE_URL = '/api';

/**
 * Adaptador HTTP del puerto TransactionRepository.
 * Consume el endpoint POST /api/transactions de core-payments.
 * La URL base por defecto es relativa ("/api") y se proxya en desarrollo
 * hacia http://localhost:3000 vía Vite (ver vite.config.ts → server.proxy).
 * Se puede override con la variable de entorno VITE_API_URL.
 */
export class ApiTransactionRepository implements TransactionRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_URL ?? DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async create(request: CreateTransactionRequest): Promise<CreateTransactionResponse> {
    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let message = `Error al crear la transacción: ${response.status}`;
      try {
        const body = await response.json();
        if (body?.message) message = body.message;
      } catch {
        // El cuerpo no es JSON — usar el mensaje genérico.
      }
      throw new Error(message);
    }

    return (await response.json()) as CreateTransactionResponse;
  }

  async getById(id: string): Promise<TransactionDetails> {
    const response = await fetch(`${this.baseUrl}/transactions/${id}`);

    if (!response.ok) {
      let message = `Error al obtener la transacción: ${response.status}`;
      try {
        const body = await response.json();
        if (body?.message) message = body.message;
      } catch {
        // El cuerpo no es JSON — usar el mensaje genérico.
      }
      throw new Error(message);
    }

    return (await response.json()) as TransactionDetails;
  }
}
