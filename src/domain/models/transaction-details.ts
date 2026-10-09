/**
 * Detalles de una transacción — capa de dominio.
 *
 * Refleja la respuesta del endpoint GET /api/transactions/:id del backend.
 */

/** Estados posibles de una transacción. */
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

/** Respuesta de GET /api/transactions/:id. */
export interface TransactionDetails {
  /** ID de la transacción. */
  id: string;
  /** Estado actual. */
  status: TransactionStatus;
  /** Referencia única visible al usuario. */
  reference: string;
  /** ID del producto comprado. */
  productId: string;
  /** Cantidad de unidades. */
  quantity: number;
  /** Monto total en centavos. */
  totalAmountInCents: number;
  /** Moneda (ej: COP). */
  currency: string;
  /** ID de la transacción en Wompi, o null si aún no se procesa. */
  wompiTransactionId: string | null;
  /** ID del cliente, o null si no se ha creado. */
  customerId: string | null;
  /** Fecha de creación ISO. */
  createdAt: string;
}
