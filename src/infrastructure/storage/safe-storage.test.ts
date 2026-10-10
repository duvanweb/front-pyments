import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { getLocalStorage, SafeStorage, persistStorage } from './safe-storage';

describe('getLocalStorage', () => {
  it('returns localStorage when available', () => {
    const result = getLocalStorage();
    expect(result).not.toBeNull();
  });
});

describe('SafeStorage', () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
  });

  describe('get', () => {
    it('returns parsed JSON value', () => {
      mockStorage.getItem = vi.fn().mockReturnValue(JSON.stringify({ name: 'test' }));
      const storage = new SafeStorage(mockStorage);

      expect(storage.get('key')).toEqual({ name: 'test' });
    });

    it('returns null for missing key', () => {
      mockStorage.getItem = vi.fn().mockReturnValue(null);
      const storage = new SafeStorage(mockStorage);

      expect(storage.get('missing')).toBeNull();
    });

    it('returns null for corrupt JSON', () => {
      mockStorage.getItem = vi.fn().mockReturnValue('not json');
      const storage = new SafeStorage(mockStorage);

      expect(storage.get('corrupt')).toBeNull();
    });

    it('returns null when storage is null', () => {
      const storage = new SafeStorage(null);
      expect(storage.get('key')).toBeNull();
    });
  });

  describe('set', () => {
    it('serializes and saves value', () => {
      const storage = new SafeStorage(mockStorage);

      const result = storage.set('key', { name: 'test' });
      expect(result).toBe(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith('key', JSON.stringify({ name: 'test' }));
    });

    it('returns false when storage is null', () => {
      const storage = new SafeStorage(null);
      expect(storage.set('key', 'value')).toBe(false);
    });

    it('returns false when setItem throws', () => {
      mockStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      const storage = new SafeStorage(mockStorage);

      expect(storage.set('key', 'value')).toBe(false);
    });
  });

  describe('remove', () => {
    it('removes the key', () => {
      const storage = new SafeStorage(mockStorage);
      storage.remove('key');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('key');
    });

    it('is a no-op when storage is null', () => {
      const storage = new SafeStorage(null);
      expect(() => storage.remove('key')).not.toThrow();
    });

    it('is a no-op when removeItem throws', () => {
      mockStorage.removeItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });
      const storage = new SafeStorage(mockStorage);
      expect(() => storage.remove('key')).not.toThrow();
    });
  });
});

describe('persistStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getItem resolves with the stored value', async () => {
    localStorage.getItem = vi.fn().mockReturnValue('stored-value');
    await expect(persistStorage.getItem('key')).resolves.toBe('stored-value');
  });

  it('getItem resolves null when storage throws', async () => {
    vi.stubGlobal('localStorage', undefined);
    await expect(persistStorage.getItem('key')).resolves.toBeNull();
    vi.unstubAllGlobals();
  });

  it('setItem resolves on success', async () => {
    await expect(persistStorage.setItem('key', 'value')).resolves.toBeUndefined();
    expect(localStorage.setItem).toHaveBeenCalledWith('key', 'value');
  });

  it('setItem rejects on error', async () => {
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('Quota');
    });
    await expect(persistStorage.setItem('key', 'value')).rejects.toThrow('Quota');
  });

  it('removeItem resolves on success', async () => {
    await expect(persistStorage.removeItem('key')).resolves.toBeUndefined();
    expect(localStorage.removeItem).toHaveBeenCalledWith('key');
  });

  it('removeItem rejects on error', async () => {
    localStorage.removeItem = vi.fn().mockImplementation(() => {
      throw new Error('Error');
    });
    await expect(persistStorage.removeItem('key')).rejects.toThrow('Error');
  });
});
