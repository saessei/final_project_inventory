/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}"
  ],
  theme: {
    extend: {
      colors:{
        'bg-cream': '#FFF8F0',
        'dark-brown': '#4B2E2B',
        'brown': '#C08552',
        'bg-lightgray': '#F5F5F4',
        'text-gray': '#807975',
        'button-gray': '#ECE7E4'

      },
      fontFamily: {
        fredoka: ['"Fredoka"', 'sans-serif'],
        quicksand: ['"Quicksand"', 'sans-serif']
      }
    },
  },
  plugins: [],
}