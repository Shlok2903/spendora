/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  important: '#root',
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#1976d2',
          light: '#63a4ff',
          dark: '#004ba0',
        },
        secondary: {
          main: '#3f51b5',
          light: '#6573c3',
          dark: '#2c387e',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
} 