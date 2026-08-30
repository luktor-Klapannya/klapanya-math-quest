/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arctic: {
          900: '#0a1128',
          800: '#101f42',
          700: '#1c3166',
          600: '#28468b',
          500: '#3861b3',
          400: '#5c8adc',
          300: '#8bb1f2',
          200: '#bed5fa',
          100: '#e3edfc',
          50: '#f4f8fd',
        },
        frost: {
          cyan: '#00f0ff',
          ice: '#7df9ff',
          neon: '#39ff14',
          gold: '#ffd700',
          ruby: '#ff3366',
          purple: '#b026ff',
        }
      },
      fontFamily: {
        sans: ['Prompt', 'Sarabun', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.4)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.4)',
        'glow-purple': '0 0 20px rgba(176, 38, 255, 0.4)',
      }
    },
  },
  plugins: [],
}
