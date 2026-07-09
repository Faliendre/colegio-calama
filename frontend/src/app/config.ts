/**
 * Configuración global para el frontend de Angular.
 * Detecta automáticamente si el entorno es local o de producción en la nube.
 */
export const CONFIG = {
  productionApiUrl: 'https://colegio-calama.onrender.com/api',
  localApiUrl: 'http://localhost:8000/api',

  get apiUrl(): string {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Si estamos en localhost, 127.0.0.1, o una IP de red local (192.168.x.x)
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
      ) {
        return this.localApiUrl;
      }
    }
    return this.productionApiUrl;
  }
};
