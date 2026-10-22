/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        aicte: {
          navy: '#0F2A4A',
          deep: '#06101E',
          blue: '#1F6FEB',
          accent: '#2563EB',
          bg: '#F4F6F9',
        },
        cadastral: {
          amber: '#D97706',
          glow: 'rgba(217, 119, 6, 0.15)',
        },
      },
    },
  },
  plugins: [],
};
