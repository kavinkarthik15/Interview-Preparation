/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── Colors ────────────────────────────────────────────────
      colors: {
        dark: {
          bg: '#0F172A',
          card: '#131B2E',
          'card-hover': '#1E293B',
          'card-elevated': '#172033',
          surface: '#1A2332',
          border: '#1F2937',
          'border-light': '#374151',
          'border-subtle': '#2A3444',
        },
        brand: {
          primary: '#2563EB',
          'primary-hover': '#1D4ED8',
          'primary-light': '#3B82F6',
          accent: '#7C3AED',
          'accent-hover': '#6D28D9',
          'accent-light': '#8B5CF6',
        },
        status: {
          success: '#10B981',
          'success-bg': 'rgba(16, 185, 129, 0.1)',
          warning: '#F59E0B',
          'warning-bg': 'rgba(245, 158, 11, 0.1)',
          error: '#EF4444',
          'error-bg': 'rgba(239, 68, 68, 0.1)',
          info: '#3B82F6',
          'info-bg': 'rgba(59, 130, 246, 0.1)',
        },
        text: {
          primary: '#E5E7EB',
          secondary: '#9CA3AF',
          muted: '#6B7280',
          inverse: '#0F172A',
        },
      },

      // ─── Font Family ───────────────────────────────────────────
      fontFamily: {
        heading: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },

      // ─── Border Radius ────────────────────────────────────────
      borderRadius: {
        card: '12px',
        btn: '12px',
        lg: '16px',
        xl: '24px',
      },

      // ─── Box Shadow ───────────────────────────────────────────
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.35)',
        'glow-primary': '0 0 20px rgba(37, 99, 235, 0.3)',
        'glow-accent': '0 0 20px rgba(124, 58, 237, 0.25)',
        'glow-success': '0 0 16px rgba(16, 185, 129, 0.2)',
      },

      // ─── Background Image (Gradients) ─────────────────────────
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
        'gradient-accent': 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(124,58,237,0.05) 100%)',
        'gradient-progress': 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
      },

      // ─── Animations ───────────────────────────────────────────
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(124, 58, 237, 0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(124, 58, 237, 0.4)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gauge-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 6px rgba(124, 58, 237, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 14px rgba(124, 58, 237, 0.5))' },
        },
        'progress-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width, 0%)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.95)' },
          '60%': { opacity: '1', transform: 'translateY(-2px) scale(1.02)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'gauge-glow': 'gauge-glow 2.5s ease-in-out infinite',
        'progress-fill': 'progress-fill 1s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'count-up': 'count-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
