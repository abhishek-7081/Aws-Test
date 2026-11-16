import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = '540px' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="tf-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="tf-modal-dialog" style={{ maxWidth }} role="dialog" aria-modal="true">
        <div className="tf-modal-header">
          <h5 className="m-0 fw-semibold text-truncate">{title}</h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          />
        </div>
        <div className="tf-modal-body">{children}</div>
        {footer && <div className="tf-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

