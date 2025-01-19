/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: "#FDF5F5",
        primary: "#D64545",
        deeper: "#B83232",
        text: "#2D3436",
        accent: "#854141",
        highlight: "#FAE8E8",
      }
    },
  },
  plugins: [],
};