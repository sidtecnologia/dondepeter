/** @type {import('tailwindcss').Config} */
export default {
  // Asegúrate que esta sección apunte a tus archivos:
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // La clave es la sección 'extend' con 'colors'
    extend: {
      colors: {
        primary: '#2769f4',
        secondary: '#1a1a1a',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}