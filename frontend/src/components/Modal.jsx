import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, subtitle, children, footer, size = 'default' }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={size === 'lg' ? { maxWidth: 680 } : {}}>
        <div className="modal-header">
          <div>
            {title && <div className="modal-title">{title}</div>}
            {subtitle && <div className="modal-subtitle">{subtitle}</div>}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Close">✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
