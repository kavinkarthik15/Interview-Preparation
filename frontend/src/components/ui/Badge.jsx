import React from 'react';
import { statusConfig, scoreConfig, aiConfidenceConfig } from '../../design-system/tokens';

/**
 * 🏷️ Badge – Status, Score, or custom badge
 */
export function Badge({ variant = 'info', children, className = '', ...props }) {
  const variants = {
    success: 'ds-badge-success',
    warning: 'ds-badge-warning',
    error: 'ds-badge-error',
    info: 'ds-badge-info',
    accent: 'ds-badge-accent',
  };

  return (
    <span className={`${variants[variant] || variants.info} ${className}`} {...props}>
      {children}
    </span>
  );
}

/**
 * 🏷️ StatusBadge – Auto-mapped from status string
 * Accepts: 'completed' | 'in-progress' | 'pending' | 'failed'
 */
export function StatusBadge({ status, className = '' }) {
  const config = statusConfig[status];
  if (!config) return null;

  const variantMap = {
    completed: 'success',
    'in-progress': 'warning',
    pending: 'info',
    failed: 'error',
  };

  return (
    <Badge variant={variantMap[status]} className={className}>
      {config.label}
    </Badge>
  );
}

/**
 * 🏷️ ScoreBadge – Shows label based on numeric score (0-100)
 */
export function ScoreBadge({ score, className = '' }) {
  if (score == null) return null;
  const { label } = scoreConfig.getLabel(score);

  const variantMap = {
    Excellent: 'success',
    Good: 'info',
    Average: 'warning',
    'Needs Work': 'error',
  };

  return (
    <Badge variant={variantMap[label]} className={className}>
      {score}% – {label}
    </Badge>
  );
}

/**
 * 🤖 AIConfidenceBadge – Shows AI confidence level
 */
export function AIConfidenceBadge({ confidence, className = '' }) {
  if (confidence == null) return null;
  const { label } = aiConfidenceConfig.getLevel(confidence);

  const variantMap = {
    High: 'success',
    Medium: 'warning',
    Low: 'error',
  };

  return (
    <Badge variant={variantMap[label]} className={`${className}`}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1" />
      AI: {label}
    </Badge>
  );
}
