/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#FDF5F5",
          light: "#FFF9F9",
          dark: "#E6DADA",
        },
        primary: {
          DEFAULT: "#1D3461",
          light: "#425789",
          dark: "#142245",
        },
        deeper: {
          DEFAULT: "#B83232",
          light: "#D9534F",
          dark: "#8A2424",
        },
        text: {
          DEFAULT: "#247BA0",
          light: "#4A99BF",
          dark: "#195A76",
        },
        accent: {
          DEFAULT: "#FB3640",
          light: "#FF5C62",
          dark: "#C51B24",
        },
        highlight: {
          DEFAULT: "#FAE8E8",
          light: "#FFF3F3",
          dark: "#E0CFCF",
        },
      },
    },
  },
  plugins: [],
};

// export default {
//   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
//   theme: {
//     extend: {
//       colors: {
//         background: "#FDF5F5",
//         primary: "#D64545",
//         deeper: "#B83232",
//         text: "#2D3436",
//         accent: "#854141",
//         highlight: "#FAE8E8",
//       }
//     },
//   },
//   plugins: [],
// };