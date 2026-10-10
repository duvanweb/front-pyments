import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { ApiPaymentRepository } from './api-payment.repository';
import type { Transaction } from '@/domain/models/transaction';

const mockTransaction: Transaction = {
  id: 'tx-1',
  payment: { id: 'pay-1', amountInCents: 10000, currency: 'COP', method: 'CREDIT_CARD', createdAt: '2026-01-01T00:00:00Z' },
  status: 'APPROVED',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('ApiPaymentRepository', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function makeResponse(ok: boolean, status: number, body?: unknown) {
    return {
      ok,
      status,
      json: vi.fn().mockResolvedValue(body ?? {}),
    };
  }

  it('saveTransaction sends POST with JSON body', async () => {
    mockFetch.mockResolvedValue(makeResponse(true, 201, { ok: true }));
    const repo = new ApiPaymentRepository('http://test/api');

    await repo.saveTransaction(mockTransaction);

    expect(mockFetch).toHaveBeenCalledWith('http://test/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockTransaction),
    });
  });

  it('saveTransaction throws on non-ok response', async () => {
    mockFetch.mockResolvedValue(makeResponse(false, 500));
    const repo = new ApiPaymentRepository('http://test/api');

    await expect(repo.saveTransaction(mockTransaction)).rejects.toThrow('estado 500');
  });

  it('getHistory returns parsed array on success', async () => {
    mockFetch.mockResolvedValue(makeResponse(true, 200, [mockTransaction]));
    const repo = new ApiPaymentRepository('http://test/api');

    const result = await repo.getHistory();
    expect(result).toEqual([mockTransaction]);
  });

  it('getHistory returns empty array when response is not an array', async () => {
    mockFetch.mockResolvedValue(makeResponse(true, 200, { not: 'array' }));
    const repo = new ApiPaymentRepository('http://test/api');

    const result = await repo.getHistory();
    expect(result).toEqual([]);
  });

  it('getHistory throws on non-ok response', async () => {
    mockFetch.mockResolvedValue(makeResponse(false, 404));
    const repo = new ApiPaymentRepository('http://test/api');

    await expect(repo.getHistory()).rejects.toThrow('estado 404');
  });

  it('clear sends DELETE request', async () => {
    mockFetch.mockResolvedValue(makeResponse(true, 204));
    const repo = new ApiPaymentRepository('http://test/api');

    await repo.clear();

    expect(mockFetch).toHaveBeenCalledWith('http://test/api', {
      method: 'DELETE',
      headers: undefined,
      body: undefined,
    });
  });

  it('clear handles 204 No Content', async () => {
    mockFetch.mockResolvedValue(makeResponse(true, 204));
    const repo = new ApiPaymentRepository('http://test/api');

    await expect(repo.clear()).resolves.toBeUndefined();
  });

  it('GET requests do not send Content-Type header', async () => {
    mockFetch.mockResolvedValue(makeResponse(true, 200, []));
    const repo = new ApiPaymentRepository('http://test/api');

    await repo.getHistory();

    expect(mockFetch).toHaveBeenCalledWith('http://test/api', {
      method: 'GET',
      headers: undefined,
      body: undefined,
    });
  });
});
