import { beforeEach, describe, expect, it } from '@jest/globals';
import type { Transaction } from '@/domain/models/transaction';
import { SafeStorage } from '../storage/safe-storage';
import { LocalStoragePaymentRepository } from './local-storage-payment.repository';

const STORAGE_KEY = 'front-pyments:transactions';
const MAX_HISTORY_LENGTH = 20;

function makeTransaction(id: string, amountInCents = 10_000): Transaction {
  return {
    id,
    payment: {
      id: `payment-${id}`,
      amountInCents,
      currency: 'COP',
      method: 'CREDIT_CARD',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    status: 'APPROVED',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('LocalStoragePaymentRepository', () => {
  let repository: LocalStoragePaymentRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStoragePaymentRepository(new SafeStorage());
  });

  it('devuelve [] cuando no hay transacciones', async () => {
    expect(await repository.getHistory()).toEqual([]);
  });

  it('guarda y recupera el historial, la más reciente primero', async () => {
    await repository.saveTransaction(makeTransaction('t1'));
    await repository.saveTransaction(makeTransaction('t2'));

    const history = await repository.getHistory();
    expect(history.map((transaction) => transaction.id)).toEqual(['t2', 't1']);
  });

  it('limita el historial al máximo configurado', async () => {
    for (let i = 0; i < MAX_HISTORY_LENGTH + 5; i++) {
      await repository.saveTransaction(makeTransaction(`t-${i}`));
    }

    const history = await repository.getHistory();
    expect(history).toHaveLength(MAX_HISTORY_LENGTH);
    expect(history[0]?.id).toBe(`t-${MAX_HISTORY_LENGTH + 4}`);
  });

  it('ignora JSON corrupto y degrada a historial vacío', async () => {
    localStorage.setItem(STORAGE_KEY, '{esto no es json válido');
    expect(await repository.getHistory()).toEqual([]);
  });

  it('clear elimina el historial', async () => {
    await repository.saveTransaction(makeTransaction('t1'));
    await repository.clear();
    expect(await repository.getHistory()).toEqual([]);
  });
});

describe('SafeStorage con storage no disponible', () => {
  it('no lanza cuando el storage es null', () => {
    const storage = new SafeStorage(null);
    expect(storage.set('key', { hola: 1 })).toBe(false);
    expect(storage.get('key')).toBeNull();
    expect(() => storage.remove('key')).not.toThrow();
  });

  it('no lanza cuando setItem falla (cuota excedida)', () => {
    const throwingStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => undefined,
    } as unknown as Storage;

    const storage = new SafeStorage(throwingStorage);
    expect(storage.set('key', 'valor')).toBe(false);
  });
});
