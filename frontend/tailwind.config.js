/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--bg-main)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
        },
        accent: {
          cyan: 'var(--accent-cyan)',
          violet: 'var(--accent-violet)',
        },
        forensic: {
          border: 'var(--border)',
          'border-subtle': 'var(--border-subtle)',
          muted: 'var(--text-muted)',
          text: 'var(--text-main)',
          success: 'var(--forensic-success)',
          warning: 'var(--forensic-warning)',
          error: 'var(--forensic-error)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': 'var(--glow-cyan)',
        'glow-violet': 'var(--glow-violet)',
      }
    },
  },
  plugins: [],
}
