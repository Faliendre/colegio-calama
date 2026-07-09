import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Captured by GlobalErrorHandler:', error);
    
    // Extract a readable error message
    let message = 'Error desconocido';
    if (error) {
      if (typeof error === 'string') {
        message = error;
      } else if (error.message) {
        message = error.message;
      } else if (error.originalError && error.originalError.message) {
        message = error.originalError.message;
      } else {
        message = JSON.stringify(error);
      }
    }
    
    // Ignore noisy Chrome Extension or browser-sync messages
    const lowerMsg = message.toLowerCase();
    if (
      lowerMsg.includes('chrome-extension') || 
      lowerMsg.includes('extensions') || 
      lowerMsg.includes('browser-sync') ||
      lowerMsg.includes('livereload')
    ) {
      return;
    }
    
    // Alert the user using the custom toast alert
    if (window.alert) {
      window.alert(`❌ Error de Ejecución Angular: ${message}`);
    }
  }
}
