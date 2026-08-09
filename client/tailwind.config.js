/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0C10', // Deep obsidian black
          800: '#15171E', // Dark card background
          700: '#1F2430', // Border / elevated dark surface
          600: '#2A303C'
        },
        gold: {
          400: '#F5D061',
          500: '#D4AF37', // Warm gold primary
          600: '#B38F22'
        },
        amber: {
          500: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'Merriweather', 'serif']
      }
    },
  },
  plugins: [],
}
