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
        volt: 'var(--accent-volt)',
        'volt-dim': 'var(--accent-volt-dim)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        inverse: 'var(--text-inverse)',
        grid: 'var(--grid-border)',
        danger: 'var(--status-danger)',
        success: 'var(--status-success)',
        warning: 'var(--status-warning)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Space Grotesk', 'sans-serif'],
      },
      transitionProperty: {
        snap: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}
