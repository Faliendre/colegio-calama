import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  alert(message: string, type: 'success' | 'error' | 'info' = 'info'): Promise<void> {
    return new Promise((resolve) => {
      // Create elements
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
      overlay.style.backdropFilter = 'blur(4px)';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '99999';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s ease-out';

      const card = document.createElement('div');
      card.style.backgroundColor = '#ffffff';
      card.style.borderRadius = '1.25rem';
      card.style.padding = '2rem';
      card.style.width = '90%';
      card.style.maxWidth = '400px';
      card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      card.style.transform = 'scale(0.9)';
      card.style.transition = 'transform 0.2s ease-out';
      card.style.textAlign = 'center';

      // Icon & Color
      let icon = 'ℹ️';
      let iconBg = '#eff6ff';
      let iconColor = '#3b82f6';
      let btnBg = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
      if (type === 'success') {
        icon = '✅';
        iconBg = '#d1fae5';
        iconColor = '#10b981';
        btnBg = 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)';
      } else if (type === 'error') {
        icon = '❌';
        iconBg = '#fee2e2';
        iconColor = '#ef4444';
        btnBg = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
      }

      card.innerHTML = `
        <div style="width: 4rem; height: 4rem; background-color: ${iconBg}; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; font-size: 2rem;">
          ${icon}
        </div>
        <p style="font-size: 1rem; color: #374151; font-weight: 500; margin-bottom: 1.5rem; line-height: 1.5;">
          ${message}
        </p>
        <button id="alert-btn" style="
          width: 100%;
          padding: 0.75rem;
          background: ${btnBg};
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          transition: all 0.2s;
        ">Aceptar</button>
      `;

      overlay.appendChild(card);
      document.body.appendChild(overlay);

      // Trigger animation
      setTimeout(() => {
        overlay.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }, 10);

      const close = () => {
        overlay.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => {
          document.body.removeChild(overlay);
          resolve();
        }, 200);
      };

      card.querySelector('#alert-btn')?.addEventListener('click', close);
    });
  }

  confirm(message: string, title: string = '¿Confirmar acción?'): Promise<boolean> {
    return new Promise((resolve) => {
      // Create elements
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
      overlay.style.backdropFilter = 'blur(4px)';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '99999';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s ease-out';

      const card = document.createElement('div');
      card.style.backgroundColor = '#ffffff';
      card.style.borderRadius = '1.25rem';
      card.style.padding = '2rem';
      card.style.width = '90%';
      card.style.maxWidth = '400px';
      card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      card.style.transform = 'scale(0.9)';
      card.style.transition = 'transform 0.2s ease-out';
      card.style.textAlign = 'center';

      card.innerHTML = `
        <div style="width: 4rem; height: 4rem; background-color: #fef3c7; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; font-size: 2rem;">
          ⚠️
        </div>
        <h3 style="font-size: 1.2rem; font-weight: bold; color: #111827; margin-bottom: 0.5rem;">${title}</h3>
        <p style="font-size: 0.95rem; color: #4b5563; margin-bottom: 1.75rem; line-height: 1.5;">
          ${message}
        </p>
        <div style="display: flex; gap: 0.75rem;">
          <button id="cancel-btn" style="
            flex: 1;
            padding: 0.75rem;
            background-color: #f3f4f6;
            color: #4b5563;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          ">Cancelar</button>
          <button id="confirm-btn" style="
            flex: 1;
            padding: 0.75rem;
            background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%);
            color: white;
            border: none;
            border-radius: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(45, 106, 79, 0.15);
            transition: all 0.2s;
          ">Aceptar</button>
        </div>
      `;

      overlay.appendChild(card);
      document.body.appendChild(overlay);

      // Trigger animation
      setTimeout(() => {
        overlay.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }, 10);

      const close = (result: boolean) => {
        overlay.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => {
          document.body.removeChild(overlay);
          resolve(result);
        }, 200);
      };

      card.querySelector('#confirm-btn')?.addEventListener('click', () => close(true));
      card.querySelector('#cancel-btn')?.addEventListener('click', () => close(false));
    });
  }
}
