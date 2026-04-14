import React from 'react';

/**
 * 🃏 Card – Dark-themed card with optional hover glow
 */
export function Card({
  children,
  className = '',
  hover = true,
  aiGlow = false,
  padding = 'p-6',
  ...props
}) {
  return (
    <div
      className={`
        ds-card ${padding}
        ${hover ? '' : 'hover:bg-dark-card hover:shadow-card'}
        ${aiGlow ? 'ds-ai-glow animate-glow-pulse' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card header with title & optional subtitle
 */
export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        <h3 className="ds-section-heading">{title}</h3>
        {subtitle && <p className="ds-section-subheading">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
