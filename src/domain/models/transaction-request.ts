/**
 * Solicitud y respuesta de creación de transacción — capa de dominio.
 *
 * Refleja los DTOs del endpoint POST /api/transactions del backend.
 */
import type { CustomerData } from './customer';
import type { ShippingAddress } from './shipping-address';

/** Cuerpo de la solicitud POST /api/transactions. */
export interface CreateTransactionRequest {
  /** UUID del producto a comprar. */
  productId: string;
  /** Cantidad de unidades. */
  quantity: number;
  /** Precio unitario del producto (no en centavos). */
  productPrice: number;
  /** Datos del cliente. */
  customer: CustomerData;
  /** Dirección de envío. */
  shippingAddress: ShippingAddress;
}

/** Respuesta 201 de POST /api/transactions. */
export interface CreateTransactionResponse {
  /** ID de la transacción creada. */
  transactionId: string;
  /** Referencia única de la transacción (número visible al usuario). */
  reference: string;
  /** URL de checkout de Wompi (no se usa en este flujo con tarjeta falsa). */
  checkoutUrl: string;
}
