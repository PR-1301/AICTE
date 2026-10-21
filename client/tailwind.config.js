/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aicte: {
          navy: '#0F2A4A',
          blue: '#1F6FEB',
          bg: '#F3F6FA',
        },
      },
    },
  },
  plugins: [],
};
