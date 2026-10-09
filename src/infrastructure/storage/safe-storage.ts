/**
 * Infraestructura técnica de almacenamiento.
 * Envuelve localStorage de forma segura: modo privado, cuota excedida,
 * storage deshabilitado o JSON corrupto no deben romper la aplicación.
 */

/** Obtiene localStorage de forma segura (null si el acceso lanza). */
export function getLocalStorage(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

/**
 * Wrapper seguro de localStorage con serialización JSON.
 * Todos los métodos degradan sin lanzar: la app sigue funcionando
 * aunque el storage no esté disponible.
 */
export class SafeStorage {
  private readonly storage: Storage | null;

  constructor(storage: Storage | null = getLocalStorage()) {
    this.storage = storage;
  }

  /**
   * Lee y deserializa un valor. Devuelve null si no existe, si el JSON
   * está corrupto o si el storage no está disponible.
   * El llamador debe validar la forma del dato deserializado.
   */
  get<T>(key: string): T | null {
    if (!this.storage) return null;
    try {
      const raw = this.storage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /** Serializa y guarda un valor. Devuelve false si el storage falla. */
  set(key: string, value: unknown): boolean {
    if (!this.storage) return false;
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  /** Elimina una clave de forma segura. */
  remove(key: string): void {
    if (!this.storage) return;
    try {
      this.storage.removeItem(key);
    } catch {
      // noop: storage no disponible
    }
  }
}

/**
 * Shim con la interfaz WebStorage que espera redux-persist (métodos que
 * devuelven Promises), envolviendo localStorage con la misma seguridad.
 * redux-persist hace su propia serialización JSON: aquí solo se mueven strings.
 */
export const persistStorage = {
  getItem(key: string): Promise<string | null> {
    try {
      return Promise.resolve(globalThis.localStorage.getItem(key));
    } catch {
      // Storage no disponible: se comporta como estado vacío.
      return Promise.resolve(null);
    }
  },
  setItem(key: string, value: string): Promise<void> {
    try {
      globalThis.localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (err) {
      // Rechaza para que redux-persist lo reporte (writeFailHandler).
      return Promise.reject(err);
    }
  },
  removeItem(key: string): Promise<void> {
    try {
      globalThis.localStorage.removeItem(key);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },
};
