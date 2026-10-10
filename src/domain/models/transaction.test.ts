import { describe, expect, it } from 'vitest';
import { isFinalStatus } from './transaction';

describe('isFinalStatus', () => {
  it('returns true for APPROVED', () => {
    expect(isFinalStatus('APPROVED')).toBe(true);
  });

  it('returns true for REJECTED', () => {
    expect(isFinalStatus('REJECTED')).toBe(true);
  });

  it('returns false for PENDING', () => {
    expect(isFinalStatus('PENDING')).toBe(false);
  });
});
