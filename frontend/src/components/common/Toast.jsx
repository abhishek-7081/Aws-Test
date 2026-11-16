import React from 'react';
import { useToast } from '../../context/ToastContext';

const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="tf-toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let icon = 'ℹ️';
        if (toast.type === 'success') icon = '✓';
        else if (toast.type === 'error') icon = '⚠️';
        else if (toast.type === 'warning') icon = '⚡';

        return (
          <div key={toast.id} className={`tf-toast tf-toast-${toast.type}`} role="alert">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontWeight: 'bold' }}>{icon}</span>
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              className="btn-close btn-close-sm"
              style={{ fontSize: '0.75rem', opacity: 0.7 }}
              aria-label="Close"
              onClick={() => removeToast(toast.id)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Toast;

