/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef6ff',
          500: '#1d63ed',
          600: '#1a56cc',
          700: '#1746a3',
        },
      },
    },
  },
  plugins: [],
}
