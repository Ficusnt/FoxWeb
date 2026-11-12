/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fox: {
          blue: "#1565c0",
          dark: "#0d47a1",
          light: "#e3f2fd",
          gray: "#f5f5f5",
        },
      },
    },
  },
  plugins: [],
};