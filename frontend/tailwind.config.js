/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B1020',
          secondary: '#111A2E',
          card: '#151F35',
        },
        accent: {
          cyan: '#38D9FF',
          violet: '#8B5CF6',
        },
        forensic: {
          border: '#26334D',
          muted: '#94A3B8',
          text: '#F8FAFC',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(56, 217, 255, 0.25)',
        'glow-violet': '0 0 20px -3px rgba(139, 92, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
