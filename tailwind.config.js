/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        'surface-elevated': 'var(--bg-surface-elevated)',
        overlay: 'var(--bg-overlay)',
        volt: 'var(--accent-volt)',
        'volt-dim': 'var(--accent-volt-dim)',
        'volt-glow': 'var(--accent-volt-glow)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        inverse: 'var(--text-inverse)',
        grid: 'var(--grid-border)',
        'border-subtle': 'var(--border-subtle)',
        danger: 'var(--status-danger)',
        success: 'var(--status-success)',
        warning: 'var(--status-warning)',
        info: 'var(--status-info)',
      },
      borderRadius: {
        'sm-token': 'var(--radius-sm)',
        'md-token': 'var(--radius-md)',
        'lg-token': 'var(--radius-lg)',
        'xl-token': 'var(--radius-xl)',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
        'glow-volt': 'var(--shadow-glow-volt)',
        'glow-danger': 'var(--shadow-glow-danger)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Space Grotesk', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
        'panel': '16px',
        'heavy': '24px',
      },
      transitionTimingFunction: {
        'spring': 'var(--anim-spring)',
        'snap': 'var(--anim-snap)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'normal': 'var(--transition-normal)',
        'slow': 'var(--transition-slow)',
      },
      keyframes: {
        'animate-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gauge-fill': {
          '0%': { strokeDashoffset: '251' },
          '100%': { strokeDashoffset: 'var(--gauge-target)' },
        },
        'float-up': {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(204, 255, 0, 0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(204, 255, 0, 0.25)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'in': 'animate-in 0.4s var(--anim-spring) forwards',
        'in-delay-1': 'animate-in 0.4s var(--anim-spring) 0.05s forwards',
        'in-delay-2': 'animate-in 0.4s var(--anim-spring) 0.1s forwards',
        'in-delay-3': 'animate-in 0.4s var(--anim-spring) 0.15s forwards',
        'in-delay-4': 'animate-in 0.4s var(--anim-spring) 0.2s forwards',
        'float-up': 'float-up 0.5s var(--anim-spring) forwards',
        'gauge': 'gauge-fill 1.2s var(--anim-spring) forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'count': 'count-up 0.6s var(--anim-spring) forwards',
      },
    },
  },
  plugins: [],
}
