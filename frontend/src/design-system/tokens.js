/**
 * 🎨 Interview Preparation – Design System Tokens
 * ================================================
 * Single source of truth for all design values.
 * Import this file when you need programmatic access to tokens
 * (e.g. charts, dynamic styles). For Tailwind classes, use the
 * custom utility names defined in tailwind.config.js.
 */

// ─── Core Color Palette ─────────────────────────────────────────────
export const colors = {
  // Backgrounds
  background: '#0F172A',       // Main app background (slate-950 range)
  cardBg: '#131B2E',           // Card / surface background (matches tailwind dark.card)
  cardBgHover: '#1E293B',      // Card hover / elevated surface

  // Brand
  primary: '#2563EB',          // Buttons, links, highlights (blue-600)
  primaryHover: '#1D4ED8',     // Button hover state
  primaryLight: '#3B82F6',     // Lighter variant for outlines / rings

  // AI / Accent
  accent: '#7C3AED',           // AI-related elements (violet-600)
  accentHover: '#6D28D9',      // AI element hover
  accentLight: '#8B5CF6',      // Lighter accent for glows

  // Semantic
  success: '#10B981',          // Completed / passed (emerald-500)
  successBg: 'rgba(16,185,129,0.1)',
  warning: '#F59E0B',          // In-progress / attention (amber-500)
  warningBg: 'rgba(245,158,11,0.1)',
  error: '#EF4444',            // Failed / critical (red-500)
  errorBg: 'rgba(239,68,68,0.1)',
  info: '#3B82F6',             // Informational (blue-500)
  infoBg: 'rgba(59,130,246,0.1)',

  // Text
  textPrimary: '#E5E7EB',      // Main text (gray-200)
  textSecondary: '#9CA3AF',    // Secondary / muted (gray-400)
  textMuted: '#6B7280',        // Disabled / placeholder (gray-500)
  textInverse: '#0F172A',      // Text on light backgrounds

  // Borders
  border: '#1F2937',           // Default border (gray-800)
  borderLight: '#374151',      // Lighter border for emphasis (gray-700)
};

// ─── Spacing Scale ──────────────────────────────────────────────────
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

// ─── Border Radius ──────────────────────────────────────────────────
export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

// ─── Shadows ────────────────────────────────────────────────────────
export const shadows = {
  card: '0 4px 24px rgba(0, 0, 0, 0.25)',
  cardHover: '0 8px 32px rgba(0, 0, 0, 0.35)',
  glow: {
    primary: '0 0 20px rgba(37, 99, 235, 0.3)',
    accent: '0 0 20px rgba(124, 58, 237, 0.25)',
    success: '0 0 16px rgba(16, 185, 129, 0.2)',
  },
};

// ─── Typography ─────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    heading: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    body: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

// ─── Transitions ────────────────────────────────────────────────────
export const transitions = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease-in-out',
};

// ─── Gradients ──────────────────────────────────────────────────────
export const gradients = {
  primaryToAccent: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
  accentToPrimary: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
  cardShine: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(124,58,237,0.05) 100%)',
  progressBar: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
};

// ─── Score / Status Helpers ─────────────────────────────────────────
export const scoreConfig = {
  getLabel(score) {
    if (score >= 90) return { label: 'Excellent', color: colors.success };
    if (score >= 75) return { label: 'Good', color: colors.primary };
    if (score >= 50) return { label: 'Average', color: colors.warning };
    return { label: 'Needs Work', color: colors.error };
  },
};

export const statusConfig = {
  completed: { label: 'Completed', color: colors.success, bg: colors.successBg },
  'in-progress': { label: 'In Progress', color: colors.warning, bg: colors.warningBg },
  pending: { label: 'Pending', color: colors.info, bg: colors.infoBg },
  failed: { label: 'Failed', color: colors.error, bg: colors.errorBg },
};

export const aiConfidenceConfig = {
  getLevel(confidence) {
    if (confidence >= 0.8) return { label: 'High', color: colors.success };
    if (confidence >= 0.5) return { label: 'Medium', color: colors.warning };
    return { label: 'Low', color: colors.error };
  },
};
