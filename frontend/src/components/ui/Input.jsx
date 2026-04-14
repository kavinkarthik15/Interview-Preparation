import React from 'react';

/**
 * 📝 Input – Styled dark-theme input
 */
export function Input({
  label,
  error,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input id={inputId} className={`ds-input ${error ? 'border-status-error focus:ring-status-error' : ''}`} {...props} />
      {error && <p className="text-xs text-status-error">{error}</p>}
    </div>
  );
}

/**
 * 📝 Textarea – Styled dark-theme textarea
 */
export function Textarea({
  label,
  error,
  rows = 4,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`ds-textarea ${error ? 'border-status-error focus:ring-status-error' : ''}`}
        {...props}
      />
      {error && <p className="text-xs text-status-error">{error}</p>}
    </div>
  );
}

/**
 * 📝 Select – Styled dark-theme select
 */
export function Select({
  label,
  error,
  options = [],
  placeholder = 'Select...',
  className = '',
  id,
  ...props
}) {
  const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`ds-select ${error ? 'border-status-error focus:ring-status-error' : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-status-error">{error}</p>}
    </div>
  );
}
