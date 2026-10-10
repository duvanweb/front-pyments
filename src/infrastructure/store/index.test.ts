import { describe, expect, it } from 'vitest';
import { migrate } from './index';

describe('migrate (redux-persist)', () => {
  it('returns the state when it has payment and checkout keys', async () => {
    const state = { payment: { history: [] }, checkout: { status: 'idle' } };
    const result = await migrate(state);
    expect(result).toBe(state);
  });

  it('returns undefined when state is null', async () => {
    const result = await migrate(null);
    expect(result).toBeUndefined();
  });

  it('returns undefined when state is undefined', async () => {
    const result = await migrate(undefined);
    expect(result).toBeUndefined();
  });

  it('returns undefined when state lacks payment key', async () => {
    const result = await migrate({ checkout: { status: 'idle' } });
    expect(result).toBeUndefined();
  });

  it('returns undefined when state lacks checkout key', async () => {
    const result = await migrate({ payment: { history: [] } });
    expect(result).toBeUndefined();
  });

  it('returns undefined when state is not an object', async () => {
    const result = await migrate('invalid');
    expect(result).toBeUndefined();
  });
});
