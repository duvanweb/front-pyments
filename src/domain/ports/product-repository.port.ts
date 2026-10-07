import type { Product } from '../models/product';

/**
 * Puerto de salida (Outbound): contrato que usa la capa de aplicación
 * para obtener productos del catálogo.
 *
 * Es asíncrono para ser agnóstico del transporte: HTTP, mock u otro
 * adaptador lo implementan con la misma firma.
 */
export interface ProductRepository {
  /** Devuelve todos los productos del catálogo. */
  findAll(): Promise<Product[]>;

  /** Devuelve un producto por id, o null si no existe. */
  findById(id: string): Promise<Product | null>;
}
