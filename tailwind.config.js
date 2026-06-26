/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1B4F8A',
          light: '#2563AB',
          dark: '#163F6E',
        },
      },
    },
  },
  plugins: [],
}
