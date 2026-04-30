import React from 'react';
import './Layout.css';

export const Layout = ({ children, title }) => {
  return (
    <div className="layout-shell">
      {title && (
        <div className="layout-header">
          <div className="layout-container">
            <h1>{title}</h1>
          </div>
        </div>
      )}
      <main className="layout-main">
        <div className="layout-container">{children}</div>
      </main>
    </div>
  );
};

export const Card = ({ children, className = '' }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    fullWidth && 'btn-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="spinner"></span>}
      {children}
    </button>
  );
};

export const Input = ({
  label,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label>
          {label}
          {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <input className={className} {...props} />
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export const TextArea = ({
  label,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label>
          {label}
          {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <textarea className={className} {...props} />
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export const Select = ({
  label,
  error,
  required = false,
  options = [],
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label>
          {label}
          {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <select className={className} {...props}>
        <option value="">Select {label?.toLowerCase() || 'an option'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export const Alert = ({ type = 'info', children, onClose }) => {
  return (
    <div className={`alert alert-${type}`}>
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
          ✕
        </button>
      )}
    </div>
  );
};

export const Badge = ({ variant = 'info', children }) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};

export const Loading = () => (
  <div className="loading">
    <div className="spinner"></div>
    <span style={{ marginLeft: '0.5rem' }}>Loading...</span>
  </div>
);

export const EmptyState = ({ title, description, action }) => {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
      <h3 style={{ color: 'var(--gray-500)', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--gray-400)', marginBottom: '1.5rem' }}>{description}</p>
      {action && action}
    </div>
  );
};
