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
        // Core Odoo-inspired color tokens
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8F7FC',
          card: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#714B67', // Signature Odoo Purple
          hover: '#5B3B54',
          surface: '#F2EAF2', // Light purple surface
          accent: '#875A9E', // Accent purple
        },
        odoo: {
          purple: '#714B67',
          hover: '#5B3B54',
          surface: '#F2EAF2',
          accent: '#875A9E',
          text: '#252333',
          muted: '#716D7A',
          border: '#E7E3EB',
          bg: '#FFFFFF',
          secondary: '#F8F7FC',
        },
        accent: {
          cyan: '#714B67', // Mapped to primary purple for backward compatibility
          violet: '#875A9E', // Accent purple
          purple: '#714B67',
        },
        forensic: {
          border: '#E7E3EB',
          'border-subtle': '#F2EFF6',
          muted: '#716D7A',
          text: '#252333',
          success: '#198754',
          warning: '#D97706',
          error: '#DC3545',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'odoo-xs': '0 1px 2px 0 rgba(37, 35, 51, 0.04)',
        'odoo-sm': '0 1px 3px 0 rgba(37, 35, 51, 0.06), 0 1px 2px -1px rgba(37, 35, 51, 0.04)',
        'odoo-md': '0 4px 12px -2px rgba(37, 35, 51, 0.08), 0 2px 6px -2px rgba(37, 35, 51, 0.04)',
        'odoo-lg': '0 12px 24px -4px rgba(37, 35, 51, 0.1), 0 4px 10px -2px rgba(37, 35, 51, 0.04)',
        'glow-cyan': '0 0 0 3px rgba(113, 75, 103, 0.15)',
        'glow-violet': '0 0 0 3px rgba(135, 90, 158, 0.15)',
      }
    },
  },
  plugins: [],
}
