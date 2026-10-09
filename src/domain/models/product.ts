/**
 * Entidad de producto — capa de dominio.
 *
 * Refleja el ProductResponseDto del backend (core-payments).
 * TypeScript puro: sin dependencias de React, Tailwind ni Redux.
 */

/** Producto del catálogo. */
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}
