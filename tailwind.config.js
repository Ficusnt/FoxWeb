/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#1565c0",
        accentDark: "#0d47a1",
        bg: "#f5f5f5",
        bgTable: "#ffffff",
        rowAlt: "#e8eaf6",
        border: "#bdbdbd",
        errorBg: "#ffebee",
        errorFg: "#b71c1c"
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "sans-serif"],
        mono: ["Courier New", "monospace"]
      }
    },
  },
  plugins: [],
}
