import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { PaymentRepository } from '@/domain/ports/payment-repository.port';
import { LocalStoragePaymentRepository } from '../adapters/local-storage-payment.repository';
import { SafeStorage } from '../storage/safe-storage';

const PaymentRepositoryContext = createContext<PaymentRepository | null>(null);

/** Repositorio por defecto: localStorage seguro. */
function createDefaultRepository(): PaymentRepository {
  return new LocalStoragePaymentRepository(new SafeStorage());
}

interface PaymentRepositoryProviderProps {
  /**
   * Instancia del puerto a inyectar. Por defecto usa localStorage;
   * pasar p. ej. `new ApiPaymentRepository(...)` para cambiar de adaptador
   * sin tocar la UI ni los casos de uso.
   */
  repository?: PaymentRepository;
  children: ReactNode;
}

/**
 * Raíz de composición (inyección de dependencias): expone la instancia
 * del puerto PaymentRepository a la UI sin acoplarla al adaptador.
 */
export function PaymentRepositoryProvider({ repository, children }: PaymentRepositoryProviderProps) {
  const value = useMemo(() => repository ?? createDefaultRepository(), [repository]);

  return <PaymentRepositoryContext.Provider value={value}>{children}</PaymentRepositoryContext.Provider>;
}

/**
 * Hook de acceso al puerto inyectado. Lanza si se usa fuera del provider.
 */
// eslint-disable-next-line react-refresh/only-export-components -- patrón estándar de Context: provider + hook en el mismo archivo
export function usePaymentRepository(): PaymentRepository {
  const repository = useContext(PaymentRepositoryContext);
  if (!repository) {
    throw new Error('usePaymentRepository debe usarse dentro de <PaymentRepositoryProvider>');
  }
  return repository;
}
