/**
 * Polyfills para SockJS y otras librerías
 * Este archivo debe ser cargado antes que cualquier otra aplicación
 */

// ============ POLYFILLS PARA SOCKJS ==============

// Define global para SockJS
(window as any).global = window;

// Polyfill para process
(window as any).process = {
  env: { DEBUG: undefined },
  version: [],
  nextTick: (() => {
    let promise: Promise<void> | undefined;
    return (callback: () => void) =>
      (promise || (promise = Promise.resolve())).then(callback).finally(
        () => (promise = undefined)
      );
  })(),
};

// Polyfill para Buffer
(window as any).Buffer = (() => {
  return {
    alloc: (size: number) => new Uint8Array(size),
    allocUnsafe: (size: number) => new Uint8Array(size),
    from: (data: any) => new Uint8Array(data),
  };
})();

// Asegúrate de que crypto está disponible
if (!(window as any).crypto) {
  (window as any).crypto = window.crypto || (window as any).msCrypto;
}

import 'zone.js';