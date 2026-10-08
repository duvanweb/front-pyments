import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { TransactionRepository } from '@/domain/ports/transaction-repository.port';
import { ApiTransactionRepository } from '../adapters/api-transaction.repository';

const TransactionRepositoryContext = createContext<TransactionRepository | null>(null);

/** Repositorio por defecto: adaptador HTTP de la API de core-payments. */
function createDefaultRepository(): TransactionRepository {
  return new ApiTransactionRepository();
}

interface TransactionRepositoryProviderProps {
  /**
   * Instancia del puerto a inyectar. Por defecto usa el adaptador HTTP;
   * pasar un mock u otro adaptador para testing sin tocar la UI.
   */
  repository?: TransactionRepository;
  children: ReactNode;
}

/**
 * Raíz de composición (inyección de dependencias): expone la instancia
 * del puerto TransactionRepository a la UI sin acoplarla al adaptador.
 */
export function TransactionRepositoryProvider({
  repository,
  children,
}: TransactionRepositoryProviderProps) {
  const value = useMemo(() => repository ?? createDefaultRepository(), [repository]);

  return (
    <TransactionRepositoryContext.Provider value={value}>
      {children}
    </TransactionRepositoryContext.Provider>
  );
}

/**
 * Hook de acceso al puerto inyectado. Lanza si se usa fuera del provider.
 */
// eslint-disable-next-line react-refresh/only-export-components -- patrón estándar de Context: provider + hook en el mismo archivo
export function useTransactionRepository(): TransactionRepository {
  const repository = useContext(TransactionRepositoryContext);
  if (!repository) {
    throw new Error(
      'useTransactionRepository debe usarse dentro de <TransactionRepositoryProvider>',
    );
  }
  return repository;
}
